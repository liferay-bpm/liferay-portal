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

	public static class MustNotCopyObjectEntryVersionInTrash
		extends ObjectEntryVersionStatusException {

		public MustNotCopyObjectEntryVersionInTrash() {
			super("Must not copy an Object Entry Version in trash");
		}

	}

	public static class MustNotDeleteObjectEntryVersionInTrash
		extends ObjectEntryVersionStatusException {

		public MustNotDeleteObjectEntryVersionInTrash() {
			super("Must not delete an Object Entry Version in trash");
		}

	}

	public static class MustNotExpireObjectEntryVersionInTrash
		extends ObjectEntryVersionStatusException {

		public MustNotExpireObjectEntryVersionInTrash() {
			super("Must not expire an Object Entry Version in trash");
		}

	}

	public static class MustNotRestoreObjectEntryVersionInTrash
		extends ObjectEntryVersionStatusException {

		public MustNotRestoreObjectEntryVersionInTrash() {
			super("Must not restore an Object Entry Version in trash");
		}

	}

	private ObjectEntryVersionStatusException(String msg) {
		super(msg);
	}

}