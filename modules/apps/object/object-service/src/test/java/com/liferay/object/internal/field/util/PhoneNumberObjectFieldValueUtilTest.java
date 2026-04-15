/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.field.util;

import com.liferay.portal.test.rule.LiferayUnitTestRule;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Yuri Monteiro
 */
public class PhoneNumberObjectFieldValueUtilTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testIsValid() {
		Assert.assertFalse(PhoneNumberObjectFieldValueUtil.isValid(null));
		Assert.assertFalse(
			PhoneNumberObjectFieldValueUtil.isValid("5551234567"));
		Assert.assertFalse(PhoneNumberObjectFieldValueUtil.isValid("+12-ABC"));
		Assert.assertTrue(
			PhoneNumberObjectFieldValueUtil.isValid("+55 (11) 5555-1234"));
	}

	@Test
	public void testNormalize() {
		Assert.assertNull(PhoneNumberObjectFieldValueUtil.normalize(null));
		Assert.assertEquals(
			"+551155551234",
			PhoneNumberObjectFieldValueUtil.normalize("+55 (11) 5555-1234"));
		Assert.assertEquals(
			"+12A", PhoneNumberObjectFieldValueUtil.normalize("+12 A"));
	}

}