/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.info.item.util;

import com.liferay.document.library.kernel.model.DLFileEntry;
import com.liferay.document.library.kernel.service.DLAppLocalService;
import com.liferay.document.library.kernel.service.DLFileEntryLocalServiceUtil;
import com.liferay.document.library.util.DLURLHelper;
import com.liferay.info.field.InfoField;
import com.liferay.info.field.InfoFieldValue;
import com.liferay.info.field.type.ActionInfoFieldType;
import com.liferay.info.field.type.ImageInfoFieldType;
import com.liferay.info.field.type.TextInfoFieldType;
import com.liferay.info.field.type.URLInfoFieldType;
import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.info.type.KeyLocalizedLabelPair;
import com.liferay.info.type.WebImage;
import com.liferay.list.type.model.ListTypeEntry;
import com.liferay.list.type.service.ListTypeEntryLocalServiceUtil;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.info.field.converter.ObjectFieldInfoFieldConverter;
import com.liferay.object.info.item.ObjectEntryInfoItemFields;
import com.liferay.object.info.util.ObjectFieldDBTypeUtil;
import com.liferay.object.model.ObjectAction;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.rest.dto.v1_0.ListEntry;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.scope.ObjectScopeProvider;
import com.liferay.object.scope.ObjectScopeProviderRegistry;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryLocalServiceUtil;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.service.ObjectRelationshipLocalServiceUtil;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.service.GroupLocalServiceUtil;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.DateUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.KeyValuePair;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;

import java.text.ParseException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * @author Carolina Barbosa
 */
public class ObjectEntryInfoItemUtil {

	public static List<InfoFieldValue<Object>> getObjectActionsInfoFieldValues(
		ObjectActionLocalService objectActionLocalService,
		ObjectDefinition objectDefinition) {

		return TransformUtil.transform(
			objectActionLocalService.getObjectActions(
				objectDefinition.getObjectDefinitionId(),
				ObjectActionTriggerConstants.KEY_STANDALONE),
			objectAction -> {
				InfoLocalizedValue<String> actionLabelLocalizedValue =
					InfoLocalizedValue.<String>builder(
					).defaultLocale(
						LocaleUtil.fromLanguageId(
							objectAction.getDefaultLanguageId())
					).values(
						objectAction.getLabelMap()
					).build();

				return new InfoFieldValue<>(
					InfoField.builder(
					).infoFieldType(
						ActionInfoFieldType.INSTANCE
					).namespace(
						ObjectAction.class.getSimpleName()
					).name(
						objectAction.getName()
					).labelInfoLocalizedValue(
						actionLabelLocalizedValue
					).build(),
					actionLabelLocalizedValue);
			});
	}

	public static ObjectEntry getObjectEntry(
		ObjectDefinition objectDefinition,
		ObjectEntryManagerRegistry objectEntryManagerRegistry,
		ObjectScopeProviderRegistry objectScopeProviderRegistry,
		com.liferay.object.model.ObjectEntry serviceBuilderObjectEntry,
		ThemeDisplay themeDisplay) {

		if (themeDisplay == null) {
			return null;
		}

		ObjectEntryManager objectEntryManager =
			objectEntryManagerRegistry.getObjectEntryManager(
				objectDefinition.getStorageType());

		try {
			return objectEntryManager.getObjectEntry(
				themeDisplay.getCompanyId(),
				new DefaultDTOConverterContext(
					false, null, null, null, null, themeDisplay.getLocale(),
					null, themeDisplay.getUser()),
				serviceBuilderObjectEntry.getExternalReferenceCode(),
				objectDefinition,
				getScopeKey(
					serviceBuilderObjectEntry.getGroupId(), objectDefinition,
					objectScopeProviderRegistry));
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}

			return null;
		}
	}

	public static List<InfoFieldValue<Object>> getObjectFieldsInfoFieldValues(
			DLAppLocalService dlAppLocalService, DLURLHelper dlURLHelper,
			ObjectDefinitionLocalService objectDefinitionLocalService,
			ObjectEntryLocalService objectEntryLocalService,
			ObjectEntryManagerRegistry objectEntryManagerRegistry,
			ObjectFieldInfoFieldConverter objectFieldInfoFieldConverter,
			ObjectFieldLocalService objectFieldLocalService,
			List<ObjectField> objectFields,
			ObjectRelationshipLocalService objectRelationshipLocalService,
			ObjectScopeProviderRegistry objectScopeProviderRegistry,
			ThemeDisplay themeDisplay, Map<String, Object> values)
		throws Exception {

		List<InfoFieldValue<Object>> objectFieldsInfoFieldValues =
			new ArrayList<>();

		for (ObjectField objectField : objectFields) {
			if (objectField.isMetadata()) {
				continue;
			}

			Object infoFieldValue = _getInfoFieldValue(
				objectField, themeDisplay, values);

			objectFieldsInfoFieldValues.add(
				new InfoFieldValue<>(
					objectFieldInfoFieldConverter.getInfoField(
						false, ObjectField.class.getSimpleName(), objectField),
					infoFieldValue));
			objectFieldsInfoFieldValues.addAll(
				_getAttachmentInfoFieldValues(
					dlAppLocalService, dlURLHelper, objectField,
					infoFieldValue));

			objectFieldsInfoFieldValues.addAll(
				_getRelatedObjectEntryFieldValues(
					objectDefinitionLocalService, objectEntryLocalService,
					objectEntryManagerRegistry, objectField,
					objectFieldInfoFieldConverter, objectFieldLocalService,
					objectRelationshipLocalService, objectScopeProviderRegistry,
					themeDisplay, values));
		}

		return objectFieldsInfoFieldValues;
	}

	public static Object getObjectFieldValue(
			Locale locale, ObjectField objectField, Map<String, Object> values)
		throws Exception {

		Object value = values.get(objectField.getName());

		if (value == null) {
			return null;
		}

		if (objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

			com.liferay.object.rest.dto.v1_0.FileEntry fileEntry =
				(com.liferay.object.rest.dto.v1_0.FileEntry)value;

			DLFileEntry dlFileEntry =
				DLFileEntryLocalServiceUtil.fetchDLFileEntry(
					GetterUtil.getLong(fileEntry.getId()));

			if (dlFileEntry == null) {
				return null;
			}

			return fileEntry;
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_DATE)) {

			try {
				return DateUtil.parseDate(
					"yyyy-MM-dd", value.toString(), locale);
			}
			catch (ParseException parseException) {
				if (_log.isDebugEnabled()) {
					_log.debug(parseException);
				}

				return value;
			}
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_DATE_TIME)) {

			DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
				ObjectFieldUtil.getDateTimePattern(value.toString()));

			return LocalDateTime.parse(value.toString(), dateTimeFormatter);
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST)) {

			List<ListTypeEntry> listTypeEntries = new ArrayList<>();

			for (ListEntry listEntry : (List<ListEntry>)value) {
				ListTypeEntry listTypeEntry =
					ListTypeEntryLocalServiceUtil.fetchListTypeEntry(
						objectField.getListTypeDefinitionId(),
						listEntry.getKey());

				if (listTypeEntry == null) {
					continue;
				}

				listTypeEntries.add(listTypeEntry);
			}

			return listTypeEntries;
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_PICKLIST)) {

			ListEntry listEntry = (ListEntry)value;

			return ListTypeEntryLocalServiceUtil.fetchListTypeEntry(
				objectField.getListTypeDefinitionId(), listEntry.getKey());
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_RELATIONSHIP)) {

			long primaryKey = GetterUtil.getLong(value);

			if (primaryKey == 0) {
				return null;
			}

			ObjectRelationship objectRelationship =
				ObjectRelationshipLocalServiceUtil.
					fetchObjectRelationshipByObjectFieldId2(
						objectField.getObjectFieldId());

			return new KeyValuePair(
				String.valueOf(primaryKey),
				ObjectEntryLocalServiceUtil.getTitleValue(
					objectRelationship.getObjectDefinitionId1(), primaryKey));
		}

		return value;
	}

	public static String getScopeKey(
		long groupId, ObjectDefinition objectDefinition,
		ObjectScopeProviderRegistry objectScopeProviderRegistry) {

		ObjectScopeProvider objectScopeProvider =
			objectScopeProviderRegistry.getObjectScopeProvider(
				objectDefinition.getScope());

		if (!objectScopeProvider.isGroupAware()) {
			return null;
		}

		Group group = GroupLocalServiceUtil.fetchGroup(groupId);

		if (group == null) {
			return null;
		}

		return group.getGroupKey();
	}

	public static ThemeDisplay getThemeDisplay(
			CompanyLocalService companyLocalService,
			UserLocalService userLocalService)
		throws Exception {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			return null;
		}

		ThemeDisplay themeDisplay = serviceContext.getThemeDisplay();

		if (themeDisplay != null) {
			return themeDisplay;
		}

		User user = userLocalService.fetchUser(serviceContext.getUserId());

		if (user == null) {
			user = userLocalService.fetchGuestUser(
				serviceContext.getCompanyId());
		}

		User finalUser = user;

		return new ThemeDisplay() {
			{
				setCompany(
					companyLocalService.getCompany(
						serviceContext.getCompanyId()));
				setLocale(
					LocaleUtil.fromLanguageId(serviceContext.getLanguageId()));
				setSiteGroupId(serviceContext.getScopeGroupId());
				setUser(finalUser);
			}
		};
	}

	public static WebImage getWebImage(
			CompanyLocalService companyLocalService, long userId,
			UserLocalService userLocalService)
		throws Exception {

		User user = userLocalService.fetchUser(userId);

		if (user == null) {
			return null;
		}

		ThemeDisplay themeDisplay = getThemeDisplay(
			companyLocalService, userLocalService);

		if (themeDisplay == null) {
			return null;
		}

		WebImage webImage = new WebImage(user.getPortraitURL(themeDisplay));

		webImage.setAlt(user.getFullName());

		return webImage;
	}

	private static List<InfoFieldValue<Object>> _getAttachmentInfoFieldValues(
		DLAppLocalService dlAppLocalService, DLURLHelper dlURLHelper,
		ObjectField objectField, Object value) {

		if (!objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

			return Collections.emptyList();
		}

		List<InfoFieldValue<Object>> infoFieldValues = new ArrayList<>();

		try {
			FileEntry fileEntry = dlAppLocalService.getFileEntry(
				GetterUtil.getLong(value));

			if (fileEntry == null) {
				return Collections.emptyList();
			}

			infoFieldValues.add(
				new InfoFieldValue<>(
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
					).build(),
					dlURLHelper.getDownloadURL(
						fileEntry, fileEntry.getFileVersion(), null,
						StringPool.BLANK)));
			infoFieldValues.add(
				new InfoFieldValue<>(
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
					).build(),
					fileEntry.getFileName()));
			infoFieldValues.add(
				new InfoFieldValue<>(
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
					).build(),
					fileEntry.getMimeType()));
			infoFieldValues.add(
				new InfoFieldValue<>(
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
					).build(),
					dlURLHelper.getPreviewURL(
						fileEntry, fileEntry.getFileVersion(), null,
						StringPool.BLANK)));
			infoFieldValues.add(
				new InfoFieldValue<>(
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
					).build(),
					fileEntry.getSize()));
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}
		}

		return infoFieldValues;
	}

	private static Object _getInfoFieldValue(
			ObjectField objectField, ThemeDisplay themeDisplay,
			Map<String, Object> values)
		throws Exception {

		if (themeDisplay == null) {
			return StringPool.BLANK;
		}

		Object value = getObjectFieldValue(
			themeDisplay.getLocale(), objectField, values);

		if (value == null) {
			return StringPool.BLANK;
		}

		if (Objects.equals(
				ObjectFieldDBTypeUtil.getInfoFieldType(objectField),
				ImageInfoFieldType.INSTANCE)) {

			JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
				new String((byte[])value));

			WebImage webImage = new WebImage(jsonObject.getString("url"));

			webImage.setAlt(jsonObject.getString("alt"));

			return webImage;
		}

		if (objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

			com.liferay.object.rest.dto.v1_0.FileEntry fileEntry =
				(com.liferay.object.rest.dto.v1_0.FileEntry)value;

			return fileEntry.getId();
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST)) {

			if (ListUtil.isEmpty((List<ListTypeEntry>)value)) {
				return StringPool.BLANK;
			}

			return ListUtil.toList(
				(List<ListTypeEntry>)value,
				listTypeEntry -> _getKeyLocalizedLabelPair(listTypeEntry));
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_PICKLIST)) {

			return ListUtil.fromArray(
				_getKeyLocalizedLabelPair((ListTypeEntry)value));
		}

		if (value instanceof Map) {
			Map<String, String> localizedValue = (Map<String, String>)value;

			if (localizedValue.containsKey(themeDisplay.getLanguageId())) {
				return localizedValue.get(themeDisplay.getLanguageId());
			}
		}

		return value;
	}

	private static KeyLocalizedLabelPair _getKeyLocalizedLabelPair(
		ListTypeEntry listTypeEntry) {

		return new KeyLocalizedLabelPair(
			listTypeEntry.getKey(),
			InfoLocalizedValue.<String>builder(
			).defaultLocale(
				LocaleUtil.fromLanguageId(listTypeEntry.getDefaultLanguageId())
			).values(
				listTypeEntry.getNameMap()
			).build());
	}

	private static List<InfoFieldValue<Object>>
			_getRelatedObjectEntryFieldValues(
				ObjectDefinitionLocalService objectDefinitionLocalService,
				ObjectEntryLocalService objectEntryLocalService,
				ObjectEntryManagerRegistry objectEntryManagerRegistry,
				ObjectField objectField,
				ObjectFieldInfoFieldConverter objectFieldInfoFieldConverter,
				ObjectFieldLocalService objectFieldLocalService,
				ObjectRelationshipLocalService objectRelationshipLocalService,
				ObjectScopeProviderRegistry objectScopeProviderRegistry,
				ThemeDisplay themeDisplay, Map<String, Object> values)
		throws Exception {

		if (!objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_RELATIONSHIP)) {

			return Collections.emptyList();
		}

		com.liferay.object.model.ObjectEntry serviceBuilderObjectEntry =
			objectEntryLocalService.fetchObjectEntry(
				GetterUtil.getLong(values.get(objectField.getName())));

		if (serviceBuilderObjectEntry == null) {
			return Collections.emptyList();
		}

		ObjectDefinition objectDefinition =
			objectDefinitionLocalService.getObjectDefinition(
				serviceBuilderObjectEntry.getObjectDefinitionId());

		ObjectEntry objectEntry = getObjectEntry(
			objectDefinition, objectEntryManagerRegistry,
			objectScopeProviderRegistry, serviceBuilderObjectEntry,
			themeDisplay);

		if (objectEntry == null) {
			return Collections.emptyList();
		}

		ObjectRelationship objectRelationship =
			objectRelationshipLocalService.
				fetchObjectRelationshipByObjectFieldId2(
					objectField.getObjectFieldId());

		return TransformUtil.transform(
			objectFieldLocalService.getObjectFields(
				serviceBuilderObjectEntry.getObjectDefinitionId(), false),
			relatedObjectField -> new InfoFieldValue<>(
				objectFieldInfoFieldConverter.getInfoField(
					false,
					StringBundler.concat(
						ObjectRelationship.class.getSimpleName(),
						StringPool.POUND, objectDefinition.getName(),
						StringPool.POUND, objectRelationship.getName()),
					relatedObjectField),
				_getInfoFieldValue(
					relatedObjectField, themeDisplay,
					objectEntry.getProperties())));
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectEntryInfoItemUtil.class);

}