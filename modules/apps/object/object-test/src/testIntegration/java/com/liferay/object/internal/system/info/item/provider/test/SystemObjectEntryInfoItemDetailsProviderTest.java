/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.system.info.item.provider.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.ERCInfoItemIdentifier;
import com.liferay.info.item.InfoItemDetails;
import com.liferay.info.item.InfoItemReference;
import com.liferay.info.item.InfoItemServiceRegistry;
import com.liferay.info.item.provider.InfoItemDetailsProvider;
import com.liferay.info.item.provider.InfoItemObjectProvider;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.system.SystemObjectDefinitionManager;
import com.liferay.object.system.SystemObjectDefinitionManagerRegistry;
import com.liferay.object.system.SystemObjectEntry;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import java.util.Map;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.mock.web.MockHttpServletRequest;

/**
 * @author Victor Kammerer
 */
@RunWith(Arquillian.class)
public class SystemObjectEntryInfoItemDetailsProviderTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_group = _groupLocalService.fetchGroup(TestPropsValues.getGroupId());

		ServiceContextThreadLocal.pushServiceContext(_getServiceContext());
	}

	@After
	public void tearDown() throws Exception {
		ServiceContextThreadLocal.popServiceContext();
	}

	@Test
	public void testGetInfoItem() throws Exception {
		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.fetchObjectDefinition(
				TestPropsValues.getCompanyId(), User.class.getSimpleName());

		SystemObjectDefinitionManager systemObjectDefinitionManager =
			_systemObjectDefinitionManagerRegistry.
				getSystemObjectDefinitionManager(objectDefinition.getName());

		long userId = systemObjectDefinitionManager.addBaseModel(
			TestPropsValues.getUser(),
			HashMapBuilder.<String, Object>put(
				"alternateName", "john"
			).put(
				"emailAddress", "john@liferay.com"
			).put(
				"familyName", "Smith"
			).put(
				"givenName", "John"
			).build());

		String objectDefinitionItemClassName = StringBundler.concat(
			objectDefinition.getClassName(), StringPool.POUND,
			objectDefinition.getObjectDefinitionId());

		InfoItemObjectProvider<SystemObjectEntry> infoItemObjectProvider =
			_infoItemServiceRegistry.getFirstInfoItemService(
				InfoItemObjectProvider.class, objectDefinitionItemClassName);

		SystemObjectEntry systemObjectEntry =
			infoItemObjectProvider.getInfoItem(
				new ClassPKInfoItemIdentifier(userId));

		InfoItemDetailsProvider<Object> infoItemDetailsProvider =
			_infoItemServiceRegistry.getFirstInfoItemService(
				InfoItemDetailsProvider.class, objectDefinitionItemClassName);

		InfoItemDetails infoItemDetails =
			infoItemDetailsProvider.getInfoItemDetails(systemObjectEntry);

		Assert.assertEquals(
			objectDefinitionItemClassName, infoItemDetails.getClassName());
		Assert.assertEquals(
			new InfoItemReference(
				objectDefinitionItemClassName, systemObjectEntry.getClassPK()),
			infoItemDetails.getInfoItemReference());

		Map<String, Object> values = systemObjectEntry.getValues();

		String externalReferenceCode = String.valueOf(
			values.get("externalReferenceCode"));

		systemObjectEntry = infoItemObjectProvider.getInfoItem(
			_group.getGroupId(),
			new ERCInfoItemIdentifier(
				externalReferenceCode, _group.getExternalReferenceCode()));

		infoItemDetails = infoItemDetailsProvider.getInfoItemDetails(
			systemObjectEntry);

		Assert.assertEquals(
			objectDefinitionItemClassName, infoItemDetails.getClassName());
		Assert.assertEquals(
			new InfoItemReference(
				objectDefinitionItemClassName, systemObjectEntry.getClassPK()),
			infoItemDetails.getInfoItemReference());

		infoItemDetails = infoItemDetailsProvider.getInfoItemDetails(
			_group.getGroupId(), ERCInfoItemIdentifier.class,
			systemObjectEntry);

		Assert.assertEquals(
			objectDefinitionItemClassName, infoItemDetails.getClassName());
		Assert.assertEquals(
			new InfoItemReference(
				objectDefinitionItemClassName,
				new ERCInfoItemIdentifier(
					externalReferenceCode, _group.getExternalReferenceCode())),
			infoItemDetails.getInfoItemReference());
	}

	private ServiceContext _getServiceContext() throws Exception {
		ServiceContext serviceContext =
			ServiceContextTestUtil.getServiceContext(
				TestPropsValues.getGroupId());

		MockHttpServletRequest mockHttpServletRequest =
			new MockHttpServletRequest();

		ThemeDisplay themeDisplay = new ThemeDisplay();

		themeDisplay.setLocale(LocaleUtil.getDefault());
		themeDisplay.setUser(TestPropsValues.getUser());

		mockHttpServletRequest.setAttribute(
			WebKeys.THEME_DISPLAY, themeDisplay);

		serviceContext.setRequest(mockHttpServletRequest);

		return serviceContext;
	}

	private Group _group;

	@Inject
	private GroupLocalService _groupLocalService;

	@Inject
	private InfoItemServiceRegistry _infoItemServiceRegistry;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private SystemObjectDefinitionManagerRegistry
		_systemObjectDefinitionManagerRegistry;

	@Inject
	private UserLocalService _userLocalService;

}