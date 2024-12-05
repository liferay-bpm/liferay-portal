/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.exportimport.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceTestUtil;
import com.liferay.headless.delivery.dto.v1_0.SitePage;
import com.liferay.headless.delivery.resource.v1_0.SitePageResource;
import com.liferay.layout.importer.LayoutsImporter;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructure;
import com.liferay.layout.page.template.service.LayoutPageTemplateStructureLocalService;
import com.liferay.layout.test.util.LayoutTestUtil;
import com.liferay.layout.util.structure.LayoutStructure;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * @author Paulo Albuquerque
 */
@RunWith(Arquillian.class)
public class FormObjectWidgetTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_objectDefinition = ObjectDefinitionTestUtil.publishObjectDefinition();

		_group = GroupTestUtil.addGroup();

		_layout = LayoutTestUtil.addTypeContentLayout(_group);

		_ddmFormInstance = DDMFormInstanceTestUtil.addDDMFormInstance(
			_group, TestPropsValues.getUserId());

		_serviceContext = ServiceContextTestUtil.getServiceContext(
			_group, TestPropsValues.getUserId());

		MockHttpServletRequest mockHttpServletRequest =
			new MockHttpServletRequest();

		mockHttpServletRequest.setAttribute(
			WebKeys.USER, TestPropsValues.getUser());
		mockHttpServletRequest.setParameter(
			"currentURL", "http://www.liferay.com");

		_serviceContext.setRequest(mockHttpServletRequest);

		ServiceContextThreadLocal.pushServiceContext(_serviceContext);
	}

	@Test
	public void testFormObjectWidget() throws Exception {
		SitePageResource.Builder builder = _sitePageResourceFactory.create();

		SitePageResource sitePageResource = builder.httpServletRequest(
			_serviceContext.getRequest()
		).httpServletResponse(
			new MockHttpServletResponse()
		).user(
			_serviceContext.fetchUser()
		).build();

		_importPageElement("object-widget-page-element.json", true);

		String friendlyURL = _layout.getFriendlyURL();

		SitePage sitePage = sitePageResource.getSiteSitePage(
			_group.getGroupId(), friendlyURL.substring(1));

		JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
			String.valueOf(sitePage.getPageDefinition()));

		jsonObject = jsonObject.getJSONObject("pageElement");
		jsonObject = jsonObject.getJSONArray(
			"pageElements"
		).getJSONObject(
			0
		);
		jsonObject = jsonObject.getJSONObject("definition");
		jsonObject = jsonObject.getJSONObject("widgetInstance");

		Assert.assertEquals(
			jsonObject.getString("widgetName"),
			_objectDefinition.getPortletId());

		_importPageElement("form-widget-page-element.json", false);

		sitePage = sitePageResource.getSiteSitePage(
			_group.getGroupId(), friendlyURL.substring(1));

		jsonObject = JSONFactoryUtil.createJSONObject(
			String.valueOf(sitePage.getPageDefinition()));

		jsonObject = jsonObject.getJSONObject("pageElement");
		jsonObject = jsonObject.getJSONArray(
			"pageElements"
		).getJSONObject(
			0
		);
		jsonObject = jsonObject.getJSONObject("definition");
		jsonObject = jsonObject.getJSONObject("widgetInstance");
		jsonObject = jsonObject.getJSONObject("widgetConfig");

		Assert.assertEquals(
			jsonObject.getString("ddmStructureExternalReferenceCode"),
			_ddmFormInstance.getStructure(
			).getExternalReferenceCode());
		Assert.assertEquals(
			jsonObject.getString("formInstanceId"),
			String.valueOf(_ddmFormInstance.getFormInstanceId()));
		Assert.assertEquals(
			jsonObject.getString("groupExternalReferenceCode"),
			_group.getExternalReferenceCode());
		Assert.assertEquals(
			jsonObject.getString("groupId"),
			String.valueOf(_group.getGroupId()));
	}

	private void _importPageElement(String fileName, boolean objectWidget)
		throws Exception {

		LayoutPageTemplateStructure layoutPageTemplateStructure =
			_layoutPageTemplateStructureLocalService.
				fetchLayoutPageTemplateStructure(
					_group.getGroupId(), _layout.getPlid());

		LayoutStructure layoutStructure = LayoutStructure.of(
			layoutPageTemplateStructure.getDefaultSegmentsExperienceData());

		layoutStructure.addRootLayoutStructureItem();

		_layoutsImporter.importPageElement(
			_layout, layoutStructure, layoutStructure.getMainItemId(),
			_read(fileName, objectWidget), 0, true);
	}

	private String _read(String fileName, boolean objectWidget)
		throws Exception {

		Class<?> clazz = getClass();

		String content = StringUtil.read(
			clazz.getClassLoader(),
			"com/liferay/dynamic/data/mapping/dependencies/" + fileName);

		if (objectWidget) {
			return StringUtil.replace(
				content, "[$WIDGET_NAME$]", _objectDefinition.getPortletId());
		}

		content = StringUtil.replace(
			content, "[$DDM_STRUCTURE_EXTERNAL_REFERENCE_CODE$]",
			_ddmFormInstance.getStructure(
			).getExternalReferenceCode());

		content = StringUtil.replace(
			content, "[$FORM_INSTANCE_ID$]",
			String.valueOf(_ddmFormInstance.getFormInstanceId()));

		content = StringUtil.replace(
			content, "[$GROUP_EXTERNAL_REFERENCE_CODE$]",
			_group.getExternalReferenceCode());

		return StringUtil.replace(
			content, "[$GROUP_ID$]", String.valueOf(_group.getGroupId()));
	}

	private DDMFormInstance _ddmFormInstance;

	@DeleteAfterTestRun
	private Group _group;

	private Layout _layout;

	@Inject
	private LayoutPageTemplateStructureLocalService
		_layoutPageTemplateStructureLocalService;

	@Inject
	private LayoutsImporter _layoutsImporter;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	private ServiceContext _serviceContext;

	@Inject
	private SitePageResource.Factory _sitePageResourceFactory;

}