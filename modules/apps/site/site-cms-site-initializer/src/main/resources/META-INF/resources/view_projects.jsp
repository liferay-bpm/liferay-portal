<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
ViewProjectsDisplayContext viewProjectsDisplayContext = (ViewProjectsDisplayContext)request.getAttribute(ViewProjectsDisplayContext.class.getName());
%>

<div>
	<div>
		<react:component
			module="{Breadcrumb} from site-cms-site-initializer"
			props="<%= viewProjectsDisplayContext.getBreadcrumbProps() %>"
		/>
	</div>

	<div class="cms-section custom-empty-state">
		<frontend-data-set:headless-display
			additionalProps="<%= viewProjectsDisplayContext.getAdditionalProps() %>"
			apiURL="<%= viewProjectsDisplayContext.getAPIURL() %>"
			bulkActionDropdownItems="<%= viewProjectsDisplayContext.getBulkActionDropdownItems() %>"
			creationMenu="<%= viewProjectsDisplayContext.getCreationMenu() %>"
			emptyState="<%= viewProjectsDisplayContext.getEmptyState() %>"
			fdsActionDropdownItems="<%= viewProjectsDisplayContext.getFDSActionDropdownItems() %>"
			formName="fm"
			id="<%= CMSSiteInitializerFDSNames.CMP_PROJECT %>"
			itemsPerPage="<%= 20 %>"
			propsTransformer="{AssetsFDSPropsTransformer} from site-cms-site-initializer"
			selectedItemsKey="embedded.id"
		/>
	</div>
</div>