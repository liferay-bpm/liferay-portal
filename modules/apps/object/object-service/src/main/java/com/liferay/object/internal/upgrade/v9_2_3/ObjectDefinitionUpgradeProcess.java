/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v9_2_3;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.kernel.dao.db.DBInspector;
import com.liferay.portal.kernel.dao.jdbc.AutoBatchPreparedStatementUtil;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.upgrade.UpgradeProcessFactory;
import com.liferay.portal.kernel.util.StringUtil;

import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Paulo Albuquerque
 */
public class ObjectDefinitionUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		DatabaseMetaData databaseMetaData = connection.getMetaData();
		DBInspector dbInspector = new DBInspector(connection);

		try (ResultSet resultSet = databaseMetaData.getTables(
				dbInspector.getCatalog(), dbInspector.getSchema(), null,
				new String[] {"TABLE"})) {

			String prefix = "l_" + CompanyThreadLocal.getCompanyId();

			while (resultSet.next()) {
				String tableName = resultSet.getString("TABLE_NAME");

				if (StringUtil.startsWith(
						StringUtil.toLowerCase(tableName), prefix)) {

					_upgradeModifiablePrimaryKeyColumnName(prefix, tableName);
				}
			}
		}
	}

	private void _upgradeModifiablePrimaryKeyColumnName(
			String prefix, String tableName)
		throws Exception {

		String objectDefinitionName = StringUtil.removeSubstring(
			tableName, prefix);

		try (PreparedStatement preparedStatement1 = connection.prepareStatement(
				SQLTransformer.transform(
					StringBundler.concat(
						"select objectDefinitionId, ",
						"pkObjectFieldDBColumnName, pkObjectFieldName from ",
						"ObjectDefinition where name = ",
						objectDefinitionName)));
			PreparedStatement preparedStatement2 =
				AutoBatchPreparedStatementUtil.concurrentAutoBatch(
					connection,
					"update ObjectDefinition set pkObjectFieldDBColumnName = " +
						"?, pkObjectFieldName = ? where objectDefinitionId = " +
							"?");
			ResultSet resultSet = preparedStatement1.executeQuery()) {

			while (resultSet.next()) {
				String pkObjectFieldDBColumnName = resultSet.getString(
					"pkObjectFieldDBColumnName");

				String newPKObjectFieldDBColumnName = StringUtil.replaceFirst(
					pkObjectFieldDBColumnName, "c_", "l_");

				UpgradeProcessFactory.alterColumnName(
					tableName, pkObjectFieldDBColumnName,
					newPKObjectFieldDBColumnName);

				preparedStatement2.setString(0, newPKObjectFieldDBColumnName);

				preparedStatement2.setString(
					1,
					StringUtil.replaceFirst(
						resultSet.getString("pkObjectFieldName"), "c_", "l_"));

				preparedStatement2.setString(
					2, resultSet.getString("objectDefinitionId"));

				preparedStatement2.addBatch();
			}

			preparedStatement2.executeBatch();
		}
	}

}