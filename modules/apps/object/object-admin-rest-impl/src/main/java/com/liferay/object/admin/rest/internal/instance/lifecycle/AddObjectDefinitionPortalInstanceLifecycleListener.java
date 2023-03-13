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

import com.liferay.object.admin.rest.dto.v1_0.ObjectDefinition;
import com.liferay.object.admin.rest.dto.v1_0.Status;
import com.liferay.object.admin.rest.resource.v1_0.ObjectDefinitionResource;
import com.liferay.portal.instance.lifecycle.BasePortalInstanceLifecycleListener;
import com.liferay.portal.instance.lifecycle.PortalInstanceLifecycleListener;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Release;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactory;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.StringUtil;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Paulo Albuquerque
 */
@Component(service = PortalInstanceLifecycleListener.class)
public class AddObjectDefinitionPortalInstanceLifecycleListener
	extends BasePortalInstanceLifecycleListener {

	@Override
	public void portalInstanceRegistered(Company company) throws Exception {
		if (FeatureFlagManagerUtil.isEnabled("LPS-167253")) {
			_importJSONObjectDefinition(company);
		}
	}

	private void _importJSONObjectDefinition(Company company) throws Exception {
		Role role = _roleLocalService.getRole(
			company.getCompanyId(), RoleConstants.ADMINISTRATOR);

		long[] currentUserId = _roleLocalService.getUserPrimaryKeys(
			role.getRoleId());

		User currentUser = _userLocalService.getUser(currentUserId[0]);

		PermissionThreadLocal.setPermissionChecker(
			_defaultPermissionCheckerFactory.create(currentUser));

		PrincipalThreadLocal.setName(currentUser.getUserId());

		ObjectDefinitionResource.Builder objectDefinitionResourceBuilder =
			_objectDefinitionResourceFactory.create();

		ObjectDefinitionResource objectDefinitionResource =
			objectDefinitionResourceBuilder.user(
				currentUser
			).build();

		JSONObject objectDefinitionJSONObject = _jsonFactory.createJSONObject(
			StringUtil.read(getClass(), "dependencies/bookmarks.json"));

		ObjectDefinition objectDefinition = ObjectDefinition.toDTO(
			objectDefinitionJSONObject.toString());

		objectDefinition =
			objectDefinitionResource.putObjectDefinitionByExternalReferenceCode(
				objectDefinition.getExternalReferenceCode(), objectDefinition);

		Status status = objectDefinition.getStatus();

		if (status.getCode() != 0) {
			objectDefinitionResource.postObjectDefinitionPublish(
				objectDefinition.getId());
		}
	}

	@Reference
	private PermissionCheckerFactory _defaultPermissionCheckerFactory;

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private ObjectDefinitionResource.Factory _objectDefinitionResourceFactory;

	@Reference(
		target = "(&(release.bundle.symbolic.name=com.liferay.object.service)(release.schema.version>=4.1.0))"
	)
	private Release _release;

	@Reference
	private RoleLocalService _roleLocalService;

	@Reference
	private UserLocalService _userLocalService;

}