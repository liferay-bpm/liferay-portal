/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.dto.v1_0.util;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.util.StringUtil;

/**
 * @author Paulo Albuquerque
 */
public class ObjectEntryTestUtil {

	public static String buildEqualsExpressionFilterString(
		String fieldName, Object value) {

		return StringBundler.concat(fieldName, " eq ", getValue(value));
	}

	public static Object getValue(Object value) {
		if (value instanceof String) {
			return StringUtil.quote(String.valueOf(value));
		}

		return value;
	}

}