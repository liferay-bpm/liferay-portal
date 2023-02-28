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

package com.liferay.notification.web.internal.portlet.action;

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.StringUtil;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;

import org.osgi.service.component.annotations.Reference;

/**
 * @author Mateus Santana
 */
public abstract class BaseNotificationTemplateTermsMVCResourceCommand
	extends BaseMVCResourceCommand {

	public enum UserTerm {

		AUTHOR_EMAIL("author-email-address", "AUTHOR_EMAIL"),
		AUTHOR_FIRST_NAME("author-first-name", "AUTHOR_FIRSTNAME"),
		AUTHOR_ID("author-id", "AUTHOR_ID"),
		AUTHOR_LAST_NAME("author-last-name", "AUTHOR_LASTNAME"),
		AUTHOR_MIDDLE_NAME("author-middle-name", "AUTHOR_MIDDLENAME"),
		AUTHOR_PREFIX("author-prefix", "AUTHOR_PREFIX"),
		AUTHOR_SUFFIX("author-suffix", "AUTHOR_SUFFIX"),
		CURRENT_USER_EMAIL("current-user-email-address", "CURRENTUSER_EMAIL"),
		CURRENT_USER_FIRST_NAME(
			"current-user-first-name", "CURRENTUSER_FIRSTNAME"),
		CURRENT_USER_ID("current-user-id", "CURRENTUSER_ID"),
		CURRENT_USER_LAST_NAME(
			"current-user-last-name", "CURRENTUSER_LASTNAME"),
		CURRENT_USER_MIDDLE_NAME(
			"current-user-middle-name", "CURRENTUSER_MIDDLENAME"),
		CURRENT_USER_PREFIX("current-user-prefix", "CURRENTUSER_PREFIX"),
		CURRENT_USER_SUFFIX("current-user-suffix", "CURRENTUSER_SUFFIX");

		public static Map<String, String> getAuthorTermMap() {
			Map<String, String> map = new LinkedHashMap<>();

			for (UserTerm userTerm : values()) {
				if (StringUtil.startsWith(userTerm._key, "author")) {
					map.put(userTerm._key, userTerm._name);
				}
			}

			return map;
		}

		public static Map<String, String> getCurrentUserTermMap() {
			Map<String, String> map = new LinkedHashMap<>();

			for (UserTerm userTerm : values()) {
				if (StringUtil.startsWith(userTerm._key, "current-user")) {
					map.put(userTerm._key, userTerm._name);
				}
			}

			return map;
		}

		public static String getTermName(String key) {
			for (UserTerm userTerm : values()) {
				if (StringUtil.equals(key, userTerm._key)) {
					return userTerm._name;
				}
			}

			return StringPool.BLANK;
		}

		private UserTerm(String key, String name) {
			_key = key;
			_name = name;
		}

		private final String _key;
		private final String _name;

	}

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws Exception {

		JSONArray jsonArray = jsonFactory.createJSONArray();

		user = userLocalService.getUser(PrincipalThreadLocal.getUserId());

		for (Map.Entry<String, String> entry : getEntrySet()) {
			jsonArray.put(
				JSONUtil.put(
					"name",
					() -> {
						if (StringUtil.equals(
								language.get(user.getLocale(), entry.getKey()),
								entry.getKey())) {

							return entry.getKey();
						}

						return language.get(user.getLocale(), entry.getKey());
					}
				).put(
					"term", getTermName(entry.getValue())
				));
		}

		JSONPortletResponseUtil.writeJSON(
			resourceRequest, resourceResponse, jsonArray);
	}

	protected abstract Set<Map.Entry<String, String>> getEntrySet();

	protected abstract String getTermName(String value);

	@Reference
	protected JSONFactory jsonFactory;

	@Reference
	protected Language language;

	protected User user;

	@Reference
	protected UserLocalService userLocalService;

}