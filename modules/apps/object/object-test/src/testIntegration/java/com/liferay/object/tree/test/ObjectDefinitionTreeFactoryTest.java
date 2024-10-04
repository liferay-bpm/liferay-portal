/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.tree.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.object.test.util.TreeTestUtil;
import com.liferay.object.tree.ObjectDefinitionTreeFactory;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.LinkedHashMapBuilder;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.test.rule.FeatureFlags;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.ArrayList;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Feliphe Marinho
 */
@FeatureFlags("LPS-187142")
@RunWith(Arquillian.class)
public class ObjectDefinitionTreeFactoryTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testCreate() throws Exception {
		TreeTestUtil.assertObjectDefinitionTree(
			LinkedHashMapBuilder.put(
				"A", new String[] {"AA", "AB"}
			).put(
				"AA", new String[] {"AAA", "AAB"}
			).put(
				"AB", new String[0]
			).put(
				"AAA", new String[0]
			).put(
				"AAB", new String[0]
			).build(),
			TreeTestUtil.createObjectDefinitionTree(
				_objectDefinitionLocalService, _objectRelationshipLocalService,
				false,
				LinkedHashMapBuilder.put(
					"A", new String[] {"AA", "AB"}
				).put(
					"AA", new String[] {"AAA", "AAB"}
				).put(
					"AB", new String[0]
				).put(
					"AAA", new String[0]
				).put(
					"AAB", new String[0]
				).build()),
			_objectDefinitionLocalService);

		TreeTestUtil.deleteObjectDefinitionHierarchy(
			_objectDefinitionLocalService,
			new String[] {"C_AAB", "C_AAA", "C_AB", "C_AA", "C_A"},
			_objectEntryLocalService);
	}

	@Test
	public void testGetObjectDefinitionTreeHeight() throws Exception {
		ObjectDefinitionTreeFactory objectDefinitionTreeFactory =
			new ObjectDefinitionTreeFactory(
				_objectDefinitionLocalService, _objectRelationshipLocalService);

		ObjectDefinition objectDefinitionA =
			ObjectDefinitionTestUtil.addCustomObjectDefinition(
				0, false, "A", new ArrayList<>());

		long rootObjectDefinitionId = objectDefinitionA.getObjectDefinitionId();

		Assert.assertEquals(
			0,
			objectDefinitionTreeFactory.getObjectDefinitionTreeHeight(
				rootObjectDefinitionId, rootObjectDefinitionId));

		ObjectDefinition objectDefinitionAA = _addAndBindObjectDefinition(
			"AA", objectDefinitionA.getObjectDefinitionId());

		ObjectDefinition objectDefinitionAAA = _addAndBindObjectDefinition(
			"AAA", objectDefinitionAA.getObjectDefinitionId());

		Assert.assertEquals(
			2,
			objectDefinitionTreeFactory.getObjectDefinitionTreeHeight(
				rootObjectDefinitionId,
				objectDefinitionAAA.getObjectDefinitionId()));

		ObjectDefinition objectDefinitionAAAA = _addAndBindObjectDefinition(
			"AAAA", objectDefinitionAAA.getObjectDefinitionId());

		ObjectDefinition objectDefinitionAAAAA = _addAndBindObjectDefinition(
			"AAAAA", objectDefinitionAAAA.getObjectDefinitionId());

		Assert.assertEquals(
			4,
			objectDefinitionTreeFactory.getObjectDefinitionTreeHeight(
				rootObjectDefinitionId,
				objectDefinitionAAAAA.getObjectDefinitionId()));

		ObjectDefinition objectDefinitionAAAAB = _addAndBindObjectDefinition(
			"AAAAB", objectDefinitionAAAA.getObjectDefinitionId());

		Assert.assertEquals(
			4,
			objectDefinitionTreeFactory.getObjectDefinitionTreeHeight(
				rootObjectDefinitionId,
				objectDefinitionAAAAB.getObjectDefinitionId()));

		TreeTestUtil.deleteObjectDefinitionHierarchy(
			_objectDefinitionLocalService,
			new String[] {
				"C_AAAAB", "C_AAAAA", "C_AAAA", "C_AAA", "C_AA", "C_A"
			},
			_objectEntryLocalService);
	}

	private ObjectDefinition _addAndBindObjectDefinition(
			String name, long parentObjectDefinitionId)
		throws Exception {

		ObjectDefinition objectDefinition =
			ObjectDefinitionTestUtil.addCustomObjectDefinition(
				0, false, name, new ArrayList<>());

		_objectRelationshipLocalService.addObjectRelationship(
			StringUtil.randomId(), TestPropsValues.getUserId(),
			parentObjectDefinitionId, objectDefinition.getObjectDefinitionId(),
			0, ObjectRelationshipConstants.DELETION_TYPE_CASCADE, true,
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			StringUtil.randomId(), false,
			ObjectRelationshipConstants.TYPE_ONE_TO_MANY, null);

		return objectDefinition;
	}

	@Inject
	private static ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private static ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private static ObjectRelationshipLocalService
		_objectRelationshipLocalService;

}