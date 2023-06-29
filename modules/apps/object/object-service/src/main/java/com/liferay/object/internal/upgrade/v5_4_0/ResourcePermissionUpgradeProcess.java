/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.object.internal.upgrade.v5_4_0;

import com.liferay.object.constants.ObjectConstants;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.kernel.upgrade.BasePortletIdUpgradeProcess;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Murilo Stodolni
 */
public class ResourcePermissionUpgradeProcess
	extends BasePortletIdUpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		try (PreparedStatement preparedStatement = connection.prepareStatement(
				SQLTransformer.transform(
					"select objectDefinitionId from ObjectDefinition where " +
						"active_ = [$TRUE$] and system_ = [$FALSE$]"));
			ResultSet resultSet = preparedStatement.executeQuery()) {

			while (resultSet.next()) {
				long objectDefinitionId = resultSet.getLong(
					"objectDefinitionId");

				String newName = StringBundler.concat(
					ObjectConstants.RESOURCE_NAME_OBJECT_DEFINITION,
					StringPool.POUND, objectDefinitionId);
				String oldName = StringBundler.concat(
					_RESOURCE_NAME, StringPool.POUND, objectDefinitionId);

				updateResourceAction(oldName, newName);

				updateResourcePermission(oldName, newName, true);
			}
		}

		updateResourceAction(
			_RESOURCE_NAME, ObjectConstants.RESOURCE_NAME_OBJECT_DEFINITION);

		updateResourcePermission(
			_RESOURCE_NAME, ObjectConstants.RESOURCE_NAME_OBJECT_DEFINITION,
			true);
	}

	private static final String _RESOURCE_NAME = "com.liferay.object";

}