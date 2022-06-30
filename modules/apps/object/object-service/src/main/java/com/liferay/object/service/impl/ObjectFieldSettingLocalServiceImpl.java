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

package com.liferay.object.service.impl;

import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectFilterConstants;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectFieldSetting;
import com.liferay.object.model.ObjectFilter;
import com.liferay.object.service.ObjectFilterLocalService;
import com.liferay.object.service.base.ObjectFieldSettingLocalServiceBaseImpl;
import com.liferay.object.service.persistence.ObjectFieldPersistence;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.PropsUtil;

import java.util.List;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Carolina Barbosa
 */
@Component(
	property = "model.class.name=com.liferay.object.model.ObjectFieldSetting",
	service = AopService.class
)
public class ObjectFieldSettingLocalServiceImpl
	extends ObjectFieldSettingLocalServiceBaseImpl {

	@Override
	public void addObjectFieldSetting(
			long userId, long objectFieldId, String name, String value)
		throws PortalException {

		ObjectField objectField = _objectFieldPersistence.findByPrimaryKey(
			objectFieldId);

		if (GetterUtil.getBoolean(PropsUtil.get("feature.flag.LPS-156704")) &&
			Objects.equals(
				objectField.getBusinessType(),
				ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION) &&
			Objects.equals(name, "filters")) {

			_addFilterObjectFieldSettings(userId, objectFieldId, value);

			return;
		}

		_addObjectFieldSetting(userId, objectFieldId, name, value);
	}

	@Override
	public ObjectFieldSetting deleteObjectFieldSetting(
			long objectFieldSettingId)
		throws PortalException {

		ObjectFieldSetting objectFieldSetting =
			objectFieldSettingPersistence.findByPrimaryKey(
				objectFieldSettingId);

		ObjectField objectField = _objectFieldPersistence.findByPrimaryKey(
			objectFieldSetting.getObjectFieldId());

		if (GetterUtil.getBoolean(PropsUtil.get("feature.flag.LPS-156704")) &&
			Objects.equals(
				objectField.getBusinessType(),
				ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION) &&
			Objects.equals(
				objectFieldSetting.getName(), ObjectFilterConstants.FILTER)) {

			_objectFilterLocalService.deleteObjectFilter(
				GetterUtil.getLong(objectFieldSetting.getValue()));
		}

		return objectFieldSettingPersistence.remove(objectFieldSetting);
	}

	@Override
	public ObjectFieldSetting fetchObjectFieldSetting(
		long objectFieldId, String name) {

		return objectFieldSettingPersistence.fetchByOFI_N(objectFieldId, name);
	}

	@Override
	public List<ObjectFieldSetting> getObjectFieldSettings(long objectFieldId) {
		return objectFieldSettingPersistence.findByObjectFieldId(objectFieldId);
	}

	@Override
	public ObjectFieldSetting updateObjectFieldSetting(
			long objectFieldSettingId, String value)
		throws PortalException {

		ObjectFieldSetting objectFieldSetting =
			objectFieldSettingPersistence.fetchByPrimaryKey(
				objectFieldSettingId);

		objectFieldSetting.setValue(value);

		return objectFieldSettingPersistence.update(objectFieldSetting);
	}

	private void _addFilterObjectFieldSettings(
			long userId, long objectFieldId, String value)
		throws PortalException {

		JSONArray jsonArray = JSONFactoryUtil.createJSONArray(value);

		for (int i = 0; i < jsonArray.length(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			ObjectFilter objectFilter =
				_objectFilterLocalService.addObjectFieldSetting(
					userId,
					jsonObject.getString(ObjectFilterConstants.FILTER_BY),
					jsonObject.getString(ObjectFilterConstants.FILTER_TYPE),
					jsonObject.getString(ObjectFilterConstants.JSON));

			_addObjectFieldSetting(
				userId, objectFieldId, "filter",
				String.valueOf(objectFilter.getObjectFilterId()));
		}
	}

	private void _addObjectFieldSetting(
			long userId, long objectFieldId, String name, String value)
		throws PortalException {

		ObjectFieldSetting objectFieldSetting =
			objectFieldSettingPersistence.create(
				counterLocalService.increment());

		User user = _userLocalService.getUser(userId);

		objectFieldSetting.setCompanyId(user.getCompanyId());
		objectFieldSetting.setUserId(user.getUserId());
		objectFieldSetting.setUserName(user.getFullName());

		objectFieldSetting.setObjectFieldId(objectFieldId);
		objectFieldSetting.setName(name);
		objectFieldSetting.setValue(value);

		objectFieldSettingPersistence.update(objectFieldSetting);
	}

	@Reference
	private ObjectFieldPersistence _objectFieldPersistence;

	@Reference
	private ObjectFilterLocalService _objectFilterLocalService;

	@Reference
	private UserLocalService _userLocalService;

}