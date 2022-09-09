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
import com.liferay.object.constants.ObjectViewFilterColumnConstants;
import com.liferay.object.exception.ObjectViewFilterColumnException;
import com.liferay.object.field.filter.parser.ObjectFieldFilterParser;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.model.ObjectViewFilterColumn;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.StringUtil;

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

				if (StringUtil.startsWith(
						objectViewFilterColumn.getObjectFieldName(), "r_")) {

					List<String> objectEntryIds = new ArrayList<>();

					for (int i = 0; i < jsonArray.length(); i++) {
						objectEntryIds.add((String)jsonArray.get(i));
					}

					return objectEntryIds;
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

		if (StringUtil.startsWith(
				objectViewFilterColumn.getObjectFieldName(), "r_")) {

			_validate(
				jsonArray, objectDefinitionId,
				objectViewFilterColumn.getObjectFieldName());
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

		ObjectEntry objectEntry;

		for (int i = 0; i < jsonArray.length(); i++) {
			try {
				objectEntry = _objectEntryLocalService.getObjectEntry(
					Long.parseLong((String)jsonArray.get(i)));
			}
			catch (Exception exception) {
				throw new ObjectViewFilterColumnException(
					StringBundler.concat(
						"Value: ", jsonArray.get(i), " is not ObjectEntryId"),
					exception);
			}

			ObjectField objectField = _objectFieldLocalService.getObjectField(
				objectDefinitionId, objectFieldName);

			ObjectRelationship objectRelationship =
				_objectRelationshipLocalService.
					fetchObjectRelationshipByObjectFieldId2(
						objectField.getObjectFieldId());

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
	}

	@Reference
	private ListTypeEntryLocalService _listTypeEntryLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}