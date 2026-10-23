/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.launch.entry.manager.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.rest.test.util.ObjectEntryTestUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionDraftLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import java.util.Collections;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Carolina Barbosa
 */
@RunWith(Arquillian.class)
public class ObjectEntryLaunchEntryManagerTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_objectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				null, TestPropsValues.getUserId(), 0, null, null, true, false,
				true, false, true, true, false, false, true, null,
				RandomTestUtil.randomLocaleStringMap(),
				"A" + StringUtil.randomString(), null, null,
				RandomTestUtil.randomLocaleStringMap(), true,
				ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.emptyList(),
				Collections.singletonList(
					new TextObjectFieldBuilder(
					).labelMap(
						RandomTestUtil.randomLocaleStringMap()
					).name(
						"textObjectFieldName"
					).build()),
				Collections.emptyList(), new ServiceContext());

		_objectDefinition =
			_objectDefinitionLocalService.publishCustomObjectDefinition(
				TestPropsValues.getUserId(),
				_objectDefinition.getObjectDefinitionId());

		ServiceContextThreadLocal.pushServiceContext(
			ServiceContextTestUtil.getServiceContext());
	}

	@After
	public void tearDown() throws Exception {
		ServiceContextThreadLocal.popServiceContext();
	}

	@Test
	public void testAddDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		ObjectEntryVersionDraft objectEntryVersionDraft =
			_objectEntryVersionDraftLocalService.getObjectEntryVersionDraft(
				draft.getDraftId());

		ObjectEntryVersion objectEntryVersion =
			_objectEntryVersionLocalService.getObjectEntryVersion(
				objectEntry.getObjectEntryId(), 1);

		Assert.assertEquals(
			objectEntryVersion.getContent(),
			objectEntryVersionDraft.getContent());
	}

	@Test
	public void testDeleteDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		_launchEntryManager.deleteDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertNull(
			_objectEntryVersionDraftLocalService.fetchObjectEntryVersionDraft(
				draft.getDraftId()));
	}

	@Test
	public void testFetchDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		ObjectEntryVersionDraft objectEntryVersionDraft =
			_objectEntryVersionDraftLocalService.getObjectEntryVersionDraft(
				draft.getDraftId());

		draft = _launchEntryManager.fetchDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertEquals(
			"draft_" + objectEntryVersionDraft.getObjectEntryVersionDraftId(),
			draft.getPreviewPrimaryKey());
	}

	@Test
	public void testFetchItem() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Item item = _launchEntryManager.fetchItem(
			objectEntry.getObjectEntryId());

		Assert.assertEquals(
			objectEntry.getObjectEntryId(), item.getPrimaryKey());
	}

	@Test
	public void testFetchVersion() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		ObjectEntryVersion objectEntryVersion =
			_objectEntryVersionLocalService.getObjectEntryVersion(
				objectEntry.getObjectEntryId(), 1);

		LaunchEntryManager.Version version = _launchEntryManager.fetchVersion(
			objectEntry.getObjectEntryId(), "1");

		Assert.assertEquals(
			"version_" + objectEntryVersion.getObjectEntryVersionId(),
			version.getPreviewPrimaryKey());
	}

	@Test
	public void testPublishDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		ObjectEntryVersionDraft objectEntryVersionDraft =
			_objectEntryVersionDraftLocalService.getObjectEntryVersionDraft(
				draft.getDraftId());

		String value = RandomTestUtil.randomString();

		objectEntryVersionDraft.setContent(
			StringUtil.replace(
				objectEntryVersionDraft.getContent(), "textObjectFieldValue",
				value));

		objectEntryVersionDraft =
			_objectEntryVersionDraftLocalService.updateObjectEntryVersionDraft(
				objectEntryVersionDraft);

		LaunchEntryManager.Version version = _launchEntryManager.publishDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertEquals("2", version.getVersionKey());

		objectEntry = _objectEntryLocalService.getObjectEntry(
			objectEntry.getObjectEntryId());

		Assert.assertEquals(
			value,
			MapUtil.getString(objectEntry.getValues(), "textObjectFieldName"));
		Assert.assertEquals(2, objectEntry.getVersion());
		Assert.assertEquals(
			2,
			_objectEntryVersionLocalService.getObjectEntryVersionsCount(
				objectEntry.getObjectEntryId()));

		Assert.assertNull(
			_objectEntryVersionDraftLocalService.fetchObjectEntryVersionDraft(
				objectEntryVersionDraft.getObjectEntryVersionDraftId()));
	}

	private ObjectEntry _addObjectEntry() throws Exception {
		return ObjectEntryTestUtil.addObjectEntry(
			_objectDefinition, "textObjectFieldName", "textObjectFieldValue");
	}

	@Inject(
		filter = "launch.entry.manager.class.name=com.liferay.object.model.ObjectEntry"
	)
	private LaunchEntryManager _launchEntryManager;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectEntryVersionDraftLocalService
		_objectEntryVersionDraftLocalService;

	@Inject
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;

}