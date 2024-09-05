/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v9_2_2;

import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.db.partition.util.DBPartitionUtil;
import com.liferay.portal.kernel.db.partition.DBPartition;
import com.liferay.portal.kernel.instance.PortalInstancePool;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Paulo Albuquerque
 */
public class SchemaUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		long companyId = CompanyThreadLocal.getCompanyId();
		long defaultCompanyId = PortalInstancePool.getDefaultCompanyId();

		if ((defaultCompanyId == companyId) ||
			!DBPartition.isPartitionEnabled()) {

			return;
		}

		try (PreparedStatement preparedStatement = connection.prepareStatement(
			SQLTransformer.transform(
				StringBundler.concat("select table_name from ",
					"information_schema.views where table_name like \"%",
					defaultCompanyId, "%\" and (table_name like \"%\\_x\\_%\" ",
					"or table_name like \"%\\_x\" or table_name like \"O\\_%\"",
					")")));

			 ResultSet resultSet = preparedStatement.executeQuery()) {

			while (resultSet.next()) {
				runSQL(
					StringBundler.concat(
						"drop view if exists ",
						DBPartitionUtil.getPartitionName(companyId),
						StringPool.PERIOD, resultSet.getString("table_name")));
			}
		}
	}

}