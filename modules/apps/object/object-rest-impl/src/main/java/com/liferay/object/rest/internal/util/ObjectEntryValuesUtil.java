/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.util;

import com.liferay.document.library.kernel.model.DLFileEntry;
import com.liferay.document.library.kernel.model.DLFolder;
import com.liferay.document.library.kernel.service.DLAppService;
import com.liferay.document.library.kernel.service.DLFileEntryLocalService;
import com.liferay.document.library.util.DLURLHelper;
import com.liferay.list.type.model.ListTypeEntry;
import com.liferay.list.type.service.ListTypeEntryLocalService;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectFieldSettingConstants;
import com.liferay.object.exception.NoSuchObjectEntryException;
import com.liferay.object.field.business.type.ObjectFieldBusinessType;
import com.liferay.object.field.business.type.ObjectFieldBusinessTypeRegistry;
import com.liferay.object.field.setting.util.ObjectFieldSettingUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.rest.dto.v1_0.FileEntry;
import com.liferay.object.rest.dto.v1_0.Folder;
import com.liferay.object.rest.dto.v1_0.ListEntry;
import com.liferay.object.rest.dto.v1_0.util.LinkUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.Base64;
import com.liferay.portal.kernel.util.File;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.vulcan.fields.NestedFieldsSupplier;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.io.Serializable;

import java.sql.Timestamp;

import java.text.SimpleDateFormat;

import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * @author Carolina Barbosa
 */
public class ObjectEntryValuesUtil {

	public static Object getDTOValue(
		boolean acceptAllLanguages, DLAppService dlAppService,
		DLFileEntryLocalService dlFileEntryLocalService,
		DLURLHelper dlURLHelper, File file,
		ListTypeEntryLocalService listTypeEntryLocalService, Locale locale,
		ObjectDefinition objectDefinition,
		String objectEntryExternalReferenceCode, ObjectField objectField,
		Portal portal, Map<String, Serializable> values) {

		Serializable serializable = values.get(objectField.getName());

		if (objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_ATTACHMENT)) {

			long fileEntryId = GetterUtil.getLong(serializable);

			if (fileEntryId == 0) {
				return null;
			}

			DLFileEntry dlFileEntry = dlFileEntryLocalService.fetchDLFileEntry(
				fileEntryId);

			if (dlFileEntry == null) {
				return new FileEntry();
			}

			FileEntry fileEntry = new FileEntry();

			if (FeatureFlagManagerUtil.isEnabled(
					objectDefinition.getCompanyId(), "LPS-174455")) {

				fileEntry.setFileBase64(
					() -> NestedFieldsSupplier.supply(
						objectField.getName() + ".fileBase64",
						fieldName -> Base64.encode(
							file.getBytes(dlFileEntry.getContentStream()))));
				fileEntry.setFolder(
					() -> NestedFieldsSupplier.supply(
						objectField.getName() + ".folder",
						fieldName -> {
							if (!Objects.equals(
									ObjectFieldSettingConstants.
										VALUE_DOCS_AND_MEDIA,
									ObjectFieldSettingUtil.getValue(
										ObjectFieldSettingConstants.
											NAME_FILE_SOURCE,
										objectField))) {

								return null;
							}

							Folder folder = new Folder();

							folder.setExternalReferenceCode(
								() -> {
									if (dlFileEntry.getFolderId() == 0) {
										return null;
									}

									DLFolder dlFolder = dlFileEntry.getFolder();

									return dlFolder.getExternalReferenceCode();
								});
							folder.setSiteId(dlFileEntry::getGroupId);

							return folder;
						}));
			}

			fileEntry.setId(dlFileEntry::getFileEntryId);
			fileEntry.setLink(
				() -> LinkUtil.toLink(
					dlAppService, dlFileEntry, dlURLHelper,
					objectDefinition.getExternalReferenceCode(),
					objectEntryExternalReferenceCode, portal));
			fileEntry.setName(dlFileEntry::getFileName);

			return fileEntry;
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_DATE_TIME)) {

			Timestamp timestamp = (Timestamp)serializable;

			if (timestamp == null) {
				return null;
			}

			String pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS";

			if (StringUtil.equals(
					ObjectFieldSettingUtil.getValue(
						ObjectFieldSettingConstants.NAME_TIME_STORAGE,
						objectField),
					ObjectFieldSettingConstants.VALUE_CONVERT_TO_UTC)) {

				pattern += "'Z'";
			}

			SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

			return simpleDateFormat.format(timestamp);
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST)) {

			if (objectField.getListTypeDefinitionId() == 0) {
				return null;
			}

			return TransformUtil.transformToList(
				StringUtil.split(
					(String)serializable, StringPool.COMMA_AND_SPACE),
				key -> getListEntry(
					acceptAllLanguages, key,
					objectField.getListTypeDefinitionId(),
					listTypeEntryLocalService, locale));
		}
		else if (objectField.compareBusinessType(
					ObjectFieldConstants.BUSINESS_TYPE_PICKLIST)) {

			if (objectField.getListTypeDefinitionId() == 0) {
				return null;
			}

			return getListEntry(
				acceptAllLanguages, (String)serializable,
				objectField.getListTypeDefinitionId(),
				listTypeEntryLocalService, locale);
		}

		return serializable;
	}

	public static ListEntry getListEntry(
		boolean acceptAllLanguages, String key, long listTypeDefinitionId,
		ListTypeEntryLocalService listTypeEntryLocalService, Locale locale) {

		ListTypeEntry listTypeEntry =
			listTypeEntryLocalService.fetchListTypeEntry(
				listTypeDefinitionId, key);

		if (listTypeEntry == null) {
			return null;
		}

		return new ListEntry() {
			{
				setKey(listTypeEntry::getKey);
				setName(() -> listTypeEntry.getName(locale));
				setName_i18n(
					() -> LocalizedMapUtil.getI18nMap(
						acceptAllLanguages, listTypeEntry.getNameMap()));
			}
		};
	}

	public static Object getValue(
			ObjectDefinitionLocalService objectDefinitionLocalService,
			ObjectEntryLocalService objectEntryLocalService,
			ObjectField objectField,
			ObjectFieldBusinessTypeRegistry objectFieldBusinessTypeRegistry,
			long userId, Map<String, Object> values)
		throws PortalException {

		try {
			ObjectFieldBusinessType objectFieldBusinessType =
				objectFieldBusinessTypeRegistry.getObjectFieldBusinessType(
					objectField.getBusinessType());

			return objectFieldBusinessType.getValue(
				objectField, userId, values);
		}
		catch (NoSuchObjectEntryException noSuchObjectEntryException) {
			if (_log.isDebugEnabled()) {
				_log.debug(noSuchObjectEntryException);
			}

			String externalReferenceCode =
				noSuchObjectEntryException.getExternalReferenceCode();

			if (Validator.isNull(externalReferenceCode)) {
				throw noSuchObjectEntryException;
			}

			ObjectEntry objectEntry = objectEntryLocalService.addObjectEntry(
				externalReferenceCode, userId,
				objectDefinitionLocalService.getObjectDefinition(
					noSuchObjectEntryException.getObjectDefinitionId()));

			return objectEntry.getObjectEntryId();
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectEntryValuesUtil.class);

}