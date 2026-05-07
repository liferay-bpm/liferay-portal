/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.manager.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.scope.CompanyScoped;
import com.liferay.portal.kernel.search.Sort;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.aggregation.Aggregation;
import com.liferay.portal.vulcan.dto.converter.DTOConverterContext;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.util.List;
import java.util.Locale;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceRegistration;

/**
 * @author Guilherme Camacho
 */
@RunWith(Arquillian.class)
public class ObjectEntryManagerRegistryImplTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testActivateWithDifferentAllowedCompanyId() {
		ServiceRegistration<ObjectEntryManager>
			objectEntryManagerServiceRegistration1 = _register(
				new TestObjectEntryManager(1, false));

		ObjectEntryManager objectEntryManager = new TestObjectEntryManager(
			2, false);

		ServiceRegistration<ObjectEntryManager>
			objectEntryManagerServiceRegistration2 = _register(
				objectEntryManager);

		List<ObjectEntryManager> objectEntryManagers =
			_objectEntryManagerRegistry.getObjectEntryManagers(1);

		Assert.assertFalse(objectEntryManagers.contains(objectEntryManager));

		_unregister(objectEntryManagerServiceRegistration1);
		_unregister(objectEntryManagerServiceRegistration2);
	}

	@Test
	public void testActivateWithException() {
		TestObjectEntryManager testObjectEntryManager1 =
			new TestObjectEntryManager(1, true);

		ServiceRegistration<ObjectEntryManager>
			objectEntryManagerServiceRegistration1 = _register(
				testObjectEntryManager1);

		TestObjectEntryManager testObjectEntryManager2 =
			new TestObjectEntryManager(1, false);

		ServiceRegistration<ObjectEntryManager>
			objectEntryManagerServiceRegistration2 = _register(
				testObjectEntryManager2);

		List<ObjectEntryManager> objectEntryManagers =
			_objectEntryManagerRegistry.getObjectEntryManagers(1);

		Assert.assertFalse(
			objectEntryManagers.contains(testObjectEntryManager1));
		Assert.assertTrue(
			objectEntryManagers.contains(testObjectEntryManager2));

		_unregister(objectEntryManagerServiceRegistration1);
		_unregister(objectEntryManagerServiceRegistration2);
	}

	@Test
	public void testGetObjectEntryManager() {
		Assert.assertNull(
			_objectEntryManagerRegistry.getObjectEntryManager(
				1, RandomTestUtil.randomString()));
	}

	@Test
	@TestInfo("LPD-72651")
	public void testObjectEntryManagerIdBasedDefaultMethods() throws Exception {

		// Non-overriding manager: default methods throw
		// UnsupportedOperationException

		TestObjectEntryManager testObjectEntryManager =
			new TestObjectEntryManager(0, false);

		Assert.assertThrows(
			UnsupportedOperationException.class,
			() -> testObjectEntryManager.deleteObjectEntry(null, 0));
		Assert.assertThrows(
			UnsupportedOperationException.class,
			() -> testObjectEntryManager.getObjectEntry(null, null, 0));
		Assert.assertThrows(
			UnsupportedOperationException.class,
			() -> testObjectEntryManager.partialUpdateObjectEntry(
				null, null, 0, null));
		Assert.assertThrows(
			UnsupportedOperationException.class,
			() -> testObjectEntryManager.updateObjectEntry(
				null, null, 0, null));

		// Overriding manager: ID-based calls are dispatched without cast

		TrackingObjectEntryManager trackingObjectEntryManager =
			new TrackingObjectEntryManager();

		ServiceRegistration<ObjectEntryManager> serviceRegistration = _register(
			trackingObjectEntryManager);

		try {
			ObjectEntryManager objectEntryManager =
				_objectEntryManagerRegistry.getObjectEntryManager(
					0, "tracking");

			Assert.assertSame(trackingObjectEntryManager, objectEntryManager);

			objectEntryManager.deleteObjectEntry(null, 1L);
			objectEntryManager.getObjectEntry(null, null, 1L);
			objectEntryManager.partialUpdateObjectEntry(null, null, 1L, null);
			objectEntryManager.updateObjectEntry(null, null, 1L, null);

			Assert.assertTrue(
				trackingObjectEntryManager.deleteObjectEntryByIdCalled);
			Assert.assertTrue(
				trackingObjectEntryManager.getObjectEntryByIdCalled);
			Assert.assertTrue(
				trackingObjectEntryManager.partialUpdateObjectEntryByIdCalled);
			Assert.assertTrue(
				trackingObjectEntryManager.updateObjectEntryByIdCalled);
		}
		finally {
			_unregister(serviceRegistration);
		}
	}

	private ServiceRegistration<ObjectEntryManager> _register(
		ObjectEntryManager objectEntryManager) {

		Bundle bundle = FrameworkUtil.getBundle(
			ObjectEntryManagerRegistryImplTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		return bundleContext.registerService(
			ObjectEntryManager.class, objectEntryManager, null);
	}

	private void _unregister(
		ServiceRegistration<ObjectEntryManager>
			objectEntryManagerServiceRegistration) {

		if (objectEntryManagerServiceRegistration == null) {
			return;
		}

		objectEntryManagerServiceRegistration.unregister();
	}

	@Inject
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

	private static class TestObjectEntryManager
		implements CompanyScoped, ObjectEntryManager {

		public TestObjectEntryManager(long allowedCompanyId, boolean fail) {
			_allowedCompanyId = allowedCompanyId;
			_fail = fail;
		}

		@Override
		public ObjectEntry addObjectEntry(
				DTOConverterContext dtoConverterContext,
				ObjectDefinition objectDefinition, ObjectEntry objectEntry,
				String scopeKey)
			throws Exception {

			return null;
		}

		@Override
		public void deleteObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				String scopeKey)
			throws Exception {
		}

		@Override
		public long getAllowedCompanyId() {
			return _allowedCompanyId;
		}

		@Override
		public Page<ObjectEntry> getObjectEntries(
				long companyId, ObjectDefinition objectDefinition,
				String scopeKey, Aggregation aggregation,
				DTOConverterContext dtoConverterContext, String filterString,
				Pagination pagination, String search, Sort[] sorts)
			throws Exception {

			return null;
		}

		@Override
		public ObjectEntry getObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				String scopeKey)
			throws Exception {

			return null;
		}

		@Override
		public String getStorageLabel(Locale locale) {
			return "Test";
		}

		@Override
		public String getStorageType() {
			if (_fail) {
				throw new RuntimeException();
			}

			return "test";
		}

		@Override
		public ObjectEntry updateObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				ObjectEntry objectEntry, String scopeKey)
			throws Exception {

			return null;
		}

		private final long _allowedCompanyId;
		private final boolean _fail;

	}

	private static class TrackingObjectEntryManager
		implements ObjectEntryManager {

		@Override
		public ObjectEntry addObjectEntry(
				DTOConverterContext dtoConverterContext,
				ObjectDefinition objectDefinition, ObjectEntry objectEntry,
				String scopeKey)
			throws Exception {

			return null;
		}

		@Override
		public void deleteObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				String scopeKey)
			throws Exception {
		}

		@Override
		public void deleteObjectEntry(
				ObjectDefinition objectDefinition, long objectEntryId)
			throws Exception {

			deleteObjectEntryByIdCalled = true;
		}

		@Override
		public Page<ObjectEntry> getObjectEntries(
				long companyId, ObjectDefinition objectDefinition,
				String scopeKey, Aggregation aggregation,
				DTOConverterContext dtoConverterContext, String filterString,
				Pagination pagination, String search, Sort[] sorts)
			throws Exception {

			return null;
		}

		@Override
		public ObjectEntry getObjectEntry(
				DTOConverterContext dtoConverterContext,
				ObjectDefinition objectDefinition, long objectEntryId)
			throws Exception {

			getObjectEntryByIdCalled = true;

			return null;
		}

		@Override
		public ObjectEntry getObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				String scopeKey)
			throws Exception {

			return null;
		}

		@Override
		public String getStorageLabel(Locale locale) {
			return "tracking";
		}

		@Override
		public String getStorageType() {
			return "tracking";
		}

		@Override
		public ObjectEntry partialUpdateObjectEntry(
				DTOConverterContext dtoConverterContext,
				ObjectDefinition objectDefinition, long objectEntryId,
				ObjectEntry objectEntry)
			throws Exception {

			partialUpdateObjectEntryByIdCalled = true;

			return null;
		}

		@Override
		public ObjectEntry updateObjectEntry(
				DTOConverterContext dtoConverterContext,
				ObjectDefinition objectDefinition, long objectEntryId,
				ObjectEntry objectEntry)
			throws Exception {

			updateObjectEntryByIdCalled = true;

			return null;
		}

		@Override
		public ObjectEntry updateObjectEntry(
				long companyId, DTOConverterContext dtoConverterContext,
				String externalReferenceCode, ObjectDefinition objectDefinition,
				ObjectEntry objectEntry, String scopeKey)
			throws Exception {

			return null;
		}

		public boolean deleteObjectEntryByIdCalled;
		public boolean getObjectEntryByIdCalled;
		public boolean partialUpdateObjectEntryByIdCalled;
		public boolean updateObjectEntryByIdCalled;

	}

}