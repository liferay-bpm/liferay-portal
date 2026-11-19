/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.content.marketing.platform.web.internal.upgrade.v2_2_0;

import com.liferay.fragment.model.FragmentEntry;
import com.liferay.fragment.model.FragmentEntryLink;
import com.liferay.fragment.service.FragmentEntryLinkLocalService;
import com.liferay.fragment.service.FragmentEntryLocalService;
import com.liferay.portal.kernel.dao.jdbc.AutoBatchPreparedStatementUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.StringUtil;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Larissa Ribeiro
 */
public class CMPTabsFragmentEntryUpgradeProcess extends UpgradeProcess {

	public CMPTabsFragmentEntryUpgradeProcess(
		CompanyLocalService companyLocalService,
		FragmentEntryLinkLocalService fragmentEntryLinkLocalService,
		FragmentEntryLocalService fragmentEntryLocalService,
		GroupLocalService groupLocalService) {

		_companyLocalService = companyLocalService;
		_fragmentEntryLinkLocalService = fragmentEntryLinkLocalService;
		_fragmentEntryLocalService = fragmentEntryLocalService;
		_groupLocalService = groupLocalService;
	}

	@Override
	protected void doUpgrade() throws Exception {
		_companyLocalService.forEachCompanyId(
			companyId -> {
				Group group = _groupLocalService.fetchGroup(
					companyId, GroupConstants.CMS);

				if (group == null) {
					return;
				}

				_upgradeFragmentEntry(group);
			});
	}

	private void _upgradeFragmentEntry(Group group) throws Exception {
		FragmentEntry fragmentEntry =
			_fragmentEntryLocalService.fetchFragmentEntry(
				group.getGroupId(), "tabs");

		if (fragmentEntry == null) {
			return;
		}

		try (PreparedStatement preparedStatement1 = connection.prepareStatement(
				"select ctCollectionId, fragmentEntryId, css from " +
					"FragmentEntry where groupId = ? and fragmentEntryKey = ?");
			PreparedStatement preparedStatement2 =
				AutoBatchPreparedStatementUtil.concurrentAutoBatch(
					connection,
					"update FragmentEntry set css = ? where ctCollectionId = " +
						"? and fragmentEntryId = ?")) {

			preparedStatement1.setLong(1, group.getGroupId());
			preparedStatement1.setString(2, "tabs");

			try (ResultSet resultSet = preparedStatement1.executeQuery()) {
				while (resultSet.next()) {
					preparedStatement2.setString(
						1,
						StringUtil.replace(
							resultSet.getString("css"), _CSS_PARTS_OLD,
							_CSS_PARTS_NEW));
					preparedStatement2.setLong(
						2, resultSet.getLong("ctCollectionId"));
					preparedStatement2.setLong(
						3, resultSet.getLong("fragmentEntryId"));

					preparedStatement2.addBatch();
				}

				preparedStatement2.executeBatch();
			}
		}

		for (FragmentEntryLink fragmentEntryLink :
				_fragmentEntryLinkLocalService.
					getFragmentEntryLinksByFragmentEntry(
						group.getGroupId(), fragmentEntry)) {

			fragmentEntryLink.setCss(
				StringUtil.replace(
					fragmentEntryLink.getCss(), _CSS_PARTS_OLD,
					_CSS_PARTS_NEW));

			_fragmentEntryLinkLocalService.updateFragmentEntryLink(
				fragmentEntryLink);
		}
	}

	private static final String[] _CSS_PARTS_NEW = {
		".component-tabs .navigation-bar-light .navbar-toggler.navbar-" +
			"toggler-link {",
		".component-tabs .navigation-bar-light .navbar-toggler .icon-caret-" +
			"bottom {",
		".component-tabs .navigation-bar-light .navbar-nav .nav-link",
		"color: var(--gray-900, #272833)", "solid var(--gray-900, #272833)",
		"color: var(--gray-600, #6b6c7e)"
	};

	private static final String[] _CSS_PARTS_OLD = {
		".component-tabs .navigation-bar-light .navbar-toggler {",
		".component-tabs .navigation-bar-light .icon-caret-bottom {",
		".component-tabs .navigation-bar-light .nav-link", "color: #272833",
		"solid #272833", "color: #6b6c7e"
	};

	private final CompanyLocalService _companyLocalService;
	private final FragmentEntryLinkLocalService _fragmentEntryLinkLocalService;
	private final FragmentEntryLocalService _fragmentEntryLocalService;
	private final GroupLocalService _groupLocalService;

}