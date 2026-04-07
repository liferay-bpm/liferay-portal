/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.field.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Yuri Monteiro
 */
public class PhoneNumberObjectFieldValueUtil {

	public static boolean isValid(String phoneNumber) {
		if (phoneNumber == null) {
			return false;
		}

		Matcher matcher = _phoneNumberPattern.matcher(phoneNumber);

		if (!matcher.matches()) {
			return false;
		}

		int digitsCount = 0;

		for (int i = 0; i < phoneNumber.length(); i++) {
			if (Character.isDigit(phoneNumber.charAt(i))) {
				digitsCount++;
			}
		}

		if ((digitsCount >= 7) && (digitsCount <= 15)) {
			return true;
		}

		return false;
	}

	private PhoneNumberObjectFieldValueUtil() {
	}

	private static final Pattern _phoneNumberPattern = Pattern.compile(
		"^\\+[0-9\\s\\-().]{1,50}$");

}