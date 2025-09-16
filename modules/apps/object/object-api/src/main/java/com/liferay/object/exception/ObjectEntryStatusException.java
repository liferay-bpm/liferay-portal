/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.exception;

import com.liferay.portal.kernel.exception.PortalException;

/**
 * @author Pedro Tavares
 */
public class ObjectEntryStatusException extends PortalException {

	public static class DraftStatusIsNotAllowed
		extends ObjectEntryStatusException {

		public DraftStatusIsNotAllowed(String msg) {
			super(msg);
		}

	}

	public static class MustNotExpireObjectEntryInTrash
		extends ObjectEntryStatusException {

		public MustNotExpireObjectEntryInTrash() {
			super("Object entries in trash must not be expired.");
		}

	}

	private ObjectEntryStatusException(String msg) {
		super(msg);
	}

	private ObjectEntryStatusException(String msg, Throwable throwable) {
		super(msg, throwable);
	}

}