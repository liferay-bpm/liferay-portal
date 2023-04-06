/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.portal.workflow.kaleo.internal.model.listener;

import com.liferay.asset.kernel.AssetRendererFactoryRegistryUtil;
import com.liferay.asset.kernel.model.AssetEntry;
import com.liferay.asset.kernel.model.AssetRenderer;
import com.liferay.asset.kernel.model.AssetRendererFactory;
import com.liferay.asset.kernel.service.AssetEntryLocalService;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryService;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Localization;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.WorkflowHandler;
import com.liferay.portal.kernel.workflow.WorkflowHandlerRegistryUtil;
import com.liferay.portal.workflow.kaleo.model.KaleoInstance;
import com.liferay.portal.workflow.kaleo.service.persistence.KaleoInstanceUtil;
import com.liferay.portal.workflow.metrics.search.index.InstanceWorkflowMetricsIndexer;

import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Pedro Leite
 */
@Component(service = ModelListener.class)
public class ObjectDefinitionModelListener
	extends BaseModelListener<ObjectDefinition> {

	@Override
	public void onAfterUpdate(
			ObjectDefinition originalModel, ObjectDefinition model)
		throws ModelListenerException {

		if (originalModel.getTitleObjectFieldId() !=
				model.getTitleObjectFieldId()) {

			ObjectDefinition objectDefinition =
				_objectDefinitionLocalService.fetchObjectDefinition(
					model.getObjectDefinitionId());

			for (ObjectEntry objectEntry :
					_objectEntryService.getObjectEntries(
						objectDefinition.getObjectDefinitionId())) {

				KaleoInstance kaleoInstance =
					KaleoInstanceUtil.fetchByCN_CPK_First(
						objectDefinition.getClassName(),
						objectEntry.getObjectEntryId(), null);

				if (kaleoInstance != null) {
					try {
						String objectEntryTitleValue =
							objectEntry.getTitleValue();

						if (Validator.isNotNull(objectEntryTitleValue)) {
							_instanceWorkflowMetricsIndexer.updateInstance(
								kaleoInstance.isActive(),
								_createAssetTitleLocalizationMap(
									kaleoInstance.getClassName(),
									kaleoInstance.getClassPK(),
									kaleoInstance.getGroupId(),
									objectEntryTitleValue),
								objectDefinition.getLabelMap(),
								kaleoInstance.getCompanyId(),
								kaleoInstance.getKaleoInstanceId(),
								kaleoInstance.getModifiedDate());
						}
					}
					catch (PortalException portalException) {
						throw new ModelListenerException(
							portalException.getMessage());
					}
				}
			}
		}
	}

	private Map<Locale, String> _createAssetTitleLocalizationMap(
		String className, long classPK, long groupId,
		String objectEntryTitleValue) {

		AssetRenderer<?> assetRenderer = _getAssetRenderer(className, classPK);

		if (assetRenderer != null) {
			AssetEntry assetEntry = _assetEntryLocalService.fetchEntry(
				assetRenderer.getClassName(), assetRenderer.getClassPK());

			if (assetEntry != null) {
				return _localization.populateLocalizationMap(
					HashMapBuilder.put(
						LocaleUtil.fromLanguageId(
							assetEntry.getDefaultLanguageId()),
						objectEntryTitleValue
					).build(),
					assetEntry.getDefaultLanguageId(), assetEntry.getGroupId());
			}
		}

		WorkflowHandler<?> workflowHandler =
			WorkflowHandlerRegistryUtil.getWorkflowHandler(className);

		if (workflowHandler != null) {
			Map<Locale, String> localizationMap = new HashMap<>();

			for (Locale availableLocale :
					_language.getAvailableLocales(groupId)) {

				localizationMap.put(
					availableLocale,
					workflowHandler.getTitle(classPK, availableLocale));
			}

			return localizationMap;
		}

		return Collections.emptyMap();
	}

	private AssetRenderer<?> _getAssetRenderer(String className, long classPK) {
		AssetRendererFactory<?> assetRendererFactory =
			AssetRendererFactoryRegistryUtil.getAssetRendererFactoryByClassName(
				className);

		if (assetRendererFactory != null) {
			try {
				return assetRendererFactory.getAssetRenderer(classPK);
			}
			catch (PortalException portalException) {
				throw new ModelListenerException(portalException.getMessage());
			}
		}

		return null;
	}

	@Reference
	private AssetEntryLocalService _assetEntryLocalService;

	@Reference
	private InstanceWorkflowMetricsIndexer _instanceWorkflowMetricsIndexer;

	@Reference
	private Language _language;

	@Reference
	private Localization _localization;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryService _objectEntryService;

}