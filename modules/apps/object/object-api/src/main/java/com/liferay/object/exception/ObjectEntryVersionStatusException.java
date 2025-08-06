/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.exception;

import com.liferay.portal.kernel.exception.PortalException;

/**
 * @author Marco Leo
 */
public class ObjectEntryVersionStatusException extends PortalException {

	public static class CannotCopyEntryInTrash
		extends ObjectEntryVersionStatusException {

		public CannotCopyEntryInTrash(String message) {
			super(message);
		}

	}

	public static class CannotDeleteEntryInTrash
		extends ObjectEntryVersionStatusException {

		public CannotDeleteEntryInTrash(String message) {
			super(message);
		}

	}

	public static class CannotExpireEntryInTrash
		extends ObjectEntryVersionStatusException {

		public CannotExpireEntryInTrash(String message) {
			super(message);
		}

	}

	public static class CannotRestoreEntryInTrash
		extends ObjectEntryVersionStatusException {

		public CannotRestoreEntryInTrash(String message) {
			super(message);
		}

	}

	private ObjectEntryVersionStatusException(String msg) {
		super(msg);
	}

}