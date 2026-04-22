/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.scope;

import com.liferay.object.model.ObjectEntry;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.vulcan.util.GroupUtil;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Locale;

/**
 * @author Marco Leo
 */
public interface ObjectScopeProvider {

	public long getGroupId(HttpServletRequest httpServletRequest)
		throws PortalException;

	public String getKey();

	public String getLabel(Locale locale);

	public String[] getRootPanelCategoryKeys();

	public default String getScopeKey(
		GroupLocalService groupLocalService, ObjectEntry objectEntry) {

		Group group = groupLocalService.fetchGroup(objectEntry.getGroupId());

		if (group == null) {
			return null;
		}

		return group.getGroupKey();
	}

	public boolean isGroupAware();

	public boolean isValidGroupId(long groupId);

	public default String resolveScopeKey(
			long companyId, String scopeKey,
			GroupLocalService groupLocalService)
		throws PortalException {

		Long groupId = GroupUtil.getGroupId(
			companyId, scopeKey, groupLocalService);

		if (groupId == null) {
			return null;
		}

		return String.valueOf(groupId);
	}

}