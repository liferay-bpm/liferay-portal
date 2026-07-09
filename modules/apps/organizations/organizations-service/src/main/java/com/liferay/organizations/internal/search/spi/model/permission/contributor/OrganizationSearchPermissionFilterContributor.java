/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.organizations.internal.search.spi.model.permission.contributor;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Organization;
import com.liferay.portal.kernel.search.BooleanClauseOccur;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.search.filter.BooleanFilter;
import com.liferay.portal.kernel.search.filter.TermsFilter;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.UserBag;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.search.spi.model.permission.contributor.SearchPermissionFilterContributor;

import org.osgi.service.component.annotations.Component;

/**
 * @author Yuri Monteiro
 */
@Component(
	property = "indexer.class.name=com.liferay.portal.kernel.model.Organization",
	service = SearchPermissionFilterContributor.class
)
public class OrganizationSearchPermissionFilterContributor
	implements SearchPermissionFilterContributor {

	@Override
	public void contribute(
		BooleanFilter booleanFilter, long companyId, long[] groupIds,
		long userId, PermissionChecker permissionChecker, String className) {

		if (!className.equals(Organization.class.getName()) || (userId == 0)) {
			return;
		}

		try {
			UserBag userBag = permissionChecker.getUserBag();

			long[] userOrgIds = userBag.getUserOrgIds();

			if (ArrayUtil.isEmpty(userOrgIds)) {
				return;
			}

			TermsFilter termsFilter = new TermsFilter(Field.ENTRY_CLASS_PK);

			termsFilter.addValues(ArrayUtil.toStringArray(userOrgIds));

			booleanFilter.add(termsFilter, BooleanClauseOccur.SHOULD);
		}
		catch (Exception exception) {
			if (_log.isWarnEnabled()) {
				_log.warn(exception);
			}
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		OrganizationSearchPermissionFilterContributor.class);

}