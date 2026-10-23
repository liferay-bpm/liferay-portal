/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.internal.bulk.selection;

import com.liferay.bulk.selection.BulkSelection;
import com.liferay.bulk.selection.BulkSelectionAction;
import com.liferay.dynamic.data.mapping.form.field.type.constants.DDMFormFieldTypeConstants;
import com.liferay.dynamic.data.mapping.internal.report.NumericDDMFormFieldTypeReportProcessor;
import com.liferay.dynamic.data.mapping.internal.util.DDMFormInstanceRecordThreadLocal;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceRecord;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceReport;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceRecordLocalService;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceReportLocalService;
import com.liferay.dynamic.data.mapping.storage.DDMFormValues;
import com.liferay.petra.lang.SafeCloseable;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.util.MapUtil;

import java.io.Serializable;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Akhash Ramprakash
 */
@Component(
	property = "bulk.selection.action.key=delete.ddm.form.instance.record",
	service = BulkSelectionAction.class
)
public class DeleteDDMFormInstanceRecordBulkSelectionAction
	implements BulkSelectionAction<DDMFormInstanceRecord> {

	@Override
	public void execute(
			User user, BulkSelection<DDMFormInstanceRecord> bulkSelection,
			Map<String, Serializable> inputMap)
		throws Exception {

		try (SafeCloseable safeCloseable =
				DDMFormInstanceRecordThreadLocal.
					setDeleteInProcessWithSafeCloseable(true)) {

			PermissionChecker permissionChecker =
				PermissionCheckerFactoryUtil.create(user);

			bulkSelection.forEach(
				ddmFormInstanceRecord -> {
					try {
						if (!_ddmFormInstanceRecordModelResourcePermission.
								contains(
									permissionChecker, ddmFormInstanceRecord,
									ActionKeys.DELETE)) {

							return;
						}

						_ddmFormInstanceRecordLocalService.
							deleteFormInstanceRecord(ddmFormInstanceRecord);
					}
					catch (Exception exception) {
						if (_log.isWarnEnabled()) {
							_log.warn(exception);
						}
					}
				});
		}
		finally {
			long formInstanceId = MapUtil.getLong(
				bulkSelection.getParameterMap(), "formInstanceId");

			for (int i = 1;; i++) {
				try {
					_updateMaxAndMin(formInstanceId);

					break;
				}
				catch (Exception exception) {
					if (i == 3) {
						throw exception;
					}

					if (_log.isWarnEnabled()) {
						_log.warn(
							"Unable to update the max and min of form " +
								"instance " + formInstanceId,
							exception);
					}
				}
			}
		}
	}

	private void _updateMaxAndMin(long formInstanceId) throws Exception {
		DDMFormInstanceReport ddmFormInstanceReport =
			_ddmFormInstanceReportLocalService.
				getFormInstanceReportByFormInstanceId(formInstanceId);

		JSONObject dataJSONObject = _jsonFactory.createJSONObject(
			ddmFormInstanceReport.getData());

		List<DDMFormValues> ddmFormValuesList =
			NumericDDMFormFieldTypeReportProcessor.getDDMFormValues(
				_ddmFormInstanceRecordLocalService.getFormInstanceRecords(
					formInstanceId));

		for (String key : dataJSONObject.keySet()) {
			JSONObject fieldJSONObject = dataJSONObject.getJSONObject(key);

			if ((fieldJSONObject == null) || !fieldJSONObject.has("summary") ||
				!Objects.equals(
					fieldJSONObject.getString("type"),
					DDMFormFieldTypeConstants.NUMERIC)) {

				continue;
			}

			NumericDDMFormFieldTypeReportProcessor.updateMaxAndMin(
				key, ddmFormValuesList, fieldJSONObject);
		}

		ddmFormInstanceReport.setData(dataJSONObject.toString());

		_ddmFormInstanceReportLocalService.updateDDMFormInstanceReport(
			ddmFormInstanceReport);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		DeleteDDMFormInstanceRecordBulkSelectionAction.class);

	@Reference
	private DDMFormInstanceRecordLocalService
		_ddmFormInstanceRecordLocalService;

	@Reference(
		target = "(model.class.name=com.liferay.dynamic.data.mapping.model.DDMFormInstanceRecord)"
	)
	private ModelResourcePermission<DDMFormInstanceRecord>
		_ddmFormInstanceRecordModelResourcePermission;

	@Reference
	private DDMFormInstanceReportLocalService
		_ddmFormInstanceReportLocalService;

	@Reference
	private JSONFactory _jsonFactory;

}