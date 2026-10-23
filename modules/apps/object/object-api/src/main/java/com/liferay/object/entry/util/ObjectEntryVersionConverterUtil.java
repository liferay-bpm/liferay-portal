/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.entry.util;

import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.service.ObjectEntryVersionLocalServiceUtil;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.DateUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;

import java.util.Date;

/**
 * @author Carolina Barbosa
 */
public class ObjectEntryVersionConverterUtil {

	public static ObjectEntryVersion toObjectEntryVersion(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		if (objectEntryVersionDraft == null) {
			return null;
		}

		ObjectEntryVersion objectEntryVersion =
			ObjectEntryVersionLocalServiceUtil.createObjectEntryVersion(0);

		objectEntryVersion.setCompanyId(objectEntryVersionDraft.getCompanyId());
		objectEntryVersion.setUserId(objectEntryVersionDraft.getUserId());
		objectEntryVersion.setUserName(objectEntryVersionDraft.getUserName());
		objectEntryVersion.setCreateDate(
			objectEntryVersionDraft.getCreateDate());
		objectEntryVersion.setModifiedDate(
			objectEntryVersionDraft.getModifiedDate());
		objectEntryVersion.setObjectDefinitionId(
			objectEntryVersionDraft.getObjectDefinitionId());
		objectEntryVersion.setObjectEntryId(
			objectEntryVersionDraft.getObjectEntryId());
		objectEntryVersion.setContent(objectEntryVersionDraft.getContent());

		try {
			JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
				objectEntryVersionDraft.getContent());

			objectEntryVersion.setDisplayDate(
				_parseDate(jsonObject.getString("displayDate")));
			objectEntryVersion.setExpirationDate(
				_parseDate(jsonObject.getString("expirationDate")));
			objectEntryVersion.setReviewDate(
				_parseDate(jsonObject.getString("reviewDate")));
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}
		}

		objectEntryVersion.setVersion(objectEntryVersionDraft.getVersion());
		objectEntryVersion.setStatus(objectEntryVersionDraft.getStatus());

		return objectEntryVersion;
	}

	private static Date _parseDate(String dateString) throws Exception {
		if (Validator.isNull(dateString)) {
			return null;
		}

		return DateUtil.parseDate(
			"yyyy-MM-dd'T'HH:mm:ss'Z'", dateString,
			LocaleUtil.getSiteDefault());
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectEntryVersionConverterUtil.class);

}