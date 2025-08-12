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

		public DraftStatusIsNotAllowed() {
		}

		public DraftStatusIsNotAllowed(String msg) {
			super(msg);
		}

		public DraftStatusIsNotAllowed(String msg, Throwable throwable) {
			super(msg, throwable);
		}

		public DraftStatusIsNotAllowed(Throwable throwable) {
			super(throwable);
		}

	}

	public static class MustNotExpireObjectEntryInTrash
		extends ObjectEntryStatusException {

		public MustNotExpireObjectEntryInTrash() {
		}

		public MustNotExpireObjectEntryInTrash(String msg) {
			super(msg);
		}

		public MustNotExpireObjectEntryInTrash(
			String msg, Throwable throwable) {

			super(msg, throwable);
		}

		public MustNotExpireObjectEntryInTrash(Throwable throwable) {
			super(throwable);
		}

	}

	protected ObjectEntryStatusException() {
	}

	protected ObjectEntryStatusException(String msg) {
		super(msg);
	}

	protected ObjectEntryStatusException(String msg, Throwable throwable) {
		super(msg, throwable);
	}

	protected ObjectEntryStatusException(Throwable throwable) {
		super(throwable);
	}

}