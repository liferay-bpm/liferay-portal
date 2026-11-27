/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.model.listener;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.rest.manager.v1_0.ObjectRelationshipElementsParser;
import com.liferay.object.rest.manager.v1_0.ObjectRelationshipElementsParserRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.util.comparator.ObjectEntryVersionVersionComparator;
import com.liferay.portal.kernel.audit.AuditMessage;
import com.liferay.portal.kernel.audit.AuditRouter;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.security.audit.event.generators.constants.EventTypes;
import com.liferay.portal.security.audit.event.generators.util.AuditMessageBuilder;

import java.io.Serializable;

import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Yuri Monteiro
 */
@Component(service = ModelListener.class)
public class ObjectEntryVersionModelListener
	extends BaseModelListener<ObjectEntryVersion> {

	@Override
	public void onAfterCreate(ObjectEntryVersion objectEntryVersion)
		throws ModelListenerException {

		try {
			_addOrUpdateLatestApprovedObjectEntry(objectEntryVersion);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	@Override
	public void onAfterRemove(ObjectEntryVersion objectEntryVersion)
		throws ModelListenerException {

		try {
			_onAfterRemove(objectEntryVersion);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	@Override
	public void onAfterUpdate(
			ObjectEntryVersion originalObjectEntryVersion,
			ObjectEntryVersion objectEntryVersion)
		throws ModelListenerException {

		if (objectEntryVersion.getStatus() ==
				WorkflowConstants.STATUS_IN_TRASH) {

			return;
		}

		try {
			_addOrUpdateLatestApprovedObjectEntry(objectEntryVersion);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	private void _addLatestApprovedObjectEntry(
			String defaultLanguageId, long headObjectEntryId,
			ObjectDefinition objectDefinition, long objectEntryFolderId,
			ObjectEntry rootObjectEntry, Map<String, ?> values, int version)
		throws Exception {

		if ((headObjectEntryId == 0) || (values == null)) {
			return;
		}

		ObjectEntry headObjectEntry = _objectEntryLocalService.fetchObjectEntry(
			headObjectEntryId);

		if (headObjectEntry == null) {
			return;
		}

		ObjectEntry latestApprovedObjectEntry =
			_objectEntryLocalService.fetchObjectEntryByHeadObjectEntryId(
				headObjectEntryId);

		if (!headObjectEntry.isApproved() &&
			(latestApprovedObjectEntry == null)) {

			_objectEntryLocalService.addLatestApprovedObjectEntry(
				null, rootObjectEntry.getGroupId(), rootObjectEntry.getUserId(),
				headObjectEntryId, objectDefinition, objectEntryFolderId,
				defaultLanguageId, version, (Map<String, Serializable>)values);
		}

		if (!FeatureFlagManagerUtil.isEnabled(
				rootObjectEntry.getCompanyId(), "LPD-116183")) {

			return;
		}

		for (ObjectRelationship objectRelationship :
				_objectRelationshipLocalService.getObjectRelationships(
					objectDefinition.getObjectDefinitionId(), true)) {

			ObjectDefinition relatedObjectDefinition =
				_objectDefinitionLocalService.getObjectDefinition(
					objectRelationship.getObjectDefinitionId2());

			ObjectRelationshipElementsParser
				<com.liferay.object.rest.dto.v1_0.ObjectEntry>
					objectRelationshipElementsParser =
						_objectRelationshipElementsParserRegistry.
							getObjectRelationshipElementsParser(
								relatedObjectDefinition.getClassName(),
								relatedObjectDefinition.getCompanyId(),
								objectRelationship.getType());

			for (com.liferay.object.rest.dto.v1_0.ObjectEntry
					nestedObjectEntry :
						objectRelationshipElementsParser.parse(
							objectRelationship,
							values.get(objectRelationship.getName()))) {

				Map<String, Object> properties =
					nestedObjectEntry.getProperties();

				_addLatestApprovedObjectEntry(
					nestedObjectEntry.getDefaultLanguageId(),
					GetterUtil.getLong(nestedObjectEntry.getId()),
					relatedObjectDefinition,
					GetterUtil.getLong(
						nestedObjectEntry.getObjectEntryFolderId()),
					rootObjectEntry,
					(Map<String, ?>)properties.get("properties"), version);
			}
		}
	}

	private void _addOrUpdateLatestApprovedObjectEntry(
			ObjectEntryVersion objectEntryVersion)
		throws Exception {

		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			objectEntryVersion.getObjectEntryId());

		if ((objectEntry == null) ||
			(FeatureFlagManagerUtil.isEnabled(
				objectEntry.getCompanyId(), "LPD-116183") &&
			 objectEntry.isRootDescendantNode())) {

			return;
		}

		if (objectEntry.isApproved()) {
			_deleteLatestApprovedObjectEntry(
				objectEntryVersion.getObjectEntryId());

			return;
		}

		ObjectEntryVersion latestApprovedObjectEntryVersion =
			_objectEntryVersionLocalService.
				fetchLatestApprovedObjectEntryVersion(
					objectEntry.getObjectEntryId(),
					ObjectEntryVersionVersionComparator.getInstance(false));

		if (latestApprovedObjectEntryVersion == null) {
			_deleteLatestApprovedObjectEntry(
				objectEntryVersion.getObjectEntryId());

			return;
		}

		ObjectEntry latestApprovedObjectEntry =
			_objectEntryLocalService.fetchObjectEntryByHeadObjectEntryId(
				objectEntryVersion.getObjectEntryId());

		if ((latestApprovedObjectEntry != null) &&
			(latestApprovedObjectEntry.getVersion() !=
				latestApprovedObjectEntryVersion.getVersion())) {

			_deleteLatestApprovedObjectEntry(
				objectEntryVersion.getObjectEntryId());
		}

		com.liferay.object.rest.dto.v1_0.ObjectEntry contentObjectEntry =
			com.liferay.object.rest.dto.v1_0.ObjectEntry.unsafeToDTO(
				latestApprovedObjectEntryVersion.getContent());

		Map<String, Object> properties = contentObjectEntry.getProperties();

		_addLatestApprovedObjectEntry(
			objectEntry.getDefaultLanguageId(), objectEntry.getObjectEntryId(),
			_objectDefinitionLocalService.getObjectDefinition(
				objectEntryVersion.getObjectDefinitionId()),
			objectEntry.getObjectEntryFolderId(), objectEntry,
			(Map<String, ?>)properties.get("properties"),
			latestApprovedObjectEntryVersion.getVersion());
	}

	private void _deleteLatestApprovedObjectEntry(long headObjectEntryId)
		throws Exception {

		ObjectEntry latestApprovedObjectEntry =
			_objectEntryLocalService.fetchObjectEntryByHeadObjectEntryId(
				headObjectEntryId);

		if (latestApprovedObjectEntry == null) {
			return;
		}

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.getObjectDefinition(
				latestApprovedObjectEntry.getObjectDefinitionId());

		if (FeatureFlagManagerUtil.isEnabled(
				latestApprovedObjectEntry.getCompanyId(), "LPD-116183") &&
			objectDefinition.isRootNode()) {

			for (ObjectEntry rootDescendantNodeObjectEntry :
					_objectEntryLocalService.getRootDescendantNodeObjectEntries(
						headObjectEntryId, null)) {

				ObjectEntry rootDescendantNodeLatestApprovedObjectEntry =
					_objectEntryLocalService.
						fetchObjectEntryByHeadObjectEntryId(
							rootDescendantNodeObjectEntry.getObjectEntryId());

				if (rootDescendantNodeLatestApprovedObjectEntry == null) {
					continue;
				}

				_objectEntryLocalService.deleteObjectEntry(
					rootDescendantNodeLatestApprovedObjectEntry);
			}
		}

		_objectEntryLocalService.deleteObjectEntry(latestApprovedObjectEntry);
	}

	private void _onAfterRemove(ObjectEntryVersion objectEntryVersion)
		throws Exception {

		_addOrUpdateLatestApprovedObjectEntry(objectEntryVersion);

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.getObjectDefinition(
				objectEntryVersion.getObjectDefinitionId());

		if (!objectDefinition.isEnableObjectEntryHistory()) {
			return;
		}

		AuditMessage auditMessage = AuditMessageBuilder.buildAuditMessage(
			objectEntryVersion, EventTypes.DELETE, null);

		JSONObject additionalInfoJSONObject = auditMessage.getAdditionalInfo();

		JSONObject contentJSONObject = _jsonFactory.createJSONObject(
			objectEntryVersion.getContent());

		JSONObject propertiesJSONObject = contentJSONObject.getJSONObject(
			"properties");

		for (String key : propertiesJSONObject.keySet()) {
			additionalInfoJSONObject.put(key, propertiesJSONObject.get(key));
		}

		_auditRouter.route(auditMessage);
	}

	@Reference
	private AuditRouter _auditRouter;

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;

	@Reference
	private ObjectRelationshipElementsParserRegistry
		_objectRelationshipElementsParserRegistry;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}