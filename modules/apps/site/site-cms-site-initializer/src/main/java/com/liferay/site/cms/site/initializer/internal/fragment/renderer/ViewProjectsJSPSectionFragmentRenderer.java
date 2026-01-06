/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.fragment.renderer;

import com.liferay.depot.service.DepotEntryLocalService;
import com.liferay.document.library.configuration.DLConfiguration;
import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntryFolder;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectDefinitionService;
import com.liferay.object.service.ObjectDefinitionSettingLocalService;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.site.cms.site.initializer.internal.display.context.ViewProjectsDisplayContext;
import com.liferay.translation.exporter.TranslationInfoItemFieldValuesExporterRegistry;

import jakarta.servlet.http.HttpServletRequest;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Sam Ziemer
 */
@Component(service = FragmentRenderer.class)
public class ViewProjectsJSPSectionFragmentRenderer
	extends BaseJSPSectionFragmentRenderer<ViewProjectsDisplayContext> {

	@Override
	public String getCollectionKey() {
		return "sections";
	}

	@Override
	public String getLabelKey() {
		return "projects";
	}

	@Override
	protected ViewProjectsDisplayContext getDisplayContext(
		HttpServletRequest httpServletRequest) {

		ThemeDisplay themeDisplay =
			(ThemeDisplay)httpServletRequest.getAttribute(
				WebKeys.THEME_DISPLAY);

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.
				fetchObjectDefinitionByExternalReferenceCode(
					"L_CMP_PROJECT", themeDisplay.getCompanyId());

		if (objectDefinition == null) {
			return null;
		}

		return new ViewProjectsDisplayContext(
			_depotEntryLocalService, _dlConfiguration, groupLocalService,
			httpServletRequest, language, objectDefinition,
			_objectDefinitionService, _objectDefinitionSettingLocalService,
			_objectEntryFolderModelResourcePermission, _portal,
			_translationInfoItemFieldValuesExporterRegistry);
	}

	@Override
	protected String getJSPPath() {
		return "/view_projects.jsp";
	}

	@Reference
	private DepotEntryLocalService _depotEntryLocalService;

	private volatile DLConfiguration _dlConfiguration;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectDefinitionService _objectDefinitionService;

	@Reference
	private ObjectDefinitionSettingLocalService
		_objectDefinitionSettingLocalService;

	@Reference(
		target = "(model.class.name=com.liferay.object.model.ObjectEntryFolder)"
	)
	private ModelResourcePermission<ObjectEntryFolder>
		_objectEntryFolderModelResourcePermission;

	@Reference
	private Portal _portal;

	@Reference
	private TranslationInfoItemFieldValuesExporterRegistry
		_translationInfoItemFieldValuesExporterRegistry;

}