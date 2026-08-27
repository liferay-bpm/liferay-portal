/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.notification.service.impl;

import com.liferay.exportimport.kernel.lar.ExportImportThreadLocal;
import com.liferay.exportimport.report.constants.ExportImportReportEntryConstants;
import com.liferay.exportimport.report.service.ExportImportReportEntryLocalService;
import com.liferay.notification.constants.NotificationRecipientConstants;
import com.liferay.notification.constants.NotificationRecipientSettingConstants;
import com.liferay.notification.context.NotificationContext;
import com.liferay.notification.exception.NotificationRecipientSettingValueException;
import com.liferay.notification.model.NotificationRecipientSetting;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.service.base.NotificationRecipientSettingLocalServiceBaseImpl;
import com.liferay.notification.type.util.NotificationTypeUtil;
import com.liferay.petra.reflect.ReflectionUtil;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.NoSuchRoleException;
import com.liferay.portal.kernel.exception.NoSuchUserGroupException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.UserGroup;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.search.Indexable;
import com.liferay.portal.kernel.search.IndexableType;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.UserGroupLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Feliphe Marinho
 */
@Component(
	property = "model.class.name=com.liferay.notification.model.NotificationRecipientSetting",
	service = AopService.class
)
public class NotificationRecipientSettingLocalServiceImpl
	extends NotificationRecipientSettingLocalServiceBaseImpl {

	@Indexable(type = IndexableType.REINDEX)
	@Override
	public NotificationRecipientSetting addNotificationRecipientSetting(
			long userId, long notificationRecipientId, String name,
			Object value)
		throws PortalException {

		NotificationRecipientSetting notificationRecipientSetting =
			notificationRecipientSettingPersistence.create(
				counterLocalService.increment());

		User user = _userLocalService.getUser(userId);

		notificationRecipientSetting.setCompanyId(user.getCompanyId());
		notificationRecipientSetting.setUserId(user.getUserId());
		notificationRecipientSetting.setUserName(user.getFullName());

		notificationRecipientSetting.setNotificationRecipientId(
			notificationRecipientId);
		notificationRecipientSetting.setName(name);

		_setValue(notificationRecipientSetting, value);

		return notificationRecipientSettingPersistence.update(
			notificationRecipientSetting);
	}

	@Override
	public List<NotificationRecipientSetting>
		createNotificationRecipientSettings(
			long notificationRecipientId, Object[] recipients, User user) {

		return createNotificationRecipientSettings(
			null, notificationRecipientId, recipients, user);
	}

	@Override
	public List<NotificationRecipientSetting>
		createNotificationRecipientSettings(
			NotificationContext notificationContext,
			long notificationRecipientId, Object[] recipients, User user) {

		List<NotificationRecipientSetting> notificationRecipientSettings =
			new ArrayList<>();

		for (Object recipient : recipients) {
			Map<String, Object> recipientMap = (Map<String, Object>)recipient;

			for (Map.Entry<String, Object> entry : recipientMap.entrySet()) {
				if (NotificationRecipientSettingConstants.
						isRecipientMetadataName(entry.getKey()) ||
					Objects.equals(
						recipientMap.get(
							NotificationRecipientSettingConstants.
								getRecipientTypeName(entry.getKey())),
						NotificationRecipientConstants.TYPE_SUBSCRIBERS)) {

					continue;
				}

				_addNotificationRecipientSetting(
					entry, notificationContext, notificationRecipientId,
					notificationRecipientSettings, recipientMap,
					GetterUtil.getString(
						recipientMap.get(
							NotificationRecipientSettingConstants.
								getRecipientTypeName(entry.getKey()))),
					user);
			}
		}

		return notificationRecipientSettings;
	}

	@Override
	public NotificationRecipientSetting fetchNotificationRecipientSetting(
		long notificationRecipientId, String name) {

		return notificationRecipientSettingPersistence.fetchByNRI_N(
			notificationRecipientId, name);
	}

	@Override
	public List<NotificationRecipientSetting> getNotificationRecipientSettings(
		long notificationRecipientId) {

		return notificationRecipientSettingPersistence.
			findByNotificationRecipientId(notificationRecipientId);
	}

	@Indexable(type = IndexableType.REINDEX)
	@Override
	public NotificationRecipientSetting updateNotificationRecipientSetting(
		long notificationRecipientId, String name, Object value) {

		NotificationRecipientSetting notificationRecipientSetting =
			notificationRecipientSettingPersistence.fetchByNRI_N(
				notificationRecipientId, name);

		_setValue(notificationRecipientSetting, value);

		return notificationRecipientSettingPersistence.update(
			notificationRecipientSetting);
	}

	private void _addNotificationRecipientSetting(
		Map.Entry<String, Object> entry,
		NotificationContext notificationContext, long notificationRecipientId,
		List<NotificationRecipientSetting> notificationRecipientSettings,
		Map<String, Object> recipientMap, String recipientType, User user) {

		if (Objects.equals(
				recipientType, NotificationRecipientConstants.TYPE_ROLE)) {

			Set<String> roleNames = new HashSet<>();

			for (Map<String, String> roleMap : _toList(entry.getValue())) {
				Role role = _resolveRole(
					roleMap.get(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE),
					roleMap.get(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME),
					roleMap.get(
						NotificationRecipientSettingConstants.NAME_ROLE_TYPE),
					user);

				if ((role == null) ||
					((role.getType() != RoleConstants.TYPE_ACCOUNT) &&
					 (role.getType() != RoleConstants.TYPE_ORGANIZATION) &&
					 (role.getType() != RoleConstants.TYPE_REGULAR)) ||
					roleNames.contains(role.getName())) {

					continue;
				}

				roleNames.add(role.getName());

				_addNotificationRecipientSetting(
					entry.getKey(), notificationRecipientId,
					notificationRecipientSettings, user, role.getName());
			}
		}
		else if (Objects.equals(
					recipientType,
					NotificationRecipientConstants.TYPE_USER_GROUP)) {

			Set<String> userGroupNames = new HashSet<>();

			for (Map<String, String> userGroupMap : _toList(entry.getValue())) {
				UserGroup userGroup = _resolveUserGroup(
					userGroupMap.get(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE),
					userGroupMap.get(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME),
					user);

				if ((userGroup == null) ||
					userGroupNames.contains(userGroup.getName())) {

					continue;
				}

				userGroupNames.add(userGroup.getName());

				_addNotificationRecipientSetting(
					entry.getKey(), notificationRecipientId,
					notificationRecipientSettings, user, userGroup.getName());
			}
		}
		else if (Objects.equals(
					entry.getKey(),
					NotificationRecipientSettingConstants.NAME_ROLE_NAME)) {

			Role role = _resolveRole(
				GetterUtil.getString(
					recipientMap.get(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE)),
				GetterUtil.getString(entry.getValue()),
				GetterUtil.getString(
					recipientMap.get(
						NotificationRecipientSettingConstants.NAME_ROLE_TYPE)),
				user);

			if (role != null) {
				_addNotificationRecipientSetting(
					entry.getKey(), notificationRecipientId,
					notificationRecipientSettings, user, role.getName());
			}
		}
		else if (Objects.equals(
					entry.getKey(),
					NotificationRecipientSettingConstants.
						NAME_USER_GROUP_NAME)) {

			UserGroup userGroup = _resolveUserGroup(
				GetterUtil.getString(
					recipientMap.get(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE)),
				GetterUtil.getString(entry.getValue()), user);

			if (userGroup != null) {
				_addNotificationRecipientSetting(
					entry.getKey(), notificationRecipientId,
					notificationRecipientSettings, user, userGroup.getName());
			}
		}
		else if (Objects.equals(
					entry.getKey(),
					NotificationRecipientSettingConstants.
						NAME_USER_SCREEN_NAME) &&
				 !NotificationTypeUtil.isTermValue(
					 GetterUtil.getString(entry.getValue()))) {

			User recipientUser = _resolveUser(
				GetterUtil.getString(
					recipientMap.get(
						NotificationRecipientSettingConstants.
							NAME_USER_EXTERNAL_REFERENCE_CODE)),
				GetterUtil.getString(entry.getValue()), user);

			if (recipientUser != null) {
				_addNotificationRecipientSetting(
					entry.getKey(), notificationRecipientId,
					notificationRecipientSettings, user,
					recipientUser.getScreenName());
			}
			else {
				_reportUnresolvedUserRecipient(
					notificationContext, GetterUtil.getString(entry.getValue()),
					user);
			}
		}
		else {
			_addNotificationRecipientSetting(
				entry.getKey(), notificationRecipientId,
				notificationRecipientSettings, user, entry.getValue());
		}
	}

	private void _addNotificationRecipientSetting(
		String name, long notificationRecipientId,
		List<NotificationRecipientSetting> notificationRecipientSettings,
		User user, Object value) {

		NotificationRecipientSetting notificationRecipientSetting =
			notificationRecipientSettingPersistence.create(0);

		notificationRecipientSetting.setCompanyId(user.getCompanyId());
		notificationRecipientSetting.setUserId(user.getUserId());
		notificationRecipientSetting.setUserName(user.getFullName());
		notificationRecipientSetting.setNotificationRecipientId(
			notificationRecipientId);
		notificationRecipientSetting.setName(name);

		if (value instanceof Map) {
			notificationRecipientSetting.setValueMap(
				LocalizedMapUtil.getLocalizedMap((Map)value));
		}
		else {
			notificationRecipientSetting.setValue(String.valueOf(value));
		}

		notificationRecipientSettings.add(notificationRecipientSetting);
	}

	private void _reportUnresolvedUserRecipient(
		NotificationContext notificationContext, String screenName, User user) {

		if (!ExportImportThreadLocal.isImportInProcess() ||
			(notificationContext == null) ||
			(notificationContext.getNotificationTemplate() == null)) {

			return;
		}

		NotificationTemplate notificationTemplate =
			notificationContext.getNotificationTemplate();

		_exportImportReportEntryLocalService.getOrAddExportImportReportEntry(
			0, user.getCompanyId(),
			notificationTemplate.getExternalReferenceCode(),
			_portal.getClassNameId(NotificationTemplate.class.getName()),
			notificationTemplate.getNotificationTemplateId(),
			GetterUtil.getLong(
				ExportImportThreadLocal.getExportImportConfigurationId()),
			ExportImportReportEntryConstants.TYPE_WARNING,
			_language.format(
				LocaleUtil.getDefault(),
				"the-user-x-does-not-exist-and-was-removed-from-the-" +
					"recipients-of-notification-template-x",
				new Object[] {
					screenName,
					notificationTemplate.getName(LocaleUtil.getDefault())
				}),
			null, "notification-template");
	}

	private Role _resolveRole(
		String externalReferenceCode, String name, String typeLabel,
		User user) {

		if (Validator.isNotNull(externalReferenceCode)) {
			try {
				return _roleLocalService.getOrAddEmptyRole(
					externalReferenceCode, user.getCompanyId(),
					user.getUserId(), null, 0, name,
					RoleConstants.getLabelType(typeLabel));
			}
			catch (NoSuchRoleException noSuchRoleException) {
				return ReflectionUtil.throwException(
					new NotificationRecipientSettingValueException.
						RoleMustExist(
							externalReferenceCode, noSuchRoleException));
			}
			catch (PortalException portalException) {
				return ReflectionUtil.throwException(portalException);
			}
		}

		if (Validator.isNull(name)) {
			return null;
		}

		return _roleLocalService.fetchRole(user.getCompanyId(), name);
	}

	private User _resolveUser(
		String externalReferenceCode, String screenName, User user) {

		if (Validator.isNotNull(externalReferenceCode)) {
			User recipientUser =
				_userLocalService.fetchUserByExternalReferenceCode(
					externalReferenceCode, user.getCompanyId());

			if (recipientUser != null) {
				return recipientUser;
			}
		}

		if (Validator.isNull(screenName)) {
			return null;
		}

		return _userLocalService.fetchUserByScreenName(
			user.getCompanyId(), screenName);
	}

	private UserGroup _resolveUserGroup(
		String externalReferenceCode, String name, User user) {

		if (Validator.isNotNull(externalReferenceCode)) {
			try {
				return _userGroupLocalService.getOrAddEmptyUserGroup(
					externalReferenceCode, user.getCompanyId(),
					user.getUserId(), name);
			}
			catch (NoSuchUserGroupException noSuchUserGroupException) {
				return ReflectionUtil.throwException(
					new NotificationRecipientSettingValueException.
						UserGroupMustExist(
							externalReferenceCode, noSuchUserGroupException));
			}
			catch (PortalException portalException) {
				return ReflectionUtil.throwException(portalException);
			}
		}

		if (Validator.isNull(name)) {
			return null;
		}

		return _userGroupLocalService.fetchUserGroup(user.getCompanyId(), name);
	}

	private void _setValue(
		NotificationRecipientSetting notificationRecipientSetting,
		Object value) {

		if (value instanceof String) {
			notificationRecipientSetting.setValue(String.valueOf(value));
		}
		else {
			notificationRecipientSetting.setValueMap(
				(Map<Locale, String>)value);
		}
	}

	private List<Map<String, String>> _toList(Object value) {
		if (value instanceof Object[]) {
			value = Arrays.asList((Object[])value);
		}

		return (List<Map<String, String>>)value;
	}

	@Reference
	private ExportImportReportEntryLocalService
		_exportImportReportEntryLocalService;

	@Reference
	private Language _language;

	@Reference
	private Portal _portal;

	@Reference
	private RoleLocalService _roleLocalService;

	@Reference
	private UserGroupLocalService _userGroupLocalService;

	@Reference
	private UserLocalService _userLocalService;

}