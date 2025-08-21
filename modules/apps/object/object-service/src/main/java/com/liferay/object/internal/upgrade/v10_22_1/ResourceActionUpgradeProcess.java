/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_22_1;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.ResourceAction;
import com.liferay.portal.kernel.model.ResourcePermission;
import com.liferay.portal.kernel.service.ResourceActionLocalServiceUtil;
import com.liferay.portal.kernel.service.ResourcePermissionLocalServiceUtil;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;

import java.util.List;
import java.util.Objects;

/**
 * @author Mario Gomes
 */
public class ResourceActionUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws PortalException {
		_upgradeResourcePermission();
		_upgradeResourceAction();
	}

	private void _upgradeResourceAction() throws PortalException {
		try {
			ResourceAction resourceActionOld =
				ResourceActionLocalServiceUtil.getResourceAction(
					_OLD_NAME, _OLD_ACTION);

			ResourceActionLocalServiceUtil.deleteResourceAction(
				resourceActionOld);
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					"Error update ResourceAction: " +
						portalException.getMessage());
			}

			throw portalException;
		}
	}

	private void _upgradeResourcePermission() throws PortalException {
		List<ResourcePermission> resourcePermissions =
			ResourcePermissionLocalServiceUtil.getResourcePermissions(
				_OLD_NAME);

		for (ResourcePermission resourcePermission : resourcePermissions) {
			long actionIds = resourcePermission.getActionIds();

			for (ResourceAction resourceAction :
					ResourceActionLocalServiceUtil.getResourceActions(
						_OLD_NAME)) {

				long bitwiseValue = resourceAction.getBitwiseValue();

				if (((actionIds & bitwiseValue) == bitwiseValue) &&
					Objects.equals(resourceAction.getActionId(), _OLD_ACTION) &&
					!Objects.equals(
						resourcePermission.getPrimKey(), _OLD_NAME)) {

					ResourcePermissionLocalServiceUtil.addResourcePermission(
						resourcePermission.getCompanyId(), _NEW_NAME,
						resourcePermission.getScope(),
						resourcePermission.getPrimKey(),
						resourcePermission.getRoleId(), _NEW_ACTION);
				}
			}

			ResourcePermissionLocalServiceUtil.removeResourcePermission(
				resourcePermission.getCompanyId(), resourcePermission.getName(),
				resourcePermission.getScope(), resourcePermission.getPrimKey(),
				resourcePermission.getRoleId(), _OLD_ACTION);
		}
	}

	private static final String _NEW_ACTION = "ADD_OBJECT_ENTRY_FOLDER";

	private static final String _NEW_NAME = "com.liferay.object.entry.folder";

	private static final String _OLD_ACTION = "ADD_FOLDER";

	private static final String _OLD_NAME =
		"com.liferay.object.model.ObjectEntryFolder";

	private static final Log _log = LogFactoryUtil.getLog(
		ResourceActionUpgradeProcess.class);

}