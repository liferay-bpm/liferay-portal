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
						"order by objectDefinitionId, createDate, primaryKey"));
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

			long objectDefinitionId = 0;
			int priority = _PRIORITY_INTERVAL;

			while (resultSet.next()) {
				if (objectDefinitionId != resultSet.getLong(
						"objectDefinitionId")) {

					objectDefinitionId = resultSet.getLong(
						"objectDefinitionId");
					priority = _PRIORITY_INTERVAL;
				}

				PreparedStatement updatePreparedStatement =
					updatePreparedStatement2;

				if (resultSet.getInt("objectField") == 1) {
					updatePreparedStatement = updatePreparedStatement1;
				}

				updatePreparedStatement.setInt(1, priority);
				updatePreparedStatement.setLong(
					2, resultSet.getLong("primaryKey"));

				updatePreparedStatement.addBatch();

				priority += _PRIORITY_INTERVAL;
			}

			updatePreparedStatement1.executeBatch();

			updatePreparedStatement2.executeBatch();
		}
	}

	private static final int _PRIORITY_INTERVAL = 1000;

}