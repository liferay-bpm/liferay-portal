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

package com.liferay.object.admin.rest.internal.instance.lifecycle;

import com.liferay.list.type.service.ListTypeDefinitionLocalService;
import com.liferay.object.admin.rest.dto.v1_0.ObjectDefinition;
import com.liferay.object.admin.rest.dto.v1_0.ObjectView;
import com.liferay.object.admin.rest.internal.dto.v1_0.util.ObjectFieldUtil;
import com.liferay.object.admin.rest.internal.dto.v1_0.util.ObjectViewUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectFieldSettingLocalService;
import com.liferay.object.service.ObjectFilterLocalService;
import com.liferay.object.service.ObjectViewLocalService;
import com.liferay.object.service.persistence.ObjectViewColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewFilterColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewSortColumnPersistence;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.portal.instance.lifecycle.BasePortalInstanceLifecycleListener;
import com.liferay.portal.instance.lifecycle.PortalInstanceLifecycleListener;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Release;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import java.util.List;
import java.util.Objects;

/**
 * @author Paulo Albuquerque
 */
@Component(service = PortalInstanceLifecycleListener.class)
public class AddObjectDefinitionPortalInstanceLifecycleListener
	extends BasePortalInstanceLifecycleListener {

	@Override
	public void portalInstanceRegistered(Company company) {
		_importJSONObjectDefinition(company);
	}

	private void _importJSONObjectDefinition(Company company) {
		JSONObject objectDefinitionJSONObject = null;

		try {
			objectDefinitionJSONObject = _jsonFactory.createJSONObject(
				StringUtil.read(getClass(), "dependencies/bookmarks.json"));
		}
		catch (JSONException jsonException) {
			throw new RuntimeException(jsonException);
		}

		ObjectDefinition objectDefinition = ObjectDefinition.toDTO(
			objectDefinitionJSONObject.toString());

		List<User> users = _userLocalService.getCompanyUsers(
			company.getCompanyId(), QueryUtil.ALL_POS, QueryUtil.ALL_POS);

		User currentUser = users.get(0);

		try {
			if (Objects.isNull(
					_objectDefinitionLocalService.
						fetchObjectDefinitionByExternalReferenceCode(
							objectDefinition.getExternalReferenceCode(),
							company.getCompanyId()))) {

				com.liferay.object.model.ObjectDefinition
					serviceBuilderObjectDefinition =
						_objectDefinitionLocalService.addCustomObjectDefinition(
							currentUser.getUserId(),
							GetterUtil.getBoolean(
								objectDefinition.getEnableComments()),
							LocalizedMapUtil.getLocalizedMap(
								objectDefinition.getLabel()),
							objectDefinition.getName(),
							objectDefinition.getPanelAppOrder(),
							objectDefinition.getPanelCategoryKey(),
							LocalizedMapUtil.getLocalizedMap(
								objectDefinition.getPluralLabel()),
							objectDefinition.getScope(),
							objectDefinition.getStorageType(),
							TransformUtil.transformToList(
								objectDefinition.getObjectFields(),
								objectField -> ObjectFieldUtil.toObjectField(
									_listTypeDefinitionLocalService,
									objectField, _objectFieldLocalService,
									_objectFieldSettingLocalService,
									_objectFilterLocalService)));

				_objectDefinitionLocalService.updateExternalReferenceCode(
					serviceBuilderObjectDefinition.getObjectDefinitionId(),
					objectDefinition.getExternalReferenceCode());

				for (ObjectView objectView :
						objectDefinition.getObjectViews()) {

					_objectViewLocalService.addObjectView(
						currentUser.getUserId(),
						serviceBuilderObjectDefinition.getObjectDefinitionId(),
						GetterUtil.getBoolean(
							objectView.getDefaultObjectView()),
						LocalizedMapUtil.getLocalizedMap(objectView.getName()),
						TransformUtil.transformToList(
							objectView.getObjectViewColumns(),
							objectViewColumn ->
								ObjectViewUtil.toObjectViewColumn(
									objectViewColumn,
									_objectViewColumnPersistence)),
						TransformUtil.transformToList(
							objectView.getObjectViewFilterColumns(),
							objectViewFilterColumn ->
								ObjectViewUtil.toObjectViewFilterColumn(
									objectViewFilterColumn,
									_objectViewFilterColumnPersistence)),
						TransformUtil.transformToList(
							objectView.getObjectViewSortColumns(),
							objectViewSortColumn ->
								ObjectViewUtil.toObjectViewSortColumn(
									objectViewSortColumn,
									_objectViewSortColumnPersistence)));
				}

				_objectDefinitionLocalService.publishCustomObjectDefinition(
					currentUser.getUserId(),
					serviceBuilderObjectDefinition.getObjectDefinitionId());
			}
		}
		catch (PortalException portalException) {
			throw new RuntimeException(portalException);
		}
	}

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private ListTypeDefinitionLocalService _listTypeDefinitionLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private ObjectFieldSettingLocalService _objectFieldSettingLocalService;

	@Reference
	private ObjectFilterLocalService _objectFilterLocalService;

	@Reference
	private ObjectViewColumnPersistence _objectViewColumnPersistence;

	@Reference
	private ObjectViewFilterColumnPersistence
		_objectViewFilterColumnPersistence;

	@Reference
	private ObjectViewLocalService _objectViewLocalService;

	@Reference
	private ObjectViewSortColumnPersistence _objectViewSortColumnPersistence;

	@Reference(
		target = "(&(release.bundle.symbolic.name=com.liferay.object.service)(release.schema.version>=1.0.0))"
	)
	private Release _release;

	@Reference
	private UserLocalService _userLocalService;

}