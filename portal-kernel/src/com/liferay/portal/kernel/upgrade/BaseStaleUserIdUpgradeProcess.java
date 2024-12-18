/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.kernel.upgrade;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.dao.jdbc.AutoBatchPreparedStatementUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Igor Costa
 */
public abstract class BaseStaleUserIdUpgradeProcess extends UpgradeProcess {

	public BaseStaleUserIdUpgradeProcess(UserLocalService userLocalService) {
		_userLocalService = userLocalService;
	}

	protected void upgradeUserId(String columnName, String tableName)
		throws Exception {

		try (PreparedStatement preparedStatement1 = connection.prepareStatement(
				StringBundler.concat(
					"SELECT t.", columnName, ", t.companyId, t.userId FROM ",
					tableName,
					" t LEFT JOIN User_ ON t.userId = User_.userId WHERE ",
					"User_.userId IS NULL"));
			PreparedStatement preparedStatement2 =
				AutoBatchPreparedStatementUtil.concurrentAutoBatch(
					connection,
					StringBundler.concat(
						"update ", tableName, " set userId = ? where ",
						columnName, " = ?"));
			ResultSet resultSet = preparedStatement1.executeQuery()) {

			while (resultSet.next()) {
				User defaultServiceAccountUser =
					_userLocalService.fetchUserByScreenName(
						resultSet.getLong("companyId"),
						"default-service-account");

				preparedStatement2.setLong(
					1, defaultServiceAccountUser.getUserId());

				preparedStatement2.setLong(2, resultSet.getLong(columnName));

				preparedStatement2.addBatch();
			}

			preparedStatement2.executeBatch();
		}
	}

	private final UserLocalService _userLocalService;

}