/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v13_15_1.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.object.test.util.ObjectRelationshipTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.dao.db.DB;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.dao.jdbc.DataAccess;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.version.Version;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import java.util.List;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Mario Gomes
 */
@RunWith(Arquillian.class)
public class ObjectDefinitionPriorityUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Test
	public void testUpgrade() throws Exception {
		ObjectDefinition objectDefinition1 =
			ObjectDefinitionTestUtil.publishObjectDefinition();
		ObjectDefinition objectDefinition2 =
			ObjectDefinitionTestUtil.publishObjectDefinition();

		ObjectRelationship objectRelationship =
			ObjectRelationshipTestUtil.addObjectRelationship(
				_objectRelationshipLocalService, objectDefinition1,
				objectDefinition2);

		DB db = DBManagerUtil.getDB();

		db.runSQL("update ObjectField set priority = null");
		db.runSQL("update ObjectRelationship set priority = null");

		for (UpgradeProcess upgradeProcess :
				UpgradeTestUtil.getUpgradeSteps(
					_upgradeStepRegistrator, new Version(13, 15, 1))) {

			upgradeProcess.upgrade();
		}

		List<ObjectField> objectFields1 =
			_objectFieldLocalService.getObjectFields(
				objectDefinition1.getObjectDefinitionId());

		Assert.assertEquals(
			String.valueOf(objectFields1.size() * 1000000),
			_getPriority(
				objectRelationship.getObjectRelationshipId(),
				"objectRelationshipId", "ObjectRelationship"));

		List<ObjectField> objectFields2 =
			_objectFieldLocalService.getObjectFields(
				objectDefinition2.getObjectDefinitionId());

		Assert.assertEquals(
			String.valueOf((objectFields2.size() - 1) * 1000000),
			_getPriority(
				objectRelationship.getObjectFieldId2(), "objectFieldId",
				"ObjectField"));
	}

	private String _getPriority(
			long primaryKey, String primaryKeyColumnName, String tableName)
		throws Exception {

		try (Connection connection = DataAccess.getConnection();

			PreparedStatement preparedStatement = connection.prepareStatement(
				StringBundler.concat(
					"select priority from ", tableName, " where ",
					primaryKeyColumnName, " = ?"))) {

			preparedStatement.setLong(1, primaryKey);

			try (ResultSet resultSet = preparedStatement.executeQuery()) {
				Assert.assertTrue(resultSet.next());

				return resultSet.getString("priority");
			}
		}
	}

	@Inject
	private ObjectFieldLocalService _objectFieldLocalService;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private UpgradeStepRegistrator _upgradeStepRegistrator;

}