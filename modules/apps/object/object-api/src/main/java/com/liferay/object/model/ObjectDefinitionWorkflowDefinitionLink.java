/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.model;

import com.liferay.portal.kernel.model.WorkflowDefinitionLink;
import com.liferay.portal.kernel.model.WorkflowDefinitionLinkWrapper;

/**
 * @author Jhosseph Gonzalez
 */
public class ObjectDefinitionWorkflowDefinitionLink
	extends WorkflowDefinitionLinkWrapper {

	public ObjectDefinitionWorkflowDefinitionLink(
		String groupExternalReferenceCode,
		String workflowDefinitionExternalReferenceCode,
		WorkflowDefinitionLink workflowDefinitionLink) {

		super(workflowDefinitionLink);

		_groupExternalReferenceCode = groupExternalReferenceCode;
		_workflowDefinitionExternalReferenceCode =
			workflowDefinitionExternalReferenceCode;
	}

	public String getGroupExternalReferenceCode() {
		return _groupExternalReferenceCode;
	}

	public String getWorkflowDefinitionExternalReferenceCode() {
		return _workflowDefinitionExternalReferenceCode;
	}

	private final String _groupExternalReferenceCode;
	private final String _workflowDefinitionExternalReferenceCode;

}