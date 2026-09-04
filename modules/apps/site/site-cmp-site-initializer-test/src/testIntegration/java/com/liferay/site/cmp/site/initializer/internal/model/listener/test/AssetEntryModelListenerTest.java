/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cmp.site.initializer.internal.model.listener.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.Time;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.FeatureFlag;
import com.liferay.portal.test.rule.FeatureFlags;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.site.cmp.site.initializer.test.util.CMPTestUtil;

import java.io.Serializable;

import java.util.Date;
import java.util.Map;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Pedro Leite
 */
@FeatureFlags(featureFlags = @FeatureFlag("LPD-58677"))
@RunWith(Arquillian.class)
public class AssetEntryModelListenerTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		CMPTestUtil.getOrAddGroup(AssetEntryModelListenerTest.class);
	}

	@Test
	public void testOnAfterUpdate() throws Exception {
		ObjectEntry cmpProjectObjectEntry =
			CMPTestUtil.addCMPProjectObjectEntry();

		ObjectEntry cmpTaskObjectEntry = CMPTestUtil.addCMPTaskObjectEntry(
			cmpProjectObjectEntry, WorkflowConstants.ACTION_PUBLISH);

		_partialUpdateObjectEntry(
			cmpTaskObjectEntry,
			HashMapBuilder.<String, Serializable>put(
				"state", "inProgress"
			).build());
		_partialUpdateObjectEntry(
			cmpTaskObjectEntry,
			HashMapBuilder.<String, Serializable>put(
				"state", "done"
			).build());

		_assertCompletionRate(cmpProjectObjectEntry, 100);

		cmpTaskObjectEntry = CMPTestUtil.addCMPTaskObjectEntry(
			cmpProjectObjectEntry);

		_assertCompletionRate(cmpProjectObjectEntry, 100);

		_partialUpdateObjectEntry(
			cmpTaskObjectEntry,
			HashMapBuilder.<String, Serializable>put(
				"state", "inProgress"
			).build());

		_assertCompletionRate(cmpProjectObjectEntry, 50);

		_objectEntryLocalService.updateStatus(
			cmpTaskObjectEntry.getUserId(),
			cmpTaskObjectEntry.getObjectEntryId(),
			WorkflowConstants.STATUS_EXPIRED,
			ServiceContextTestUtil.getServiceContext());

		_assertCompletionRate(cmpProjectObjectEntry, 50);

		_partialUpdateObjectEntry(
			cmpTaskObjectEntry,
			HashMapBuilder.<String, Serializable>put(
				"displayDate", new Date(System.currentTimeMillis() + Time.DAY)
			).build());

		_assertCompletionRate(cmpProjectObjectEntry, 50);
	}

	private void _assertCompletionRate(
			ObjectEntry cmpProjectObjectEntry, int expectedCompletionRate)
		throws Exception {

		ObjectEntry objectEntry = _objectEntryLocalService.getObjectEntry(
			cmpProjectObjectEntry.getObjectEntryId());

		Assert.assertEquals(
			expectedCompletionRate,
			MapUtil.getInteger(objectEntry.getValues(), "completionRate"));
	}

	private ObjectEntry _partialUpdateObjectEntry(
			ObjectEntry objectEntry, Map<String, Serializable> values)
		throws Exception {

		return _objectEntryLocalService.partialUpdateObjectEntry(
			objectEntry.getUserId(), objectEntry.getObjectEntryId(),
			objectEntry.getObjectEntryFolderId(), values,
			ServiceContextTestUtil.getServiceContext());
	}

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

}