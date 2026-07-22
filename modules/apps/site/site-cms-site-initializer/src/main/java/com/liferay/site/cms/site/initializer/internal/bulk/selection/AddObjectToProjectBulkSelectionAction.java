/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.bulk.selection;

import com.liferay.bulk.selection.BulkSelectionAction;
import com.liferay.object.exception.ObjectValidationRuleEngineException;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectEntryService;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.vulcan.util.GroupUtil;
import com.liferay.site.cms.site.initializer.bulk.selection.BaseObjectBulkSelectionAction;

import java.io.Serializable;

import java.util.List;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Mario Gomes
 */
@Component(
	property = "bulk.selection.action.key=add.object.to.project",
	service = BulkSelectionAction.class
)
public class AddObjectToProjectBulkSelectionAction
	extends BaseObjectBulkSelectionAction {

	@Override
	protected void doExecute(
			User user, Map<String, Serializable> inputMap, Object object)
		throws Exception {

		if (!(object instanceof ObjectEntry)) {
			throw new IllegalArgumentException("Unsupported object " + object);
		}

		String[] projectScopeKeys = (String[])inputMap.get("projectScopeKeys");

		if (ArrayUtil.isEmpty(projectScopeKeys)) {
			throw new IllegalArgumentException(
				"No project scope keys were provided");
		}

		ObjectEntry assetObjectEntry = (ObjectEntry)object;

		long companyId = assetObjectEntry.getCompanyId();

		ObjectDefinition projectObjectDefinition =
			objectDefinitionLocalService.
				getObjectDefinitionByExternalReferenceCode(
					"L_CMP_PROJECT", companyId);
		ObjectDefinition relationshipObjectDefinition =
			objectDefinitionLocalService.
				getObjectDefinitionByExternalReferenceCode(
					"L_CMP_PROJECT_ASSET_RELATIONSHIP", companyId);

		Group assetGroup = _groupLocalService.getGroup(
			assetObjectEntry.getGroupId());

		for (String projectScopeKey : projectScopeKeys) {
			Long projectGroupId = GroupUtil.getGroupId(
				companyId, projectScopeKey, _groupLocalService);

			if (projectGroupId == null) {
				throw new IllegalArgumentException(
					"Unable to resolve the project scope key \"" +
						projectScopeKey + "\"");
			}

			List<ObjectEntry> projectObjectEntries =
				objectEntryLocalService.getObjectEntries(
					projectGroupId,
					projectObjectDefinition.getObjectDefinitionId(), 0, 1);

			if (projectObjectEntries.isEmpty()) {
				throw new IllegalArgumentException(
					"Unable to find a project in group " + projectGroupId);
			}

			ServiceContext serviceContext = new ServiceContext();

			serviceContext.setCompanyId(companyId);
			serviceContext.setScopeGroupId(projectGroupId);
			serviceContext.setUserId(user.getUserId());

			try {
				_objectEntryService.addObjectEntry(
					projectGroupId,
					relationshipObjectDefinition.getObjectDefinitionId(), 0,
					null,
					HashMapBuilder.<String, Serializable>put(
						"classExternalReferenceCode",
						assetObjectEntry.getExternalReferenceCode()
					).put(
						"className", assetObjectEntry.getModelClassName()
					).put(
						"groupExternalReferenceCode",
						assetGroup.getExternalReferenceCode()
					).put(
						"r_cmpProjectToCMPProjectAssetRelationships_c_" +
							"cmpProjectId",
						projectObjectEntries.get(
							0
						).getObjectEntryId()
					).build(),
					serviceContext);
			}
			catch (ModelListenerException modelListenerException) {
				if (!(modelListenerException.getCause() instanceof
						ObjectValidationRuleEngineException)) {

					throw modelListenerException;
				}

				if (_log.isWarnEnabled()) {
					_log.warn(modelListenerException);
				}
			}
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		AddObjectToProjectBulkSelectionAction.class);

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private ObjectEntryService _objectEntryService;

}