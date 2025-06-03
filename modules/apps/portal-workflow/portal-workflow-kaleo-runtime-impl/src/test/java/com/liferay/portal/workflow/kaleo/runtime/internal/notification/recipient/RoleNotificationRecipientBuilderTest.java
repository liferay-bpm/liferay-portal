/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.runtime.internal.notification.recipient;

import com.liferay.object.scope.ObjectScopeProvider;
import com.liferay.object.scope.ObjectScopeProviderRegistry;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.UserGroupRoleLocalService;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;
import com.liferay.portal.workflow.kaleo.model.KaleoInstanceToken;
import com.liferay.portal.workflow.kaleo.runtime.ExecutionContext;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Nathaly Gomes
 */
public class RoleNotificationRecipientBuilderTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		Mockito.when(
			_executionContext.getKaleoInstanceToken()
		).thenReturn(
			Mockito.mock(KaleoInstanceToken.class)
		);

		Mockito.when(
			_executionContext.getKaleoTaskInstanceToken()
		).thenReturn(
			null
		);

		Mockito.when(
			_executionContext.getServiceContext()
		).thenReturn(
			_serviceContext
		);

		Mockito.when(
			_objectScopeProvider.isGroupAware()
		).thenReturn(
			false
		);

		Mockito.when(
			_objectScopeProviderRegistry.getObjectScopeProvider(
				String.valueOf(_serviceContext.getAttribute("scope")))
		).thenReturn(
			_objectScopeProvider
		);

		Mockito.when(
			_role.getType()
		).thenReturn(
			RoleConstants.TYPE_SITE
		);

		ReflectionTestUtil.setFieldValue(
			_roleNotificationRecipientBuilder, "objectScopeProviderRegistry",
			_objectScopeProviderRegistry);

		ReflectionTestUtil.setFieldValue(
			_roleNotificationRecipientBuilder, "userGroupRoleLocalService",
			_userGroupRoleLocalService);
	}

	@Test
	public void testGetRoleUsers()
		throws IllegalAccessException, InvocationTargetException,
			   NoSuchMethodException {

		Class<?> clazz = _roleNotificationRecipientBuilder.getClass();

		Method method = clazz.getDeclaredMethod(
			"_getRoleUsers", Role.class, ExecutionContext.class);

		method.setAccessible(true);

		method.invoke(
			_roleNotificationRecipientBuilder, _role, _executionContext);

		Mockito.verify(
			_userGroupRoleLocalService
		).getUserGroupRolesByRole(
			Mockito.anyLong()
		);
	}

	@Test
	public void testIsSelfAssignedUser()
		throws IllegalAccessException, InvocationTargetException,
			   NoSuchMethodException {

		Class<?> clazz = _roleNotificationRecipientBuilder.getClass();

		Method method = clazz.getDeclaredMethod(
			"_isSelfAssignedUser", ExecutionContext.class, User.class);

		method.setAccessible(true);

		Assert.assertFalse(
			(Boolean)method.invoke(
				_roleNotificationRecipientBuilder, _executionContext,
				Mockito.mock(User.class)));
	}

	private final ExecutionContext _executionContext = Mockito.mock(
		ExecutionContext.class);
	private final ObjectScopeProvider _objectScopeProvider = Mockito.mock(
		ObjectScopeProvider.class);
	private final ObjectScopeProviderRegistry _objectScopeProviderRegistry =
		Mockito.mock(ObjectScopeProviderRegistry.class);
	private final Role _role = Mockito.mock(Role.class);
	private final RoleNotificationRecipientBuilder
		_roleNotificationRecipientBuilder =
			new RoleNotificationRecipientBuilder();
	private final ServiceContext _serviceContext = Mockito.mock(
		ServiceContext.class);
	private final UserGroupRoleLocalService _userGroupRoleLocalService =
		Mockito.mock(UserGroupRoleLocalService.class);

}