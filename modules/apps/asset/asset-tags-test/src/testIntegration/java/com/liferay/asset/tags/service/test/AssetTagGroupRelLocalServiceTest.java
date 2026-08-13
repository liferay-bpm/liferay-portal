/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.asset.tags.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.asset.kernel.exception.AssetTagGroupRelGroupIdException;
import com.liferay.asset.kernel.model.AssetTag;
import com.liferay.asset.kernel.model.AssetTagGroupRel;
import com.liferay.asset.kernel.service.AssetTagGroupRelLocalService;
import com.liferay.asset.kernel.service.AssetTagLocalService;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Gislayne Vitorino
 */
@RunWith(Arquillian.class)
public class AssetTagGroupRelLocalServiceTest {

	@ClassRule
	@Rule
	public static final LiferayIntegrationTestRule liferayIntegrationTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_assetTag = _addAssetTag();
	}

	@Test
	public void testGetAssetTagGroupRelsByAssetTagId() throws Exception {
		Group group1 = GroupTestUtil.addGroup();
		Group group2 = GroupTestUtil.addGroup();

		long[] groupIds = {group1.getGroupId(), group2.getGroupId()};

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			_assetTag.getTagId(), groupIds, DepotConstants.TYPE_SPACE);

		List<AssetTagGroupRel> assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByTagId(
				_assetTag.getTagId());

		Assert.assertEquals(
			assetTagGroupRels.toString(), groupIds.length,
			assetTagGroupRels.size());

		for (AssetTagGroupRel assetTagGroupRel : assetTagGroupRels) {
			Assert.assertEquals(
				_assetTag.getTagId(), assetTagGroupRel.getTagId());
			Assert.assertTrue(
				ArrayUtil.contains(groupIds, assetTagGroupRel.getGroupId()));
		}

		_assetTagLocalService.deleteTag(_assetTag);

		assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByTagId(
				_assetTag.getTagId());

		Assert.assertTrue(assetTagGroupRels.isEmpty());
	}

	@Test
	public void testGetAssetTagGroupRelsByGroupId() throws Exception {
		AssetTag assetTag1 = _addAssetTag();
		AssetTag assetTag2 = _addAssetTag();

		long[] assetTagIds = {assetTag1.getTagId(), assetTag2.getTagId()};

		Group group = GroupTestUtil.addGroup();

		for (long assetTagId : assetTagIds) {
			_assetTagGroupRelLocalService.addAssetTagGroupRel(
				group.getGroupId(), assetTagId, DepotConstants.TYPE_SPACE);
		}

		List<AssetTagGroupRel> assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByGroupId(
				group.getGroupId());

		Assert.assertEquals(
			assetTagGroupRels.toString(), assetTagIds.length,
			assetTagGroupRels.size());

		for (AssetTagGroupRel assetTagGroupRel : assetTagGroupRels) {
			Assert.assertEquals(
				group.getGroupId(), assetTagGroupRel.getGroupId());
			Assert.assertTrue(
				ArrayUtil.contains(assetTagIds, assetTagGroupRel.getTagId()));
		}

		_groupLocalService.deleteGroup(group);

		assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByGroupId(
				group.getGroupId());

		Assert.assertTrue(assetTagGroupRels.isEmpty());
	}

	@Test
	public void testSetAssetTagGroupRels() throws Exception {
		try {
			_assetTagGroupRelLocalService.setAssetTagGroupRels(
				_assetTag.getTagId(), new long[0], DepotConstants.TYPE_SPACE);

			Assert.fail();
		}
		catch (AssetTagGroupRelGroupIdException
					assetTagGroupRelGroupIdException) {

			Assert.assertNotNull(assetTagGroupRelGroupIdException);
		}

		Group group1 = GroupTestUtil.addGroup();

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			_assetTag.getTagId(), new long[] {group1.getGroupId()},
			DepotConstants.TYPE_SPACE);

		List<AssetTagGroupRel> assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByTagId(
				_assetTag.getTagId());

		Assert.assertEquals(
			assetTagGroupRels.toString(), 1, assetTagGroupRels.size());

		_assertAssetTagGroupRel(
			assetTagGroupRels.get(0), _assetTag.getTagId(),
			group1.getGroupId());

		Group group2 = GroupTestUtil.addGroup();

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			_assetTag.getTagId(), new long[] {group2.getGroupId()},
			DepotConstants.TYPE_SPACE);

		assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByTagId(
				_assetTag.getTagId());

		Assert.assertEquals(
			assetTagGroupRels.toString(), 1, assetTagGroupRels.size());

		_assertAssetTagGroupRel(
			assetTagGroupRels.get(0), _assetTag.getTagId(),
			group2.getGroupId());

		_testSetAssetTagGroupRelsKeepsOtherDepotEntryTypes();
	}

	private AssetTag _addAssetTag() throws Exception {
		return _assetTagLocalService.addTag(
			null, TestPropsValues.getUserId(),
			GroupConstants.DEFAULT_PARENT_GROUP_ID,
			RandomTestUtil.randomString(),
			ServiceContextTestUtil.getServiceContext());
	}

	private void _assertAssetTagGroupRel(
			AssetTagGroupRel assetTagGroupRel, long expectedAssetTagId,
			long expectedGroupId)
		throws Exception {

		Assert.assertEquals(expectedAssetTagId, assetTagGroupRel.getTagId());
		Assert.assertEquals(expectedGroupId, assetTagGroupRel.getGroupId());
	}

	private void _testSetAssetTagGroupRelsKeepsOtherDepotEntryTypes()
		throws Exception {

		Group projectGroup = GroupTestUtil.addGroup();
		Group spaceGroup = GroupTestUtil.addGroup();

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			_assetTag.getTagId(), new long[] {projectGroup.getGroupId()},
			DepotConstants.TYPE_PROJECT);
		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			_assetTag.getTagId(), new long[] {spaceGroup.getGroupId()},
			DepotConstants.TYPE_SPACE);

		List<AssetTagGroupRel> projectAssetTagGroupRels =
			_assetTagGroupRelLocalService.
				getAssetTagGroupRelsByTagIdAndDepotEntryType(
					_assetTag.getTagId(), DepotConstants.TYPE_PROJECT);

		Assert.assertEquals(
			projectAssetTagGroupRels.toString(), 1,
			projectAssetTagGroupRels.size());

		_assertAssetTagGroupRel(
			projectAssetTagGroupRels.get(0), _assetTag.getTagId(),
			projectGroup.getGroupId());

		List<AssetTagGroupRel> spaceAssetTagGroupRels =
			_assetTagGroupRelLocalService.
				getAssetTagGroupRelsByTagIdAndDepotEntryType(
					_assetTag.getTagId(), DepotConstants.TYPE_SPACE);

		Assert.assertEquals(
			spaceAssetTagGroupRels.toString(), 1,
			spaceAssetTagGroupRels.size());

		_assertAssetTagGroupRel(
			spaceAssetTagGroupRels.get(0), _assetTag.getTagId(),
			spaceGroup.getGroupId());

		List<AssetTagGroupRel> assetTagGroupRels =
			_assetTagGroupRelLocalService.getAssetTagGroupRelsByTagId(
				_assetTag.getTagId());

		Assert.assertEquals(
			assetTagGroupRels.toString(), 2, assetTagGroupRels.size());
	}

	private AssetTag _assetTag;

	@Inject
	private AssetTagGroupRelLocalService _assetTagGroupRelLocalService;

	@Inject
	private AssetTagLocalService _assetTagLocalService;

	@Inject
	private GroupLocalService _groupLocalService;

}