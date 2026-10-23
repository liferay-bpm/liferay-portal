/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.internal.bulk.selection.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.bulk.selection.BulkSelectionAction;
import com.liferay.bulk.selection.BulkSelectionFactory;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceRecord;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceReport;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceRecordLocalService;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceReportLocalService;
import com.liferay.dynamic.data.mapping.storage.DDMFormValues;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceRecordTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMFormTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMFormValuesTestUtil;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.util.HashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceRegistration;

/**
 * @author Akhash Ramprakash
 */
@RunWith(Arquillian.class)
public class DeleteDDMFormInstanceRecordBulkSelectionActionTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();
	}

	@Test
	public void testExecuteWhenDeleteFormInstanceRecordFails()
		throws Exception {

		DDMFormInstance ddmFormInstance = _addDDMFormInstance();

		long[] formInstanceRecordIds = _addFormInstanceRecords(
			5, ddmFormInstance);

		ServiceRegistration<ModelListener<DDMFormInstanceRecord>>
			serviceRegistration = _registerDDMFormInstanceRecordModelListener(
				formInstanceRecordIds[1], formInstanceRecordIds[3]);

		try {
			_execute(ddmFormInstance);
		}
		finally {
			serviceRegistration.unregister();
		}

		for (int i = 0; i < formInstanceRecordIds.length; i++) {
			DDMFormInstanceRecord ddmFormInstanceRecord =
				_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
					formInstanceRecordIds[i]);

			if ((i == 1) || (i == 3)) {
				Assert.assertNotNull(ddmFormInstanceRecord);
			}
			else {
				Assert.assertNull(ddmFormInstanceRecord);
			}
		}

		JSONObject dataJSONObject = _getDataJSONObject(ddmFormInstance);

		Assert.assertEquals(2, dataJSONObject.getInt("totalItems"));

		JSONObject numberJSONObject = dataJSONObject.getJSONObject("number");

		Assert.assertEquals(2, numberJSONObject.getInt("totalEntries"));

		JSONObject summaryJSONObject = numberJSONObject.getJSONObject(
			"summary");

		Assert.assertEquals("4", summaryJSONObject.getString("max"));
		Assert.assertEquals(1, summaryJSONObject.getInt("maxCount"));
		Assert.assertEquals("2", summaryJSONObject.getString("min"));
		Assert.assertEquals(1, summaryJSONObject.getInt("minCount"));
		Assert.assertEquals("6", summaryJSONObject.getString("sum"));
	}

	@Test
	public void testExecuteWhenUpdateDDMFormInstanceReportFails()
		throws Exception {

		DDMFormInstance ddmFormInstance = _addDDMFormInstance();

		long[] formInstanceRecordIds = _addFormInstanceRecords(
			3, ddmFormInstance);

		ServiceRegistration<ModelListener<DDMFormInstanceRecord>>
			ddmFormInstanceRecordServiceRegistration =
				_registerDDMFormInstanceRecordModelListener(
					formInstanceRecordIds[2]);
		ServiceRegistration<ModelListener<DDMFormInstanceReport>>
			ddmFormInstanceReportServiceRegistration =
				_registerDDMFormInstanceReportModelListener(
					formInstanceRecordIds.length + 1,
					ddmFormInstance.getFormInstanceId());

		try {
			_execute(ddmFormInstance);
		}
		finally {
			ddmFormInstanceRecordServiceRegistration.unregister();
			ddmFormInstanceReportServiceRegistration.unregister();
		}

		JSONObject dataJSONObject = _getDataJSONObject(ddmFormInstance);

		JSONObject numberJSONObject = dataJSONObject.getJSONObject("number");

		JSONObject summaryJSONObject = numberJSONObject.getJSONObject(
			"summary");

		Assert.assertEquals("3", summaryJSONObject.getString("max"));
		Assert.assertEquals(1, summaryJSONObject.getInt("maxCount"));
		Assert.assertEquals("3", summaryJSONObject.getString("min"));
		Assert.assertEquals(1, summaryJSONObject.getInt("minCount"));
	}

	private DDMFormInstance _addDDMFormInstance() throws Exception {
		DDMForm ddmForm = DDMFormTestUtil.createDDMForm();

		ddmForm.addDDMFormField(
			DDMFormTestUtil.createNumericDDMFormField(
				"number", RandomTestUtil.randomString(), "integer", false,
				false, false, RandomTestUtil.randomString(),
				RandomTestUtil.randomString(), RandomTestUtil.randomString()));

		return DDMFormInstanceTestUtil.addDDMFormInstance(
			ddmForm, _group, TestPropsValues.getUserId());
	}

	private long[] _addFormInstanceRecords(
			int count, DDMFormInstance ddmFormInstance)
		throws Exception {

		long[] formInstanceRecordIds = new long[count];

		DDMForm ddmForm = ddmFormInstance.getDDMForm();

		for (int i = 0; i < formInstanceRecordIds.length; i++) {
			DDMFormValues ddmFormValues =
				DDMFormValuesTestUtil.createDDMFormValues(ddmForm);

			ddmFormValues.addDDMFormFieldValue(
				DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
					"number", String.valueOf(i + 1)));

			DDMFormInstanceRecord ddmFormInstanceRecord =
				DDMFormInstanceRecordTestUtil.addDDMFormInstanceRecord(
					ddmFormInstance, ddmFormValues, _group,
					TestPropsValues.getUserId());

			formInstanceRecordIds[i] =
				ddmFormInstanceRecord.getFormInstanceRecordId();
		}

		return formInstanceRecordIds;
	}

	private void _execute(DDMFormInstance ddmFormInstance) throws Exception {
		_deleteDDMFormInstanceRecordBulkSelectionAction.execute(
			TestPropsValues.getUser(),
			_ddmFormInstanceRecordBulkSelectionFactory.create(
				HashMapBuilder.put(
					"createDate",
					new String[] {String.valueOf(System.currentTimeMillis())}
				).put(
					"formInstanceId",
					new String[] {
						String.valueOf(ddmFormInstance.getFormInstanceId())
					}
				).build()),
			new HashMap<>());
	}

	private JSONObject _getDataJSONObject(DDMFormInstance ddmFormInstance)
		throws Exception {

		DDMFormInstanceReport ddmFormInstanceReport =
			_ddmFormInstanceReportLocalService.
				getFormInstanceReportByFormInstanceId(
					ddmFormInstance.getFormInstanceId());

		return JSONFactoryUtil.createJSONObject(
			ddmFormInstanceReport.getData());
	}

	private ServiceRegistration<ModelListener<DDMFormInstanceRecord>>
		_registerDDMFormInstanceRecordModelListener(
			long... formInstanceRecordIds) {

		Bundle bundle = FrameworkUtil.getBundle(
			DeleteDDMFormInstanceRecordBulkSelectionActionTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		return bundleContext.registerService(
			(Class<ModelListener<DDMFormInstanceRecord>>)
				(Class<?>)ModelListener.class,
			new BaseModelListener<DDMFormInstanceRecord>() {

				@Override
				public void onBeforeRemove(
						DDMFormInstanceRecord ddmFormInstanceRecord)
					throws ModelListenerException {

					if (ArrayUtil.contains(
							formInstanceRecordIds,
							ddmFormInstanceRecord.getFormInstanceRecordId())) {

						throw new ModelListenerException();
					}
				}

			},
			null);
	}

	private ServiceRegistration<ModelListener<DDMFormInstanceReport>>
		_registerDDMFormInstanceReportModelListener(
			int failedUpdatesCount, long formInstanceId) {

		Bundle bundle = FrameworkUtil.getBundle(
			DeleteDDMFormInstanceRecordBulkSelectionActionTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		AtomicInteger updatesCount = new AtomicInteger();

		return bundleContext.registerService(
			(Class<ModelListener<DDMFormInstanceReport>>)
				(Class<?>)ModelListener.class,
			new BaseModelListener<DDMFormInstanceReport>() {

				@Override
				public void onBeforeUpdate(
						DDMFormInstanceReport originalDDMFormInstanceReport,
						DDMFormInstanceReport ddmFormInstanceReport)
					throws ModelListenerException {

					if ((ddmFormInstanceReport.getFormInstanceId() ==
							formInstanceId) &&
						(updatesCount.incrementAndGet() ==
							failedUpdatesCount)) {

						throw new ModelListenerException();
					}
				}

			},
			null);
	}

	@Inject(
		filter = "model.class.name=com.liferay.dynamic.data.mapping.model.DDMFormInstanceRecord"
	)
	private BulkSelectionFactory<DDMFormInstanceRecord>
		_ddmFormInstanceRecordBulkSelectionFactory;

	@Inject
	private DDMFormInstanceRecordLocalService
		_ddmFormInstanceRecordLocalService;

	@Inject
	private DDMFormInstanceReportLocalService
		_ddmFormInstanceReportLocalService;

	@Inject(
		filter = "bulk.selection.action.key=delete.ddm.form.instance.record"
	)
	private BulkSelectionAction<DDMFormInstanceRecord>
		_deleteDDMFormInstanceRecordBulkSelectionAction;

	@DeleteAfterTestRun
	private Group _group;

}