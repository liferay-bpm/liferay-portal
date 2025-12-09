/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.security.permission.util;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.ResourceAction;
import com.liferay.portal.kernel.model.ResourceConstants;
import com.liferay.portal.kernel.model.ResourcePermission;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.service.PermissionServiceUtil;
import com.liferay.portal.kernel.service.ResourceActionLocalServiceUtil;
import com.liferay.portal.kernel.service.ResourcePermissionLocalServiceUtil;
import com.liferay.portal.kernel.service.RoleLocalServiceUtil;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.permission.ModelPermissions;

import java.util.Collection;

/**
 * @author Nathaly Gomes
 */
public class ObjectPermissionUtil {

	public static void updateResourcePermissions(
			long companyId, long groupId, long primKey, String permissionName,
			ServiceContext serviceContext)
		throws PortalException {

		ModelPermissions modelPermissions =
			serviceContext.getModelPermissions();

		if (modelPermissions == null) {
			return;
		}

		PermissionServiceUtil.checkPermission(
			groupId, ObjectDefinition.class.getName(), primKey);

		Collection<String> roleNames = modelPermissions.getRoleNames();

		for (ResourcePermission resourcePermission :
				ResourcePermissionLocalServiceUtil.getResourcePermissions(
					companyId, permissionName,
					ResourceConstants.SCOPE_INDIVIDUAL,
					String.valueOf(primKey))) {

			Role role = RoleLocalServiceUtil.fetchRole(
				resourcePermission.getRoleId());

			if ((role == null) || roleNames.contains(role.getName())) {
				continue;
			}

			for (ResourceAction resourceAction :
					ResourceActionLocalServiceUtil.getResourceActions(
						permissionName)) {

				ResourcePermissionLocalServiceUtil.removeResourcePermission(
					companyId, permissionName,
					ResourceConstants.SCOPE_INDIVIDUAL, String.valueOf(primKey),
					role.getRoleId(), resourceAction.getActionId());
			}
		}

		ResourcePermissionLocalServiceUtil.updateResourcePermissions(
			companyId, groupId, permissionName, String.valueOf(primKey),
			modelPermissions);
	}

}