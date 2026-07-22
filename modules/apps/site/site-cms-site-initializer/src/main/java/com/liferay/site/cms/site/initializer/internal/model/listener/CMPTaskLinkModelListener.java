/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.model.listener;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.portal.kernel.audit.AuditRouter;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.security.audit.event.generators.util.Attribute;
import com.liferay.portal.security.audit.event.generators.util.AuditMessageBuilder;

import java.io.Serializable;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * Re-sources the task history audit events from the task-asset link rows.
 *
 * <p>
 * Before the link-row model, an asset was linked to a task by stamping an
 * <code>L_CMP_TASK_&lt;n&gt;</code> keyword on both, and {@link
 * ObjectEntryModelListener} emitted <code>CMP_ADD_ASSET</code>/
 * <code>CMP_REMOVE_ASSET</code> by diffing those keywords. Now that a link is a
 * {@code L_CMP_TASK_LINK} child object entry, this listener emits
 * the same audit events from the link row's own creation and removal, keyed to
 * the parent task so the task history timeline is unchanged.
 * </p>
 *
 * @author Guilherme Camacho
 */
@Component(service = ModelListener.class)
public class CMPTaskLinkModelListener extends BaseModelListener<ObjectEntry> {

	@Override
	public void onAfterCreate(ObjectEntry objectEntry)
		throws ModelListenerException {

		_route(objectEntry, "CMP_ADD_ASSET");
	}

	@Override
	public void onAfterRemove(ObjectEntry objectEntry)
		throws ModelListenerException {

		_route(objectEntry, "CMP_REMOVE_ASSET");
	}

	private String _getAssetTitle(
			long companyId, Map<String, Serializable> values)
		throws Exception {

		Group group = _groupLocalService.fetchGroupByExternalReferenceCode(
			GetterUtil.getString(values.get("groupExternalReferenceCode")),
			companyId);

		if (group == null) {
			return null;
		}

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.fetchObjectDefinitionByClassName(
				companyId, GetterUtil.getString(values.get("className")));

		if (objectDefinition == null) {
			return null;
		}

		ObjectEntry assetObjectEntry =
			_objectEntryLocalService.fetchObjectEntry(
				GetterUtil.getString(values.get("classExternalReferenceCode")),
				group.getGroupId(), objectDefinition.getObjectDefinitionId());

		if (assetObjectEntry == null) {
			return null;
		}

		return assetObjectEntry.getTitleValue();
	}

	private void _route(ObjectEntry objectEntry, String eventType)
		throws ModelListenerException {

		try {
			if (!FeatureFlagManagerUtil.isEnabled(
					objectEntry.getCompanyId(), "LPD-58677")) {

				return;
			}

			ObjectDefinition objectDefinition =
				_objectDefinitionLocalService.fetchObjectDefinition(
					objectEntry.getObjectDefinitionId());

			if ((objectDefinition == null) ||
				!Objects.equals(
					objectDefinition.getExternalReferenceCode(),
					"L_CMP_TASK_LINK")) {

				return;
			}

			Map<String, Serializable> values = objectEntry.getValues();

			long cmpTaskId = GetterUtil.getLong(
				values.get("r_cmpTaskToCMPTaskLinks_c_cmpTaskId"));

			ObjectEntry taskObjectEntry =
				_objectEntryLocalService.fetchObjectEntry(cmpTaskId);

			if (taskObjectEntry == null) {
				return;
			}

			String assetTitle = _getAssetTitle(
				objectEntry.getCompanyId(), values);

			if (assetTitle == null) {
				return;
			}

			_auditRouter.route(
				AuditMessageBuilder.buildAuditMessage(
					taskObjectEntry.getModelClassName(),
					taskObjectEntry.getObjectEntryId(), eventType,
					Collections.singletonList(new Attribute(assetTitle))));
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	@Reference
	private AuditRouter _auditRouter;

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

}