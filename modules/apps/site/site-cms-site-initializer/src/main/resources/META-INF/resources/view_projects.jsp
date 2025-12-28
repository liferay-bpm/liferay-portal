<%--
/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
ViewProjectsDisplayContext viewProjectsDisplayContext = (ViewProjectsDisplayContext)request.getAttribute(ViewProjectsDisplayContext.class.getName());
%>

<div class="cms-section">
	<div>
		<react:component
			module="{Breadcrumb} from site-cms-site-initializer"
			props="<%= viewProjectsDisplayContext.getBreadcrumbProps() %>"
		/>
	</div>

	<div>
		<frontend-data-set:headless-display
			apiURL="<%= viewProjectsDisplayContext.getAPIURL() %>"
			bulkActionDropdownItems="<%= viewProjectsDisplayContext.getBulkActionDropdownItems() %>"
			creationMenu="<%= viewProjectsDisplayContext.getCreationMenu() %>"
			fdsActionDropdownItems="<%= viewProjectsDisplayContext.getFDSActionDropdownItems() %>"
			formName="fm"
			id="<%= CMSSiteInitializerFDSNames.CMP_PROJECT %>"
			itemsPerPage="<%= 20 %>"
			propsTransformer="{StructuresFDSPropsTransformer} from site-cms-site-initializer"
			selectedItemsKey="id"
			style="fluid"
		/>
	</div>
</div>