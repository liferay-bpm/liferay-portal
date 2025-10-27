/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.model.listener;

import com.liferay.asset.kernel.model.AssetVocabulary;
import com.liferay.asset.kernel.service.AssetVocabularyLocalService;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.tree.Node;
import com.liferay.object.tree.ObjectDefinitionTreeFactory;
import com.liferay.object.tree.Tree;
import com.liferay.portal.kernel.audit.AuditMessage;
import com.liferay.portal.kernel.audit.AuditRouter;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.ClassName;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.search.Indexer;
import com.liferay.portal.kernel.search.IndexerRegistryUtil;
import com.liferay.portal.kernel.service.ClassNameLocalService;
import com.liferay.portal.security.audit.event.generators.constants.EventTypes;
import com.liferay.portal.security.audit.event.generators.util.Attribute;
import com.liferay.portal.security.audit.event.generators.util.AttributesBuilder;
import com.liferay.portal.security.audit.event.generators.util.AuditMessageBuilder;
import com.liferay.portlet.asset.util.AssetVocabularySettingsHelper;

import java.util.Iterator;
import java.util.List;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marcela Cunha
 */
@Component(service = ModelListener.class)
public class ObjectDefinitionModelListener
	extends BaseModelListener<ObjectDefinition> {

	@Override
	public void onAfterUpdate(
			ObjectDefinition originalObjectDefinition,
			ObjectDefinition objectDefinition)
		throws ModelListenerException {

		if (!objectDefinition.isRootNode()) {
			return;
		}

		ObjectDefinitionTreeFactory objectDefinitionTreeFactory =
			new ObjectDefinitionTreeFactory(
				_objectDefinitionLocalService, _objectRelationshipLocalService);

		try {
			Tree tree = objectDefinitionTreeFactory.create(
				objectDefinition.getObjectDefinitionId());

			Iterator<Node> iterator = tree.iterator();

			while (iterator.hasNext()) {
				Node node = iterator.next();

				Indexer<ObjectDefinition> indexer =
					IndexerRegistryUtil.nullSafeGetIndexer(
						ObjectDefinition.class);

				indexer.reindex(
					_objectDefinitionLocalService.getObjectDefinition(
						node.getPrimaryKey()));
			}
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	@Override
	public void onBeforeCreate(ObjectDefinition objectDefinition)
		throws ModelListenerException {

		_route(EventTypes.ADD, objectDefinition);
	}

	@Override
	public void onBeforeRemove(ObjectDefinition objectDefinition)
		throws ModelListenerException {

		try {
			ClassName className = _classNameLocalService.getClassName(
				objectDefinition.getClassName());

			long classNameId = className.getClassNameId();

			List<AssetVocabulary> assetVocabularies =
				_assetVocabularyLocalService.getAssetVocabularies(-1, -1);

			for (AssetVocabulary assetVocabulary : assetVocabularies) {
				_assetVocabularyRemoveClassNameId(assetVocabulary, classNameId);
			}

			super.onBeforeRemove(objectDefinition);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}

		_route(EventTypes.DELETE, objectDefinition);
	}

	@Override
	public void onBeforeUpdate(
			ObjectDefinition originalObjectDefinition,
			ObjectDefinition objectDefinition)
		throws ModelListenerException {

		try {
			_auditRouter.route(
				AuditMessageBuilder.buildAuditMessage(
					EventTypes.UPDATE, ObjectDefinition.class.getName(),
					objectDefinition.getObjectDefinitionId(),
					_getModifiedAttributes(
						originalObjectDefinition, objectDefinition)));
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	private void _assetVocabularyRemoveClassNameId(
		AssetVocabulary assetVocabulary, long targetClassNameId) {

		String settings = assetVocabulary.getSettings();

		if ((settings == null) || settings.isEmpty()) {
			return;
		}

		AssetVocabularySettingsHelper assetVocabularySettingsHelper =
			new AssetVocabularySettingsHelper(settings);

		long[] classNameIds = assetVocabularySettingsHelper.getClassNameIds();

		int keepCount = 0;

		for (long classNameId : classNameIds) {
			if (classNameId != targetClassNameId) {
				keepCount++;
			}
		}

		if (keepCount == classNameIds.length) {
			return;
		}

		long[] classTypePKs = assetVocabularySettingsHelper.getClassTypePKs();

		if ((classTypePKs == null) ||
			(classTypePKs.length != classNameIds.length)) {

			return;
		}

		long[] newClassNameIds = new long[keepCount];
		long[] newClassTypePKs = new long[keepCount];
		boolean[] newRequireds = new boolean[keepCount];

		int idx = 0;
		int i = 0;

		for (long classNameId : classNameIds) {
			long classTypePK = classTypePKs[i];

			if (classNameId != targetClassNameId) {
				newClassNameIds[idx] = classNameId;
				newClassTypePKs[idx] = classTypePK;

				newRequireds[idx] =
					assetVocabularySettingsHelper.
						isClassNameIdAndClassTypePKRequired(
							classNameId, classTypePK);

				idx++;
			}

			i++;
		}

		assetVocabularySettingsHelper.setClassNameIdsAndClassTypePKs(
			newClassNameIds, newClassTypePKs, newRequireds);

		assetVocabulary.setSettings(assetVocabularySettingsHelper.toString());

		_assetVocabularyLocalService.updateAssetVocabulary(assetVocabulary);
	}

	private List<Attribute> _getModifiedAttributes(
		ObjectDefinition originalObjectDefinition,
		ObjectDefinition objectDefinition) {

		AttributesBuilder attributesBuilder = new AttributesBuilder(
			objectDefinition, originalObjectDefinition);

		attributesBuilder.add("active");
		attributesBuilder.add("descriptionObjectFieldId");
		attributesBuilder.add("labelMap");
		attributesBuilder.add("name");
		attributesBuilder.add("panelAppOrder");
		attributesBuilder.add("panelCategoryKey");
		attributesBuilder.add("pluralLabelMap");
		attributesBuilder.add("portlet");
		attributesBuilder.add("scope");
		attributesBuilder.add("titleObjectFieldId");

		return attributesBuilder.getAttributes();
	}

	private void _route(String eventType, ObjectDefinition objectDefinition)
		throws ModelListenerException {

		try {
			AuditMessage auditMessage = AuditMessageBuilder.buildAuditMessage(
				eventType, ObjectDefinition.class.getName(),
				objectDefinition.getObjectDefinitionId(), null);

			JSONObject additionalInfoJSONObject =
				auditMessage.getAdditionalInfo();

			additionalInfoJSONObject.put(
				"active", objectDefinition.isActive()
			).put(
				"labelMap", objectDefinition.getLabelMap()
			).put(
				"name", objectDefinition.getName()
			).put(
				"scope", objectDefinition.getScope()
			);

			_auditRouter.route(auditMessage);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	@Reference
	private AssetVocabularyLocalService _assetVocabularyLocalService;

	@Reference
	private AuditRouter _auditRouter;

	@Reference
	private ClassNameLocalService _classNameLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}