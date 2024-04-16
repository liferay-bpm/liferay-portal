/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.portlet.action.test;

import com.liferay.object.constants.ObjectPortletKeys;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.LayoutConstants;
import com.liferay.portal.kernel.model.Portlet;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.LiferayPortletConfig;
import com.liferay.portal.kernel.portlet.LiferayPortletRequest;
import com.liferay.portal.kernel.portlet.PortletConfigFactoryUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCActionCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.service.PortletLocalService;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.portlet.MockLiferayPortletActionRequest;
import com.liferay.portal.kernel.test.portlet.MockLiferayPortletActionResponse;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceRequest;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceResponse;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.File;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.ProxyUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.model.impl.LayoutImpl;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.upload.test.util.UploadTestUtil;

import java.util.Objects;

import org.junit.Assert;

import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockMultipartHttpServletRequest;

/**
 * @author Guilherme Sá
 */
public abstract class BaseExportImportTestCase {

	public void testExportImport(
			String actualFileName, String expectedFileName,
			String externalReferenceCode, String name)
		throws Exception {

		MVCActionCommand mvcActionCommand = getMVCActionCommand();

		MockLiferayPortletActionRequest mockLiferayPortletActionRequest =
			_importRequest(actualFileName, externalReferenceCode, name);

		mvcActionCommand.processAction(
			mockLiferayPortletActionRequest,
			new MockLiferayPortletActionResponse());

		// MVCResourceCommand

		MVCResourceCommand mvcResourceCommand = getMVCResourceCommand();

		MockLiferayResourceRequest mockLiferayResourceRequest =
			new MockLiferayResourceRequest();

		Class<?> clazz = getClazz();

		mockLiferayResourceRequest.addParameter(
			getIdentifierName(), String.valueOf(getId(name)));
		mockLiferayResourceRequest.setAttribute(
			WebKeys.THEME_DISPLAY, _getThemeDisplay());

		MockLiferayResourceResponse mockLiferayResourceResponse =
			new MockLiferayResourceResponse();

		mvcResourceCommand.serveResource(
			mockLiferayResourceRequest, mockLiferayResourceResponse);

		JSONAssert.assertEquals(
			StringUtil.read(
				clazz.getResourceAsStream("dependencies/" + expectedFileName)),
			String.valueOf(
				mockLiferayResourceResponse.getPortletOutputStream()),
			JSONCompareMode.LENIENT);
	}

	public void testImportWithError(
			String actualFileName, String expectedFileName,
			String externalReferenceCode, String name)
		throws Exception {

		MVCActionCommand mvcActionCommand = getMVCActionCommand();

		MockLiferayPortletActionRequest mockLiferayPortletActionRequest =
			_importRequest(actualFileName, externalReferenceCode, name);

		// MVCActionCommand

		MockLiferayPortletActionResponse mockLiferayPortletActionResponse =
			new MockLiferayPortletActionResponse();

		mvcActionCommand.processAction(
			mockLiferayPortletActionRequest, mockLiferayPortletActionResponse);

		MockHttpServletResponse mockHttpServletResponse =
			(MockHttpServletResponse)
				mockLiferayPortletActionResponse.getHttpServletResponse();

		JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
			mockHttpServletResponse.getContentAsString());

		Assert.assertEquals(
			"The object definition was imported without a custom view.",
			jsonObject.get("title"));
	}

	protected abstract ClassLoader getClassLoader();

	protected abstract Class<?> getClazz();

	protected abstract long getId(String name) throws Exception;

	protected abstract String getIdentifierName();

	protected abstract String getJSONName();

	protected abstract MVCActionCommand getMVCActionCommand();

	protected abstract MVCResourceCommand getMVCResourceCommand();

	protected User user;

	private ThemeDisplay _getThemeDisplay() throws Exception {
		ThemeDisplay themeDisplay = new ThemeDisplay();

		Layout layout = new LayoutImpl();

		layout.setType(LayoutConstants.TYPE_CONTROL_PANEL);

		themeDisplay.setLayout(layout);

		themeDisplay.setLocale(LocaleUtil.US);
		themeDisplay.setScopeGroupId(TestPropsValues.getGroupId());
		themeDisplay.setSiteDefaultLocale(LocaleUtil.US);
		themeDisplay.setUser(user);

		return themeDisplay;
	}

	private MockLiferayPortletActionRequest _importRequest(
			String actualFileName, String externalReferenceCode, String name)
		throws Exception {

		MVCActionCommand mvcActionCommand = getMVCActionCommand();

		MockMultipartHttpServletRequest mockMultipartHttpServletRequest =
			new MockMultipartHttpServletRequest();

		Class<?> clazz = getClazz();

		byte[] bytes = _file.getBytes(
			clazz.getResourceAsStream("dependencies/" + actualFileName));

		mockMultipartHttpServletRequest.addFile(
			new MockMultipartFile(actualFileName, bytes));

		mockMultipartHttpServletRequest.setCharacterEncoding(StringPool.UTF8);

		String boundary = "WebKitFormBoundary" + StringUtil.randomString();

		String start = StringBundler.concat(
			StringPool.DOUBLE_DASH, boundary,
			"\r\nContent-Disposition:form-data;name=\"", getJSONName(),
			"\";filename=\"", actualFileName,
			"\";\r\nContent-type:application/json\r\n\r\n");
		String end = StringBundler.concat(
			"\r\n--", boundary, StringPool.DOUBLE_DASH);

		mockMultipartHttpServletRequest.setContent(
			ArrayUtil.append(start.getBytes(), bytes, end.getBytes()));

		mockMultipartHttpServletRequest.setContentType(
			MediaType.MULTIPART_FORM_DATA_VALUE + "; boundary=" + boundary);

		MockLiferayPortletActionRequest mockLiferayPortletActionRequest =
			new MockLiferayPortletActionRequest(
				mockMultipartHttpServletRequest);

		if (Validator.isNotNull(externalReferenceCode)) {
			mockLiferayPortletActionRequest.addParameter(
				"externalReferenceCode", externalReferenceCode);
		}

		mockLiferayPortletActionRequest.addParameter("name", name);
		mockLiferayPortletActionRequest.addParameter(
			"redirect", RandomTestUtil.randomString());
		mockLiferayPortletActionRequest.setAttribute(
			WebKeys.THEME_DISPLAY, _getThemeDisplay());

		Portlet portlet = _portletLocalService.getPortletById(
			ObjectPortletKeys.OBJECT_DEFINITIONS);

		LiferayPortletConfig liferayPortletConfig =
			(LiferayPortletConfig)PortletConfigFactoryUtil.create(
				portlet, null);

		mockLiferayPortletActionRequest.setAttribute(
			JavaConstants.JAVAX_PORTLET_CONFIG, liferayPortletConfig);

		ReflectionTestUtil.setFieldValue(
			mvcActionCommand, "_portal",
			ProxyUtil.newProxyInstance(
				getClassLoader(), new Class<?>[] {Portal.class},
				(proxy, method, args) -> {
					if (Objects.equals(
							method.getName(), "getUploadPortletRequest")) {

						LiferayPortletRequest liferayPortletRequest =
							_portal.getLiferayPortletRequest(
								mockLiferayPortletActionRequest);

						return UploadTestUtil.createUploadPortletRequest(
							_portal.getUploadServletRequest(
								liferayPortletRequest.getHttpServletRequest()),
							liferayPortletRequest,
							_portal.getPortletNamespace(
								liferayPortletRequest.getPortletName()));
					}

					return method.invoke(_portal, args);
				}));

		return mockLiferayPortletActionRequest;
	}

	@Inject
	private File _file;

	@Inject
	private Portal _portal;

	@Inject
	private PortletLocalService _portletLocalService;

}