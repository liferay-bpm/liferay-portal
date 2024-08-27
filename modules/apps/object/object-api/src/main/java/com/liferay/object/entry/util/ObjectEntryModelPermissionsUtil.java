/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.entry.util;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
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
 * @author Paulo Albuquerque
 */
public class ObjectEntryModelPermissionsUtil {

	public static void updateResourcePermissions(
			ObjectDefinition objectDefinition, ObjectEntry objectEntry,
			ServiceContext serviceContext)
		throws PortalException {

		ModelPermissions modelPermissions =
			serviceContext.getModelPermissions();

		if (modelPermissions == null) {
			return;
		}

		PermissionServiceUtil.checkPermission(
			objectEntry.getGroupId(), objectDefinition.getClassName(),
			String.valueOf(objectEntry.getObjectEntryId()));

		Collection<String> roleNames = modelPermissions.getRoleNames();

		for (ResourcePermission resourcePermission :
				ResourcePermissionLocalServiceUtil.getResourcePermissions(
					objectDefinition.getCompanyId(),
					objectDefinition.getClassName(),
					ResourceConstants.SCOPE_INDIVIDUAL,
					String.valueOf(objectEntry.getObjectEntryId()))) {

			Role role = RoleLocalServiceUtil.fetchRole(
				resourcePermission.getRoleId());

			if ((role == null) || roleNames.contains(role.getName())) {
				continue;
			}

			for (ResourceAction resourceAction :
					ResourceActionLocalServiceUtil.getResourceActions(
						objectDefinition.getClassName())) {

				ResourcePermissionLocalServiceUtil.removeResourcePermission(
					objectDefinition.getCompanyId(),
					objectDefinition.getClassName(),
					ResourceConstants.SCOPE_INDIVIDUAL,
					String.valueOf(objectEntry.getObjectEntryId()),
					role.getRoleId(), resourceAction.getActionId());
			}
		}

		ResourcePermissionLocalServiceUtil.updateResourcePermissions(
			objectEntry.getCompanyId(), objectEntry.getGroupId(),
			objectDefinition.getClassName(),
			String.valueOf(objectEntry.getObjectEntryId()), modelPermissions);
	}

}