/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.action.executor;

import com.liferay.list.type.model.ListTypeEntry;
import com.liferay.list.type.service.ListTypeEntryLocalService;
import com.liferay.notification.context.NotificationContextBuilder;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.service.NotificationTemplateLocalService;
import com.liferay.notification.type.NotificationType;
import com.liferay.notification.type.NotificationTypeServiceTracker;
import com.liferay.object.action.executor.ObjectActionExecutor;
import com.liferay.object.constants.ObjectActionExecutorConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.internal.action.util.ObjectEntryVariablesUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.system.SystemObjectDefinitionManagerRegistry;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;

import java.sql.Timestamp;

import java.text.SimpleDateFormat;

import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Gabriel Albuquerque
 */
@Component(service = ObjectActionExecutor.class)
public class NotificationTemplateObjectActionExecutorImpl
	implements ObjectActionExecutor {

	@Override
	public void execute(
			long companyId, long objectActionId,
			UnicodeProperties parametersUnicodeProperties,
			JSONObject payloadJSONObject, long userId)
		throws Exception {

		NotificationTemplate notificationTemplate =
			_notificationTemplateLocalService.getNotificationTemplate(
				GetterUtil.getLong(
					parametersUnicodeProperties.get("notificationTemplateId")));

		NotificationType notificationType =
			_notificationTypeServiceTracker.getNotificationType(
				notificationTemplate.getType());

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.fetchObjectDefinition(
				payloadJSONObject.getLong("objectDefinitionId"));

		Map<String, Object> termValues = _getTermValues(
			objectDefinition,
			ObjectEntryVariablesUtil.getVariables(
				_dtoConverterRegistry, objectDefinition, payloadJSONObject,
				_systemObjectDefinitionManagerRegistry));

		notificationType.sendNotification(
			new NotificationContextBuilder(
			).className(
				objectDefinition.getClassName()
			).classPK(
				GetterUtil.getLong(termValues.get("id"))
			).externalReferenceCode(
				GetterUtil.getString(termValues.get("externalReferenceCode"))
			).groupId(
				GetterUtil.getLong(termValues.get("groupId"))
			).notificationTemplate(
				notificationTemplate
			).termValues(
				termValues
			).userId(
				userId
			).portletId(
				objectDefinition.isUnmodifiableSystemObject() ?
					StringPool.BLANK : objectDefinition.getPortletId()
			).build());
	}

	@Override
	public String getKey() {
		return ObjectActionExecutorConstants.KEY_NOTIFICATION;
	}

	private String _getEntryLanguageId(
		ObjectDefinition objectDefinition, Map<String, Object> variables) {

		Map<String, Object> entryDTO = (Map<String, Object>)variables.get(
			"entryDTO");

		if (entryDTO == null) {
			return null;
		}

		Map<String, Object> properties = (Map<String, Object>)entryDTO.get(
			"properties");

		if (properties == null) {
			return null;
		}

		Set<String> i18nObjectFieldNames = new HashSet<>();

		for (ObjectField objectField :
				_objectFieldLocalService.getObjectFields(
					objectDefinition.getObjectDefinitionId())) {

			if (objectField.isLocalized()) {
				i18nObjectFieldNames.add(objectField.getI18nObjectFieldName());
			}
		}

		for (String i18nObjectFieldName : i18nObjectFieldNames) {
			Map<String, Object> localizedValue =
				(Map<String, Object>)properties.get(i18nObjectFieldName);

			if (localizedValue == null) {
				continue;
			}

			Set<String> languageIdSet = localizedValue.keySet();

			return languageIdSet.iterator(
			).next();
		}

		return null;
	}

	private Map<String, Object> _getTermValues(
		ObjectDefinition objectDefinition, Map<String, Object> variables) {

		Map<String, Object> termValues = (Map<String, Object>)variables.get(
			"baseModel");

		boolean enableLocalization = objectDefinition.isEnableLocalization();

		termValues.put(
			"enableLocalization", objectDefinition.isEnableLocalization());

		if (enableLocalization) {
			termValues.put(
				"languageId", _getEntryLanguageId(objectDefinition, variables));
		}

		for (ObjectField objectField :
				_objectFieldLocalService.getObjectFields(
					objectDefinition.getObjectDefinitionId())) {

			if (termValues.get(objectField.getName()) == null) {
				continue;
			}

			if (Objects.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_DATE) &&
				!Objects.equals(objectField.getName(), "createDate") &&
				!Objects.equals(objectField.getName(), "modifiedDate")) {

				SimpleDateFormat simpleDateFormat = new SimpleDateFormat(
					"yyyy-MM-dd");

				Timestamp timestamp = (Timestamp)termValues.get(
					objectField.getName());

				termValues.put(
					objectField.getName(),
					simpleDateFormat.format(new Date(timestamp.getTime())));
			}
			else if (Objects.equals(
						objectField.getBusinessType(),
						ObjectFieldConstants.BUSINESS_TYPE_PICKLIST)) {

				ListTypeEntry listTypeEntry =
					_listTypeEntryLocalService.fetchListTypeEntry(
						objectField.getListTypeDefinitionId(),
						(String)termValues.get(objectField.getName()));

				if (listTypeEntry != null) {
					termValues.put(
						objectField.getName(),
						listTypeEntry.getNameCurrentValue());
				}
			}
		}

		return termValues;
	}

	@Reference
	private DTOConverterRegistry _dtoConverterRegistry;

	@Reference
	private ListTypeEntryLocalService _listTypeEntryLocalService;

	@Reference
	private NotificationTemplateLocalService _notificationTemplateLocalService;

	@Reference
	private NotificationTypeServiceTracker _notificationTypeServiceTracker;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private SystemObjectDefinitionManagerRegistry
		_systemObjectDefinitionManagerRegistry;

}