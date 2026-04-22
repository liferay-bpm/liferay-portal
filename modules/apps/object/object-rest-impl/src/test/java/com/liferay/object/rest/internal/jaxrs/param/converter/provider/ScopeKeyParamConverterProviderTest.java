/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.jaxrs.param.converter.provider;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.scope.ObjectScopeProvider;
import com.liferay.object.scope.ObjectScopeProviderRegistry;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotFoundException;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

/**
 * @author Stefano Motta
 */
public class ScopeKeyParamConverterProviderTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		MockitoAnnotations.initMocks(this);

		_scopeKeyParamConverterProvider = new ScopeKeyParamConverterProvider(
			_groupLocalService, _objectScopeProviderRegistry);

		ReflectionTestUtil.setFieldValue(
			_scopeKeyParamConverterProvider, "_company", _company);
		ReflectionTestUtil.setFieldValue(
			_scopeKeyParamConverterProvider, "_objectDefinition",
			_objectDefinition);

		Mockito.when(
			_objectDefinition.getScope()
		).thenReturn(
			_SCOPE
		);

		Mockito.when(
			_objectScopeProviderRegistry.getObjectScopeProvider(_SCOPE)
		).thenReturn(
			_objectScopeProvider
		);
	}

	@After
	public void tearDown() {
		ServiceContextThreadLocal.popServiceContext();
	}

	@Test
	public void testFromString() throws Exception {
		Assert.assertNull(_scopeKeyParamConverterProvider.fromString(null));

		Mockito.when(
			_objectScopeProvider.isGroupAware()
		).thenReturn(
			false
		);

		try {
			_scopeKeyParamConverterProvider.fromString(
				RandomTestUtil.randomString());

			Assert.fail();
		}
		catch (InternalServerErrorException internalServerErrorException) {
			Assert.assertNotNull(internalServerErrorException);
		}

		Mockito.when(
			_objectScopeProvider.isGroupAware()
		).thenReturn(
			true
		);

		Mockito.when(
			_objectScopeProvider.resolveScopeKey(
				Mockito.anyLong(), Mockito.anyString(),
				Mockito.any(GroupLocalService.class))
		).thenReturn(
			null
		);

		try {
			_scopeKeyParamConverterProvider.fromString(
				RandomTestUtil.randomString());

			Assert.fail();
		}
		catch (NotFoundException notFoundException) {
			Assert.assertNotNull(notFoundException);
		}

		long companyId = RandomTestUtil.randomLong();

		Mockito.when(
			_company.getCompanyId()
		).thenReturn(
			companyId
		);

		String scopeKey = RandomTestUtil.randomString();
		String groupId = String.valueOf(RandomTestUtil.randomLong());

		Mockito.when(
			_objectScopeProvider.resolveScopeKey(
				companyId, scopeKey, _groupLocalService)
		).thenReturn(
			groupId
		);

		ServiceContext serviceContext = new ServiceContext();

		ServiceContextThreadLocal.pushServiceContext(serviceContext);

		Assert.assertEquals(
			groupId, _scopeKeyParamConverterProvider.fromString(scopeKey));
		Assert.assertEquals(scopeKey, serviceContext.getAttribute("scopeKey"));

		Mockito.doThrow(
			new PortalException()
		).when(
			_objectScopeProvider
		).resolveScopeKey(
			Mockito.anyLong(), Mockito.anyString(),
			Mockito.any(GroupLocalService.class)
		);

		try {
			_scopeKeyParamConverterProvider.fromString(
				RandomTestUtil.randomString());

			Assert.fail();
		}
		catch (InternalServerErrorException internalServerErrorException) {
			Assert.assertNotNull(internalServerErrorException);
		}
	}

	private static final String _SCOPE = RandomTestUtil.randomString();

	@Mock
	private Company _company;

	@Mock
	private GroupLocalService _groupLocalService;

	@Mock
	private ObjectDefinition _objectDefinition;

	@Mock
	private ObjectScopeProvider _objectScopeProvider;

	@Mock
	private ObjectScopeProviderRegistry _objectScopeProviderRegistry;

	private ScopeKeyParamConverterProvider _scopeKeyParamConverterProvider;

}