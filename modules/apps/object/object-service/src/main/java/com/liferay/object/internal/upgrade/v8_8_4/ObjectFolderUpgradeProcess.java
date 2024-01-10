/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v8_8_4;

import com.liferay.object.constants.ObjectFolderConstants;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.settings.LocalizedValuesMap;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.upgrade.util.UpgradeProcessUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.LocalizationUtil;

import java.sql.PreparedStatement;

/**
 * @author Pedro Leite
 */
public class ObjectFolderUpgradeProcess extends UpgradeProcess {

	public ObjectFolderUpgradeProcess(CompanyLocalService companyLocalService) {
		_companyLocalService = companyLocalService;
	}

	@Override
	protected void doUpgrade() throws Exception {
		_companyLocalService.forEachCompany(
			company -> {
				try (PreparedStatement preparedStatement =
						connection.prepareStatement(
							StringBundler.concat(
								"update ObjectFolder set ",
								"externalReferenceCode = ?, label = ?, name = ",
								"? where companyId = ? and ",
								"externalReferenceCode = ?"))) {

					preparedStatement.setString(
						1,
						ObjectFolderConstants.EXTERNAL_REFERENCE_CODE_DEFAULT);
					preparedStatement.setString(
						2,
						LocalizationUtil.getXml(
							new LocalizedValuesMap() {
								{
									put(
										LocaleUtil.fromLanguageId(
											UpgradeProcessUtil.
												getDefaultLanguageId(
													company.getCompanyId())),
										ObjectFolderConstants.NAME_DEFAULT);
								}
							},
							"Label"));
					preparedStatement.setString(
						3, ObjectFolderConstants.NAME_DEFAULT);
					preparedStatement.setLong(4, company.getCompanyId());
					preparedStatement.setString(5, "uncategorized");

					preparedStatement.executeUpdate();
				}
			});
	}

	private final CompanyLocalService _companyLocalService;

}