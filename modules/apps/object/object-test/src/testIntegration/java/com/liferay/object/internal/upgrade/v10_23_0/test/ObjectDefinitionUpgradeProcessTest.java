/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v10_23_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Collections;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Mario Gomes
 */
@RunWith(Arquillian.class)
public class ObjectDefinitionUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final LiferayIntegrationTestRule liferayIntegrationTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testUpgrade() throws Exception {
		ObjectDefinition customObjectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				TestPropsValues.getUserId(), 0, null, false, true, true, true,
				false, false, false, false, false, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionTestUtil.getRandomName(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.emptyList(), Collections.emptyList(),
				Collections.emptyList());

		ObjectDefinition modifiableSystemObjectDefinition =
			_objectDefinitionLocalService.addSystemObjectDefinition(
				null, TestPropsValues.getUserId(), 0, null, null, false, false,
				false, true, false, false, false, false, false, null,
				RandomTestUtil.randomLocaleStringMap(), true, "Test", null,
				null, null, null, RandomTestUtil.randomLocaleStringMap(), false,
				ObjectDefinitionConstants.SCOPE_COMPANY, null, 1,
				WorkflowConstants.STATUS_APPROVED, Collections.emptyList(),
				Collections.emptyList(), Collections.emptyList());

		ObjectDefinition systemObjectDefinition =
			_objectDefinitionLocalService.addSystemObjectDefinition(
				null, TestPropsValues.getUserId(), 0, null, null, false, false,
				false, true, false, false, false, false, false, null,
				RandomTestUtil.randomLocaleStringMap(), false,
				ObjectDefinitionTestUtil.getRandomName(), null, null, null,
				null, RandomTestUtil.randomLocaleStringMap(), false,
				ObjectDefinitionConstants.SCOPE_COMPANY, null, 1,
				WorkflowConstants.STATUS_APPROVED, Collections.emptyList(),
				Collections.emptyList(), Collections.emptyList());

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				_CLASS_NAME, LoggerTestUtil.OFF)) {

			UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
				_upgradeStepRegistrator, _CLASS_NAME);

			upgradeProcess.upgrade();

			_multiVMPool.clear();
		}

		_assertEnableFormContainer(
			customObjectDefinition.getObjectDefinitionId(), true);
		_assertEnableFormContainer(
			modifiableSystemObjectDefinition.getObjectDefinitionId(), true);
		_assertEnableFormContainer(
			systemObjectDefinition.getObjectDefinitionId(), false);

		_objectDefinitionLocalService.deleteObjectDefinition(
			customObjectDefinition);
		_objectDefinitionLocalService.deleteObjectDefinition(
			modifiableSystemObjectDefinition);
		_objectDefinitionLocalService.deleteObjectDefinition(
			systemObjectDefinition);
	}

	private void _assertEnableFormContainer(
		long objectDefinitionId, boolean expectedResult) {

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.fetchObjectDefinition(
				objectDefinitionId);

		Assert.assertEquals(
			expectedResult, objectDefinition.isEnableFormContainer());
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v10_23_0." +
			"ObjectDefinitionUpgradeProcess";

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private static UpgradeStepRegistrator _upgradeStepRegistrator;

	@Inject
	private MultiVMPool _multiVMPool;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

}