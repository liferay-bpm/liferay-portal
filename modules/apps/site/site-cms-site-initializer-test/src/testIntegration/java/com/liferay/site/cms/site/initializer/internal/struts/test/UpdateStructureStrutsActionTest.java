/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.struts.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.admin.rest.dto.v1_0.ObjectDefinition;
import com.liferay.object.admin.rest.dto.v1_0.ObjectRelationship;
import com.liferay.object.admin.rest.resource.v1_0.ObjectDefinitionResource;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.struts.StrutsAction;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.test.rule.FeatureFlag;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * @author Víctor Galán
 */
@RunWith(Arquillian.class)
public class UpdateStructureStrutsActionTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@FeatureFlag("LPD-34594")
	@Test
	@TestInfo("LPD-77022")
	public void testExecute() throws Exception {
		com.liferay.object.model.ObjectDefinition
			serviceBuilderObjectDefinition1 =
				ObjectDefinitionTestUtil.publishObjectDefinition();
		com.liferay.object.model.ObjectDefinition
			serviceBuilderObjectDefinition2 =
				ObjectDefinitionTestUtil.publishObjectDefinition();

		com.liferay.object.model.ObjectRelationship
			serviceBuilderObjectRelationship =
				_objectRelationshipLocalService.addObjectRelationship(
					null, TestPropsValues.getUserId(),
					serviceBuilderObjectDefinition1.getObjectDefinitionId(),
					serviceBuilderObjectDefinition2.getObjectDefinitionId(), 0,
					ObjectRelationshipConstants.DELETION_TYPE_CASCADE, true,
					LocalizedMapUtil.getLocalizedMap(
						RandomTestUtil.randomString()),
					StringUtil.randomId(), false,
					ObjectRelationshipConstants.TYPE_ONE_TO_MANY, null);

		Assert.assertTrue(serviceBuilderObjectRelationship.isEdge());

		ObjectDefinition dtoObjectDefinition = _getObjectDefinition(
			serviceBuilderObjectDefinition1.getExternalReferenceCode());

		MockHttpServletRequest mockHttpServletRequest =
			new MockHttpServletRequest();

		ThemeDisplay themeDisplay = new ThemeDisplay();

		themeDisplay.setCompany(
			_companyLocalService.getCompany(TestPropsValues.getCompanyId()));
		themeDisplay.setLocale(LocaleUtil.US);
		themeDisplay.setUser(TestPropsValues.getUser());

		mockHttpServletRequest.setAttribute(
			WebKeys.THEME_DISPLAY, themeDisplay);

		mockHttpServletRequest.setParameter(
			"deletedObjectRelationships",
			JSONUtil.putAll(
				JSONUtil.put(
					"objectDefinitionERC",
					serviceBuilderObjectDefinition1.getExternalReferenceCode()
				).put(
					"objectRelationshipERC",
					serviceBuilderObjectRelationship.getExternalReferenceCode()
				)
			).toString());
		mockHttpServletRequest.setParameter(
			"objectDefinition", dtoObjectDefinition.toString());
		mockHttpServletRequest.setParameter("objectRelationships", "[]");
		mockHttpServletRequest.setParameter(
			"repeatableGroupObjectDefinitions", "[]");

		MockHttpServletResponse mockHttpServletResponse =
			new MockHttpServletResponse();

		_updateStructureStrutsAction.execute(
			mockHttpServletRequest, mockHttpServletResponse);

		JSONObject jsonObject = _jsonFactory.createJSONObject(
			mockHttpServletResponse.getContentAsString());

		Assert.assertEquals(jsonObject.toString(), 0, jsonObject.length());

		Assert.assertNull(
			_objectRelationshipLocalService.fetchObjectRelationship(
				serviceBuilderObjectRelationship.getObjectRelationshipId()));

		_objectDefinitionLocalService.deleteObjectDefinition(
			serviceBuilderObjectDefinition1.getObjectDefinitionId());
		_objectDefinitionLocalService.deleteObjectDefinition(
			serviceBuilderObjectDefinition2.getObjectDefinitionId());
	}

	private ObjectDefinition _getObjectDefinition(String externalReferenceCode)
		throws Exception {

		ObjectDefinitionResource.Builder builder =
			_objectDefinitionResourceFactory.create();

		builder.user(TestPropsValues.getUser());

		ObjectDefinition objectDefinition = builder.build(
		).getObjectDefinitionByExternalReferenceCode(
			externalReferenceCode
		);

		objectDefinition.setObjectRelationships((ObjectRelationship[])null);

		return objectDefinition;
	}

	@Inject
	private CompanyLocalService _companyLocalService;

	@Inject
	private JSONFactory _jsonFactory;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectDefinitionResource.Factory _objectDefinitionResourceFactory;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Inject(filter = "path=/cms/update-structure")
	private StrutsAction _updateStructureStrutsAction;

}