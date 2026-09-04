/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v13_7_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectActionExecutorConstants;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.model.ObjectAction;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.upgrade.util.UpgradeProcessUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.LocalizationUtil;
import com.liferay.portal.kernel.util.UnicodePropertiesBuilder;
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
 * @author Nathaly Gomes
 */
@RunWith(Arquillian.class)
public class ObjectActionDescriptionUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final LiferayIntegrationTestRule liferayIntegrationTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testUpgrade() throws Exception {
		ObjectDefinition objectDefinition =
			ObjectDefinitionTestUtil.publishObjectDefinition(
				Collections.singletonList(
					new TextObjectFieldBuilder(
					).labelMap(
						LocalizedMapUtil.getLocalizedMap(
							RandomTestUtil.randomString())
					).name(
						"a" + RandomTestUtil.randomString()
					).build()),
				false);

		String localizedDescription = LocalizationUtil.updateLocalization(
			HashMapBuilder.put(
				LocaleUtil.SPAIN, _DESCRIPTION
			).build(),
			StringPool.BLANK, "Description", LocaleUtil.SPAIN.toString());

		ObjectAction objectAction1 = _addObjectAction(
			_DESCRIPTION, objectDefinition);
		ObjectAction objectAction2 = _addObjectAction(
			localizedDescription, objectDefinition);
		ObjectAction objectAction3 = _addObjectAction(
			StringPool.BLANK, objectDefinition);

		Assert.assertEquals(_DESCRIPTION, objectAction1.getDescription());

		UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
			_upgradeStepRegistrator, _CLASS_NAME);

		upgradeProcess.upgrade();

		_multiVMPool.clear();

		// A plain value is wrapped under the company's default language

		objectAction1 = _objectActionLocalService.getObjectAction(
			objectAction1.getObjectActionId());

		Assert.assertNotEquals(_DESCRIPTION, objectAction1.getDescription());
		Assert.assertEquals(
			_DESCRIPTION,
			objectAction1.getDescription(
				LocaleUtil.fromLanguageId(
					UpgradeProcessUtil.getDefaultLanguageId(
						objectAction1.getCompanyId()))));

		// A value that is already localized is left alone

		objectAction2 = _objectActionLocalService.getObjectAction(
			objectAction2.getObjectActionId());

		Assert.assertEquals(
			localizedDescription, objectAction2.getDescription());

		// A blank value is left alone

		objectAction3 = _objectActionLocalService.getObjectAction(
			objectAction3.getObjectActionId());

		Assert.assertEquals(StringPool.BLANK, objectAction3.getDescription());
	}

	private ObjectAction _addObjectAction(
			String description, ObjectDefinition objectDefinition)
		throws Exception {

		ObjectAction objectAction = _objectActionLocalService.addObjectAction(
			RandomTestUtil.randomString(), TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId(), true, StringPool.BLANK,
			null,
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			"a" + RandomTestUtil.randomString(),
			ObjectActionExecutorConstants.KEY_WEBHOOK,
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			UnicodePropertiesBuilder.put(
				"secret", "0123456789"
			).put(
				"url", "https://onafteradd.com"
			).build(),
			false);

		objectAction.setDescription(description);

		return _objectActionLocalService.updateObjectAction(objectAction);
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v13_7_0." +
			"ObjectActionDescriptionUpgradeProcess";

	private static final String _DESCRIPTION = "Able Description";

	@Inject
	private MultiVMPool _multiVMPool;

	@Inject
	private ObjectActionLocalService _objectActionLocalService;

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private UpgradeStepRegistrator _upgradeStepRegistrator;

}