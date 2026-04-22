/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.commerce.internal.object.scope;

import com.liferay.commerce.constants.CommerceOrderConstants;
import com.liferay.commerce.model.CommerceOrder;
import com.liferay.commerce.service.CommerceOrderLocalService;
import com.liferay.object.model.ObjectEntry;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import java.io.Serializable;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

/**
 * @author Stefano Motta
 */
public class CommerceOrderObjectScopeProviderImplTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		MockitoAnnotations.initMocks(this);
	}

	@After
	public void tearDown() {
		ServiceContextThreadLocal.popServiceContext();
	}

	@Test
	public void testGetKey() {
		Assert.assertEquals(
			CommerceOrderConstants.OBJECT_DEFINITION_SCOPE,
			_commerceOrderObjectScopeProviderImpl.getKey());
	}

	@Test
	public void testGetRootPanelCategoryKeysIsEmpty() {
		Assert.assertEquals(
			0,
			_commerceOrderObjectScopeProviderImpl.
				getRootPanelCategoryKeys().length);
	}

	@Test
	public void testGetScopeKey() {
		long commerceOrderId = RandomTestUtil.randomLong();

		ObjectEntry objectEntry = Mockito.mock(ObjectEntry.class);

		Mockito.when(
			objectEntry.getValues()
		).thenReturn(
			HashMapBuilder.<String, Serializable>put(
				"r_commerceOrderToCommerceOrderAttachments_commerceOrderId",
				commerceOrderId
			).build()
		);

		Assert.assertEquals(
			String.valueOf(commerceOrderId),
			_commerceOrderObjectScopeProviderImpl.getScopeKey(
				_groupLocalService, objectEntry));

		objectEntry = Mockito.mock(ObjectEntry.class);

		Mockito.when(
			objectEntry.getValues()
		).thenReturn(
			HashMapBuilder.<String, Serializable>put(
				"r_commerceOrderToCommerceOrderAttachments_commerceOrderId", 0L
			).build()
		);

		long groupId = RandomTestUtil.randomLong();

		Mockito.when(
			objectEntry.getGroupId()
		).thenReturn(
			groupId
		);

		Group group = Mockito.mock(Group.class);

		Mockito.when(
			_groupLocalService.fetchGroup(groupId)
		).thenReturn(
			group
		);

		String groupKey = RandomTestUtil.randomString();

		Mockito.when(
			group.getGroupKey()
		).thenReturn(
			groupKey
		);

		Assert.assertEquals(
			groupKey,
			_commerceOrderObjectScopeProviderImpl.getScopeKey(
				_groupLocalService, objectEntry));
	}

	@Test
	public void testIsGroupAware() {
		Assert.assertTrue(_commerceOrderObjectScopeProviderImpl.isGroupAware());
	}

	@Test
	public void testIsValidGroupId() {
		Assert.assertFalse(
			_commerceOrderObjectScopeProviderImpl.isValidGroupId(
				RandomTestUtil.randomLong()));

		long commerceOrderId = RandomTestUtil.randomLong();

		Mockito.when(
			_commerceOrderLocalService.fetchCommerceOrder(commerceOrderId)
		).thenReturn(
			_commerceOrder
		);

		ServiceContext serviceContext = new ServiceContext();

		serviceContext.setAttribute("commerceOrderId", commerceOrderId);

		ServiceContextThreadLocal.pushServiceContext(serviceContext);

		Assert.assertFalse(
			_commerceOrderObjectScopeProviderImpl.isValidGroupId(
				RandomTestUtil.randomLong()));

		long groupId = RandomTestUtil.randomLong();

		Mockito.when(
			_commerceOrder.getGroupId()
		).thenReturn(
			groupId
		);

		Assert.assertTrue(
			_commerceOrderObjectScopeProviderImpl.isValidGroupId(groupId));

		serviceContext = new ServiceContext();

		serviceContext.setAttribute(
			"scopeKey", String.valueOf(commerceOrderId));

		ServiceContextThreadLocal.pushServiceContext(serviceContext);

		Assert.assertTrue(
			_commerceOrderObjectScopeProviderImpl.isValidGroupId(groupId));
	}

	@Test
	public void testResolveScopeKey() throws Exception {
		long commerceOrderId = RandomTestUtil.randomLong();

		Mockito.when(
			_commerceOrderLocalService.fetchCommerceOrder(commerceOrderId)
		).thenReturn(
			null
		);

		long companyId = RandomTestUtil.randomLong();

		Assert.assertNull(
			_commerceOrderObjectScopeProviderImpl.resolveScopeKey(
				companyId, String.valueOf(commerceOrderId),
				_groupLocalService));

		Mockito.when(
			_commerceOrderLocalService.fetchCommerceOrder(commerceOrderId)
		).thenReturn(
			_commerceOrder
		);

		Mockito.when(
			_commerceOrder.getCompanyId()
		).thenReturn(
			RandomTestUtil.randomLong()
		);

		Assert.assertNull(
			_commerceOrderObjectScopeProviderImpl.resolveScopeKey(
				companyId, String.valueOf(commerceOrderId),
				_groupLocalService));

		Mockito.when(
			_commerceOrder.getCompanyId()
		).thenReturn(
			companyId
		);

		long groupId = RandomTestUtil.randomLong();

		Mockito.when(
			_commerceOrder.getGroupId()
		).thenReturn(
			groupId
		);

		Assert.assertEquals(
			String.valueOf(groupId),
			_commerceOrderObjectScopeProviderImpl.resolveScopeKey(
				companyId, String.valueOf(commerceOrderId),
				_groupLocalService));
	}

	@Mock
	private CommerceOrder _commerceOrder;

	@Mock
	private CommerceOrderLocalService _commerceOrderLocalService;

	@InjectMocks
	private CommerceOrderObjectScopeProviderImpl
		_commerceOrderObjectScopeProviderImpl;

	@Mock
	private GroupLocalService _groupLocalService;

}