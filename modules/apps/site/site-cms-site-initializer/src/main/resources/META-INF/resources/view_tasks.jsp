<%--
/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
ViewTasksDisplayContext viewTasksDisplayContext = (ViewTasksDisplayContext)request.getAttribute(ViewTasksDisplayContext.class.getName());
%>

<div class="cms-section">
	<div>
		<react:component
			module="{Breadcrumb} from site-cms-site-initializer"
			props="<%= viewTasksDisplayContext.getBreadcrumbProps() %>"
		/>
	</div>

	<div>
		<frontend-data-set:headless-display
			apiURL="<%= viewTasksDisplayContext.getAPIURL() %>"
			bulkActionDropdownItems="<%= viewTasksDisplayContext.getBulkActionDropdownItems() %>"
			creationMenu="<%= viewTasksDisplayContext.getCreationMenu() %>"
			fdsActionDropdownItems="<%= viewTasksDisplayContext.getFDSActionDropdownItems() %>"
			formName="fm"
			id="<%= CMSSiteInitializerFDSNames.CMP_TASK %>"
			itemsPerPage="<%= 20 %>"
			propsTransformer="{StructuresFDSPropsTransformer} from site-cms-site-initializer"
			selectedItemsKey="id"
			style="fluid"
		/>
	</div>
</div>