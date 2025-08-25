/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_22_1.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.dao.orm.EntityCache;
import com.liferay.portal.kernel.exception.NoSuchResourceActionException;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.ResourceAction;
import com.liferay.portal.kernel.model.ResourceConstants;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.service.ResourceActionLocalService;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
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
 * @author Mario Gomes
 */
@RunWith(Arquillian.class)
public class ResourceActionUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();
	}

	@Test
	public void testUpgrade() throws Exception {
		ResourceAction oldResourceAction =
			_resourceActionLocalService.addResourceAction(
				_OLD_NAME, _OLD_ACTION, 64L);

		_resourceActionLocalService.addResourceAction(
			_NEW_NAME, _NEW_ACTION, 4L);

		Role role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);

		RoleTestUtil.addResourcePermission(
			role, _OLD_NAME, ResourceConstants.SCOPE_COMPANY,
			String.valueOf(_group.getCompanyId()), ActionKeys.UPDATE);
		RoleTestUtil.addResourcePermission(
			role, _OLD_NAME, ResourceConstants.SCOPE_COMPANY,
			String.valueOf(TestPropsValues.getCompanyId()), _OLD_ACTION);

		_runUpgrade();

		Assert.assertTrue(
			_resourcePermissionLocalService.hasResourcePermission(
				_group.getCompanyId(), _NEW_NAME,
				ResourceConstants.SCOPE_COMPANY,
				String.valueOf(_group.getCompanyId()), role.getRoleId(),
				_NEW_ACTION));

		AssertUtils.assertFailure(
			NoSuchResourceActionException.class,
			"No ResourceAction exists with the primary key " +
				oldResourceAction.getResourceActionId(),
			() -> _resourceActionLocalService.getResourceAction(
				oldResourceAction.getResourceActionId()));
	}

	private void _runUpgrade() throws Exception {
		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				_CLASS_NAME, LoggerTestUtil.OFF)) {

			UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
				_upgradeStepRegistrator, _CLASS_NAME);

			upgradeProcess.upgrade();

			_entityCache.clearCache();
			_multiVMPool.clear();
		}
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v10_22_1." +
			"ResourceActionUpgradeProcess";

	private static final String _NEW_ACTION = "ADD_OBJECT_ENTRY_FOLDER";

	private static final String _NEW_NAME = "com.liferay.object.entry.folder";

	private static final String _OLD_ACTION = "ADD_FOLDER";

	private static final String _OLD_NAME =
		"com.liferay.object.model.ObjectEntryFolder";

	@Inject(
		filter = "(&(component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator))"
	)
	private static UpgradeStepRegistrator _upgradeStepRegistrator;

	@Inject
	private EntityCache _entityCache;

	@DeleteAfterTestRun
	private Group _group;

	@Inject
	private MultiVMPool _multiVMPool;

	@Inject
	private ResourceActionLocalService _resourceActionLocalService;

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

}