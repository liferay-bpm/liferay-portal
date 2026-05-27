/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.ai.hub.audit.constants;

/**
 * @author Pedro Leite
 */
public interface AIHubEventTypes {

	public static final String AI_HUB_AGENT_EXECUTION =
		"AI_HUB_AGENT_EXECUTION";

	public static final String AI_HUB_AGENT_FLOW_ADD = "AI_HUB_AGENT_FLOW_ADD";

	public static final String AI_HUB_AGENT_FLOW_DELETE =
		"AI_HUB_AGENT_FLOW_DELETE";

	public static final String AI_HUB_AGENT_FLOW_UPDATE =
		"AI_HUB_AGENT_FLOW_UPDATE";

	public static final String AI_HUB_REFERENCE_DATABASE_QUERY =
		"AI_HUB_REFERENCE_DATABASE_QUERY";

}