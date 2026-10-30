/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.launch.entry.manager.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectEntryConstants;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.rest.dto.v1_0.Status;
import com.liferay.object.rest.manager.v1_0.DefaultObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.DefaultObjectEntryManagerProvider;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.rest.test.util.ObjectEntryTestUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;

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

		ObjectEntry draftObjectEntry = _objectEntryLocalService.getObjectEntry(
			draft.getDraftId());

		Assert.assertEquals(
			objectEntry.getObjectEntryId(),
			draftObjectEntry.getHeadObjectEntryId());
		Assert.assertEquals(
			WorkflowConstants.STATUS_DRAFT, draftObjectEntry.getStatus());
		Assert.assertEquals(
			ObjectEntryConstants.TYPE_LAUNCH, draftObjectEntry.getType());
		Assert.assertEquals(
			"textObjectFieldValue",
			MapUtil.getString(
				draftObjectEntry.getValues(), "textObjectFieldName"));
		Assert.assertEquals(1, draftObjectEntry.getVersion());

		objectEntry = _objectEntryLocalService.getObjectEntry(
			objectEntry.getObjectEntryId());

		Assert.assertEquals(
			ObjectEntryConstants.TYPE_REGULAR, objectEntry.getType());
		Assert.assertEquals(
			"textObjectFieldValue",
			MapUtil.getString(objectEntry.getValues(), "textObjectFieldName"));
		Assert.assertEquals(1, objectEntry.getVersion());

		Assert.assertEquals(
			1,
			_objectEntryLocalService.getObjectEntriesCount(
				_objectDefinition.getObjectDefinitionId()));
	}

	@Test
	public void testDeleteDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		_launchEntryManager.deleteDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertNull(
			_objectEntryLocalService.fetchObjectEntry(draft.getDraftId()));

		Assert.assertNotNull(
			_objectEntryLocalService.fetchObjectEntry(
				objectEntry.getObjectEntryId()));
	}

	@Test
	public void testFetchDraft() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry();

		LaunchEntryManager.Draft draft = _launchEntryManager.addDraft(
			objectEntry.getObjectEntryId(), "1");

		draft = _launchEntryManager.fetchDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertEquals(
			"draft_" + draft.getDraftId(), draft.getPreviewPrimaryKey());
		Assert.assertEquals(WorkflowConstants.STATUS_DRAFT, draft.getStatus());
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

		String value = RandomTestUtil.randomString();

		_updateObjectEntry(
			draft.getDraftId(), WorkflowConstants.STATUS_DRAFT, value);

		ObjectEntry draftObjectEntry = _updateObjectEntry(
			draft.getDraftId(), WorkflowConstants.STATUS_APPROVED, value);

		Assert.assertEquals(
			WorkflowConstants.STATUS_READY_TO_PUBLISH,
			draftObjectEntry.getStatus());

		LaunchEntryManager.Version version = _launchEntryManager.publishDraft(
			objectEntry.getObjectEntryId(), draft.getDraftId());

		Assert.assertEquals("2", version.getVersionKey());

		Assert.assertNull(
			_objectEntryLocalService.fetchObjectEntry(draft.getDraftId()));

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
	}

	private ObjectEntry _addObjectEntry() throws Exception {
		return ObjectEntryTestUtil.addObjectEntry(
			_objectDefinition, "textObjectFieldName", "textObjectFieldValue");
	}

	private ObjectEntry _updateObjectEntry(
			long draftId, int statusCode, String value)
		throws Exception {

		DefaultObjectEntryManager defaultObjectEntryManager =
			DefaultObjectEntryManagerProvider.provide(
				_objectEntryManagerRegistry.getObjectEntryManager(
					_objectDefinition.getCompanyId(),
					_objectDefinition.getStorageType()));

		defaultObjectEntryManager.updateObjectEntry(
			new DefaultDTOConverterContext(
				false, null, _dtoConverterRegistry, null, null, LocaleUtil.US,
				null, TestPropsValues.getUser()),
			_objectDefinition, draftId,
			new com.liferay.object.rest.dto.v1_0.ObjectEntry() {
				{
					setProperties(
						() -> HashMapBuilder.<String, Object>put(
							"textObjectFieldName", value
						).build());
					setStatus(
						() -> new Status() {
							{
								setCode(() -> statusCode);
							}
						});
				}
			});

		return _objectEntryLocalService.getObjectEntry(draftId);
	}

	@Inject
	private DTOConverterRegistry _dtoConverterRegistry;

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
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

	@Inject
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;

}