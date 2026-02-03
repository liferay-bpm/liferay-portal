/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.notification.internal.type;

import com.liferay.account.service.AccountEntryLocalService;
import com.liferay.account.service.AccountEntryOrganizationRelLocalService;
import com.liferay.account.service.AccountEntryUserRelLocalService;
import com.liferay.info.field.InfoField;
import com.liferay.info.field.InfoFieldValue;
import com.liferay.info.field.type.RelationshipInfoFieldType;
import com.liferay.info.item.InfoItemFieldValues;
import com.liferay.info.item.InfoItemServiceRegistry;
import com.liferay.info.item.provider.InfoItemFieldValuesProvider;
import com.liferay.mail.kernel.model.MailMessage;
import com.liferay.notification.constants.NotificationConstants;
import com.liferay.notification.constants.NotificationQueueEntryConstants;
import com.liferay.notification.constants.NotificationRecipientConstants;
import com.liferay.notification.constants.NotificationRecipientSettingConstants;
import com.liferay.notification.constants.NotificationTemplateConstants;
import com.liferay.notification.context.NotificationContext;
import com.liferay.notification.exception.NotificationRecipientSettingValueException;
import com.liferay.notification.internal.type.email.provider.DefaultEmailProvider;
import com.liferay.notification.internal.type.email.provider.EmailProvider;
import com.liferay.notification.internal.type.email.provider.RoleEmailProvider;
import com.liferay.notification.internal.type.email.provider.SubscribersEmailProvider;
import com.liferay.notification.internal.type.email.provider.TermEmailProvider;
import com.liferay.notification.internal.type.email.provider.UserGroupEmailProvider;
import com.liferay.notification.model.NotificationQueueEntry;
import com.liferay.notification.model.NotificationQueueEntryAttachment;
import com.liferay.notification.model.NotificationRecipient;
import com.liferay.notification.model.NotificationRecipientSetting;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.service.NotificationQueueEntryAttachmentLocalService;
import com.liferay.notification.type.BaseNotificationType;
import com.liferay.notification.type.NotificationType;
import com.liferay.notification.type.util.NotificationTypeUtil;
import com.liferay.notification.util.NotificationRecipientSettingUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryFolderLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.util.HttpServletRequestThreadLocal;
import com.liferay.osgi.service.tracker.collections.list.ServiceTrackerList;
import com.liferay.osgi.service.tracker.collections.list.ServiceTrackerListFactory;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.messaging.DestinationNames;
import com.liferay.portal.kernel.messaging.MessageBusUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portletfilerepository.PortletFileRepository;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.security.auth.EmailAddressValidator;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactory;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.OrganizationLocalService;
import com.liferay.portal.kernel.service.PersistedModelLocalService;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserGroupRoleLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.template.StringTemplateResource;
import com.liferay.portal.kernel.template.Template;
import com.liferay.portal.kernel.template.TemplateConstants;
import com.liferay.portal.kernel.template.TemplateContextContributor;
import com.liferay.portal.kernel.template.TemplateManagerUtil;
import com.liferay.portal.kernel.templateparser.TemplateNode;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.transaction.TransactionCommitCallbackUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.KeyValuePair;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.kernel.util.SetUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.security.auth.EmailAddressValidatorFactory;
import com.liferay.portal.service.PersistedModelLocalServiceRegistryUtil;
import com.liferay.portlet.display.template.PortletDisplayTemplate;
import com.liferay.subscription.service.SubscriptionLocalService;
import com.liferay.template.transformer.TemplateNodeFactory;

import jakarta.mail.internet.InternetAddress;

import jakarta.servlet.http.HttpServletRequest;

import java.io.StringWriter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Feliphe Marinho
 */
@Component(service = NotificationType.class)
public class EmailNotificationType extends BaseNotificationType {

	@Override
	public Map<String, String> evaluateNotificationRecipientSettings(
			long companyId, NotificationContext notificationContext,
			Map<String, Object> notificationRecipientSettings)
		throws PortalException {

		return HashMapBuilder.put(
			NotificationRecipientSettingConstants.NAME_BCC,
			_getValue(
				notificationContext,
				NotificationRecipientSettingConstants.NAME_BCC,
				notificationRecipientSettings)
		).put(
			NotificationRecipientSettingConstants.NAME_BCC_TYPE,
			NotificationRecipientConstants.TYPE_EMAIL
		).put(
			NotificationRecipientSettingConstants.NAME_CC,
			_getValue(
				notificationContext,
				NotificationRecipientSettingConstants.NAME_CC,
				notificationRecipientSettings)
		).put(
			NotificationRecipientSettingConstants.NAME_CC_TYPE,
			NotificationRecipientConstants.TYPE_EMAIL
		).put(
			NotificationRecipientSettingConstants.NAME_FROM,
			NotificationTypeUtil.evaluateTerms(
				(String)notificationRecipientSettings.get(
					NotificationRecipientSettingConstants.NAME_FROM),
				notificationContext, notificationTermEvaluatorTracker)
		).put(
			NotificationRecipientSettingConstants.NAME_FROM_NAME,
			formatLocalizedContent(
				(Map<Locale, String>)notificationRecipientSettings.get(
					NotificationRecipientSettingConstants.NAME_FROM_NAME),
				notificationContext)
		).put(
			NotificationRecipientSettingConstants.NAME_SINGLE_RECIPIENT,
			() -> String.valueOf(
				notificationRecipientSettings.getOrDefault(
					NotificationRecipientSettingConstants.NAME_SINGLE_RECIPIENT,
					Boolean.TRUE))
		).put(
			NotificationRecipientSettingConstants.NAME_TO,
			_getValue(
				notificationContext,
				NotificationRecipientSettingConstants.NAME_TO,
				notificationRecipientSettings)
		).put(
			NotificationRecipientSettingConstants.NAME_TO_TYPE,
			NotificationRecipientConstants.TYPE_EMAIL
		).build();
	}

	@Override
	public Set<String> getAllowedNotificationRecipientSettingsNames() {
		return SetUtil.fromArray(
			NotificationRecipientSettingConstants.NAME_BCC,
			NotificationRecipientSettingConstants.NAME_BCC_TYPE,
			NotificationRecipientSettingConstants.NAME_CC,
			NotificationRecipientSettingConstants.NAME_CC_TYPE,
			NotificationRecipientSettingConstants.NAME_FROM,
			NotificationRecipientSettingConstants.NAME_FROM_NAME,
			NotificationRecipientSettingConstants.NAME_SINGLE_RECIPIENT,
			NotificationRecipientSettingConstants.NAME_TO,
			NotificationRecipientSettingConstants.NAME_TO_TYPE);
	}

	@Override
	public String getFromName(NotificationQueueEntry notificationQueueEntry) {
		Map<String, Object> notificationRecipientSettingsMap =
			NotificationRecipientSettingUtil.
				getNotificationRecipientSettingsMap(notificationQueueEntry);

		return String.valueOf(
			notificationRecipientSettingsMap.get(
				NotificationRecipientSettingConstants.NAME_FROM_NAME));
	}

	@Override
	public String getRecipientSummary(
		NotificationQueueEntry notificationQueueEntry) {

		Map<String, Object> notificationRecipientSettingsMap =
			NotificationRecipientSettingUtil.
				getNotificationRecipientSettingsMap(notificationQueueEntry);

		return String.valueOf(
			notificationRecipientSettingsMap.get(
				NotificationRecipientSettingConstants.NAME_TO));
	}

	@Override
	public String getType() {
		return NotificationConstants.TYPE_EMAIL;
	}

	@Override
	public String getTypeLanguageKey() {
		return "email";
	}

	@Override
	public void resendNotification(
			NotificationQueueEntry notificationQueueEntry)
		throws PortalException {

		if (notificationQueueEntry.getStatus() !=
				NotificationQueueEntryConstants.STATUS_UNSENT) {

			notificationQueueEntry =
				notificationQueueEntryLocalService.updateStatus(
					notificationQueueEntry.getNotificationQueueEntryId(),
					NotificationQueueEntryConstants.STATUS_UNSENT);
		}

		sendNotification(notificationQueueEntry);
	}

	@Override
	public void resendNotifications(int status, String type)
		throws PortalException {

		for (NotificationQueueEntry notificationQueueEntry :
				notificationQueueEntryLocalService.getNotificationEntries(
					type, status)) {

			resendNotification(notificationQueueEntry);
		}
	}

	@Override
	public void sendNotification(NotificationContext notificationContext)
		throws PortalException {

		NotificationTemplate notificationTemplate =
			notificationContext.getNotificationTemplate();

		NotificationRecipient notificationRecipient =
			notificationTemplate.getNotificationRecipient();

		Map<String, Object> notificationRecipientSettings =
			NotificationRecipientSettingUtil.toMap(
				notificationRecipient.getNotificationRecipientSettings());

		notificationContext.setCompanyId(notificationTemplate.getCompanyId());

		notificationContext.setSiteDefaultLocale(
			portal.getSiteDefaultLocale(notificationContext.getGroupId()));

		Map<String, String> evaluatedNotificationRecipientSettings =
			evaluateNotificationRecipientSettings(
				notificationTemplate.getCompanyId(), notificationContext,
				notificationRecipientSettings);

		String validEmailAddresses = _getValidEmailAddresses(
			notificationContext.getCompanyId(),
			evaluatedNotificationRecipientSettings.get(
				NotificationRecipientSettingConstants.NAME_TO));

		if (Validator.isNull(validEmailAddresses) &&
			(Objects.equals(
				notificationRecipientSettings.get(
					NotificationRecipientSettingConstants.NAME_TO_TYPE),
				NotificationRecipientConstants.TYPE_ROLE) ||
			 Objects.equals(
				 notificationRecipientSettings.get(
					 NotificationRecipientSettingConstants.NAME_TO_TYPE),
				 NotificationRecipientConstants.TYPE_USER_GROUP))) {

			return;
		}

		String[] emailAddresses = StringUtil.split(validEmailAddresses);

		boolean singleRecipient = GetterUtil.getBoolean(
			evaluatedNotificationRecipientSettings.get(
				NotificationRecipientSettingConstants.NAME_SINGLE_RECIPIENT));

		Map<String, User> recipientUserMap = new HashMap<>();
		Set<Locale> recipientLocales = new HashSet<>();

		for (String emailAddress : emailAddresses) {
			User recipientUser = _userLocalService.fetchUserByEmailAddress(
				notificationContext.getCompanyId(), emailAddress);

			if (recipientUser == null) {
				recipientUser = _userLocalService.getGuestUser(
					notificationContext.getCompanyId());
			}

			recipientLocales.add(recipientUser.getLocale());
			recipientUserMap.put(emailAddress, recipientUser);
		}

		Locale locale = notificationContext.getPreferredLocale();

		boolean hasTranslation = _hasTranslation(
			locale, recipientLocales, notificationTemplate.getBodyMap());

		if ((emailAddresses.length > 1) && (recipientLocales.size() > 1) &&
			hasTranslation) {

			singleRecipient = true;
		}

		Group group = _groupLocalService.fetchGroup(
			notificationContext.getGroupId());

		if (group == null) {
			group = _groupLocalService.getGroup(
				notificationContext.getCompanyId(), GroupConstants.GUEST);

			notificationContext.setGroupId(group.getGroupId());
		}

		if (!singleRecipient) {
			if (recipientLocales.size() == 1) {
				Locale recipientLocale = recipientLocales.iterator(
				).next();

				Map<Locale, String> bodyMap = notificationTemplate.getBodyMap();

				if ((bodyMap != null) &&
					Validator.isNotNull(bodyMap.get(recipientLocale)) &&
					notificationContext.isUsePreferredLanguageForGuests()) {

					notificationContext.setPreferredLocale(recipientLocale);
				}
			}

			String body = _formatBody(
				notificationTemplate.getBodyMap(), group, notificationContext);

			String subject = formatLocalizedContent(
				notificationTemplate.getSubjectMap(), notificationContext);

			prepareNotificationContext(
				_userLocalService.getGuestUser(
					notificationContext.getCompanyId()),
				body, notificationContext,
				HashMapBuilder.putAll(
					evaluatedNotificationRecipientSettings
				).put(
					NotificationRecipientSettingConstants.NAME_TO,
					validEmailAddresses
				).build(),
				subject);

			sendNotification(
				notificationQueueEntryLocalService.addNotificationQueueEntry(
					notificationContext));

			return;
		}

		for (String emailAddress : emailAddresses) {
			User recipientUser = recipientUserMap.get(emailAddress);

			Locale recipientLocale = recipientUser.getLocale();

			if (recipientUser.isGuestUser() &&
				!notificationContext.isUsePreferredLanguageForGuests()) {

				recipientLocale = recipientUser.getLocale();
			}

			notificationContext.setPreferredLocale(recipientLocale);

			String body = _formatBody(
				notificationTemplate.getBodyMap(), group, notificationContext);
			String subject = formatLocalizedContent(
				notificationTemplate.getSubjectMap(), notificationContext);

			if (FeatureFlagManagerUtil.isEnabled(
					notificationTemplate.getCompanyId(), "LPD-17564")) {

				body = StringUtil.replace(
					body, "[%EMAIL_RECIPIENT_ADDRESS%]",
					recipientUser.getDisplayEmailAddress());
				body = StringUtil.replace(
					body, "[%EMAIL_RECIPIENT_NAME%]",
					recipientUser.getFullName());
			}

			prepareNotificationContext(
				recipientUser, body, notificationContext,
				HashMapBuilder.putAll(
					evaluatedNotificationRecipientSettings
				).put(
					NotificationRecipientSettingConstants.NAME_TO, emailAddress
				).build(),
				subject);

			sendNotification(
				notificationQueueEntryLocalService.addNotificationQueueEntry(
					notificationContext));
		}
	}

	@Override
	public void sendNotification(
		NotificationQueueEntry notificationQueueEntry) {

		TransactionCommitCallbackUtil.registerCallback(
			() -> {
				try {
					Map<String, Object> notificationRecipientSettingsMap =
						NotificationRecipientSettingUtil.
							getNotificationRecipientSettingsMap(
								notificationQueueEntry);

					MailMessage mailMessage = new MailMessage(
						new InternetAddress(
							String.valueOf(
								notificationRecipientSettingsMap.get(
									NotificationRecipientSettingConstants.
										NAME_FROM)),
							String.valueOf(
								notificationRecipientSettingsMap.get(
									NotificationRecipientSettingConstants.
										NAME_FROM_NAME))),
						notificationQueueEntry.getSubject(),
						notificationQueueEntry.getBody(), true);

					_addFileAttachments(
						mailMessage,
						notificationQueueEntry.getNotificationQueueEntryId());

					mailMessage.setBCC(
						_toInternetAddresses(
							String.valueOf(
								notificationRecipientSettingsMap.get(
									NotificationRecipientSettingConstants.
										NAME_BCC))));
					mailMessage.setCC(
						_toInternetAddresses(
							String.valueOf(
								notificationRecipientSettingsMap.get(
									NotificationRecipientSettingConstants.
										NAME_CC))));
					mailMessage.setTo(
						_toInternetAddresses(
							String.valueOf(
								notificationRecipientSettingsMap.get(
									NotificationRecipientSettingConstants.
										NAME_TO))));

					MessageBusUtil.sendMessage(
						DestinationNames.MAIL, mailMessage);

					notificationQueueEntryLocalService.updateStatus(
						notificationQueueEntry.getNotificationQueueEntryId(),
						NotificationQueueEntryConstants.STATUS_SENT);
				}
				catch (Exception exception) {
					if (_log.isDebugEnabled()) {
						_log.debug(exception);
					}

					if (notificationQueueEntry.getStatus() !=
							NotificationQueueEntryConstants.STATUS_FAILED) {

						notificationQueueEntryLocalService.updateStatus(
							notificationQueueEntry.
								getNotificationQueueEntryId(),
							NotificationQueueEntryConstants.STATUS_FAILED);
					}
				}

				return null;
			});
	}

	@Override
	public Object[] toRecipients(
		List<NotificationRecipientSetting> notificationRecipientSettings) {

		return new Object[] {
			NotificationRecipientSettingUtil.toMap(
				notificationRecipientSettings)
		};
	}

	@Override
	public void validateNotificationQueueEntry(
			NotificationContext notificationContext)
		throws PortalException {

		super.validateNotificationQueueEntry(notificationContext);

		_validateNotificationRecipientSettings(
			NotificationRecipientSettingUtil.toMap(
				notificationContext.getNotificationRecipientSettings()));
	}

	@Override
	public void validateNotificationTemplate(
			NotificationContext notificationContext)
		throws PortalException {

		super.validateNotificationTemplate(notificationContext);

		_validateNotificationRecipientSettings(
			NotificationRecipientSettingUtil.toMap(
				notificationContext.getNotificationRecipientSettings()));
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
		_emailProviders.put(
			NotificationRecipientConstants.TYPE_EMAIL,
			new DefaultEmailProvider(notificationTermEvaluatorTracker));

		RoleEmailProvider roleEmailProvider = new RoleEmailProvider(
			_accountEntryLocalService, _accountEntryOrganizationRelLocalService,
			_accountEntryUserRelLocalService, _groupLocalService,
			_objectDefinitionLocalService, _objectFieldLocalService,
			_organizationLocalService, _permissionCheckerFactory,
			_resourcePermissionLocalService, _roleLocalService,
			_userGroupRoleLocalService, _userLocalService);

		_emailProviders.put(
			NotificationRecipientConstants.TYPE_ROLE, roleEmailProvider);

		_emailProviders.put(
			NotificationRecipientConstants.TYPE_SUBSCRIBERS,
			new SubscribersEmailProvider(
				_objectEntryFolderLocalService, _objectEntryLocalService,
				_subscriptionLocalService, _userLocalService));
		_emailProviders.put(
			NotificationRecipientConstants.TYPE_TERM,
			new TermEmailProvider(
				notificationTermEvaluatorTracker, _permissionCheckerFactory,
				roleEmailProvider, _roleLocalService, _userLocalService));
		_emailProviders.put(
			NotificationRecipientConstants.TYPE_USER_GROUP,
			new UserGroupEmailProvider(
				_permissionCheckerFactory, userGroupLocalService,
				_userLocalService));

		_serviceTrackerList = ServiceTrackerListFactory.open(
			bundleContext, TemplateContextContributor.class,
			"(type=" + TemplateContextContributor.TYPE_GLOBAL + ")");
	}

	@Deactivate
	protected void deactivate() {
		_serviceTrackerList.close();
	}

	private void _addFileAttachments(
		MailMessage mailMessage, long notificationQueueEntryId) {

		for (NotificationQueueEntryAttachment notificationQueueEntryAttachment :
				_notificationQueueEntryAttachmentLocalService.
					getNotificationQueueEntryNotificationQueueEntryAttachments(
						notificationQueueEntryId)) {

			try {
				FileEntry fileEntry =
					_portletFileRepository.getPortletFileEntry(
						notificationQueueEntryAttachment.getFileEntryId());

				mailMessage.addFileAttachment(
					fileEntry.getFileName(), fileEntry.getContentStream());
			}
			catch (Exception exception) {
				if (_log.isDebugEnabled()) {
					_log.debug(exception);
				}
			}
		}
	}

	private String _formatBody(
			Map<Locale, String> bodyMap, Group group,
			NotificationContext notificationContext)
		throws PortalException {

		NotificationTemplate notificationTemplate =
			notificationContext.getNotificationTemplate();

		if (Objects.equals(
				NotificationTemplateConstants.EDITOR_TYPE_RICH_TEXT,
				notificationTemplate.getEditorType())) {

			return formatLocalizedContent(bodyMap, notificationContext);
		}

		StringWriter stringWriter = new StringWriter();

		String body = notificationTemplate.getBody(
			notificationContext.getPreferredLocale());

		if (Validator.isNull(body)) {
			body = notificationTemplate.getBody(
				notificationContext.getSiteDefaultLocale());
		}

		Template template = TemplateManagerUtil.getTemplate(
			TemplateConstants.LANG_TYPE_FTL,
			new StringTemplateResource(
				NotificationTemplate.class.getName() + StringPool.POUND +
					notificationTemplate.getNotificationTemplateId(),
				body),
			!PropsValues.NOTIFICATION_EMAIL_TEMPLATE_ENABLED);

		for (TemplateContextContributor templateContextContributor :
				_serviceTrackerList) {

			templateContextContributor.prepare(template, null);
		}

		ThemeDisplay themeDisplay = new ThemeDisplay();

		themeDisplay.setLocale(notificationContext.getPreferredLocale());

		InfoItemFieldValuesProvider<Object> infoItemFieldValuesProvider =
			_infoItemServiceRegistry.getFirstInfoItemService(
				InfoItemFieldValuesProvider.class,
				notificationContext.getClassName());
		PersistedModelLocalService persistedModelLocalService =
			PersistedModelLocalServiceRegistryUtil.
				getPersistedModelLocalService(
					notificationContext.getClassName());

		HttpServletRequest httpServletRequest =
			HttpServletRequestThreadLocal.getHttpServletRequest();

		ServiceContextThreadLocal.pushServiceContext(
			_getServiceContext(group, httpServletRequest, notificationContext));

		try {
			InfoItemFieldValues infoItemFieldValues =
				infoItemFieldValuesProvider.getInfoItemFieldValues(
					persistedModelLocalService.getPersistedModel(
						notificationContext.getClassPK()));

			for (InfoFieldValue<Object> infoFieldValue :
					infoItemFieldValues.getInfoFieldValues()) {

				InfoField<?> infoField = infoFieldValue.getInfoField();

				if (StringUtil.startsWith(
						infoField.getName(),
						PortletDisplayTemplate.DISPLAY_STYLE_PREFIX)) {

					continue;
				}

				if (Objects.equals(
						infoField.getInfoFieldType(),
						RelationshipInfoFieldType.INSTANCE) &&
					(infoFieldValue.getValue() instanceof KeyValuePair)) {

					KeyValuePair keyValuePair =
						(KeyValuePair)infoFieldValue.getValue();

					infoFieldValue = new InfoFieldValue<>(
						infoField,
						GetterUtil.getObject(
							keyValuePair.getKey(), StringPool.BLANK));
				}

				TemplateNode templateNode =
					_templateNodeFactory.createTemplateNode(
						infoFieldValue, themeDisplay);

				template.put(infoField.getName(), templateNode);
				template.put(infoField.getUniqueId(), templateNode);
			}

			if (httpServletRequest != null) {
				template.put("locale", portal.getLocale(httpServletRequest));
				template.put(
					"portalURL", portal.getPortalURL(httpServletRequest));
			}
		}
		finally {
			ServiceContextThreadLocal.popServiceContext();
		}

		template.processTemplate(stringWriter);

		return stringWriter.toString();
	}

	private ServiceContext _getServiceContext(
		Group group, HttpServletRequest httpServletRequest,
		NotificationContext notificationContext) {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			serviceContext = new ServiceContext();
		}

		serviceContext = (ServiceContext)serviceContext.clone();

		serviceContext.setCompanyId(group.getCompanyId());
		serviceContext.setLanguageId(
			_language.getLanguageId(notificationContext.getPreferredLocale()));
		serviceContext.setRequest(httpServletRequest);
		serviceContext.setScopeGroupId(group.getGroupId());
		serviceContext.setUserId(notificationContext.getUserId());

		return serviceContext;
	}

	private String _getValidEmailAddresses(
		long companyId, String emailAddresses) {

		StringBundler sb = new StringBundler();

		for (String emailAddress : StringUtil.split(emailAddresses)) {
			EmailAddressValidator emailAddressValidator =
				EmailAddressValidatorFactory.getInstance();

			if (!emailAddressValidator.validate(companyId, emailAddress)) {
				if (_log.isInfoEnabled()) {
					_log.info("Invalid email address " + emailAddress);
				}

				continue;
			}

			User user = _userLocalService.fetchUserByEmailAddress(
				companyId, emailAddress);

			if ((user != null) && !user.isActive()) {
				continue;
			}

			if (sb.index() > 0) {
				sb.append(StringPool.COMMA);
			}

			sb.append(emailAddress);
		}

		return sb.toString();
	}

	private String _getValue(
			NotificationContext notificationContext,
			String notificationRecipientSettingName,
			Map<String, Object> notificationRecipientSettings)
		throws PortalException {

		EmailProvider emailProvider = _emailProviders.get(
			GetterUtil.getString(
				notificationRecipientSettings.get(
					NotificationRecipientSettingConstants.getRecipientTypeName(
						notificationRecipientSettingName)),
				NotificationRecipientConstants.TYPE_EMAIL));

		return emailProvider.provide(
			notificationContext,
			notificationRecipientSettings.get(
				notificationRecipientSettingName));
	}

	private boolean _hasTranslation(
		Locale triggerLocale, Set<Locale> recipientLocales,
		Map<Locale, String> bodyMap) {

		if (bodyMap == null) {
			return false;
		}

		for (Locale recipientLocale : recipientLocales) {
			if (!Objects.equals(recipientLocale, triggerLocale)) {
				for (Map.Entry<Locale, String> entry : bodyMap.entrySet()) {
					Locale bodyLocale = entry.getKey();

					if (Objects.equals(bodyLocale, recipientLocale) &&
						Validator.isNotNull(entry.getValue())) {

						return true;
					}
				}
			}
		}

		return false;
	}

	private InternetAddress[] _toInternetAddresses(String string)
		throws Exception {

		List<InternetAddress> internetAddresses = new ArrayList<>();

		for (String internetAddressString : StringUtil.split(string)) {
			internetAddresses.add(new InternetAddress(internetAddressString));
		}

		return internetAddresses.toArray(new InternetAddress[0]);
	}

	private void _validateNotificationRecipientSettings(
			Map<String, Object> notificationRecipientSettingsMap)
		throws PortalException {

		if (Validator.isNull(
				notificationRecipientSettingsMap.get(
					NotificationRecipientSettingConstants.NAME_FROM))) {

			throw new NotificationRecipientSettingValueException.
				FromMustNotBeNull();
		}

		if (Validator.isNull(
				notificationRecipientSettingsMap.get(
					NotificationRecipientSettingConstants.NAME_FROM_NAME))) {

			throw new NotificationRecipientSettingValueException.
				FromNameMustNotBeNull();
		}

		if (!Objects.equals(
				notificationRecipientSettingsMap.get(
					NotificationRecipientSettingConstants.NAME_TO_TYPE),
				NotificationRecipientConstants.TYPE_SUBSCRIBERS) &&
			Validator.isNull(
				notificationRecipientSettingsMap.get(
					NotificationRecipientSettingConstants.NAME_TO))) {

			throw new NotificationRecipientSettingValueException.
				ToMustNotBeNull();
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		EmailNotificationType.class);

	@Reference
	private AccountEntryLocalService _accountEntryLocalService;

	@Reference
	private AccountEntryOrganizationRelLocalService
		_accountEntryOrganizationRelLocalService;

	@Reference
	private AccountEntryUserRelLocalService _accountEntryUserRelLocalService;

	private final Map<String, EmailProvider> _emailProviders = new HashMap<>();

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private InfoItemServiceRegistry _infoItemServiceRegistry;

	@Reference
	private Language _language;

	@Reference
	private NotificationQueueEntryAttachmentLocalService
		_notificationQueueEntryAttachmentLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryFolderLocalService _objectEntryFolderLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private OrganizationLocalService _organizationLocalService;

	@Reference
	private PermissionCheckerFactory _permissionCheckerFactory;

	@Reference
	private PortletFileRepository _portletFileRepository;

	@Reference
	private ResourcePermissionLocalService _resourcePermissionLocalService;

	@Reference
	private RoleLocalService _roleLocalService;

	private volatile ServiceTrackerList<TemplateContextContributor>
		_serviceTrackerList;

	@Reference
	private SubscriptionLocalService _subscriptionLocalService;

	@Reference
	private TemplateNodeFactory _templateNodeFactory;

	@Reference
	private UserGroupRoleLocalService _userGroupRoleLocalService;

	@Reference
	private UserLocalService _userLocalService;

}