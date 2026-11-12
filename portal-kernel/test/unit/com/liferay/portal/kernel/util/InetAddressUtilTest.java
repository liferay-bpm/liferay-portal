/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.kernel.util;

import java.net.InetAddress;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Jhosseph Gonzalez
 */
public class InetAddressUtilTest {

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
	public void testIsLocalInetAddressWithSharedIPv4Address() throws Exception {
		Assert.assertFalse(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("100.63.255.255")));
		Assert.assertTrue(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("100.64.0.1")));
		Assert.assertTrue(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("100.127.255.255")));
		Assert.assertFalse(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("100.128.0.1")));
	}

	@Test
	public void testIsLocalInetAddressWithUniqueLocalIPv6Address()
		throws Exception {

		// Global unicast address

		Assert.assertFalse(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("2001:4860:4860::8888")));

		// Unique local addresses (fc00::/7)

		Assert.assertTrue(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("fc00::1")));
		Assert.assertTrue(
			InetAddressUtil.isLocalInetAddress(
				InetAddress.getByName("fd12:3456:789a::1")));
	}

	private static final MockedStatic<PropsUtil> _propsUtilMockedStatic =
		Mockito.mockStatic(PropsUtil.class, Mockito.CALLS_REAL_METHODS);

}