/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v9_2_3.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Collections;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Paulo Albuquerque
 */
@RunWith(Arquillian.class)
public class ObjectDefinitionUpgradeProcessTest {

	@Test
	public void testUpgrade() throws Exception {
		ObjectDefinition objectDefinition =
			ObjectDefinitionTestUtil.addModifiableSystemObjectDefinition(
				TestPropsValues.getUserId(), null, false,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"Test", null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionConstants.SCOPE_SITE, null, 1,
				Collections.singletonList(
					ObjectFieldUtil.createObjectField(
						ObjectFieldConstants.BUSINESS_TYPE_TEXT,
						ObjectFieldConstants.DB_TYPE_STRING,
						RandomTestUtil.randomString(), StringUtil.randomId())));

		objectDefinition.setPKObjectFieldDBColumnName(
			StringUtil.replaceFirst(
				objectDefinition.getPKObjectFieldDBColumnName(), "l_", "c_"));
		objectDefinition.setPKObjectFieldName(
			StringUtil.replaceFirst(
				objectDefinition.getPKObjectFieldName(), "l_", "c_"));

		objectDefinition = _objectDefinitionLocalService.updateObjectDefinition(
			objectDefinition);

		String pkObjectFieldDBColumnName =
			objectDefinition.getPKObjectFieldDBColumnName();

		Assert.assertTrue(pkObjectFieldDBColumnName.startsWith("c_"));

		String pkObjectFieldName = objectDefinition.getPKObjectFieldName();

		Assert.assertTrue(pkObjectFieldName.startsWith("c_"));

		UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
			_upgradeStepRegistrator, _CLASS_NAME);

		upgradeProcess.upgrade();

		objectDefinition = _objectDefinitionLocalService.getObjectDefinition(
			objectDefinition.getObjectDefinitionId());

		pkObjectFieldDBColumnName =
			objectDefinition.getPKObjectFieldDBColumnName();

		Assert.assertTrue(pkObjectFieldDBColumnName.startsWith("l_"));

		pkObjectFieldName = objectDefinition.getPKObjectFieldName();

		Assert.assertTrue(pkObjectFieldName.startsWith("l_"));
	}

	private static final String _CLASS_NAME =
		"com.liferay.object.internal.upgrade.v9_2_3." +
			"ObjectDefinitionUpgradeProcess";

	@Inject(
		filter = "component.name=com.liferay.object.internal.upgrade.registry.ObjectServiceUpgradeStepRegistrator"
	)
	private static UpgradeStepRegistrator _upgradeStepRegistrator;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

}