/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_25_1.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.dao.db.DB;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.service.ResourceActionLocalService;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Carolina Barbosa
 */
@RunWith(Arquillian.class)
public class ObjectDefinitionPortletIdUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_db = DBManagerUtil.getDB();
		_objectDefinition = ObjectDefinitionTestUtil.publishObjectDefinition();
	}

	@Test
	public void testUpgrade() throws Exception {
		String oldResourceName =
			ObjectDefinitionConstants.
				RESOURCE_NAME_PREFIX_CUSTOM_OBJECT_DEFINITION +
					_objectDefinition.getObjectDefinitionId();

		_db.runSQL(
			StringBundler.concat(
				"update ResourceAction set name = '", oldResourceName,
				"' where name = '", _objectDefinition.getResourceName(), "'"));
		_db.runSQL(
			StringBundler.concat(
				"update ResourcePermission set name = '", oldResourceName,
				"' where name = '", _objectDefinition.getResourceName(), "'"));

		Assert.assertTrue(
			ListUtil.isNotEmpty(
				_resourceActionLocalService.getResourceActions(
					oldResourceName)));
		Assert.assertTrue(
			ListUtil.isNotEmpty(
				_resourcePermissionLocalService.getResourcePermissions(
					oldResourceName)));

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				_CLASS_NAME, LoggerTestUtil.OFF)) {

			UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
				_upgradeStepRegistrator, _CLASS_NAME);

			upgradeProcess.upgrade();
		}

		Assert.assertTrue(
			ListUtil.isEmpty(
				_resourceActionLocalService.getResourceActions(
					oldResourceName)));
		Assert.assertTrue(
			ListUtil.isNotEmpty(
				_resourceActionLocalService.getResourceActions(
					_objectDefinition.getResourceName())));
		Assert.assertTrue(
			ListUtil.isEmpty(
				_resourcePermissionLocalService.getResourcePermissions(
					oldResourceName)));
		Assert.assertTrue(
			ListUtil.isNotEmpty(
				_resourcePermissionLocalService.getResourcePermissions(
					_objectDefinition.getResourceName())));
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v10_25_1." +
			"ObjectDefinitionPortletIdUpgradeProcess";

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private static UpgradeStepRegistrator _upgradeStepRegistrator;

	private DB _db;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ResourceActionLocalService _resourceActionLocalService;

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

}