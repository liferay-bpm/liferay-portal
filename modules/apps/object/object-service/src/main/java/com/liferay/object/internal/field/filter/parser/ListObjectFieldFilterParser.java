/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.object.internal.field.filter.parser;

import com.liferay.list.type.model.ListTypeEntry;
import com.liferay.list.type.service.ListTypeEntryLocalService;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectViewFilterColumnConstants;
import com.liferay.object.exception.ObjectViewFilterColumnException;
import com.liferay.object.field.filter.parser.ObjectFieldFilterParser;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.model.ObjectViewFilterColumn;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.service.PersistedModelLocalService;
import com.liferay.portal.kernel.service.PersistedModelLocalServiceRegistry;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Feliphe Marinho
 */
@Component(
	immediate = true,
	property = {
		"object.field.filter.type.key=" + ObjectViewFilterColumnConstants.FILTER_TYPE_EXCLUDES,
		"object.field.filter.type.key=" + ObjectViewFilterColumnConstants.FILTER_TYPE_INCLUDES
	},
	service = ObjectFieldFilterParser.class
)
public class ListObjectFieldFilterParser implements ObjectFieldFilterParser {

	@Override
	public Map<String, Object> parse(
			long listTypeDefinitionId, Locale locale,
			ObjectViewFilterColumn objectViewFilterColumn)
		throws PortalException {

		return HashMapBuilder.<String, Object>put(
			"exclude",
			ObjectViewFilterColumnConstants.FILTER_TYPE_EXCLUDES.equals(
				objectViewFilterColumn.getFilterType())
		).put(
			"itemsValues",
			() -> {
				JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
					objectViewFilterColumn.getJSON());

				JSONArray jsonArray = jsonObject.getJSONArray(
					objectViewFilterColumn.getFilterType());

				if (Objects.equals(
						objectViewFilterColumn.getObjectFieldName(),
						"status")) {

					return _toIntegerList(jsonArray);
				}

				List<Map<String, String>> map = new ArrayList<>();

				for (int i = 0; i < jsonArray.length(); i++) {
					ListTypeEntry listTypeEntry =
						_listTypeEntryLocalService.fetchListTypeEntry(
							listTypeDefinitionId, jsonArray.getString(i));

					map.add(
						HashMapBuilder.put(
							"label", listTypeEntry.getName(locale)
						).put(
							"value", jsonArray.getString(i)
						).build());
				}

				return map;
			}
		).build();
	}

	@Override
	public void validate(
			long objectDefinitionId,
			ObjectViewFilterColumn objectViewFilterColumn)
		throws PortalException {

		JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
			objectViewFilterColumn.getJSON());

		JSONArray jsonArray = jsonObject.getJSONArray(
			objectViewFilterColumn.getFilterType());

		if (jsonArray == null) {
			throw new ObjectViewFilterColumnException(
				"JSON array is null for filter type " +
					objectViewFilterColumn.getFilterType());
		}

		if (Objects.equals(
				objectViewFilterColumn.getObjectFieldName(), "status")) {

			try {
				_toIntegerList(jsonArray);
			}
			catch (Exception exception) {
				throw new ObjectViewFilterColumnException(
					"JSON array is invalid for filter type " +
						objectViewFilterColumn.getFilterType(),
					exception);
			}
		}

		ObjectField objectField = _objectFieldLocalService.fetchObjectField(
			objectDefinitionId, objectViewFilterColumn.getObjectFieldName());

		if (Objects.equals(
				objectField.getBusinessType(),
				ObjectFieldConstants.BUSINESS_TYPE_RELATIONSHIP)) {

			_validate(
				jsonArray, objectDefinitionId,
				objectViewFilterColumn.getObjectFieldName());
		}
	}

	private List<Integer> _toIntegerList(JSONArray jsonArray) {
		List<Integer> statuses = new ArrayList<>();

		for (int i = 0; i < jsonArray.length(); i++) {
			statuses.add((Integer)jsonArray.get(i));
		}

		return statuses;
	}

	private void _validate(
			JSONArray jsonArray, long objectDefinitionId,
			String objectFieldName)
		throws PortalException {

		ObjectField objectField = _objectFieldLocalService.getObjectField(
			objectDefinitionId, objectFieldName);

		ObjectRelationship objectRelationship =
			_objectRelationshipLocalService.
				fetchObjectRelationshipByObjectFieldId2(
					objectField.getObjectFieldId());

		ObjectEntry objectEntry = null;

		for (int i = 0; i < jsonArray.length(); i++) {
			objectEntry = _objectEntryLocalService.fetchObjectEntry(
				GetterUtil.getLong(jsonArray.get(i)));

			if (!Objects.isNull(objectEntry)) {
				if (!Objects.equals(
						objectEntry.getObjectDefinitionId(),
						objectRelationship.getObjectDefinitionId1())) {

					throw new ObjectViewFilterColumnException(
						StringBundler.concat(
							"ObjectEntryId: ", jsonArray.get(i),
							" do not belong to ObjectDefinition1: ",
							objectRelationship.getObjectDefinitionId1()));
				}
			}
			else {
				ObjectDefinition objectDefinition1 =
					_objectDefinitionLocalService.getObjectDefinition(
						objectRelationship.getObjectDefinitionId1());

				if (!objectDefinition1.isSystem()) {
					throw new ObjectViewFilterColumnException(
						"There is no ObjectEntry with id: " +
							GetterUtil.getLong(jsonArray.get(i)));
				}

				_validateSystemObject(
					GetterUtil.getLong(jsonArray.get(i)), objectDefinition1);
			}
		}
	}

	private void _validateSystemObject(
			long entryId, ObjectDefinition objectDefinition)
		throws PortalException {

		PersistedModelLocalService persistedModelLocalService =
			_persistedModelLocalServiceRegistry.getPersistedModelLocalService(
				objectDefinition.getClassName());

		if (Objects.isNull(
				persistedModelLocalService.getPersistedModel(entryId))) {

			throw new ObjectViewFilterColumnException(
				StringBundler.concat(
					"ObjectEntryId: ", entryId,
					" do not belong to ObjectDefinition1: ",
					objectDefinition.getObjectDefinitionId()));
		}
	}

	@Reference
	private ListTypeEntryLocalService _listTypeEntryLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Reference
	private PersistedModelLocalServiceRegistry
		_persistedModelLocalServiceRegistry;

}