/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.display.context.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalService;
import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.frontend.data.set.model.FDSActionDropdownItem;
import com.liferay.frontend.data.set.test.util.FrontendDataSetTestUtil;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.CreationMenu;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItem;
import com.liferay.info.constants.InfoDisplayWebKeys;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.rule.Sync;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.test.rule.FeatureFlag;
import com.liferay.portal.test.rule.FeatureFlags;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.mock.web.MockHttpServletResponse;

/**
 * @author Carolina Barbosa
 */
@FeatureFlags(featureFlags = @FeatureFlag("LPD-58677"))
@RunWith(Arquillian.class)
@Sync
public class ViewRelatedAssetsSectionDisplayContextTest
	extends BaseDisplayContextTestCase {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_objectDefinition = ObjectDefinitionTestUtil.publishObjectDefinition();

		_objectEntry = _objectEntryLocalService.addObjectEntry(
			0, TestPropsValues.getUserId(),
			_objectDefinition.getObjectDefinitionId(), 0, null,
			Collections.emptyMap(), ServiceContextTestUtil.getServiceContext());

		_depotEntry = _depotEntryLocalService.addDepotEntry(
			HashMapBuilder.put(
				LocaleUtil.getDefault(), RandomTestUtil.randomString()
			).build(),
			HashMapBuilder.put(
				LocaleUtil.getDefault(), StringUtil.randomString()
			).build(),
			DepotConstants.TYPE_SPACE,
			ServiceContextTestUtil.getServiceContext(
				group.getGroupId(), TestPropsValues.getUserId()));

		_user = UserTestUtil.addUser();

		_groupLocalService.addUserGroup(
			_user.getUserId(), _depotEntry.getGroupId());
	}

	@Test
	public void testGetAdditionalAPIURLParameters() throws Exception {
		String additionalAPIURLParameters = ReflectionTestUtil.invoke(
			_getViewRelatedAssetsSectionDisplayContext(
				getMockHttpServletRequest(_user)),
			"getAdditionalAPIURLParameters", new Class<?>[0]);

		Assert.assertTrue(
			additionalAPIURLParameters,
			additionalAPIURLParameters.contains(
				"groupIds/any(g:g in (" + _depotEntry.getGroupId() + "))"));
		Assert.assertTrue(
			additionalAPIURLParameters,
			additionalAPIURLParameters.contains("sort=dateModified:desc"));
		Assert.assertTrue(
			additionalAPIURLParameters,
			additionalAPIURLParameters.contains(
				StringBundler.concat(
					"(cmsSection eq 'contents' or cmsSection eq 'files') and ",
					"cmpTaskObjectEntryIds in (",
					_objectEntry.getObjectEntryId(),
					") and rootDescendantNode eq false")));
	}

	@Test
	public void testGetAdditionalProps() throws Exception {
		Map<String, Object> additionalProps = ReflectionTestUtil.invoke(
			_getViewRelatedAssetsSectionDisplayContext(mockHttpServletRequest),
			"getAdditionalProps", new Class<?>[0]);

		Map<String, Object> breadcrumbProps =
			(Map<String, Object>)additionalProps.get("breadcrumbProps");

		Assert.assertNotNull(breadcrumbProps.get("breadcrumbItems"));

		Assert.assertEquals(
			HashMapBuilder.<String, Object>put(
				"objectEntryId", String.valueOf(_objectEntry.getObjectEntryId())
			).put(
				"relationshipObjectFieldName",
				"r_cmpTaskToCMPTaskLinks_c_cmpTaskId"
			).put(
				"restContextPath", "/o/cmp/task-links"
			).put(
				"scopeGroupId", String.valueOf(_objectEntry.getGroupId())
			).build(),
			additionalProps.get("objectEntryLinkProps"));
	}

	@Test
	public void testGetCMSSectionFilterString() throws Exception {
		String filterString = ReflectionTestUtil.invoke(
			_getViewRelatedAssetsSectionDisplayContext(
				getMockHttpServletRequest(_user)),
			"getCMSSectionFilterString", new Class<?>[0]);

		Assert.assertTrue(
			filterString,
			filterString.contains(
				"groupIds/any(g:g in (" + _depotEntry.getGroupId() + "))"));
	}

	@Test
	public void testGetCreationMenu() throws Exception {
		CreationMenu creationMenu = ReflectionTestUtil.invoke(
			_getViewRelatedAssetsSectionDisplayContext(
				getMockHttpServletRequest()),
			"getCreationMenu", new Class<?>[0]);

		List<DropdownItem> dropdownItems = (List<DropdownItem>)creationMenu.get(
			"primaryItems");

		Assert.assertEquals(dropdownItems.toString(), 2, dropdownItems.size());

		DropdownItem uploadDropdownItem = dropdownItems.get(0);

		Map<String, Object> uploadData =
			(Map<String, Object>)uploadDropdownItem.get("data");

		ObjectDefinition cmsBasicDocumentObjectDefinition =
			_objectDefinitionLocalService.
				fetchObjectDefinitionByExternalReferenceCode(
					"L_CMS_BASIC_DOCUMENT", _objectEntry.getCompanyId());

		Assert.assertEquals("uploadMultipleFiles", uploadData.get("action"));
		Assert.assertEquals(
			cmsBasicDocumentObjectDefinition.getClassName(),
			uploadData.get("documentClassName"));
		Assert.assertEquals(
			String.valueOf(_objectEntry.getObjectEntryId()),
			uploadData.get("objectEntryId"));
		Assert.assertEquals(
			"r_cmpTaskToCMPTaskLinks_c_cmpTaskId",
			uploadData.get("relationshipObjectFieldName"));
		Assert.assertEquals(
			"/o/cmp/task-links", uploadData.get("restContextPath"));
		Assert.assertEquals(
			String.valueOf(_objectEntry.getGroupId()),
			uploadData.get("scopeGroupId"));

		DropdownItem selectDropdownItem = dropdownItems.get(1);

		Map<String, Object> selectData =
			(Map<String, Object>)selectDropdownItem.get("data");

		Assert.assertEquals("selectAssets", selectData.get("action"));
		Assert.assertEquals(
			String.valueOf(_objectEntry.getObjectEntryId()),
			selectData.get("objectEntryId"));
		Assert.assertEquals(
			"r_cmpTaskToCMPTaskLinks_c_cmpTaskId",
			selectData.get("relationshipObjectFieldName"));
		Assert.assertEquals(
			"/o/cmp/task-links", selectData.get("restContextPath"));
		Assert.assertEquals(
			String.valueOf(_objectEntry.getGroupId()),
			selectData.get("scopeGroupId"));

		String searchAPIURL = (String)selectData.get("searchAPIURL");

		Assert.assertTrue(
			searchAPIURL,
			searchAPIURL.contains(
				StringBundler.concat(
					"(cmsSection eq 'contents' or cmsSection eq 'files') and ",
					"not (cmpTaskObjectEntryIds in (",
					_objectEntry.getObjectEntryId(),
					")) and objectDefinitionId gt 0")));

		Assert.assertEquals("CMS Assets", selectDropdownItem.get("label"));
	}

	@Test
	public void testGetFDSActionDropdownItems() throws Exception {
		List<FDSActionDropdownItem> fdsActionDropdownItems =
			ReflectionTestUtil.invoke(
				_getViewRelatedAssetsSectionDisplayContext(
					getMockHttpServletRequest()),
				"getFDSActionDropdownItems", new Class<?>[0]);

		Assert.assertEquals(
			fdsActionDropdownItems.toString(), 5,
			fdsActionDropdownItems.size());

		FrontendDataSetTestUtil.assertFDSActionDropdownItem(
			"pencil", "actionLink", "Edit", "get",
			fdsActionDropdownItems.get(0));
		FrontendDataSetTestUtil.assertFDSActionDropdownItem(
			"view", "view-content", "View", null,
			fdsActionDropdownItems.get(1));
		FrontendDataSetTestUtil.assertFDSActionDropdownItem(
			"view", "view-file", "View", null, fdsActionDropdownItems.get(2));
		FrontendDataSetTestUtil.assertFDSActionDropdownItem(
			"share", "share", "Share", "get", fdsActionDropdownItems.get(3));
		FrontendDataSetTestUtil.assertFDSActionDropdownItem(
			"chain-broken", "unlink-asset",
			"Remove from " + _objectDefinition.getLabel(LocaleUtil.US), null,
			fdsActionDropdownItems.get(4));
	}

	private Object _getViewRelatedAssetsSectionDisplayContext(
			HttpServletRequest httpServletRequest)
		throws Exception {

		httpServletRequest.setAttribute(
			InfoDisplayWebKeys.INFO_ITEM, _objectEntry);

		_fragmentRenderer.render(
			fragmentRendererContext, httpServletRequest,
			new MockHttpServletResponse());

		return httpServletRequest.getAttribute(
			"com.liferay.site.cms.site.initializer.internal.display.context." +
				"ViewRelatedAssetsSectionDisplayContext");
	}

	@DeleteAfterTestRun
	private DepotEntry _depotEntry;

	@Inject
	private DepotEntryLocalService _depotEntryLocalService;

	@Inject(
		filter = "component.name=com.liferay.site.cms.site.initializer.internal.fragment.renderer.ViewRelatedAssetsJSPSectionFragmentRenderer"
	)
	private FragmentRenderer _fragmentRenderer;

	@Inject
	private GroupLocalService _groupLocalService;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	private ObjectEntry _objectEntry;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@DeleteAfterTestRun
	private User _user;

}