/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.persistence.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.exception.NoSuchObjectEntryVersionDraftException;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.service.ObjectEntryVersionDraftLocalServiceUtil;
import com.liferay.object.service.persistence.ObjectEntryVersionDraftPersistence;
import com.liferay.object.service.persistence.ObjectEntryVersionDraftUtil;
import com.liferay.portal.kernel.dao.orm.ActionableDynamicQuery;
import com.liferay.portal.kernel.dao.orm.DynamicQuery;
import com.liferay.portal.kernel.dao.orm.DynamicQueryFactoryUtil;
import com.liferay.portal.kernel.dao.orm.ProjectionFactoryUtil;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.dao.orm.RestrictionsFactoryUtil;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.transaction.Propagation;
import com.liferay.portal.kernel.util.IntegerWrapper;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.kernel.util.OrderByComparatorFactoryUtil;
import com.liferay.portal.kernel.util.Time;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PersistenceTestRule;
import com.liferay.portal.test.rule.TransactionalTestRule;

import java.io.Serializable;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @generated
 */
@RunWith(Arquillian.class)
public class ObjectEntryVersionDraftPersistenceTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(), PersistenceTestRule.INSTANCE,
			new TransactionalTestRule(
				Propagation.REQUIRED, "com.liferay.object.service"));

	@Before
	public void setUp() {
		_persistence = ObjectEntryVersionDraftUtil.getPersistence();

		Class<?> clazz = _persistence.getClass();

		_dynamicQueryClassLoader = clazz.getClassLoader();
	}

	@After
	public void tearDown() throws Exception {
		Iterator<ObjectEntryVersionDraft> iterator =
			_objectEntryVersionDrafts.iterator();

		while (iterator.hasNext()) {
			_persistence.remove(iterator.next());

			iterator.remove();
		}
	}

	@Test
	public void testCreate() throws Exception {
		long pk = RandomTestUtil.nextLong();

		ObjectEntryVersionDraft objectEntryVersionDraft = _persistence.create(
			pk);

		Assert.assertNotNull(objectEntryVersionDraft);

		Assert.assertEquals(objectEntryVersionDraft.getPrimaryKey(), pk);
	}

	@Test
	public void testRemove() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		_persistence.remove(newObjectEntryVersionDraft);

		ObjectEntryVersionDraft existingObjectEntryVersionDraft =
			_persistence.fetchByPrimaryKey(
				newObjectEntryVersionDraft.getPrimaryKey());

		Assert.assertNull(existingObjectEntryVersionDraft);
	}

	@Test
	public void testUpdateNew() throws Exception {
		addObjectEntryVersionDraft();
	}

	@Test
	public void testUpdateExisting() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		newObjectEntryVersionDraft.setCompanyId(RandomTestUtil.nextLong());

		newObjectEntryVersionDraft.setUserId(RandomTestUtil.nextLong());

		newObjectEntryVersionDraft.setUserName(RandomTestUtil.randomString());

		newObjectEntryVersionDraft.setCreateDate(RandomTestUtil.nextDate());

		newObjectEntryVersionDraft.setModifiedDate(RandomTestUtil.nextDate());

		newObjectEntryVersionDraft.setObjectDefinitionId(
			RandomTestUtil.nextLong());

		newObjectEntryVersionDraft.setObjectEntryId(RandomTestUtil.nextLong());

		newObjectEntryVersionDraft.setContent(RandomTestUtil.randomString());

		newObjectEntryVersionDraft.setVersion(RandomTestUtil.nextInt());

		newObjectEntryVersionDraft.setStatus(RandomTestUtil.nextInt());

		newObjectEntryVersionDraft = _persistence.update(
			newObjectEntryVersionDraft);

		_objectEntryVersionDrafts.add(newObjectEntryVersionDraft);

		ObjectEntryVersionDraft existingObjectEntryVersionDraft =
			_persistence.findByPrimaryKey(
				newObjectEntryVersionDraft.getPrimaryKey());

		Assert.assertEquals(
			existingObjectEntryVersionDraft.getMvccVersion(),
			newObjectEntryVersionDraft.getMvccVersion());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getObjectEntryVersionDraftId(),
			newObjectEntryVersionDraft.getObjectEntryVersionDraftId());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getCompanyId(),
			newObjectEntryVersionDraft.getCompanyId());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getUserId(),
			newObjectEntryVersionDraft.getUserId());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getUserName(),
			newObjectEntryVersionDraft.getUserName());
		Assert.assertEquals(
			Time.getShortTimestamp(
				existingObjectEntryVersionDraft.getCreateDate()),
			Time.getShortTimestamp(newObjectEntryVersionDraft.getCreateDate()));
		Assert.assertEquals(
			Time.getShortTimestamp(
				existingObjectEntryVersionDraft.getModifiedDate()),
			Time.getShortTimestamp(
				newObjectEntryVersionDraft.getModifiedDate()));
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getObjectDefinitionId(),
			newObjectEntryVersionDraft.getObjectDefinitionId());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getObjectEntryId(),
			newObjectEntryVersionDraft.getObjectEntryId());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getContent(),
			newObjectEntryVersionDraft.getContent());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getVersion(),
			newObjectEntryVersionDraft.getVersion());
		Assert.assertEquals(
			existingObjectEntryVersionDraft.getStatus(),
			newObjectEntryVersionDraft.getStatus());
	}

	@Test
	public void testCountByObjectDefinitionId() throws Exception {
		_persistence.countByObjectDefinitionId(RandomTestUtil.nextLong());

		_persistence.countByObjectDefinitionId(0L);
	}

	@Test
	public void testCountByObjectEntryId() throws Exception {
		_persistence.countByObjectEntryId(RandomTestUtil.nextLong());

		_persistence.countByObjectEntryId(0L);
	}

	@Test
	public void testFindByPrimaryKeyExisting() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		ObjectEntryVersionDraft existingObjectEntryVersionDraft =
			_persistence.findByPrimaryKey(
				newObjectEntryVersionDraft.getPrimaryKey());

		Assert.assertEquals(
			existingObjectEntryVersionDraft, newObjectEntryVersionDraft);
	}

	@Test(expected = NoSuchObjectEntryVersionDraftException.class)
	public void testFindByPrimaryKeyMissing() throws Exception {
		long pk = RandomTestUtil.nextLong();

		_persistence.findByPrimaryKey(pk);
	}

	@Test
	public void testFindAll() throws Exception {
		_persistence.findAll(
			QueryUtil.ALL_POS, QueryUtil.ALL_POS, getOrderByComparator());
	}

	protected OrderByComparator<ObjectEntryVersionDraft>
		getOrderByComparator() {

		return OrderByComparatorFactoryUtil.create(
			"ObjectEntryVersionDraft", "mvccVersion", true,
			"objectEntryVersionDraftId", true, "companyId", true, "userId",
			true, "userName", true, "createDate", true, "modifiedDate", true,
			"objectDefinitionId", true, "objectEntryId", true, "version", true,
			"status", true);
	}

	@Test
	public void testFetchByPrimaryKeyExisting() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		ObjectEntryVersionDraft existingObjectEntryVersionDraft =
			_persistence.fetchByPrimaryKey(
				newObjectEntryVersionDraft.getPrimaryKey());

		Assert.assertEquals(
			existingObjectEntryVersionDraft, newObjectEntryVersionDraft);
	}

	@Test
	public void testFetchByPrimaryKeyMissing() throws Exception {
		long pk = RandomTestUtil.nextLong();

		ObjectEntryVersionDraft missingObjectEntryVersionDraft =
			_persistence.fetchByPrimaryKey(pk);

		Assert.assertNull(missingObjectEntryVersionDraft);
	}

	@Test
	public void testFetchByPrimaryKeysWithMultiplePrimaryKeysWhereAllPrimaryKeysExist()
		throws Exception {

		ObjectEntryVersionDraft newObjectEntryVersionDraft1 =
			addObjectEntryVersionDraft();
		ObjectEntryVersionDraft newObjectEntryVersionDraft2 =
			addObjectEntryVersionDraft();

		Set<Serializable> primaryKeys = new HashSet<Serializable>();

		primaryKeys.add(newObjectEntryVersionDraft1.getPrimaryKey());
		primaryKeys.add(newObjectEntryVersionDraft2.getPrimaryKey());

		Map<Serializable, ObjectEntryVersionDraft> objectEntryVersionDrafts =
			_persistence.fetchByPrimaryKeys(primaryKeys);

		Assert.assertEquals(2, objectEntryVersionDrafts.size());
		Assert.assertEquals(
			newObjectEntryVersionDraft1,
			objectEntryVersionDrafts.get(
				newObjectEntryVersionDraft1.getPrimaryKey()));
		Assert.assertEquals(
			newObjectEntryVersionDraft2,
			objectEntryVersionDrafts.get(
				newObjectEntryVersionDraft2.getPrimaryKey()));
	}

	@Test
	public void testFetchByPrimaryKeysWithMultiplePrimaryKeysWhereNoPrimaryKeysExist()
		throws Exception {

		long pk1 = RandomTestUtil.nextLong();

		long pk2 = RandomTestUtil.nextLong();

		Set<Serializable> primaryKeys = new HashSet<Serializable>();

		primaryKeys.add(pk1);
		primaryKeys.add(pk2);

		Map<Serializable, ObjectEntryVersionDraft> objectEntryVersionDrafts =
			_persistence.fetchByPrimaryKeys(primaryKeys);

		Assert.assertTrue(objectEntryVersionDrafts.isEmpty());
	}

	@Test
	public void testFetchByPrimaryKeysWithMultiplePrimaryKeysWhereSomePrimaryKeysExist()
		throws Exception {

		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		long pk = RandomTestUtil.nextLong();

		Set<Serializable> primaryKeys = new HashSet<Serializable>();

		primaryKeys.add(newObjectEntryVersionDraft.getPrimaryKey());
		primaryKeys.add(pk);

		Map<Serializable, ObjectEntryVersionDraft> objectEntryVersionDrafts =
			_persistence.fetchByPrimaryKeys(primaryKeys);

		Assert.assertEquals(1, objectEntryVersionDrafts.size());
		Assert.assertEquals(
			newObjectEntryVersionDraft,
			objectEntryVersionDrafts.get(
				newObjectEntryVersionDraft.getPrimaryKey()));
	}

	@Test
	public void testFetchByPrimaryKeysWithNoPrimaryKeys() throws Exception {
		Set<Serializable> primaryKeys = new HashSet<Serializable>();

		Map<Serializable, ObjectEntryVersionDraft> objectEntryVersionDrafts =
			_persistence.fetchByPrimaryKeys(primaryKeys);

		Assert.assertTrue(objectEntryVersionDrafts.isEmpty());
	}

	@Test
	public void testFetchByPrimaryKeysWithOnePrimaryKey() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		Set<Serializable> primaryKeys = new HashSet<Serializable>();

		primaryKeys.add(newObjectEntryVersionDraft.getPrimaryKey());

		Map<Serializable, ObjectEntryVersionDraft> objectEntryVersionDrafts =
			_persistence.fetchByPrimaryKeys(primaryKeys);

		Assert.assertEquals(1, objectEntryVersionDrafts.size());
		Assert.assertEquals(
			newObjectEntryVersionDraft,
			objectEntryVersionDrafts.get(
				newObjectEntryVersionDraft.getPrimaryKey()));
	}

	@Test
	public void testActionableDynamicQuery() throws Exception {
		final IntegerWrapper count = new IntegerWrapper();

		ActionableDynamicQuery actionableDynamicQuery =
			ObjectEntryVersionDraftLocalServiceUtil.getActionableDynamicQuery();

		actionableDynamicQuery.setPerformActionMethod(
			new ActionableDynamicQuery.PerformActionMethod
				<ObjectEntryVersionDraft>() {

				@Override
				public void performAction(
					ObjectEntryVersionDraft objectEntryVersionDraft) {

					Assert.assertNotNull(objectEntryVersionDraft);

					count.increment();
				}

			});

		actionableDynamicQuery.performActions();

		Assert.assertEquals(count.getValue(), _persistence.countAll());
	}

	@Test
	public void testDynamicQueryByPrimaryKeyExisting() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		DynamicQuery dynamicQuery = DynamicQueryFactoryUtil.forClass(
			ObjectEntryVersionDraft.class, _dynamicQueryClassLoader);

		dynamicQuery.add(
			RestrictionsFactoryUtil.eq(
				"objectEntryVersionDraftId",
				newObjectEntryVersionDraft.getObjectEntryVersionDraftId()));

		List<ObjectEntryVersionDraft> result =
			_persistence.findWithDynamicQuery(dynamicQuery);

		Assert.assertEquals(1, result.size());

		ObjectEntryVersionDraft existingObjectEntryVersionDraft = result.get(0);

		Assert.assertEquals(
			existingObjectEntryVersionDraft, newObjectEntryVersionDraft);
	}

	@Test
	public void testDynamicQueryByPrimaryKeyMissing() throws Exception {
		DynamicQuery dynamicQuery = DynamicQueryFactoryUtil.forClass(
			ObjectEntryVersionDraft.class, _dynamicQueryClassLoader);

		dynamicQuery.add(
			RestrictionsFactoryUtil.eq(
				"objectEntryVersionDraftId", RandomTestUtil.nextLong()));

		List<ObjectEntryVersionDraft> result =
			_persistence.findWithDynamicQuery(dynamicQuery);

		Assert.assertEquals(0, result.size());
	}

	@Test
	public void testDynamicQueryByProjectionExisting() throws Exception {
		ObjectEntryVersionDraft newObjectEntryVersionDraft =
			addObjectEntryVersionDraft();

		DynamicQuery dynamicQuery = DynamicQueryFactoryUtil.forClass(
			ObjectEntryVersionDraft.class, _dynamicQueryClassLoader);

		dynamicQuery.setProjection(
			ProjectionFactoryUtil.property("objectEntryVersionDraftId"));

		Object newObjectEntryVersionDraftId =
			newObjectEntryVersionDraft.getObjectEntryVersionDraftId();

		dynamicQuery.add(
			RestrictionsFactoryUtil.in(
				"objectEntryVersionDraftId",
				new Object[] {newObjectEntryVersionDraftId}));

		List<Object> result = _persistence.findWithDynamicQuery(dynamicQuery);

		Assert.assertEquals(1, result.size());

		Object existingObjectEntryVersionDraftId = result.get(0);

		Assert.assertEquals(
			existingObjectEntryVersionDraftId, newObjectEntryVersionDraftId);
	}

	@Test
	public void testDynamicQueryByProjectionMissing() throws Exception {
		DynamicQuery dynamicQuery = DynamicQueryFactoryUtil.forClass(
			ObjectEntryVersionDraft.class, _dynamicQueryClassLoader);

		dynamicQuery.setProjection(
			ProjectionFactoryUtil.property("objectEntryVersionDraftId"));

		dynamicQuery.add(
			RestrictionsFactoryUtil.in(
				"objectEntryVersionDraftId",
				new Object[] {RandomTestUtil.nextLong()}));

		List<Object> result = _persistence.findWithDynamicQuery(dynamicQuery);

		Assert.assertEquals(0, result.size());
	}

	protected ObjectEntryVersionDraft addObjectEntryVersionDraft()
		throws Exception {

		long pk = RandomTestUtil.nextLong();

		ObjectEntryVersionDraft objectEntryVersionDraft = _persistence.create(
			pk);

		objectEntryVersionDraft.setCompanyId(RandomTestUtil.nextLong());

		objectEntryVersionDraft.setUserId(RandomTestUtil.nextLong());

		objectEntryVersionDraft.setUserName(RandomTestUtil.randomString());

		objectEntryVersionDraft.setCreateDate(RandomTestUtil.nextDate());

		objectEntryVersionDraft.setModifiedDate(RandomTestUtil.nextDate());

		objectEntryVersionDraft.setObjectDefinitionId(
			RandomTestUtil.nextLong());

		objectEntryVersionDraft.setObjectEntryId(RandomTestUtil.nextLong());

		objectEntryVersionDraft.setContent(RandomTestUtil.randomString());

		objectEntryVersionDraft.setVersion(RandomTestUtil.nextInt());

		objectEntryVersionDraft.setStatus(RandomTestUtil.nextInt());

		_objectEntryVersionDrafts.add(
			_persistence.update(objectEntryVersionDraft));

		return objectEntryVersionDraft;
	}

	private List<ObjectEntryVersionDraft> _objectEntryVersionDrafts =
		new ArrayList<ObjectEntryVersionDraft>();
	private ObjectEntryVersionDraftPersistence _persistence;
	private ClassLoader _dynamicQueryClassLoader;

}
// LIFERAY-SERVICE-BUILDER-HASH:1770733825