/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.content.marketing.platform.web.internal.upgrade.v2_3_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.content.marketing.platform.test.util.CMPTestUtil;
import com.liferay.fragment.constants.FragmentConstants;
import com.liferay.fragment.model.FragmentEntryLink;
import com.liferay.layout.page.template.model.LayoutPageTemplateEntry;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructure;
import com.liferay.layout.page.template.service.LayoutPageTemplateStructureLocalService;
import com.liferay.layout.page.template.test.util.DisplayPageTemplateTestUtil;
import com.liferay.layout.test.util.ContentLayoutTestUtil;
import com.liferay.layout.util.structure.LayoutStructure;
import com.liferay.layout.util.structure.StyledLayoutStructureItem;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.portal.upgrade.test.util.UpgradeTestUtil;
import com.liferay.segments.service.SegmentsExperienceLocalService;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Larissa Ribeiro
 */
@RunWith(Arquillian.class)
public class CMPTabsLayoutPageTemplateStructureUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		ObjectDefinition cmpTaskObjectDefinition =
			_objectDefinitionLocalService.
				getObjectDefinitionByExternalReferenceCode(
					"L_CMP_TASK", TestPropsValues.getCompanyId());
		Group group = CMPTestUtil.getOrAddGroup(
			CMPTabsLayoutPageTemplateStructureUpgradeProcessTest.class);

		_layoutPageTemplateEntry =
			DisplayPageTemplateTestUtil.addDisplayPageTemplate(
				group.getGroupId(),
				PortalUtil.getClassNameId(
					cmpTaskObjectDefinition.getClassName()),
				null, false, WorkflowConstants.STATUS_APPROVED);
	}

	@Test
	public void testUpgrade() throws Exception {
		Layout layout = _layoutLocalService.getLayout(
			_layoutPageTemplateEntry.getPlid());

		_testUpgrade(layout);
		_testUpgrade(layout.fetchDraftLayout());
	}

	private FragmentEntryLink _addFragmentEntryLink(
			Layout layout, int position, String rendererKey)
		throws Exception {

		return ContentLayoutTestUtil.addFragmentEntryLinkToLayout(
			StringPool.BLANK, StringPool.BLANK, StringPool.BLANK,
			StringPool.BLANK, StringPool.BLANK, StringPool.BLANK,
			StringPool.BLANK, layout, rendererKey,
			FragmentConstants.TYPE_COMPONENT, null, position,
			_segmentsExperienceLocalService.fetchDefaultSegmentsExperienceId(
				layout.getPlid()));
	}

	private String _getCustomCSS(
		FragmentEntryLink fragmentEntryLink, Layout layout) {

		StyledLayoutStructureItem styledLayoutStructureItem =
			_getStyledLayoutStructureItem(
				fragmentEntryLink, _getLayoutStructure(layout));

		return styledLayoutStructureItem.getCustomCSS();
	}

	private LayoutStructure _getLayoutStructure(Layout layout) {
		LayoutPageTemplateStructure layoutPageTemplateStructure =
			_layoutPageTemplateStructureLocalService.
				fetchLayoutPageTemplateStructure(
					layout.getGroupId(), layout.getPlid());

		return LayoutStructure.of(
			layoutPageTemplateStructure.getData(
				_segmentsExperienceLocalService.
					fetchDefaultSegmentsExperienceId(layout.getPlid())));
	}

	private StyledLayoutStructureItem _getStyledLayoutStructureItem(
		FragmentEntryLink fragmentEntryLink, LayoutStructure layoutStructure) {

		return (StyledLayoutStructureItem)
			layoutStructure.getLayoutStructureItemByFragmentEntryLinkId(
				fragmentEntryLink.getFragmentEntryLinkId());
	}

	private void _testUpgrade(Layout layout) throws Exception {
		FragmentEntryLink fragmentEntryLink1 = _addFragmentEntryLink(
			layout, 0, "BASIC_COMPONENT-tabs");

		_updateCustomCSS(_CUSTOM_CSS, fragmentEntryLink1, layout);

		FragmentEntryLink fragmentEntryLink2 = _addFragmentEntryLink(
			layout, 1, "BASIC_COMPONENT-paragraph");

		_updateCustomCSS(_CUSTOM_CSS, fragmentEntryLink2, layout);

		UpgradeProcess upgradeProcess = UpgradeTestUtil.getUpgradeStep(
			_upgradeStepRegistrator,
			"com.liferay.content.marketing.platform.web.internal.upgrade." +
				"v2_3_0.CMPTabsLayoutPageTemplateStructureUpgradeProcess");

		upgradeProcess.upgrade();

		Assert.assertEquals(
			StringUtil.read(
				CMPTabsLayoutPageTemplateStructureUpgradeProcessTest.class,
				"dependencies/upgraded_custom_css.txt"),
			_getCustomCSS(fragmentEntryLink1, layout));
		Assert.assertEquals(
			_CUSTOM_CSS, _getCustomCSS(fragmentEntryLink2, layout));
	}

	private void _updateCustomCSS(
			String customCSS, FragmentEntryLink fragmentEntryLink,
			Layout layout)
		throws Exception {

		LayoutStructure layoutStructure = _getLayoutStructure(layout);

		StyledLayoutStructureItem styledLayoutStructureItem =
			_getStyledLayoutStructureItem(fragmentEntryLink, layoutStructure);

		styledLayoutStructureItem.setCustomCSS(customCSS);

		_layoutPageTemplateStructureLocalService.
			updateLayoutPageTemplateStructureData(
				TestPropsValues.getUserId(), layout.getGroupId(),
				layout.getPlid(),
				_segmentsExperienceLocalService.
					fetchDefaultSegmentsExperienceId(layout.getPlid()),
				layoutStructure.toString());
	}

	private static final String _CUSTOM_CSS = StringUtil.read(
		CMPTabsLayoutPageTemplateStructureUpgradeProcessTest.class,
		"dependencies/custom_css.txt");

	@Inject
	private LayoutLocalService _layoutLocalService;

	@DeleteAfterTestRun
	private LayoutPageTemplateEntry _layoutPageTemplateEntry;

	@Inject
	private LayoutPageTemplateStructureLocalService
		_layoutPageTemplateStructureLocalService;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private SegmentsExperienceLocalService _segmentsExperienceLocalService;

	@Inject(
		filter = "component.name=com.liferay.content.marketing.platform.web.internal.upgrade.registry.CMPSiteInitializerUpgradeStepRegistrator"
	)
	private UpgradeStepRegistrator _upgradeStepRegistrator;

}