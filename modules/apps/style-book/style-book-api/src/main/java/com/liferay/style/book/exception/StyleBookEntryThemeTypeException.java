/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.style.book.exception;

import com.liferay.portal.kernel.exception.PortalException;

/**
 * @author Thiago Buarque
 */
public class StyleBookEntryThemeTypeException extends PortalException {

	public static class MustNotBeNull extends StyleBookEntryThemeTypeException {

		public MustNotBeNull() {
			super("Theme type must not be null");
		}

	}

	private StyleBookEntryThemeTypeException(String msg) {
		super(msg);
	}

}