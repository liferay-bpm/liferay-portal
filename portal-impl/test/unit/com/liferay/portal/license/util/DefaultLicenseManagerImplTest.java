/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.license.util;

import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;
import com.liferay.portal.util.LicenseUtil;

import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Victor Kammerer
 */
public class DefaultLicenseManagerImplTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testRegisterLicense() throws Exception {
		try (MockedStatic<LicenseUtil> licenseUtilMockedStatic =
				Mockito.mockStatic(LicenseUtil.class)) {

			_defaultLicenseManagerImpl.registerLicense(
				JSONUtil.put("licenseXML", "<license />"));
			_defaultLicenseManagerImpl.registerLicense(
				JSONUtil.put("serverId", "[]"));

			licenseUtilMockedStatic.verify(
				() -> LicenseUtil.writeServerProperties(Mockito.any()),
				Mockito.never());

			_defaultLicenseManagerImpl.registerLicense(
				JSONUtil.put("serverId", "[1, 2, 3]"));

			licenseUtilMockedStatic.verify(
				() -> LicenseUtil.writeServerProperties(Mockito.any()));
		}
	}

	private final DefaultLicenseManagerImpl _defaultLicenseManagerImpl =
		new DefaultLicenseManagerImpl();

}