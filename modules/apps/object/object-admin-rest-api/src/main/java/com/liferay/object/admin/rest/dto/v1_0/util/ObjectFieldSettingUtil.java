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

package com.liferay.object.admin.rest.dto.v1_0.util;

import com.liferay.object.admin.rest.dto.v1_0.ObjectStateFlow;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectFieldSettingConstants;
import com.liferay.object.filter.util.ObjectFilterUtil;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectFieldSetting;
import com.liferay.object.model.ObjectFilter;
import com.liferay.object.service.ObjectFieldSettingLocalService;
import com.liferay.object.service.ObjectFilterLocalService;
import com.liferay.object.service.ObjectStateFlowLocalServiceUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONException;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.vulcan.util.ObjectMapperUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * @author Feliphe Marinho
 */
public class ObjectFieldSettingUtil {

	public static JSONArray toJSONObject(ObjectField objectField) {
		JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

		ListUtil.isNotEmptyForEach(
			objectField.getObjectFieldSettings(),
			objectFieldSetting -> jsonArray.put(
				JSONUtil.put(
					"name", objectFieldSetting.getName()
				).put(
					"objectFieldId", objectFieldSetting.getObjectFieldId()
				).put(
					"value",
					_getValue(objectField.getBusinessType(), objectFieldSetting)
				)));

		return jsonArray;
	}

	public static ObjectFieldSetting toObjectFieldSetting(
			String businessType, long listTypeDefinitionId,
			com.liferay.object.admin.rest.dto.v1_0.ObjectFieldSetting
				objectFieldSetting,
			ObjectFieldSettingLocalService objectFieldSettingLocalService,
			ObjectFilterLocalService objectFilterLocalService)
		throws Exception {

		ObjectFieldSetting serviceBuilderObjectFieldSetting =
			objectFieldSettingLocalService.createObjectFieldSetting(0L);

		serviceBuilderObjectFieldSetting.setName(objectFieldSetting.getName());

		if (Objects.equals(
				ObjectFieldSettingConstants.NAME_STATE_FLOW,
				objectFieldSetting.getName())) {

			serviceBuilderObjectFieldSetting.setObjectStateFlow(
				ObjectStateFlowUtil.toObjectStateFlow(
					listTypeDefinitionId,
					ObjectMapperUtil.readValue(
						ObjectStateFlow.class, objectFieldSetting.getValue())));
		}

		serviceBuilderObjectFieldSetting.setValue(
			String.valueOf(objectFieldSetting.getValue()));

		if (Objects.equals(
				businessType, ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION) &&
			Objects.equals(
				objectFieldSetting.getName(),
				ObjectFieldSettingConstants.NAME_FILTERS)) {

			List<ObjectFilter> objectFilters = new ArrayList<>();

			List<Object> values = null;

			if (objectFieldSetting.getValue() instanceof JSONArray) {
				values = JSONUtil.toList(
					(JSONArray)objectFieldSetting.getValue(),
					jsonObject -> jsonObject.toMap());
			}
			else if (objectFieldSetting.getValue() instanceof Object[]) {
				values = ListUtil.fromArray(
					(Object[])objectFieldSetting.getValue());
			}
			else {
				values = (List<Object>)objectFieldSetting.getValue();
			}

			for (Object value : values) {
				Map<String, Object> valueMap = (Map<String, Object>)value;

				ObjectFilter objectFilter =
					objectFilterLocalService.createObjectFilter(0L);

				objectFilter.setFilterBy(
					String.valueOf(valueMap.get("filterBy")));
				objectFilter.setFilterType(
					String.valueOf(valueMap.get("filterType")));
				objectFilter.setJSON(
					String.valueOf(
						JSONFactoryUtil.createJSONObject(
							(Map)valueMap.get("json"))));

				objectFilters.add(objectFilter);
			}

			serviceBuilderObjectFieldSetting.setObjectFilters(objectFilters);
		}

		return serviceBuilderObjectFieldSetting;
	}

	public static com.liferay.object.admin.rest.dto.v1_0.ObjectFieldSetting
		toObjectFieldSetting(
			String businessType,
			ObjectFieldSetting serviceBuilderObjectFieldSetting) {

		if (serviceBuilderObjectFieldSetting == null) {
			return null;
		}

		com.liferay.object.admin.rest.dto.v1_0.ObjectFieldSetting
			objectFieldSetting =
				new com.liferay.object.admin.rest.dto.v1_0.
					ObjectFieldSetting() {

					{
						name = serviceBuilderObjectFieldSetting.getName();
						value = serviceBuilderObjectFieldSetting.getValue();
					}
				};

		if (Objects.equals(
				businessType, ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION) &&
			Objects.equals(
				objectFieldSetting.getName(),
				ObjectFieldSettingConstants.NAME_FILTERS)) {

			objectFieldSetting.setValue(
				ObjectFilterUtil.getObjectFiltersJSONArray(
					serviceBuilderObjectFieldSetting.getObjectFilters()));
		}
		else if (Objects.equals(
					ObjectFieldSettingConstants.NAME_STATE_FLOW,
					objectFieldSetting.getName())) {

			objectFieldSetting.setValue(
				ObjectStateFlowUtil.toObjectStateFlow(
					ObjectStateFlowLocalServiceUtil.fetchObjectStateFlow(
						GetterUtil.getLong(
							serviceBuilderObjectFieldSetting.getValue()))));
		}

		return objectFieldSetting;
	}

	private static Object _getValue(
		String businessType, ObjectFieldSetting objectFieldSetting) {

		if (Objects.equals(
				ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION, businessType) &&
			Objects.equals(
				objectFieldSetting.getName(),
				ObjectFieldSettingConstants.NAME_FILTERS)) {

			return ObjectFilterUtil.getObjectFiltersJSONArray(
				objectFieldSetting.getObjectFilters());
		}
		else if (Objects.equals(
					ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT,
					businessType)) {

			if (Objects.equals(
					objectFieldSetting.getName(), "maximumFileSize")) {

				return GetterUtil.getInteger(objectFieldSetting.getValue());
			}
			else if (Objects.equals(
						objectFieldSetting.getName(),
						"showFilesInDocumentsAndMedia")) {

				return GetterUtil.getBoolean(objectFieldSetting.getValue());
			}
		}
		else if (Objects.equals(
					ObjectFieldConstants.BUSINESS_TYPE_LONG_TEXT,
					businessType) ||
				 Objects.equals(
					 ObjectFieldConstants.BUSINESS_TYPE_TEXT, businessType)) {

			if (Objects.equals(objectFieldSetting.getName(), "maxLength")) {
				return GetterUtil.getInteger(objectFieldSetting.getValue());
			}
			else if (Objects.equals(
						objectFieldSetting.getName(), "showCounter")) {

				return GetterUtil.getBoolean(objectFieldSetting.getValue());
			}
		}
		else if (Objects.equals(
					ObjectFieldConstants.BUSINESS_TYPE_PICKLIST,
					businessType)) {

			if (Objects.equals(
					objectFieldSetting.getName(),
					ObjectFieldSettingConstants.NAME_STATE_FLOW)) {

				ObjectStateFlow objectStateFlow =
					ObjectStateFlowUtil.toObjectStateFlow(
						ObjectStateFlowLocalServiceUtil.fetchObjectStateFlow(
							GetterUtil.getLong(objectFieldSetting.getValue())));

				try {
					return JSONFactoryUtil.createJSONObject(
						objectStateFlow.toString());
				}
				catch (JSONException jsonException) {
					_log.error(jsonException);

					return null;
				}
			}
		}

		return objectFieldSetting.getValue();
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectFieldSettingUtil.class);

}