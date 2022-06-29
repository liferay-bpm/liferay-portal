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

package com.liferay.notification.web.internal.display.context;

import com.liferay.frontend.data.set.model.FDSActionDropdownItem;
import com.liferay.frontend.taglib.clay.servlet.taglib.util.CreationMenu;
import com.liferay.notification.constants.NotificationActionKeys;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.web.internal.display.context.helper.NotificationRequestHelper;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.portlet.PortletURLUtil;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.security.permission.resource.PortletResourcePermission;

import java.util.Arrays;
import java.util.List;

import javax.portlet.PortletException;
import javax.portlet.PortletURL;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Paulo Albuquerque
 */
public class ViewNotificationQueueEntryDisplayContext {

	public ViewNotificationQueueEntryDisplayContext(
		HttpServletRequest httpServletRequest,
		ModelResourcePermission<NotificationTemplate>
			notificationTemplateModelResourcePermission) {

		_notificationTemplateModelResourcePermission =
			notificationTemplateModelResourcePermission;

		_notificationRequestHelper = new NotificationRequestHelper(
			httpServletRequest);
	}

	public String getAPIURL() {
		return "/o/notification/v1.0/notification-queue-entry";
	}

	public CreationMenu getCreationMenu() {
		CreationMenu creationMenu = new CreationMenu();

		if (!_hasAddNotificationTemplatePermission()) {
			return creationMenu;
		}

		return creationMenu.addDropdownItem(
			dropdownItem -> {
				dropdownItem.setHref(
					_getPortletURL(), "mvcRenderCommandName",
					"/notification_templates/edit_notification_template",
					"backURL", _notificationRequestHelper.getCurrentURL());
				dropdownItem.setLabel(
					LanguageUtil.get(
						_notificationRequestHelper.getRequest(),
						"add-notification-template"));
			});
	}

	public List<FDSActionDropdownItem> getFDSActionDropdownItems()
		throws Exception {

		return Arrays.asList(
			new FDSActionDropdownItem(
				getAPIURL() + "/{id}/resend", null, "put",
				LanguageUtil.get(
					_notificationRequestHelper.getRequest(), "resend"),
				"put", null, "async"),
			new FDSActionDropdownItem(
				getAPIURL() + "/{id}", "trash", "delete",
				LanguageUtil.get(
					_notificationRequestHelper.getRequest(), "delete"),
				"delete", "delete", "async"));
	}

	private PortletURL _getPortletURL() throws PortletException {
		return PortletURLUtil.clone(
			PortletURLUtil.getCurrent(
				_notificationRequestHelper.getLiferayPortletRequest(),
				_notificationRequestHelper.getLiferayPortletResponse()),
			_notificationRequestHelper.getLiferayPortletResponse());
	}

	private boolean _hasAddNotificationTemplatePermission() {
		PortletResourcePermission portletResourcePermission =
			_notificationTemplateModelResourcePermission.
				getPortletResourcePermission();

		return portletResourcePermission.contains(
			_notificationRequestHelper.getPermissionChecker(), null,
			NotificationActionKeys.ADD_NOTIFICATION_TEMPLATE);
	}

	private final NotificationRequestHelper _notificationRequestHelper;
	private final ModelResourcePermission<NotificationTemplate>
		_notificationTemplateModelResourcePermission;

}