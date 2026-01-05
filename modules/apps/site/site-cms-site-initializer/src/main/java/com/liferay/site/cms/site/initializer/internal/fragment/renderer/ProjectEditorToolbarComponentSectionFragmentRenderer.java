/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.fragment.renderer;

import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.fragment.renderer.FragmentRendererContext;
import com.liferay.portal.kernel.util.Constants;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ParamUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import java.util.Map;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;

/**
 * @author Igor Franca
 */
@Component(service = FragmentRenderer.class)
public class ProjectEditorToolbarComponentSectionFragmentRenderer
	extends BaseComponentSectionFragmentRenderer {

	@Override
	public String getCollectionKey() {
		return "project-editor";
	}

	@Override
	public void render(
			FragmentRendererContext fragmentRendererContext,
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		String layoutMode = ParamUtil.getString(
			httpServletRequest, "p_l_mode", Constants.VIEW);

		if (Objects.equals(layoutMode, Constants.READ)) {
			return;
		}

		super.render(
			fragmentRendererContext, httpServletRequest, httpServletResponse);
	}

	@Override
	protected String getLabelKey() {
		return "project-editor-management-bar";
	}

	@Override
	protected String getModuleName() {
		return "ProjectEditorToolbar";
	}

	@Override
	protected Map<String, Object> getProps(
		FragmentRendererContext fragmentRendererContext,
		HttpServletRequest httpServletRequest) {

		HashMapBuilder.HashMapWrapper<String, Object> hashMapWrapper =
			HashMapBuilder.<String, Object>put(
				"backURL", ParamUtil.getString(httpServletRequest, "redirect"));

		return hashMapWrapper.build();
	}

}