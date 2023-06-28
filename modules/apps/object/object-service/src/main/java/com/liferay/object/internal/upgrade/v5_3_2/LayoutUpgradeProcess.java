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

package com.liferay.object.internal.upgrade.v5_3_2;

import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.petra.string.StringUtil;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.UnicodePropertiesBuilder;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

import java.util.List;
import java.util.Map;

/**
 * @author Pedro Tavares
 */
public class LayoutUpgradeProcess extends UpgradeProcess {

	@Override
	protected void doUpgrade() throws Exception {
		try (PreparedStatement preparedStatement1 = connection.prepareStatement(
			"select companyId, name, objectDefinitionId from ObjectDefinition");

			 PreparedStatement preparedStatement2 =
				 connection.prepareStatement(
					 "select typeSettings, uuid_ from Layout where " +
					 "typeSettings like ?");

			 PreparedStatement preparedStatement3 =
				 connection.prepareStatement(
					 "update Layout set typeSettings = ? where uuid_ = ?");

			 ResultSet resultSet1 = preparedStatement1.executeQuery()) {

			while (resultSet1.next()) {
				preparedStatement2.setString(
					1,
					StringBundler.concat(
						"%", _BASEPORTLETID,
						resultSet1.getString("objectDefinitionId"), "%"));

				try (ResultSet resultSet2 = preparedStatement2.executeQuery()) {
					while (resultSet2.next()) {
						preparedStatement3.setString(
							1,
							_updateTypeSettings(
								resultSet1.getString("companyId"),
								resultSet1.getString("name"),
								resultSet1.getString("objectDefinitionId"),
								resultSet2.getString("typeSettings")));

						preparedStatement3.setString(
							2, resultSet2.getString("uuid_"));
						preparedStatement3.execute();
					}
				}
			}
		}
	}

	private String _updateTypeSettings(
		String companyId, String name, String objectDefinitionId,
		String typeSettings) {

		UnicodeProperties typeSettingsUnicodeProperties =
			UnicodePropertiesBuilder.load(
				typeSettings
			).build();

		for (Map.Entry<String, String> entry :
				typeSettingsUnicodeProperties.entrySet()) {

			List<String> values = ListUtil.fromString(
				entry.getValue(), StringPool.COMMA);

			for (int i = 0; i < values.size(); i++) {
				String value = values.get(i);

				if (value.endsWith(_BASEPORTLETID + objectDefinitionId)) {
					values.set(
						i,
						StringBundler.concat(
							_BASEPORTLETID, companyId, "_", name));
				}
			}

			entry.setValue(StringUtil.merge(values, StringPool.COMMA));
		}

		return typeSettingsUnicodeProperties.toString();
	}

	private static final String _BASEPORTLETID =
		"com_liferay_object_web_internal_object_definitions_portlet_" +
			"ObjectDefinitionsPortlet_";

}