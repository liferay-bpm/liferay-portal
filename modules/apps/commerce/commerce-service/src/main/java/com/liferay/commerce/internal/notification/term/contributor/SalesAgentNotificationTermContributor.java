/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.commerce.internal.notification.term.contributor;

import com.liferay.notification.term.contributor.NotificationTermContributor;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * @author Luca Pellizzon
 */
public class SalesAgentNotificationTermContributor
	implements NotificationTermContributor {

	@Override
	public Map<String, String> contributeTerms() {
		Map<String, String> terms = new HashMap<String, String>();

			terms.put(
				"sales-agent", "[%SALES_AGENT%]"
			);

		return terms;
	}

}