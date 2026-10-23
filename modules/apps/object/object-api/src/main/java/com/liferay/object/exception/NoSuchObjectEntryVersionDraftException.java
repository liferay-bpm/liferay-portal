/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.exception;

import com.liferay.portal.kernel.exception.NoSuchModelException;

/**
 * @author Marco Leo
 */
public class NoSuchObjectEntryVersionDraftException
	extends NoSuchModelException {

	public NoSuchObjectEntryVersionDraftException() {
	}

	public NoSuchObjectEntryVersionDraftException(String msg) {
		super(msg);
	}

	public NoSuchObjectEntryVersionDraftException(
		String msg, Throwable throwable) {

		super(msg, throwable);
	}

	public NoSuchObjectEntryVersionDraftException(Throwable throwable) {
		super(throwable);
	}

}