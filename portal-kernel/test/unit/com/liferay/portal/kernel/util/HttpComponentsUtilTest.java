/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.kernel.util;

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.util.RandomTestUtil;

import java.net.InetAddress;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Alberto Chaparro
 */
public class HttpComponentsUtilTest {

	@BeforeClass
	public static void setUpClass() {
		_propsUtilMockedStatic.when(
			() -> PropsUtil.get(PropsKeys.DNS_SECURITY_ADDRESS_TIMEOUT_SECONDS)
		).thenReturn(
			String.valueOf(2)
		);

		_propsUtilMockedStatic.when(
			() -> PropsUtil.get(PropsKeys.DNS_SECURITY_THREAD_LIMIT)
		).thenReturn(
			String.valueOf(10)
		);

		_propsUtilMockedStatic.when(
			() -> PropsUtil.get(PropsKeys.DNS_SECURITY_THREAD_QUEUE_LIMIT)
		).thenReturn(
			String.valueOf(5)
		);
	}

	@AfterClass
	public static void tearDownClass() {
		_propsUtilMockedStatic.close();
	}

	@Test
	@TestInfo("LPD-106200")
	public void testHasHTTPProtocol() {
		String host = RandomTestUtil.randomString() + ".com";

		Assert.assertFalse(HttpComponentsUtil.hasHTTPProtocol("/" + host));
		Assert.assertTrue(HttpComponentsUtil.hasHTTPProtocol("HTTP://" + host));
		Assert.assertTrue(
			HttpComponentsUtil.hasHTTPProtocol("HTTPS://" + host));
		Assert.assertFalse(
			HttpComponentsUtil.hasHTTPProtocol("file:///" + host));
		Assert.assertFalse(HttpComponentsUtil.hasHTTPProtocol("ftp://" + host));
		Assert.assertTrue(HttpComponentsUtil.hasHTTPProtocol("http://" + host));
		Assert.assertTrue(
			HttpComponentsUtil.hasHTTPProtocol("https://" + host));
		Assert.assertFalse(
			HttpComponentsUtil.hasHTTPProtocol("httpx://" + host));
		Assert.assertFalse(HttpComponentsUtil.hasHTTPProtocol(host));

		Assert.assertFalse(
			HttpComponentsUtil.hasHTTPProtocol(StringPool.BLANK));
		Assert.assertFalse(HttpComponentsUtil.hasHTTPProtocol(null));
	}

	@Test
	@TestInfo("LPD-108705")
	public void testIsAllowedURL() throws Exception {
		Assert.assertFalse(
			HttpComponentsUtil.isAllowedURL(
				"ftp://8.8.8.8", new String[0], false));
		Assert.assertFalse(
			HttpComponentsUtil.isAllowedURL(
				"http:///path", new String[0], false));
		Assert.assertFalse(
			HttpComponentsUtil.isAllowedURL(
				"http://127.0.0.1", new String[0], false));
		Assert.assertTrue(
			HttpComponentsUtil.isAllowedURL(
				"http://127.0.0.1", new String[0], true));
		Assert.assertTrue(
			HttpComponentsUtil.isAllowedURL(
				"http://8.8.8.8", new String[0], false));
		Assert.assertFalse(
			HttpComponentsUtil.isAllowedURL(
				"https://8.8.8.8", new String[] {"liferay.com"}, true));
		Assert.assertTrue(
			HttpComponentsUtil.isAllowedURL(
				"https://LIFERAY.com", new String[] {"liferay.com"}, true));
		Assert.assertFalse(
			HttpComponentsUtil.isAllowedURL(null, new String[0], true));

		try (MockedStatic<InetAddressUtil> inetAddressUtilMockedStatic =
				Mockito.mockStatic(InetAddressUtil.class)) {

			inetAddressUtilMockedStatic.when(
				() -> InetAddressUtil.getInetAddressesByName("liferay.com")
			).thenReturn(
				new InetAddress[] {
					InetAddress.getByName("8.8.8.8"),
					InetAddress.getByName("127.0.0.1")
				}
			);

			inetAddressUtilMockedStatic.when(
				() -> InetAddressUtil.getInetAddressesByName("www.liferay.com")
			).thenReturn(
				new InetAddress[] {
					InetAddress.getByName("8.8.4.4"),
					InetAddress.getByName("8.8.8.8")
				}
			);

			inetAddressUtilMockedStatic.when(
				() -> InetAddressUtil.isLocalInetAddress(Mockito.any())
			).thenCallRealMethod();

			Assert.assertFalse(
				HttpComponentsUtil.isAllowedURL(
					"http://liferay.com", new String[0], false));
			Assert.assertTrue(
				HttpComponentsUtil.isAllowedURL(
					"http://www.liferay.com", new String[0], false));
		}
	}

	private static final MockedStatic<PropsUtil> _propsUtilMockedStatic =
		Mockito.mockStatic(PropsUtil.class, Mockito.CALLS_REAL_METHODS);

}