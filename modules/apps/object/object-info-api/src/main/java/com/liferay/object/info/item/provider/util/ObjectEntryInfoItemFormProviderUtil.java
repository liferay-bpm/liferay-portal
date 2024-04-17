/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.info.item.provider.util;

import com.liferay.info.exception.NoSuchFormVariationException;
import com.liferay.info.field.InfoField;
import com.liferay.info.field.InfoFieldSet;
import com.liferay.info.field.InfoFieldSetEntry;
import com.liferay.info.field.type.ActionInfoFieldType;
import com.liferay.info.field.type.ImageInfoFieldType;
import com.liferay.info.field.type.TextInfoFieldType;
import com.liferay.info.field.type.URLInfoFieldType;
import com.liferay.info.form.InfoForm;
import com.liferay.info.item.field.reader.InfoItemFieldReaderFieldSetProvider;
import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.exception.NoSuchObjectDefinitionException;
import com.liferay.object.info.field.converter.ObjectFieldInfoFieldConverter;
import com.liferay.object.info.item.ObjectEntryInfoItemFields;
import com.liferay.object.model.ObjectAction;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.template.info.item.provider.TemplateInfoItemFieldSetProvider;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author Carolina Barbosa
 */
public class ObjectEntryInfoItemFormProviderUtil {

	public static InfoForm getInfoForm(
			InfoFieldSet basicInformationInfoFieldSet,
			InfoFieldSet displayPageInfoFieldSet,
			InfoItemFieldReaderFieldSetProvider
				infoItemFieldReaderFieldSetProvider,
			String modelClassName,
			ObjectActionLocalService objectActionLocalService,
			ObjectDefinition objectDefinition, long objectDefinitionId,
			ObjectDefinitionLocalService objectDefinitionLocalService,
			ObjectFieldInfoFieldConverter objectFieldInfoFieldConverter,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectRelationshipLocalService objectRelationshipLocalService,
			TemplateInfoItemFieldSetProvider templateInfoItemFieldSetProvider)
		throws NoSuchFormVariationException {

		return InfoForm.builder(
		).infoFieldSetEntry(
			basicInformationInfoFieldSet
		).<NoSuchFormVariationException>infoFieldSetEntry(
			unsafeConsumer -> {
				if (objectDefinitionId != 0) {
					ObjectDefinition currentObjectDefinition =
						objectDefinitionLocalService.fetchObjectDefinition(
							objectDefinitionId);

					if (currentObjectDefinition == null) {
						throw new NoSuchFormVariationException(
							String.valueOf(objectDefinitionId),
							new NoSuchObjectDefinitionException());
					}

					unsafeConsumer.accept(
						_getObjectDefinitionInfoFieldSet(
							true, currentObjectDefinition.getLabelMap(),
							currentObjectDefinition.getName(),
							ObjectField.class.getSimpleName(),
							currentObjectDefinition,
							objectDefinitionLocalService,
							objectFieldInfoFieldConverter,
							objectFieldLocalService,
							objectRelationshipLocalService));
				}
			}
		).infoFieldSetEntries(
			_getAttachmentInfoFieldSetEntries(
				objectDefinitionId, objectFieldLocalService)
		).infoFieldSetEntries(
			_getParentsInfoFieldSetEntries(
				objectDefinitionId, objectDefinitionLocalService,
				objectFieldInfoFieldConverter, objectFieldLocalService,
				objectRelationshipLocalService)
		).infoFieldSetEntry(
			templateInfoItemFieldSetProvider.getInfoFieldSet(modelClassName)
		).infoFieldSetEntry(
			displayPageInfoFieldSet
		).infoFieldSetEntry(
			infoItemFieldReaderFieldSetProvider.getInfoFieldSet(modelClassName)
		).infoFieldSetEntries(
			_getObjectActionInfoFieldSetEntries(
				objectActionLocalService, objectDefinition)
		).labelInfoLocalizedValue(
			InfoLocalizedValue.<String>builder(
			).defaultLocale(
				LocaleUtil.fromLanguageId(
					objectDefinition.getDefaultLanguageId())
			).values(
				objectDefinition.getLabelMap()
			).build()
		).name(
			modelClassName
		).build();
	}

	private static List<InfoFieldSetEntry> _getAttachmentInfoFieldSetEntries(
		long objectDefinitionId,
		ObjectFieldLocalService objectFieldLocalService) {

		List<InfoFieldSetEntry> infoFieldSetEntries = new ArrayList<>();

		for (ObjectField objectField :
				objectFieldLocalService.getObjectFields(
					objectDefinitionId, false)) {

			if (!objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

				continue;
			}

			infoFieldSetEntries.add(
				InfoFieldSet.builder(
				).infoFieldSetEntry(
					InfoField.builder(
					).infoFieldType(
						URLInfoFieldType.INSTANCE
					).namespace(
						ObjectField.class.getSimpleName()
					).name(
						objectField.getObjectFieldId() + "#downloadURL"
					).labelInfoLocalizedValue(
						InfoLocalizedValue.localize(
							ObjectEntryInfoItemFields.class, "download-url")
					).build()
				).infoFieldSetEntry(
					InfoField.builder(
					).infoFieldType(
						TextInfoFieldType.INSTANCE
					).namespace(
						ObjectField.class.getSimpleName()
					).name(
						objectField.getObjectFieldId() + "#fileName"
					).labelInfoLocalizedValue(
						InfoLocalizedValue.localize(
							ObjectEntryInfoItemFields.class, "file-name")
					).build()
				).infoFieldSetEntry(
					InfoField.builder(
					).infoFieldType(
						TextInfoFieldType.INSTANCE
					).namespace(
						ObjectField.class.getSimpleName()
					).name(
						objectField.getObjectFieldId() + "#mimeType"
					).labelInfoLocalizedValue(
						InfoLocalizedValue.localize(
							ObjectEntryInfoItemFields.class, "mime-type")
					).build()
				).infoFieldSetEntry(
					InfoField.builder(
					).infoFieldType(
						ImageInfoFieldType.INSTANCE
					).namespace(
						ObjectField.class.getSimpleName()
					).name(
						objectField.getObjectFieldId() + "#previewURL"
					).labelInfoLocalizedValue(
						InfoLocalizedValue.localize(
							ObjectEntryInfoItemFields.class, "preview-url")
					).build()
				).infoFieldSetEntry(
					InfoField.builder(
					).infoFieldType(
						TextInfoFieldType.INSTANCE
					).namespace(
						ObjectField.class.getSimpleName()
					).name(
						objectField.getObjectFieldId() + "#size"
					).labelInfoLocalizedValue(
						InfoLocalizedValue.localize(
							ObjectEntryInfoItemFields.class, "size")
					).build()
				).labelInfoLocalizedValue(
					InfoLocalizedValue.<String>builder(
					).defaultLocale(
						LocaleUtil.fromLanguageId(
							objectField.getDefaultLanguageId())
					).values(
						objectField.getLabelMap()
					).build()
				).name(
					objectField.getName()
				).build());
		}

		return infoFieldSetEntries;
	}

	private static List<InfoFieldSetEntry> _getObjectActionInfoFieldSetEntries(
		ObjectActionLocalService objectActionLocalService,
		ObjectDefinition objectDefinition) {

		InfoFieldSet.Builder infoFieldSetBuilder = InfoFieldSet.builder(
		).labelInfoLocalizedValue(
			InfoLocalizedValue.localize(
				ObjectEntryInfoItemFields.class, "actions")
		).name(
			"actions"
		);

		return TransformUtil.transform(
			objectActionLocalService.getObjectActions(
				objectDefinition.getObjectDefinitionId(),
				ObjectActionTriggerConstants.KEY_STANDALONE),
			objectAction -> infoFieldSetBuilder.infoFieldSetEntry(
				InfoField.builder(
				).infoFieldType(
					ActionInfoFieldType.INSTANCE
				).namespace(
					ObjectAction.class.getSimpleName()
				).name(
					objectAction.getName()
				).labelInfoLocalizedValue(
					InfoLocalizedValue.<String>builder(
					).defaultLocale(
						LocaleUtil.fromLanguageId(
							objectAction.getDefaultLanguageId())
					).values(
						objectAction.getLabelMap()
					).build()
				).build()
			).build());
	}

	private static InfoFieldSet _getObjectDefinitionInfoFieldSet(
		boolean editable, Map<Locale, String> labelMap, String name,
		String namespace, ObjectDefinition objectDefinition,
		ObjectDefinitionLocalService objectDefinitionLocalService,
		ObjectFieldInfoFieldConverter objectFieldInfoFieldConverter,
		ObjectFieldLocalService objectFieldLocalService,
		ObjectRelationshipLocalService objectRelationshipLocalService) {

		return InfoFieldSet.builder(
		).infoFieldSetEntry(
			unsafeConsumer -> {
				for (ObjectField objectField :
						objectFieldLocalService.getObjectFields(
							objectDefinition.getObjectDefinitionId())) {

					if (objectField.isMetadata()) {
						continue;
					}

					if (Validator.isNotNull(
							objectField.getRelationshipType())) {

						ObjectRelationship objectRelationship =
							objectRelationshipLocalService.
								fetchObjectRelationshipByObjectFieldId2(
									objectField.getObjectFieldId());

						ObjectDefinition parentObjectDefinition =
							objectDefinitionLocalService.fetchObjectDefinition(
								objectRelationship.getObjectDefinitionId1());

						if ((parentObjectDefinition == null) ||
							!parentObjectDefinition.isActive()) {

							continue;
						}
					}

					unsafeConsumer.accept(
						objectFieldInfoFieldConverter.getInfoField(
							editable, namespace, objectField));
				}
			}
		).labelInfoLocalizedValue(
			InfoLocalizedValue.<String>builder(
			).defaultLocale(
				LocaleUtil.fromLanguageId(
					objectDefinition.getDefaultLanguageId())
			).values(
				labelMap
			).build()
		).name(
			name
		).build();
	}

	private static List<InfoFieldSetEntry> _getParentsInfoFieldSetEntries(
		long objectDefinitionId,
		ObjectDefinitionLocalService objectDefinitionLocalService,
		ObjectFieldInfoFieldConverter objectFieldInfoFieldConverter,
		ObjectFieldLocalService objectFieldLocalService,
		ObjectRelationshipLocalService objectRelationshipLocalService) {

		if (objectDefinitionId == 0) {
			return Collections.emptyList();
		}

		List<InfoFieldSetEntry> infoFieldSetEntries = new ArrayList<>();

		for (ObjectRelationship objectRelationship :
				objectRelationshipLocalService.getObjectRelationships(
					objectDefinitionId,
					ObjectRelationshipConstants.TYPE_ONE_TO_MANY)) {

			ObjectDefinition parentObjectDefinition =
				objectDefinitionLocalService.fetchObjectDefinition(
					objectRelationship.getObjectDefinitionId1());

			if (parentObjectDefinition == null) {
				_log.error(
					new NoSuchObjectDefinitionException(
						String.valueOf(
							objectRelationship.getObjectDefinitionId1())));

				continue;
			}

			if (parentObjectDefinition.isUnmodifiableSystemObject()) {
				continue;
			}

			Map<Locale, String> fieldSetLabelMap = new HashMap<>();

			Map<Locale, String> labelMap = parentObjectDefinition.getLabelMap();

			for (Map.Entry<Locale, String> entry : labelMap.entrySet()) {
				Locale locale = entry.getKey();

				fieldSetLabelMap.put(
					locale,
					StringBundler.concat(
						objectRelationship.getLabel(locale), StringPool.SPACE,
						StringPool.OPEN_PARENTHESIS, entry.getValue(),
						StringPool.CLOSE_PARENTHESIS));
			}

			infoFieldSetEntries.add(
				_getObjectDefinitionInfoFieldSet(
					false, fieldSetLabelMap, objectRelationship.getName(),
					StringBundler.concat(
						ObjectRelationship.class.getSimpleName(),
						StringPool.POUND, parentObjectDefinition.getName(),
						StringPool.POUND, objectRelationship.getName()),
					parentObjectDefinition, objectDefinitionLocalService,
					objectFieldInfoFieldConverter, objectFieldLocalService,
					objectRelationshipLocalService));
		}

		return infoFieldSetEntries;
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectEntryInfoItemFormProviderUtil.class);

}