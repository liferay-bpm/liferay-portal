/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.upgrade.v7_4_x.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.asset.kernel.model.AssetTag;
import com.liferay.asset.kernel.model.AssetTagGroupRel;
import com.liferay.asset.kernel.service.AssetTagGroupRelLocalService;
import com.liferay.asset.kernel.service.AssetTagLocalService;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.portal.kernel.cache.CacheRegistryUtil;
import com.liferay.portal.kernel.dao.orm.EntityCache;
import com.liferay.portal.kernel.dao.orm.FinderCache;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.upgrade.v7_4_x.AssetTagGroupRelAllProjectsUpgradeProcess;
import com.liferay.portlet.asset.model.impl.AssetTagGroupRelImpl;

import java.util.Collections;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Yuri Monteiro
 */
@RunWith(Arquillian.class)
public class AssetTagGroupRelAllProjectsUpgradeProcessTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();

		Group cmsGroup = _groupLocalService.getGroup(
			TestPropsValues.getCompanyId(), GroupConstants.CMS);

		_cmsAssetTag = _addAssetTag(cmsGroup.getGroupId());

		_siteAssetTag = _addAssetTag(_group.getGroupId());
	}

	@Test
	public void testUpgrade() throws Exception {
		UpgradeProcess upgradeProcess =
			new AssetTagGroupRelAllProjectsUpgradeProcess();

		_upgrade(upgradeProcess);

		_assertAllProjectsAssetTagGroupRel(_cmsAssetTag);

		Assert.assertEquals(
			Collections.emptyList(),
			_assetTagGroupRelLocalService.
				getAssetTagGroupRelsByTagIdAndDepotEntryType(
					_siteAssetTag.getTagId(), DepotConstants.TYPE_PROJECT));

		_upgrade(upgradeProcess);

		_assertAllProjectsAssetTagGroupRel(_cmsAssetTag);
	}

	private AssetTag _addAssetTag(long groupId) throws Exception {
		return _assetTagLocalService.addTag(
			null, TestPropsValues.getUserId(), groupId,
			RandomTestUtil.randomString(),
			ServiceContextTestUtil.getServiceContext(groupId));
	}

	private void _assertAllProjectsAssetTagGroupRel(AssetTag assetTag) {
		List<AssetTagGroupRel> assetTagGroupRels =
			_assetTagGroupRelLocalService.
				getAssetTagGroupRelsByTagIdAndDepotEntryType(
					assetTag.getTagId(), DepotConstants.TYPE_PROJECT);

		Assert.assertEquals(
			assetTagGroupRels.toString(), 1, assetTagGroupRels.size());

		AssetTagGroupRel assetTagGroupRel = assetTagGroupRels.get(0);

		Assert.assertEquals(
			GroupConstants.ANY_PARENT_GROUP_ID, assetTagGroupRel.getGroupId());
	}

	private void _upgrade(UpgradeProcess upgradeProcess) throws Exception {
		upgradeProcess.upgrade();

		CacheRegistryUtil.clear();

		_entityCache.clearCache(AssetTagGroupRelImpl.class);

		_finderCache.clearCache(AssetTagGroupRelImpl.class);
	}

	@Inject
	private AssetTagGroupRelLocalService _assetTagGroupRelLocalService;

	@Inject
	private AssetTagLocalService _assetTagLocalService;

	@DeleteAfterTestRun
	private AssetTag _cmsAssetTag;

	@Inject
	private EntityCache _entityCache;

	@Inject
	private FinderCache _finderCache;

	@DeleteAfterTestRun
	private Group _group;

	@Inject
	private GroupLocalService _groupLocalService;

	@DeleteAfterTestRun
	private AssetTag _siteAssetTag;

}