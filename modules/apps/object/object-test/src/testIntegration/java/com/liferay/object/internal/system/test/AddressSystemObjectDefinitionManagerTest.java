/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.system.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.system.SystemObjectDefinitionManager;
import com.liferay.object.system.SystemObjectDefinitionManagerRegistry;
import com.liferay.petra.lang.SafeCloseable;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.exception.NoSuchAddressException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.lazy.referencing.LazyReferencingThreadLocal;
import com.liferay.portal.kernel.model.Address;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

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
public class AddressSystemObjectDefinitionManagerTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_addressSystemObjectDefinitionManager =
			_systemObjectDefinitionManagerRegistry.
				getSystemObjectDefinitionManager("Address");
	}

	@Test
	@TestInfo("LPD-63013")
	public void testGetOrAddEmptyBaseModel() throws Exception {

		// Lazy referencing disable

		String originalName = PrincipalThreadLocal.getName();
		PermissionChecker originalPermissionChecker =
			PermissionThreadLocal.getPermissionChecker();

		User user1 = TestPropsValues.getUser();

		_setUser(user1);

		String externalReferenceCode = RandomTestUtil.randomString();

		AssertUtils.assertFailure(
			PortalException.class,
			StringBundler.concat(
				NoSuchAddressException.class.getName(),
				": No Address exists with the key {externalReferenceCode=",
				externalReferenceCode, ", companyId=",
				TestPropsValues.getCompanyId(), "}"),
			() -> _addressSystemObjectDefinitionManager.getOrAddEmptyBaseModel(
				externalReferenceCode, TestPropsValues.getCompanyId(), user1));

		// Lazy referecing enabled

		try (SafeCloseable safeCloseable =
				LazyReferencingThreadLocal.setEnabledWithSafeCloseable(true)) {

			// With permissions

			Address address =
				(Address)
					_addressSystemObjectDefinitionManager.
						getOrAddEmptyBaseModel(
							RandomTestUtil.randomString(),
							TestPropsValues.getCompanyId(), user1);

			Assert.assertEquals(
				WorkflowConstants.STATUS_EMPTY, address.getStatus());

			// Without permissions

			User user2 = UserTestUtil.addUser();

			_setUser(user2);

			AssertUtils.assertFailure(
				PortalException.class,
				StringBundler.concat(
					PrincipalException.MustHavePermission.class.getName(),
					": User ", user2.getUserId(),
					" must have UPDATE permission for ", User.class.getName(),
					" ", user1.getUserId()),
				() ->
					_addressSystemObjectDefinitionManager.
						getOrAddEmptyBaseModel(
							RandomTestUtil.randomString(),
							TestPropsValues.getCompanyId(), user1));

			// Without permissions, existing address

			AssertUtils.assertFailure(
				PortalException.class,
				StringBundler.concat(
					PrincipalException.MustHavePermission.class.getName(),
					": User ", user2.getUserId(),
					" must have VIEW permission for ", User.class.getName(),
					" ", user1.getUserId()),
				() ->
					_addressSystemObjectDefinitionManager.
						getOrAddEmptyBaseModel(
							address.getExternalReferenceCode(),
							address.getCompanyId(), user2));
		}

		PermissionThreadLocal.setPermissionChecker(originalPermissionChecker);

		PrincipalThreadLocal.setName(originalName);
	}

	private void _setUser(User user) throws Exception {
		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(user));

		PrincipalThreadLocal.setName(user.getUserId());
	}

	private SystemObjectDefinitionManager _addressSystemObjectDefinitionManager;

	@Inject
	private SystemObjectDefinitionManagerRegistry
		_systemObjectDefinitionManagerRegistry;

}