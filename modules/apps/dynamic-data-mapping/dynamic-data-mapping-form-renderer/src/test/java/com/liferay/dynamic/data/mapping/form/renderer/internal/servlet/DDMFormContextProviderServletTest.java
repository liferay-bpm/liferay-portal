/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.form.renderer.internal.servlet;

import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceSettings;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.permission.GroupPermissionUtil;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Locale;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Larissa Ribeiro
 */
public class DDMFormContextProviderServletTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		_setUpLanguageUtil();

		_ddmFormContextProviderServlet = new DDMFormContextProviderServlet();
		_language = Mockito.mock(Language.class);

		ReflectionTestUtil.setFieldValue(
			_ddmFormContextProviderServlet, "_ddmFormInstanceLocalService",
			_ddmFormInstanceLocalService);
		ReflectionTestUtil.setFieldValue(
			_ddmFormContextProviderServlet,
			"_ddmFormInstanceModelResourcePermission",
			_ddmFormInstanceModelResourcePermission);
		ReflectionTestUtil.setFieldValue(
			_ddmFormContextProviderServlet, "_groupLocalService",
			_groupLocalService);
		ReflectionTestUtil.setFieldValue(
			_ddmFormContextProviderServlet, "_language", _language);
		ReflectionTestUtil.setFieldValue(
			_ddmFormContextProviderServlet, "_portal", _portal);

		Mockito.when(
			_portal.getCompanyId(_httpServletRequest)
		).thenReturn(
			_COMPANY_ID
		);

		PermissionThreadLocal.setPermissionChecker(_permissionChecker);

		_groupPermissionUtilMockedStatic = Mockito.mockStatic(
			GroupPermissionUtil.class);
	}

	@After
	public void tearDown() {
		_groupPermissionUtilMockedStatic.close();

		PermissionThreadLocal.setPermissionChecker(null);
	}

	@Test
	public void testCheckGroupPermissionWhenFormInstanceIsPublished()
		throws Exception {

		_mockDDMFormInstance();
		_mockGroup();

		_invokeCheckGroupPermission(_DDM_FORM_INSTANCE_ID);
	}

	@Test
	public void testCheckGroupPermissionWhenUserCanViewGroup() {
		_groupPermissionUtilMockedStatic.when(
			() -> GroupPermissionUtil.contains(
				_permissionChecker, _mockGroup(), ActionKeys.VIEW)
		).thenReturn(
			true
		);

		_invokeCheckGroupPermission(0);
	}

	@Test
	public void testCheckGroupPermissionWhenUserCannotViewGroup() {
		_mockGroup();

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User 0 must have VIEW permission for ", Group.class.getName(),
				" ", _GROUP_ID),
			() -> _invokeCheckGroupPermission(0));
	}

	@Test
	public void testGetLocaleWhenLanguageIdIsNull() {
		HttpServletRequest httpServletRequest = Mockito.mock(
			HttpServletRequest.class);

		Mockito.when(
			_language.getLanguageId(httpServletRequest)
		).thenReturn(
			"en_US"
		);

		Assert.assertEquals(
			LocaleUtil.US,
			ReflectionTestUtil.invoke(
				_ddmFormContextProviderServlet, "_getLocale",
				new Class<?>[] {HttpServletRequest.class}, httpServletRequest));
	}

	@Test
	public void testGetLocaleWhenLanguageIdIsPresent() {
		HttpServletRequest httpServletRequest = Mockito.mock(
			HttpServletRequest.class);

		Mockito.when(
			httpServletRequest.getParameter("languageId")
		).thenReturn(
			"pt_BR"
		);

		Assert.assertEquals(
			LocaleUtil.BRAZIL,
			ReflectionTestUtil.invoke(
				_ddmFormContextProviderServlet, "_getLocale",
				new Class<?>[] {HttpServletRequest.class}, httpServletRequest));
	}

	private void _invokeCheckGroupPermission(long ddmFormInstanceId) {
		DDMFormTemplateContextProcessor ddmFormTemplateContextProcessor =
			Mockito.mock(DDMFormTemplateContextProcessor.class);

		Mockito.when(
			ddmFormTemplateContextProcessor.getDDMFormInstanceId()
		).thenReturn(
			ddmFormInstanceId
		);
		Mockito.when(
			ddmFormTemplateContextProcessor.getGroupId()
		).thenReturn(
			_GROUP_ID
		);

		ReflectionTestUtil.invoke(
			_ddmFormContextProviderServlet, "_checkGroupPermission",
			new Class<?>[] {
				DDMFormTemplateContextProcessor.class, HttpServletRequest.class
			},
			ddmFormTemplateContextProcessor, _httpServletRequest);
	}

	private void _mockDDMFormInstance() throws Exception {
		DDMFormInstanceSettings ddmFormInstanceSettings = Mockito.mock(
			DDMFormInstanceSettings.class);

		Mockito.when(
			ddmFormInstanceSettings.published()
		).thenReturn(
			true
		);

		DDMFormInstance ddmFormInstance = Mockito.mock(DDMFormInstance.class);

		Mockito.when(
			ddmFormInstance.getGroupId()
		).thenReturn(
			_GROUP_ID
		);
		Mockito.when(
			ddmFormInstance.getSettingsModel()
		).thenReturn(
			ddmFormInstanceSettings
		);

		Mockito.when(
			_ddmFormInstanceLocalService.fetchFormInstance(
				_DDM_FORM_INSTANCE_ID)
		).thenReturn(
			ddmFormInstance
		);

		Mockito.when(
			_ddmFormInstanceModelResourcePermission.contains(
				_permissionChecker, ddmFormInstance, ActionKeys.VIEW)
		).thenReturn(
			true
		);
	}

	private Group _mockGroup() {
		Group group = Mockito.mock(Group.class);

		Mockito.when(
			group.getCompanyId()
		).thenReturn(
			_COMPANY_ID
		);

		Mockito.when(
			_groupLocalService.fetchGroup(_GROUP_ID)
		).thenReturn(
			group
		);

		return group;
	}

	private void _setUpLanguageUtil() {
		LanguageUtil languageUtil = new LanguageUtil();

		Language language = Mockito.mock(Language.class);

		Mockito.doReturn(
			Boolean.TRUE
		).when(
			language
		).isAvailableLocale(
			Mockito.any(Locale.class)
		);

		languageUtil.setLanguage(language);
	}

	private static final long _COMPANY_ID = 1L;

	private static final long _DDM_FORM_INSTANCE_ID = 3L;

	private static final long _GROUP_ID = 2L;

	private DDMFormContextProviderServlet _ddmFormContextProviderServlet;
	private final DDMFormInstanceLocalService _ddmFormInstanceLocalService =
		Mockito.mock(DDMFormInstanceLocalService.class);
	private final ModelResourcePermission<DDMFormInstance>
		_ddmFormInstanceModelResourcePermission = Mockito.mock(
			ModelResourcePermission.class);
	private final GroupLocalService _groupLocalService = Mockito.mock(
		GroupLocalService.class);
	private MockedStatic<GroupPermissionUtil> _groupPermissionUtilMockedStatic;
	private final HttpServletRequest _httpServletRequest = Mockito.mock(
		HttpServletRequest.class);
	private Language _language;
	private final PermissionChecker _permissionChecker = Mockito.mock(
		PermissionChecker.class);
	private final Portal _portal = Mockito.mock(Portal.class);

}