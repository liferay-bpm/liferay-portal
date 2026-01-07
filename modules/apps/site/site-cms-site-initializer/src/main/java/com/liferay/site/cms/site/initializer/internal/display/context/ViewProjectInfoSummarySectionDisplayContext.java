/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.display.context;

import com.liferay.object.model.ObjectEntry;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;

import java.io.Serializable;

import java.util.Collections;
import java.util.Map;

/**
 * @author Igor Franca
 */
public class ViewProjectInfoSummarySectionDisplayContext {

	public ViewProjectInfoSummarySectionDisplayContext(
		ObjectEntry objectEntry, ThemeDisplay themeDisplay) {

		_objectEntry = objectEntry;
		_themeDisplay = themeDisplay;
	}

	public Map<String, Object> getProperties() throws Exception {
		return HashMapBuilder.<String, Object>put(
			"dueDate", _getFieldValue("dueDate")
		).put(
			"initialState", "not started"
		).put(
			"manager",
			_getUserInfo(
				GetterUtil.getLong(
					_getFieldValue("r_projectToUserManager_userId")))
		).put(
			"sponsor",
			_getUserInfo(
				GetterUtil.getLong(
					_getFieldValue("r_projectToUserSponsor_userId")))
		).build();
	}

	private Object _getFieldValue(String fieldName) {
		Map<String, Serializable> values = _objectEntry.getValues();

		return values.get(fieldName);
	}

	private Map<String, String> _getUserInfo(long userId) throws Exception {
		User user = UserLocalServiceUtil.fetchUser(userId);

		if (user == null) {
			return Collections.emptyMap();
		}

		return HashMapBuilder.put(
			"image", user.getPortraitURL(_themeDisplay)
		).put(
			"name", user.getFullName()
		).build();
	}

	private final ObjectEntry _objectEntry;
	private final ThemeDisplay _themeDisplay;

}