/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.notification.rest.dto.v1_0.util;

import com.liferay.counter.kernel.service.CounterLocalServiceUtil;
import com.liferay.exportimport.kernel.lar.ExportImportThreadLocal;
import com.liferay.exportimport.report.constants.ExportImportReportEntryConstants;
import com.liferay.exportimport.report.service.ExportImportReportEntryLocalServiceUtil;
import com.liferay.notification.context.NotificationContext;
import com.liferay.notification.model.NotificationRecipient;
import com.liferay.notification.model.NotificationRecipientSetting;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.service.NotificationRecipientLocalServiceUtil;
import com.liferay.notification.service.NotificationTemplateLocalServiceUtil;
import com.liferay.notification.type.NotificationType;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectFolder;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectFolderLocalServiceUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.ClassNameLocalServiceUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author Feliphe Marinho
 */
public class NotificationUtil {

	public static NotificationContext toNotificationContext(
		com.liferay.notification.rest.dto.v1_0.NotificationTemplate
			notificationTemplate,
		ObjectFieldLocalService objectFieldLocalService,
		NotificationTemplate serviceBuilderNotificationTemplate) {

		NotificationContext notificationContext = new NotificationContext();

		List<Long> attachmentObjectFieldIds = new ArrayList<>();
		boolean featureFlagEnabled = FeatureFlagManagerUtil.isEnabled(
			serviceBuilderNotificationTemplate.getCompanyId(), "LPD-49854");

		String[] attachmentObjectFieldExternalReferenceCodes =
			notificationTemplate.
				getAttachmentObjectFieldExternalReferenceCodes();

		if (attachmentObjectFieldExternalReferenceCodes != null) {
			for (String attachmentObjectFieldExternalReferenceCode :
					attachmentObjectFieldExternalReferenceCodes) {

				ObjectField objectField =
					objectFieldLocalService.fetchObjectField(
						attachmentObjectFieldExternalReferenceCode,
						serviceBuilderNotificationTemplate.
							getObjectDefinitionId());

				if (objectField == null) {
					if (!featureFlagEnabled) {
						attachmentObjectFieldIds.clear();

						break;
					}

					if (ExportImportThreadLocal.isImportInProcess()) {
						ExportImportReportEntryLocalServiceUtil.
							getOrAddExportImportReportEntry(
								0,
								serviceBuilderNotificationTemplate.
									getCompanyId(),
								attachmentObjectFieldExternalReferenceCode,
								ClassNameLocalServiceUtil.getClassNameId(
									ObjectField.class),
								0,
								GetterUtil.getLong(
									ExportImportThreadLocal.
										getExportImportConfigurationId()),
								ExportImportReportEntryConstants.
									TYPE_MISSING_REFERENCE,
								null, null, ObjectField.class.getName());
					}

					continue;
				}

				attachmentObjectFieldIds.add(objectField.getObjectFieldId());
			}
		}

		if ((attachmentObjectFieldExternalReferenceCodes == null) ||
			(!featureFlagEnabled && attachmentObjectFieldIds.isEmpty())) {

			notificationContext.setAttachmentObjectFieldIds(
				ListUtil.fromArray(
					notificationTemplate.getAttachmentObjectFieldIds()));
		}
		else {
			notificationContext.setAttachmentObjectFieldIds(
				attachmentObjectFieldIds);
		}

		notificationContext.setNotificationTemplate(
			serviceBuilderNotificationTemplate);
		notificationContext.setType(notificationTemplate.getType());

		return notificationContext;
	}

	public static NotificationRecipient toNotificationRecipient(
		User user, long classPK) {

		NotificationRecipient notificationRecipient =
			NotificationRecipientLocalServiceUtil.
				fetchNotificationRecipientByClassPK(classPK);

		if (notificationRecipient != null) {
			return notificationRecipient;
		}

		notificationRecipient =
			NotificationRecipientLocalServiceUtil.createNotificationRecipient(
				CounterLocalServiceUtil.increment());

		notificationRecipient.setCompanyId(user.getCompanyId());
		notificationRecipient.setUserId(user.getUserId());
		notificationRecipient.setUserName(user.getFullName());
		notificationRecipient.setClassPK(classPK);

		return notificationRecipient;
	}

	public static List<NotificationRecipientSetting>
		toNotificationRecipientSetting(
			long notificationRecipientId, NotificationType notificationType,
			Object[] recipients, User user) {

		return notificationType.createNotificationRecipientSettings(
			notificationRecipientId, recipients, user);
	}

	public static NotificationTemplate toNotificationTemplate(
			long notificationTemplateId,
			com.liferay.notification.rest.dto.v1_0.NotificationTemplate
				notificationTemplate,
			ObjectDefinitionLocalService objectDefinitionLocalService,
			User user)
		throws PortalException {

		NotificationTemplate serviceBuilderNotificationTemplate =
			NotificationTemplateLocalServiceUtil.fetchNotificationTemplate(
				notificationTemplateId);

		if (serviceBuilderNotificationTemplate == null) {
			serviceBuilderNotificationTemplate =
				NotificationTemplateLocalServiceUtil.createNotificationTemplate(
					0L);

			serviceBuilderNotificationTemplate.setUserId(user.getUserId());
			serviceBuilderNotificationTemplate.setUserName(user.getFullName());
		}

		serviceBuilderNotificationTemplate.setExternalReferenceCode(
			notificationTemplate.getExternalReferenceCode());
		serviceBuilderNotificationTemplate.setCompanyId(user.getCompanyId());

		long objectDefinitionId = GetterUtil.getLong(
			notificationTemplate.getObjectDefinitionId());

		String objectDefinitionExternalReferenceCode =
			notificationTemplate.getObjectDefinitionExternalReferenceCode();

		if (Validator.isNotNull(objectDefinitionExternalReferenceCode)) {
			if (FeatureFlagManagerUtil.isEnabled(
					user.getCompanyId(), "LPD-49854")) {

				ObjectDefinition objectDefinition =
					objectDefinitionLocalService.
						fetchObjectDefinitionByExternalReferenceCode(
							objectDefinitionExternalReferenceCode,
							user.getCompanyId());

				if (objectDefinition == null) {
					ObjectFolder defaultObjectFolder =
						ObjectFolderLocalServiceUtil.
							getOrAddDefaultObjectFolder(user.getCompanyId());

					objectDefinition =
						objectDefinitionLocalService.
							getOrAddEmptyObjectDefinition(
								objectDefinitionExternalReferenceCode,
								user.getCompanyId(), user.getUserId(),
								defaultObjectFolder.getObjectFolderId(), true,
								ObjectDefinitionConstants.SCOPE_COMPANY, false);
				}

				objectDefinitionId = objectDefinition.getObjectDefinitionId();
			}
			else {
				try {
					ObjectDefinition objectDefinition =
						objectDefinitionLocalService.
							getObjectDefinitionByExternalReferenceCode(
								objectDefinitionExternalReferenceCode,
								user.getCompanyId());

					objectDefinitionId =
						objectDefinition.getObjectDefinitionId();
				}
				catch (PortalException portalException) {
					_log.error(portalException);
				}
			}
		}

		serviceBuilderNotificationTemplate.setObjectDefinitionId(
			objectDefinitionId);

		serviceBuilderNotificationTemplate.setBodyMap(
			LocalizedMapUtil.getLocalizedMap(notificationTemplate.getBody()));
		serviceBuilderNotificationTemplate.setDescription(
			notificationTemplate.getDescription());
		serviceBuilderNotificationTemplate.setEditorType(
			GetterUtil.getString(notificationTemplate.getEditorTypeAsString()));

		Map<Locale, String> nameMap = LocalizedMapUtil.populateLocalizedMap(
			LocaleUtil.toLanguageId(LocaleUtil.getSiteDefault()),
			notificationTemplate.getName_i18n(),
			notificationTemplate.getName());

		LocalizedMapUtil.validateI18n(
			notificationTemplateId == 0, LocaleUtil.getSiteDefault(),
			"Notification template", nameMap, new HashSet<>());

		serviceBuilderNotificationTemplate.setNameMap(nameMap);

		serviceBuilderNotificationTemplate.setRecipientType(
			notificationTemplate.getRecipientType());
		serviceBuilderNotificationTemplate.setSubjectMap(
			LocalizedMapUtil.getLocalizedMap(
				notificationTemplate.getSubject()));
		serviceBuilderNotificationTemplate.setSystem(
			GetterUtil.getBoolean(notificationTemplate.getSystem()));
		serviceBuilderNotificationTemplate.setType(
			notificationTemplate.getType());

		return serviceBuilderNotificationTemplate;
	}

	private static final Log _log = LogFactoryUtil.getLog(
		NotificationUtil.class);

}