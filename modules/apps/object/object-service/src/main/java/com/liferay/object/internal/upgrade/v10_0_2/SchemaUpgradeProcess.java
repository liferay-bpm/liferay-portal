/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_0_2;

import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.workflow.WorkflowConstants;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Nathaly Gomes
 */
public class SchemaUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		try (PreparedStatement preparedStatement = connection.prepareStatement(
				SQLTransformer.transform(
					StringBundler.concat(
						"select ObjectField.dbColumnName, ",
						"ObjectField.dbTableName from ObjectField inner join ",
						"ObjectDefinition on ",
						"ObjectDefinition.objectDefinitionId = ",
						"ObjectField.objectDefinitionId where ",
						"ObjectDefinition.status = ",
						WorkflowConstants.STATUS_APPROVED,
						" and ObjectField.businessType = '",
						ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST,
						"'")));
			ResultSet resultSet = preparedStatement.executeQuery()) {

			while (resultSet.next()) {
				alterColumnType(
					resultSet.getString("dbTableName"),
					resultSet.getString("dbColumnName"), "VARCHAR(5000) null");
			}
		}
	}

}