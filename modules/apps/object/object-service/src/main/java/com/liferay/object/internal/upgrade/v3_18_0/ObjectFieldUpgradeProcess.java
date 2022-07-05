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

package com.liferay.object.internal.upgrade.v3_18_0;

import com.liferay.object.model.ObjectEntryTable;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.util.LocalizedMapUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.upgrade.util.UpgradeProcessUtil;
import com.liferay.portal.kernel.util.LocaleUtil;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * @author Mateus Santana
 */
public class ObjectFieldUpgradeProcess extends UpgradeProcess {

	public ObjectFieldUpgradeProcess(
		ObjectFieldLocalService objectFieldLocalService) {

		_objectFieldLocalService = objectFieldLocalService;
	}

	@Override
	protected void doUpgrade() throws Exception {
		try (PreparedStatement preparedStatement = connection.prepareStatement(
			StringBundler.concat("SELECT ObjectDefinition.companyId, ",
				"ObjectDefinition.dbTableName, ",
				"ObjectDefinition.objectDefinitionId, ",
				"ObjectDefinition.system_, ObjectDefinition.userId FROM ",
				"ObjectDefinition WHERE ObjectDefinition.objectDefinitionId ",
				"NOT IN (SELECT DISTINCT ObjectField.objectDefinitionId FROM ",
				"ObjectField WHERE (ObjectField.name = \"creator\" or ",
				"ObjectField.name = \"dateCreated\" or ObjectField.name = ",
				"\"dateModified\" or ObjectField.name = \"id\" or ",
				"ObjectField.name = \"status\") AND ObjectField.system_ = ",
				"true)"));

			 ResultSet resultSet = preparedStatement.executeQuery()) {

			while (resultSet.next()) {
				long companyId = resultSet.getLong("companyId");
				String dbTableName = resultSet.getString("dbTableName");
				long objectDefinitionId = resultSet.getLong(
					"objectDefinitionId");
				long system = resultSet.getLong("system_");
				long userId = resultSet.getLong("userId");

				if (system == 0) {
					dbTableName = "ObjectEntry";
				}

				_objectFieldLocalService.addSystemObjectField(
					userId, objectDefinitionId, "Text",
					ObjectEntryTable.INSTANCE.userName.getName(), dbTableName,
					"String", null, false, false, null,
					LocalizedMapUtil.getLocalizedMap(
						LanguageUtil.get(
							LocaleUtil.fromLanguageId(
								UpgradeProcessUtil.getDefaultLanguageId(
									companyId)),
							"author")),
					"creator", false, false);

				_objectFieldLocalService.addSystemObjectField(
					userId, objectDefinitionId, "Date",
					ObjectEntryTable.INSTANCE.createDate.getName(), dbTableName,
					"Date", null, false, false, null,
					LocalizedMapUtil.getLocalizedMap(
						LanguageUtil.get(
							LocaleUtil.fromLanguageId(
								UpgradeProcessUtil.getDefaultLanguageId(
									companyId)),
							"create-date")),
					"createDate", false, false);

				_objectFieldLocalService.addSystemObjectField(
					userId, objectDefinitionId, "Integer",
					ObjectEntryTable.INSTANCE.objectEntryId.getName(),
					resultSet.getString("dbTableName"), "Integer", null, false,
					false, null,
					LocalizedMapUtil.getLocalizedMap(
						LanguageUtil.get(
							LocaleUtil.fromLanguageId(
								UpgradeProcessUtil.getDefaultLanguageId(
									companyId)),
							"id")),
					"id", false, false);

				_objectFieldLocalService.addSystemObjectField(
					userId, objectDefinitionId, "Date",
					ObjectEntryTable.INSTANCE.modifiedDate.getName(),
					dbTableName, "Date", null, false, false, null,
					LocalizedMapUtil.getLocalizedMap(
						LanguageUtil.get(
							LocaleUtil.fromLanguageId(
								UpgradeProcessUtil.getDefaultLanguageId(
									companyId)),
							"modified-date")),
					"modifiedDate", false, false);

				_objectFieldLocalService.addSystemObjectField(
					userId, objectDefinitionId, "Text",
					ObjectEntryTable.INSTANCE.status.getName(), dbTableName,
					"Integer", null, false, false, null,
					LocalizedMapUtil.getLocalizedMap(
						LanguageUtil.get(
							LocaleUtil.fromLanguageId(
								UpgradeProcessUtil.getDefaultLanguageId(
									companyId)),
							"status")),
					"status", false, false);
			}
		}
	}

	private final ObjectFieldLocalService _objectFieldLocalService;

}