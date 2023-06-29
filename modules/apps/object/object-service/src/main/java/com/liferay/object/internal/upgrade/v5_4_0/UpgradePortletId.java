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

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.upgrade.BasePortletIdUpgradeProcess;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author Pedro Tavares
 */
public class UpgradePortletId extends BasePortletIdUpgradeProcess {

	@Override
	protected String[][] getRenamePortletIdsArray() {
		try (PreparedStatement preparedStatement1 = connection.prepareStatement(
				"select count(objectDefinitionId) from ObjectDefinition");
			PreparedStatement preparedStatement2 = connection.prepareStatement(
				"select companyId, name, objectDefinitionId from " +
					"ObjectDefinition");
			ResultSet resultSet1 = preparedStatement1.executeQuery();
			ResultSet resultSet2 = preparedStatement2.executeQuery()) {

			if (!resultSet1.next()) {
				return new String[0][0];
			}

			String[][] renamePortletIdsArray =
				new String[resultSet1.getInt(1)][2];

			while (resultSet2.next()) {
				int row = resultSet2.getRow() - 1;

				renamePortletIdsArray[row][0] =
					_BASEPORTLETID + resultSet2.getString("objectDefinitionId");
				renamePortletIdsArray[row][1] = StringBundler.concat(
					_BASEPORTLETID, resultSet2.getString("companyId"), "_",
					resultSet2.getString("name"));
			}

			return renamePortletIdsArray;
		}
		catch (SQLException sqlException) {
			if (_log.isDebugEnabled()) {
				_log.debug(sqlException);
			}

			return new String[0][0];
		}
	}

	private static final String _BASEPORTLETID =
		"com_liferay_object_web_internal_object_definitions_portlet_" +
			"ObjectDefinitionsPortlet_";

	private static final Log _log = LogFactoryUtil.getLog(
		UpgradePortletId.class);

}