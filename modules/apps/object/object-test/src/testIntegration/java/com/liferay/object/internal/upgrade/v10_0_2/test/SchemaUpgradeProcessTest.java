/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_0_2.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.list.type.model.ListTypeDefinition;
import com.liferay.list.type.service.ListTypeDefinitionLocalService;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.dao.db.DB;
import com.liferay.portal.kernel.dao.db.DBInspector;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.dao.jdbc.DataAccess;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import java.util.Collections;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Nathaly Gomes
 */
@RunWith(Arquillian.class)
public class SchemaUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testUpgrade() throws Exception {
		ListTypeDefinition listTypeDefinition =
			_listTypeDefinitionLocalService.addListTypeDefinition(
				null, TestPropsValues.getUserId(),
				Collections.singletonMap(
					LocaleUtil.US, RandomTestUtil.randomString()),
				false, Collections.emptyList());

		ObjectDefinitionTestUtil.publishObjectDefinition(
			ObjectDefinitionTestUtil.getRandomName(),
			Collections.singletonList(
				ObjectFieldUtil.createObjectField(
					listTypeDefinition.getListTypeDefinitionId(),
					ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST,
					null, ObjectFieldConstants.DB_TYPE_STRING, true, false,
					null, RandomTestUtil.randomString(),
					_OBJECT_FIELD_NAME_MULTISELECT_PICKLIST, false, false)),
			ObjectDefinitionConstants.SCOPE_COMPANY);

		Connection connection = DataAccess.getConnection();

		String dbColumnName = null;
		String dbTableName = null;

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
				DB db = DBManagerUtil.getDB();

				dbColumnName = resultSet.getString("dbColumnName");
				dbTableName = resultSet.getString("dbTableName");

				db.alterColumnType(
					connection, resultSet.getString("dbTableName"),
					resultSet.getString("dbColumnName"), "VARCHAR(280) null");
			}
		}

		DBInspector dbInspector = new DBInspector(connection);

		Assert.assertTrue(
			dbInspector.hasColumnType(
				dbTableName, dbColumnName, "VARCHAR(280) null"));

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				_CLASS_NAME, LoggerTestUtil.OFF)) {

			UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
				_upgradeStepRegistrator, _CLASS_NAME);

			upgradeProcess.upgrade();

			_multiVMPool.clear();
		}

		Assert.assertTrue(
			dbInspector.hasColumnType(
				dbTableName, dbColumnName, "VARCHAR(5000) null"));
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v10_0_2.SchemaUpgradeProcess";

	private static final String _OBJECT_FIELD_NAME_MULTISELECT_PICKLIST =
		"x" + RandomTestUtil.randomString();

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private static UpgradeStepRegistrator _upgradeStepRegistrator;

	@Inject
	private ListTypeDefinitionLocalService _listTypeDefinitionLocalService;

	@Inject
	private MultiVMPool _multiVMPool;

}