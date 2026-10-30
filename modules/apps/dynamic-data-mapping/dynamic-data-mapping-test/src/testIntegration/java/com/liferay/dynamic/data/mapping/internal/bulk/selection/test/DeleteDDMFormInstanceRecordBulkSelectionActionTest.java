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
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import java.util.HashMap;

import org.junit.After;
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
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();
	}

	@After
	public void tearDown() {
		if (_serviceRegistration != null) {
			_serviceRegistration.unregister();
		}
	}

	@Test
	public void testExecute() throws Exception {

		// Failed deletions

		DDMFormInstance ddmFormInstance = _addDDMFormInstance();

		long[] formInstanceRecordIds = _addFormInstanceRecords(
			ddmFormInstance, "1", "2", "3", "4", "5");

		_failFormInstanceRecordDeletions(
			formInstanceRecordIds[1], formInstanceRecordIds[3]);

		_execute(ddmFormInstance);

		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[0]));
		Assert.assertNotNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[1]));
		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[2]));
		Assert.assertNotNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[3]));
		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[4]));

		JSONObject ddmFormInstanceReportDataJSONObject =
			_getDDMFormInstanceReportDataJSONObject(ddmFormInstance);

		Assert.assertEquals(
			2, ddmFormInstanceReportDataJSONObject.getInt("totalItems"));

		JSONObject numberFieldJSONObject =
			ddmFormInstanceReportDataJSONObject.getJSONObject("number");

		Assert.assertEquals(2, numberFieldJSONObject.getInt("totalEntries"));

		JSONObject numberFieldSummaryJSONObject =
			numberFieldJSONObject.getJSONObject("summary");

		Assert.assertEquals("4", numberFieldSummaryJSONObject.getString("max"));
		Assert.assertEquals(1, numberFieldSummaryJSONObject.getInt("maxCount"));
		Assert.assertEquals("2", numberFieldSummaryJSONObject.getString("min"));
		Assert.assertEquals(1, numberFieldSummaryJSONObject.getInt("minCount"));
		Assert.assertEquals("6", numberFieldSummaryJSONObject.getString("sum"));

		// Successful deletions

		ddmFormInstance = _addDDMFormInstance();

		formInstanceRecordIds = _addFormInstanceRecords(
			ddmFormInstance, String.valueOf(RandomTestUtil.randomInt()),
			String.valueOf(RandomTestUtil.randomInt()),
			String.valueOf(RandomTestUtil.randomInt()));

		_execute(ddmFormInstance);

		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[0]));
		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[1]));
		Assert.assertNull(
			_ddmFormInstanceRecordLocalService.fetchFormInstanceRecord(
				formInstanceRecordIds[2]));

		ddmFormInstanceReportDataJSONObject =
			_getDDMFormInstanceReportDataJSONObject(ddmFormInstance);

		Assert.assertEquals(
			0, ddmFormInstanceReportDataJSONObject.getInt("totalItems"));

		numberFieldJSONObject =
			ddmFormInstanceReportDataJSONObject.getJSONObject("number");

		Assert.assertFalse(numberFieldJSONObject.has("summary"));
		Assert.assertEquals(0, numberFieldJSONObject.getInt("totalEntries"));
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
			DDMFormInstance ddmFormInstance, String... values)
		throws Exception {

		long[] formInstanceRecordIds = new long[values.length];

		DDMForm ddmForm = ddmFormInstance.getDDMForm();

		for (int i = 0; i < values.length; i++) {
			DDMFormValues ddmFormValues =
				DDMFormValuesTestUtil.createDDMFormValues(ddmForm);

			ddmFormValues.addDDMFormFieldValue(
				DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
					"number", values[i]));

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

	private void _failFormInstanceRecordDeletions(
		long... formInstanceRecordIds) {

		Bundle bundle = FrameworkUtil.getBundle(
			DeleteDDMFormInstanceRecordBulkSelectionActionTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		_serviceRegistration = bundleContext.registerService(
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

	private JSONObject _getDDMFormInstanceReportDataJSONObject(
			DDMFormInstance ddmFormInstance)
		throws Exception {

		DDMFormInstanceReport ddmFormInstanceReport =
			_ddmFormInstanceReportLocalService.
				getFormInstanceReportByFormInstanceId(
					ddmFormInstance.getFormInstanceId());

		return JSONFactoryUtil.createJSONObject(
			ddmFormInstanceReport.getData());
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

	private ServiceRegistration<ModelListener<DDMFormInstanceRecord>>
		_serviceRegistration;

}