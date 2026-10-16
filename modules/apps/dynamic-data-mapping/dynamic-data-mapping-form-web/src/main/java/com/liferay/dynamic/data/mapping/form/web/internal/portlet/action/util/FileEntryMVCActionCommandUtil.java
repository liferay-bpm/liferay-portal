/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.form.web.internal.portlet.action.util;

import com.liferay.document.library.kernel.model.DLFileEntry;
import com.liferay.document.library.kernel.service.DLFileEntryLocalServiceUtil;
import com.liferay.dynamic.data.mapping.constants.DDMFormConstants;
import com.liferay.dynamic.data.mapping.util.DDMFormUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.DigesterUtil;
import com.liferay.portal.kernel.util.TempFileEntryUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * @author Igor Costa
 */
public class FileEntryMVCActionCommandUtil {

	public static void deleteFileEntry(
			long fileEntryId, HttpServletRequest httpServletRequest,
			ThemeDisplay themeDisplay)
		throws PortalException {

		if (fileEntryId == 0) {
			return;
		}

		DLFileEntry dlFileEntry = DLFileEntryLocalServiceUtil.fetchDLFileEntry(
			fileEntryId);

		if (dlFileEntry == null) {
			return;
		}

		User user = DDMFormUtil.getDDMFormDefaultUser(
			themeDisplay.getCompanyId());

		if ((dlFileEntry.getUserId() != user.getUserId()) ||
			!_isTempFileEntry(dlFileEntry, httpServletRequest, user)) {

			return;
		}

		TempFileEntryUtil.deleteTempFileEntry(fileEntryId);
	}

	public static String getTempFolderName(
		HttpServletRequest httpServletRequest) {

		HttpSession httpSession = httpServletRequest.getSession();

		return DDMFormConstants.SERVICE_NAME + "-" +
			DigesterUtil.digestHex(DigesterUtil.SHA_256, httpSession.getId());
	}

	private static boolean _isTempFileEntry(
		DLFileEntry dlFileEntry, HttpServletRequest httpServletRequest,
		User user) {

		try {
			FileEntry tempFileEntry = TempFileEntryUtil.getTempFileEntry(
				dlFileEntry.getGroupId(), user.getUserId(),
				getTempFolderName(httpServletRequest), dlFileEntry.getTitle());

			if (tempFileEntry.getFileEntryId() ==
					dlFileEntry.getFileEntryId()) {

				return true;
			}

			return false;
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(portalException);
			}

			return false;
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		FileEntryMVCActionCommandUtil.class);

}