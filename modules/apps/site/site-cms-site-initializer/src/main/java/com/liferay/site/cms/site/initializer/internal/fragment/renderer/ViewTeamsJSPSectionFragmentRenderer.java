/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.fragment.renderer;

import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.site.cms.site.initializer.internal.display.context.ViewTeamsDisplayContext;

import jakarta.servlet.http.HttpServletRequest;

import org.osgi.service.component.annotations.Component;

/**
 * @author Sam Ziemer
 */
@Component(service = FragmentRenderer.class)
public class ViewTeamsJSPSectionFragmentRenderer
	extends BaseJSPSectionFragmentRenderer<ViewTeamsDisplayContext> {

	@Override
	public String getCollectionKey() {
		return "sections";
	}

	@Override
	public String getLabelKey() {
		return "teams";
	}

	@Override
	protected ViewTeamsDisplayContext getDisplayContext(
		HttpServletRequest httpServletRequest) {

		return new ViewTeamsDisplayContext(httpServletRequest);
	}

	@Override
	protected String getJSPPath() {
		return "/view_teams.jsp";
	}

}