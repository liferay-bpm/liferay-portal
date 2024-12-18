/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.object.entries.display.context.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.frontend.data.set.filter.SelectionFDSFilterItem;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.field.filter.parser.OneToManyObjectFieldFilterStrategy;
import com.liferay.object.field.frontend.data.set.filter.OneToManySelectionFDSFilter;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.model.ObjectViewFilterColumn;
import com.liferay.object.related.models.test.util.ObjectEntryTestUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.service.persistence.ObjectViewFilterColumnPersistence;
import com.liferay.object.system.SystemObjectDefinitionManagerRegistry;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.object.test.util.ObjectRelationshipTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.io.Serializable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Richard Jeremias
 */
@RunWith(Arquillian.class)
public class ViewObjectEntriesDisplayContextTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Test
	public void testGetFDSFilter() throws Exception {
		_objectDefinition1 = _publishObjectDefinition();
		_objectDefinition2 = _publishObjectDefinition();

		ObjectRelationship objectRelationship =
			ObjectRelationshipTestUtil.addObjectRelationship(
				_objectRelationshipLocalService, _objectDefinition1,
				_objectDefinition2);

		ObjectEntry objectEntry = ObjectEntryTestUtil.addObjectEntry(
			TestPropsValues.getGroupId(),
			_objectDefinition1.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				_OBJECT_FIELD_NAME, RandomTestUtil.randomInt()
			).build());

		ObjectViewFilterColumn objectViewFilterColumn =
			_objectViewFilterColumnPersistence.create(0L);

		objectViewFilterColumn.setFilterType(null);
		objectViewFilterColumn.setJSON(null);
		objectViewFilterColumn.setObjectFieldName(_OBJECT_FIELD_NAME);

		OneToManyObjectFieldFilterStrategy oneToManyObjectFieldFilterStrategy =
			new OneToManyObjectFieldFilterStrategy(
				TestPropsValues.getGroupId(),
				TestPropsValues.getUser(
				).getLocale(),
				_objectDefinition1, _objectDefinitionLocalService,
				_objectEntryLocalService,
				_objectFieldLocalService.getObjectField(
					objectRelationship.getObjectFieldId2()),
				_objectFieldLocalService, _objectRelationshipLocalService,
				objectViewFilterColumn, _systemObjectDefinitionManagerRegistry);

		OneToManySelectionFDSFilter filter =
			(OneToManySelectionFDSFilter)
				oneToManyObjectFieldFilterStrategy.getFDSFilter();

		Map<String, Object> preloadedData = filter.getPreloadedData();

		List<SelectionFDSFilterItem> selectionFDSFilterItems =
			(ArrayList<SelectionFDSFilterItem>)preloadedData.get(
				"selectedItems");

		Assert.assertEquals(
			filter.getAPIURL(),
			StringBundler.concat(
				"/o", _objectDefinition1.getRESTContextPath(), "/scopes/",
				TestPropsValues.getGroupId()));
		Assert.assertEquals(
			selectionFDSFilterItems.get(
				0
			).getValue(),
			objectEntry.getObjectEntryId());
	}

	private ObjectDefinition _publishObjectDefinition() throws Exception {
		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				TestPropsValues.getUserId(), 0, null, false, true, false, false,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionTestUtil.getRandomName(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, ObjectDefinitionConstants.SCOPE_SITE,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.singletonList(
					ObjectFieldUtil.createObjectField(
						"Text", "String", true, true, null,
						RandomTestUtil.randomString(), _OBJECT_FIELD_NAME,
						false)));

		return _objectDefinitionLocalService.publishCustomObjectDefinition(
			TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId());
	}

	private static final String _OBJECT_FIELD_NAME =
		"x" + RandomTestUtil.randomString();

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition1;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition2;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectFieldLocalService _objectFieldLocalService;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Inject
	private ObjectViewFilterColumnPersistence
		_objectViewFilterColumnPersistence;

	@Inject
	private SystemObjectDefinitionManagerRegistry
		_systemObjectDefinitionManagerRegistry;

}