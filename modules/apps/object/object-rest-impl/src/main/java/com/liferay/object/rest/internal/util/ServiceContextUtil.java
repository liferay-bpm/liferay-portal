/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.util;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.dto.v1_0.Status;
import com.liferay.object.service.ObjectEntryLocalServiceUtil;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.service.ResourceActionLocalService;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.vulcan.dto.converter.DTOConverterContext;
import com.liferay.portal.vulcan.permission.ModelPermissionsUtil;

/**
 * @author Sergio Jiménez del Coso
 */
public class ServiceContextUtil {

	public static ServiceContext createServiceContext(
			DTOConverterContext dtoConverterContext,
			ObjectDefinition objectDefinition, ObjectEntry objectEntry,
			ResourceActionLocalService resourceActionLocalService,
			ResourcePermissionLocalService resourcePermissionLocalService,
			RoleLocalService roleLocalService)
		throws Exception {

		ServiceContext serviceContext = createServiceContext(
			objectEntry, dtoConverterContext.getUserId());

		serviceContext.setLanguageId(
			LocaleUtil.toLanguageId(dtoConverterContext.getLocale()));

		if (!FeatureFlagManagerUtil.isEnabled("LPD-28799")) {
			return serviceContext;
		}

		serviceContext.setModelPermissions(
			ModelPermissionsUtil.toModelPermissions(
				objectDefinition.getCompanyId(), objectEntry.getPermissions(),
				GetterUtil.getLong(objectEntry.getId()),
				objectDefinition.getClassName(), resourceActionLocalService,
				resourcePermissionLocalService, roleLocalService));

		return serviceContext;
	}

	public static ServiceContext createServiceContext(long objectEntryId) {
		com.liferay.object.model.ObjectEntry serviceBuilderObjectEntry =
			ObjectEntryLocalServiceUtil.fetchObjectEntry(objectEntryId);

		if (serviceBuilderObjectEntry == null) {
			return new ServiceContext();
		}

		ServiceContext serviceContext = new ServiceContext();

		if (serviceBuilderObjectEntry.getStatus() ==
				WorkflowConstants.STATUS_DRAFT) {

			serviceContext.setWorkflowAction(
				WorkflowConstants.ACTION_SAVE_DRAFT);
		}

		return serviceContext;
	}

	public static ServiceContext createServiceContext(
		ObjectEntry objectEntry, long userId) {

		ServiceContext serviceContext = new ServiceContext();

		serviceContext.setAddGroupPermissions(true);
		serviceContext.setAddGuestPermissions(true);

		if (Validator.isNotNull(objectEntry.getTaxonomyCategoryIds())) {
			serviceContext.setAssetCategoryIds(
				ArrayUtil.toArray(objectEntry.getTaxonomyCategoryIds()));
		}

		if (Validator.isNotNull(objectEntry.getKeywords())) {
			serviceContext.setAssetTagNames(objectEntry.getKeywords());
		}

		serviceContext.setUserId(userId);

		if (_isObjectEntryDraft(objectEntry.getStatus())) {
			serviceContext.setWorkflowAction(
				WorkflowConstants.ACTION_SAVE_DRAFT);
		}

		return serviceContext;
	}

	private static boolean _isObjectEntryDraft(Status status) {
		if ((status != null) &&
			(status.getCode() == WorkflowConstants.STATUS_DRAFT)) {

			return true;
		}

		return false;
	}

}