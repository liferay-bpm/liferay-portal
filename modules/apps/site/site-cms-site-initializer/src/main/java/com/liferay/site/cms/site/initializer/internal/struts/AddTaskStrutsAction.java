/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.struts;

import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.dto.v1_0.Status;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.service.ObjectDefinitionService;
import com.liferay.portal.kernel.struts.StrutsAction;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.HttpComponentsUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;
import com.liferay.site.cms.site.initializer.internal.util.ActionUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Gabriel Albuquerque
 */
@Component(property = "path=/cms/add_task", service = StrutsAction.class)
public class AddTaskStrutsAction implements StrutsAction {

	@Override
	public String execute(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws Exception {

		long objectDefinitionId = ParamUtil.getLong(
			httpServletRequest, "objectDefinitionId");

		ObjectDefinition objectDefinition =
			_objectDefinitionService.getObjectDefinition(objectDefinitionId);

		if (!Objects.equals(
				objectDefinition.getScope(),
				ObjectDefinitionConstants.SCOPE_DEPOT)) {

			return null;
		}

		ThemeDisplay themeDisplay =
			(ThemeDisplay)httpServletRequest.getAttribute(
				WebKeys.THEME_DISPLAY);

		ObjectEntryManager objectEntryManager =
			_objectEntryManagerRegistry.getObjectEntryManager(
				objectDefinition.getCompanyId(),
				objectDefinition.getStorageType());

		ObjectEntry objectEntry = new ObjectEntry();

		objectEntry.setObjectEntryFolderExternalReferenceCode(
			() -> ParamUtil.getString(
				httpServletRequest, "objectEntryFolderExternalReferenceCode"));
		objectEntry.setProperties(
			() -> HashMapBuilder.<String, Object>put(
				"r_cmpProjectToCMPTask_c_cmpProjectId",
				ParamUtil.getLong(httpServletRequest, "projectId")
			).build());
		objectEntry.setStatus(
			() -> new Status() {
				{
					setCode(() -> WorkflowConstants.STATUS_DRAFT);
				}
			});

		long projectGroupId = ParamUtil.getLong(
			httpServletRequest, "projectGroupId");

		objectEntry = objectEntryManager.addObjectEntry(
			new DefaultDTOConverterContext(
				false, null, null, null, null,
				themeDisplay.getSiteDefaultLocale(), null,
				themeDisplay.getUser()),
			objectDefinition, objectEntry, String.valueOf(projectGroupId));

		String editTaskURL =
			ActionUtil.getBaseEditTaskURL(objectDefinition, themeDisplay) +
				objectEntry.getId();

		editTaskURL = HttpComponentsUtil.addParameter(
			editTaskURL, "projectId",
			ParamUtil.getLong(httpServletRequest, "projectId"));

		String backURL = ParamUtil.getString(httpServletRequest, "redirect");

		if (Validator.isNotNull(backURL)) {
			editTaskURL = HttpComponentsUtil.addParameter(
				editTaskURL, "redirect", backURL);
		}

		httpServletResponse.sendRedirect(editTaskURL);

		return null;
	}

	@Reference
	private ObjectDefinitionService _objectDefinitionService;

	@Reference
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

}