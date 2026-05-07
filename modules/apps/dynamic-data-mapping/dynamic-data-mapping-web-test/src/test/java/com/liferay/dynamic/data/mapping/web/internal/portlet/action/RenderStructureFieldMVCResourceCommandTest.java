/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.web.internal.portlet.action;

import com.liferay.dynamic.data.mapping.io.DDMFormDeserializer;
import com.liferay.dynamic.data.mapping.io.DDMFormDeserializerDeserializeResponse;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderer;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRendererRegistry;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderingContext;
import com.liferay.portal.kernel.servlet.ServletResponseUtil;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.ContentTypes;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.portlet.ResourceRequest;
import jakarta.portlet.ResourceResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Collections;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Mateus Xavier
 */
public class RenderStructureFieldMVCResourceCommandTest {

	@ClassRule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() throws Exception {
		ThemeDisplay themeDisplay = Mockito.mock(ThemeDisplay.class);

		Mockito.when(
			themeDisplay.getLocale()
		).thenReturn(
			LocaleUtil.US
		);

		Mockito.when(
			_httpServletRequest.getAttribute(WebKeys.THEME_DISPLAY)
		).thenReturn(
			themeDisplay
		);
	}

	@Test
	public void testCreateDDMFormFieldRenderingContext() {
		Mockito.when(
			_httpServletRequest.getParameter("namespace")
		).thenReturn(
			_SCRIPT
		);

		Mockito.when(
			_httpServletRequest.getParameter("portletNamespace")
		).thenReturn(
			_SCRIPT
		);

		RenderStructureFieldMVCResourceCommand
			renderStructureFieldMVCResourceCommand =
				new RenderStructureFieldMVCResourceCommand();

		ReflectionTestUtil.setFieldValue(
			renderStructureFieldMVCResourceCommand, "_portal", _portal);

		DDMFormFieldRenderingContext ddmFormFieldRenderingContext =
			renderStructureFieldMVCResourceCommand.
				createDDMFormFieldRenderingContext(
					_httpServletRequest,
					Mockito.mock(HttpServletResponse.class));

		Assert.assertEquals(
			HtmlUtil.escapeAttribute(_SCRIPT),
			ddmFormFieldRenderingContext.getNamespace());
		Assert.assertEquals(
			HtmlUtil.escapeAttribute(_SCRIPT),
			ddmFormFieldRenderingContext.getPortletNamespace());
	}

	@Test
	public void testGetDDMFormField() {
		Mockito.when(
			_httpServletRequest.getParameter("fieldName")
		).thenReturn(
			HtmlUtil.escapeAttribute(_SCRIPT)
		);

		DDMFormDeserializer ddmFormDeserializer = Mockito.mock(
			DDMFormDeserializer.class);

		DDMFormDeserializerDeserializeResponse
			ddmFormDeserializerDeserializeResponse = Mockito.mock(
				DDMFormDeserializerDeserializeResponse.class);

		Mockito.when(
			ddmFormDeserializer.deserialize(Mockito.any())
		).thenReturn(
			ddmFormDeserializerDeserializeResponse
		);

		DDMForm ddmForm = Mockito.mock(DDMForm.class);

		Mockito.when(
			ddmFormDeserializerDeserializeResponse.getDDMForm()
		).thenReturn(
			ddmForm
		);

		DDMFormField mockDDMFormField = Mockito.mock(DDMFormField.class);

		Mockito.when(
			mockDDMFormField.getName()
		).thenReturn(
			HtmlUtil.escapeAttribute(_SCRIPT)
		);

		Mockito.when(
			ddmForm.getDDMFormFieldsMap(true)
		).thenReturn(
			Collections.singletonMap(
				HtmlUtil.escapeAttribute(_SCRIPT), mockDDMFormField)
		);

		RenderStructureFieldMVCResourceCommand
			renderStructureFieldMVCResourceCommand =
				new RenderStructureFieldMVCResourceCommand();

		ReflectionTestUtil.setFieldValue(
			renderStructureFieldMVCResourceCommand, "_jsonDDMFormDeserializer",
			ddmFormDeserializer);

		DDMFormField ddmFormField =
			renderStructureFieldMVCResourceCommand.getDDMFormField(
				_httpServletRequest);

		Assert.assertEquals(
			HtmlUtil.escapeAttribute(_SCRIPT), ddmFormField.getName());
	}

	@Test
	public void testServeResource() throws Exception {
		Mockito.when(
			_httpServletRequest.getParameter("fieldName")
		).thenReturn(
			_FIELD_NAME
		);

		_setUpDDMFormFieldRendererRegistry();
		_setUpJSONDDMFormDeserializer();
		_setUpPortal();

		try (MockedStatic<ServletResponseUtil> servletResponseUtilMockedStatic =
				Mockito.mockStatic(ServletResponseUtil.class)) {

			_renderStructureFieldMVCResourceCommand.doServeResource(
				_resourceRequest, _resourceResponse);

			servletResponseUtilMockedStatic.verify(
				() -> ServletResponseUtil.write(
					_httpServletResponse, _RENDERED_HTML),
				Mockito.times(1));
		}

		Mockito.verify(
			_httpServletResponse
		).setContentType(
			ContentTypes.TEXT_HTML
		);
	}

	private void _setUpDDMFormFieldRendererRegistry() throws Exception {
		DDMFormFieldRenderer ddmFormFieldRenderer = Mockito.mock(
			DDMFormFieldRenderer.class);

		Mockito.when(
			ddmFormFieldRenderer.render(
				Mockito.any(DDMFormField.class),
				Mockito.any(DDMFormFieldRenderingContext.class))
		).thenReturn(
			_RENDERED_HTML
		);

		Mockito.when(
			_ddmFormFieldRendererRegistry.getDDMFormFieldRenderer(_FIELD_TYPE)
		).thenReturn(
			ddmFormFieldRenderer
		);

		ReflectionTestUtil.setFieldValue(
			_renderStructureFieldMVCResourceCommand,
			"_ddmFormFieldRendererRegistry", _ddmFormFieldRendererRegistry);
	}

	private void _setUpJSONDDMFormDeserializer() throws Exception {
		DDMFormField ddmFormField = Mockito.mock(DDMFormField.class);

		Mockito.when(
			ddmFormField.getType()
		).thenReturn(
			_FIELD_TYPE
		);

		DDMForm ddmForm = Mockito.mock(DDMForm.class);

		Mockito.when(
			ddmForm.getDDMFormFieldsMap(true)
		).thenReturn(
			Collections.singletonMap(_FIELD_NAME, ddmFormField)
		);

		DDMFormDeserializerDeserializeResponse
			ddmFormDeserializerDeserializeResponse = Mockito.mock(
				DDMFormDeserializerDeserializeResponse.class);

		Mockito.when(
			ddmFormDeserializerDeserializeResponse.getDDMForm()
		).thenReturn(
			ddmForm
		);

		Mockito.when(
			_jsonDDMFormDeserializer.deserialize(Mockito.any())
		).thenReturn(
			ddmFormDeserializerDeserializeResponse
		);

		ReflectionTestUtil.setFieldValue(
			_renderStructureFieldMVCResourceCommand, "_jsonDDMFormDeserializer",
			_jsonDDMFormDeserializer);
	}

	private void _setUpPortal() {
		Mockito.when(
			_portal.getHttpServletRequest(_resourceRequest)
		).thenReturn(
			_httpServletRequest
		);

		Mockito.when(
			_portal.getHttpServletResponse(_resourceResponse)
		).thenReturn(
			_httpServletResponse
		);

		Mockito.when(
			_portal.getOriginalServletRequest(_httpServletRequest)
		).thenReturn(
			_httpServletRequest
		);

		ReflectionTestUtil.setFieldValue(
			_renderStructureFieldMVCResourceCommand, "_portal", _portal);
	}

	private static final String _FIELD_NAME = "fieldName";

	private static final String _FIELD_TYPE = "text";

	private static final String _RENDERED_HTML =
		"<input name=\"" + _FIELD_NAME + "\" type=\"text\" />";

	private static final String _SCRIPT =
		"'\"></option><img onerror=alert(123) src=x>";

	private final DDMFormFieldRendererRegistry _ddmFormFieldRendererRegistry =
		Mockito.mock(DDMFormFieldRendererRegistry.class);
	private final HttpServletRequest _httpServletRequest = Mockito.mock(
		HttpServletRequest.class);
	private final HttpServletResponse _httpServletResponse = Mockito.mock(
		HttpServletResponse.class);
	private final DDMFormDeserializer _jsonDDMFormDeserializer = Mockito.mock(
		DDMFormDeserializer.class);
	private final Portal _portal = Mockito.mock(Portal.class);
	private final RenderStructureFieldMVCResourceCommand
		_renderStructureFieldMVCResourceCommand =
			new RenderStructureFieldMVCResourceCommand();
	private final ResourceRequest _resourceRequest = Mockito.mock(
		ResourceRequest.class);
	private final ResourceResponse _resourceResponse = Mockito.mock(
		ResourceResponse.class);

}