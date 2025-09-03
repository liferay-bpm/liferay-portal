/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.display.context;

import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalService;
import com.liferay.frontend.data.set.model.FDSActionDropdownItem;
import com.liferay.object.model.ObjectEntryFolder;
import com.liferay.object.service.ObjectDefinitionService;
import com.liferay.object.service.ObjectDefinitionSettingLocalService;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringUtil;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.workflow.WorkflowConstants;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

/**
 * @author Pedro Leite
 */
public class ViewRecycleBinSectionDisplayContext
	extends BaseSectionDisplayContext {

	public ViewRecycleBinSectionDisplayContext(
		DepotEntryLocalService depotEntryLocalService,
		GroupLocalService groupLocalService,
		HttpServletRequest httpServletRequest, Language language,
		ObjectDefinitionService objectDefinitionService,
		ObjectDefinitionSettingLocalService objectDefinitionSettingLocalService,
		ModelResourcePermission<ObjectEntryFolder>
			objectEntryFolderModelResourcePermission,
		Portal portal) {

		super(
			depotEntryLocalService, groupLocalService, httpServletRequest,
			language, objectDefinitionService,
			objectDefinitionSettingLocalService,
			objectEntryFolderModelResourcePermission, portal);
	}

	public Map<String, Object> getEmptyState() {
		return HashMapBuilder.<String, Object>put(
			"description",
			LanguageUtil.get(httpServletRequest, "the-recycle-bin-is-empty")
		).put(
			"image", "/states/cms_empty_state_files.svg"
		).put(
			"title", LanguageUtil.get(httpServletRequest, "no-assets-yet")
		).build();
	}

	@Override
	public List<FDSActionDropdownItem> getFDSActionDropdownItems() {
		return ListUtil.fromArray(
			new FDSActionDropdownItem(
				null, "trash", "delete",
				language.get(httpServletRequest, "delete"), "delete", "delete",
				null),
			new FDSActionDropdownItem(
				null, "restore", "restore",
				language.get(httpServletRequest, "restore"), "restore",
				"restore", null));
	}

	@Override
	protected String getCMSSectionFilterString() {
		String filter =
			"cmsKind eq 'object' and (cmsSection eq 'contents' or cmsSection " +
				"eq 'files') and status eq " +
					WorkflowConstants.STATUS_IN_TRASH;

		Long[] groupIds;

		try {
			groupIds = _getGroupIds(httpServletRequest);
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					"Unable to resolve eligible group ids", portalException);
			}

			return filter;
		}

		if (groupIds.length == 0) {
			return filter + WorkflowConstants.STATUS_ANY;
		}

		return filter + _buildGroupIdsAnyClause(groupIds);
	}

	private String _buildGroupIdsAnyClause(Long[] groupIds) {
		if (ArrayUtil.isEmpty(groupIds)) {
			return "";
		}

		StringBundler sb = new StringBundler(3);

		sb.append(" and groupIds/any(g:g in (");
		sb.append(StringUtil.merge(groupIds, ","));
		sb.append("))");

		return sb.toString();
	}

	private Long[] _getGroupIds(HttpServletRequest httpServletRequest)
		throws PortalException {

		long scopeGroupId = portal.getScopeGroupId(httpServletRequest);

		List<DepotEntry> depotEntries =
			depotEntryLocalService.getGroupConnectedDepotEntries(
				scopeGroupId, DepotConstants.TYPE_ANY, QueryUtil.ALL_POS,
				QueryUtil.ALL_POS);

		List<DepotEntry> trashEnabledDepotEntries = ListUtil.filter(
			depotEntries,
			depotEntry -> {
				Group depotGroup = groupLocalService.fetchGroup(
					depotEntry.getGroupId());

				return (depotGroup != null) && _isTrashEnabled(depotGroup);
			});

		Long[] groupIds = TransformUtil.transformToArray(
			trashEnabledDepotEntries, DepotEntry::getGroupId, Long.class);

		Group scopeGroup = groupLocalService.fetchGroup(scopeGroupId);

		if ((scopeGroup != null) && scopeGroup.isDepot() &&
			_isTrashEnabled(scopeGroup)) {

			groupIds = ArrayUtil.append(groupIds, scopeGroupId);
		}

		return groupIds;
	}

	private boolean _isTrashEnabled(Group group) {
		return Boolean.parseBoolean(
			group.getTypeSettingsProperty("trashEnabled"));
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ViewRecycleBinSectionDisplayContext.class);

}