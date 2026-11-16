/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v13_15_1;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.dao.jdbc.AutoBatchPreparedStatementUtil;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Mario Gomes
 */
public class ObjectDefinitionPriorityUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		try (PreparedStatement selectPreparedStatement =
				connection.prepareStatement(
					StringBundler.concat(
						"select objectDefinitionId, createDate, objectFieldId ",
						"as primaryKey, 1 as objectField from ObjectField ",
						"union all select objectDefinitionId1, createDate, ",
						"objectRelationshipId, 0 from ObjectRelationship ",
						"order by 1, 2, 3"));
			PreparedStatement updatePreparedStatement1 =
				AutoBatchPreparedStatementUtil.concurrentAutoBatch(
					connection,
					"update ObjectField set priority = ? where objectFieldId " +
						"= ?");
			PreparedStatement updatePreparedStatement2 =
				AutoBatchPreparedStatementUtil.concurrentAutoBatch(
					connection,
					"update ObjectRelationship set priority = ? where " +
						"objectRelationshipId = ?");
			ResultSet resultSet = selectPreparedStatement.executeQuery()) {

			int count = 0;
			long objectDefinitionId = 0;

			while (resultSet.next()) {
				if (objectDefinitionId != resultSet.getLong(
						"objectDefinitionId")) {

					count = 0;
					objectDefinitionId = resultSet.getLong(
						"objectDefinitionId");
				}

				PreparedStatement updatePreparedStatement =
					updatePreparedStatement2;

				if (resultSet.getInt("objectField") == 1) {
					updatePreparedStatement = updatePreparedStatement1;
				}

				updatePreparedStatement.setInt(
					1,
					Math.min(count, Integer.MAX_VALUE / _PRIORITY_INTERVAL) *
						_PRIORITY_INTERVAL);
				updatePreparedStatement.setLong(
					2, resultSet.getLong("primaryKey"));

				updatePreparedStatement.addBatch();

				count++;
			}

			updatePreparedStatement1.executeBatch();

			updatePreparedStatement2.executeBatch();
		}
	}

	private static final int _PRIORITY_INTERVAL = 1000000;

}