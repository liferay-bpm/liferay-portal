/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.admin.taxonomy.internal.resource.v1_0;

import com.liferay.asset.kernel.model.AssetTag;
import com.liferay.asset.kernel.model.AssetTagGroupRel;
import com.liferay.asset.kernel.service.AssetTagGroupRelLocalService;
import com.liferay.asset.kernel.service.AssetTagLocalService;
import com.liferay.asset.kernel.service.AssetTagService;
import com.liferay.asset.tags.constants.AssetTagsAdminPortletKeys;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryService;
import com.liferay.exportimport.constants.ExportImportConstants;
import com.liferay.exportimport.vulcan.batch.engine.ExportImportVulcanBatchEngineTaskItemDelegate;
import com.liferay.headless.admin.taxonomy.dto.v1_0.Keyword;
import com.liferay.headless.admin.taxonomy.internal.odata.entity.v1_0.KeywordEntityModel;
import com.liferay.headless.admin.taxonomy.internal.util.TaxonomyGroupUtil;
import com.liferay.headless.admin.taxonomy.resource.v1_0.KeywordResource;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.dao.orm.DynamicQuery;
import com.liferay.portal.kernel.dao.orm.OrderFactoryUtil;
import com.liferay.portal.kernel.dao.orm.ProjectionFactoryUtil;
import com.liferay.portal.kernel.dao.orm.ProjectionList;
import com.liferay.portal.kernel.dao.orm.RestrictionsFactoryUtil;
import com.liferay.portal.kernel.dao.orm.Type;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.model.UserConstants;
import com.liferay.portal.kernel.search.BooleanClauseOccur;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.search.Sort;
import com.liferay.portal.kernel.search.filter.BooleanFilter;
import com.liferay.portal.kernel.search.filter.ExistsFilter;
import com.liferay.portal.kernel.search.filter.Filter;
import com.liferay.portal.kernel.search.filter.TermsFilter;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.odata.entity.EntityModel;
import com.liferay.portal.vulcan.aggregation.Aggregation;
import com.liferay.portal.vulcan.dto.converter.DTOConverter;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;
import com.liferay.portal.vulcan.util.SearchUtil;
import com.liferay.portlet.asset.model.impl.AssetTagImpl;
import com.liferay.portlet.asset.service.permission.AssetTagsPermission;

import jakarta.ws.rs.core.MultivaluedMap;

import java.util.Date;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;
import org.osgi.service.component.annotations.ServiceScope;

/**
 * @author Javier Gamarra
 */
@Component(
	properties = "OSGI-INF/liferay/rest/v1_0/keyword.properties",
	property = "export.import.vulcan.batch.engine.task.item.delegate=true",
	scope = ServiceScope.PROTOTYPE, service = KeywordResource.class
)
public class KeywordResourceImpl
	extends BaseKeywordResourceImpl
	implements ExportImportVulcanBatchEngineTaskItemDelegate<Keyword> {

	@Override
	public void deleteAssetLibraryKeywordByExternalReferenceCode(
			Long assetLibraryId, String externalReferenceCode)
		throws Exception {

		AssetTag assetTag = _assetTagService.getAssetTagByExternalReferenceCode(
			externalReferenceCode, assetLibraryId);

		_assetTagService.deleteTag(assetTag.getTagId());
	}

	@Override
	public void deleteKeyword(Long keywordId) throws Exception {
		_assetTagService.deleteTag(keywordId);
	}

	@Override
	public void deleteSiteKeywordByExternalReferenceCode(
			Long siteId, String externalReferenceCode)
		throws Exception {

		AssetTag assetTag = _assetTagService.getAssetTagByExternalReferenceCode(
			externalReferenceCode, siteId);

		_assetTagService.deleteTag(assetTag.getTagId());
	}

	@Override
	public Keyword getAssetLibraryKeywordByExternalReferenceCode(
			Long assetLibraryId, String externalReferenceCode)
		throws Exception {

		return _toKeyword(
			_assetTagLocalService.getAssetTagByExternalReferenceCode(
				externalReferenceCode, assetLibraryId));
	}

	@Override
	public Page<Keyword> getAssetLibraryKeywordsPage(
			Long assetLibraryId, String search, Aggregation aggregation,
			Filter filter, Pagination pagination, Sort[] sorts)
		throws Exception {

		return _getKeywordsPage(
			HashMapBuilder.put(
				"create",
				addAction(
					ActionKeys.MANAGE_TAG, "postAssetLibraryKeyword",
					AssetTagsPermission.RESOURCE_NAME, assetLibraryId)
			).put(
				"createBatch",
				addAction(
					ActionKeys.MANAGE_TAG, "postAssetLibraryKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, assetLibraryId)
			).put(
				"deleteBatch",
				addAction(
					ActionKeys.DELETE, "deleteKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, null)
			).put(
				"get",
				addAction(
					ActionKeys.MANAGE_TAG, "getAssetLibraryKeywordsPage",
					AssetTagsPermission.RESOURCE_NAME, assetLibraryId)
			).put(
				"updateBatch",
				addAction(
					ActionKeys.UPDATE, "putKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, null)
			).build(),
			assetLibraryId, search, aggregation, filter, pagination, sorts);
	}

	@Override
	public EntityModel getEntityModel(MultivaluedMap multivaluedMap) {
		return _entityModel;
	}

	@Override
	public ExportImportDescriptor<AssetTag> getExportImportDescriptor() {
		return new ExportImportDescriptor<>() {

			@Override
			public String getKey() {
				return KeywordResourceImpl.class.getName();
			}

			@Override
			public String getLabelLanguageKey() {
				return "tags";
			}

			@Override
			public Class<AssetTag> getModelClass() {
				return AssetTag.class;
			}

			@Override
			public String getPortletId() {
				return AssetTagsAdminPortletKeys.ASSET_TAGS_ADMIN;
			}

			@Override
			public Scope getScope() {
				return Scope.SITE;
			}

			@Override
			public String getSectionKey() {
				return ExportImportConstants.SECTION_KEY_CONTENT_AND_DATA;
			}

			@Override
			public boolean isStagingSupported() {
				return true;
			}

		};
	}

	@Override
	public Keyword getKeyword(Long keywordId) throws Exception {
		return _toKeyword(_assetTagService.getTag(keywordId));
	}

	@Override
	public Page<Keyword> getKeywordsRankedPage(
		String search, Long siteId, Pagination pagination) {

		DynamicQuery dynamicQuery = _assetTagLocalService.dynamicQuery();

		dynamicQuery.add(
			RestrictionsFactoryUtil.eq(
				"companyId", contextCompany.getCompanyId()));

		if (siteId != null) {
			dynamicQuery.add(RestrictionsFactoryUtil.eq("groupId", siteId));
		}

		if (!Validator.isBlank(search)) {
			dynamicQuery.add(
				RestrictionsFactoryUtil.ilike(
					"name", StringUtil.quote(search, StringPool.PERCENT)));
		}

		dynamicQuery.addOrder(OrderFactoryUtil.desc("assetCount"));
		dynamicQuery.setProjection(_getProjectionList());

		return Page.of(
			transform(
				transform(
					_assetTagLocalService.dynamicQuery(
						dynamicQuery, pagination.getStartPosition(),
						pagination.getEndPosition()),
					this::_toAssetTag),
				this::_toKeyword),
			pagination, _getTotalCount(search, siteId));
	}

	@Override
	public Keyword getSiteKeywordByExternalReferenceCode(
			Long siteId, String externalReferenceCode)
		throws Exception {

		return _toKeyword(
			_assetTagService.getAssetTagByExternalReferenceCode(
				externalReferenceCode, siteId));
	}

	@Override
	public Page<Keyword> getSiteKeywordsPage(
			Long siteId, String search, Aggregation aggregation, Filter filter,
			Pagination pagination, Sort[] sorts)
		throws Exception {

		return _getKeywordsPage(
			HashMapBuilder.put(
				"create",
				addAction(
					ActionKeys.MANAGE_TAG, "postSiteKeyword",
					AssetTagsPermission.RESOURCE_NAME, siteId)
			).put(
				"createBatch",
				addAction(
					ActionKeys.MANAGE_TAG, "postSiteKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, siteId)
			).put(
				"deleteBatch",
				addAction(
					ActionKeys.DELETE, "deleteKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, null)
			).put(
				"get",
				addAction(
					ActionKeys.MANAGE_TAG, "getSiteKeywordsPage",
					AssetTagsPermission.RESOURCE_NAME, siteId)
			).put(
				"updateBatch",
				addAction(
					ActionKeys.UPDATE, "putKeywordBatch",
					AssetTagsPermission.RESOURCE_NAME, null)
			).build(),
			siteId, search, aggregation, filter, pagination, sorts);
	}

	@Override
	public Keyword patchSiteKeyword(Long siteId, Keyword keyword)
		throws Exception {

		return _patchSiteKeyword(
			keyword.getExternalReferenceCode(), keyword, siteId);
	}

	@Override
	public Keyword patchSiteKeywordByExternalReferenceCode(
			Long siteId, String externalReferenceCode, Keyword keyword)
		throws Exception {

		return _patchSiteKeyword(externalReferenceCode, keyword, siteId);
	}

	@Override
	public Keyword postAssetLibraryKeyword(Long assetLibraryId, Keyword keyword)
		throws Exception {

		return postSiteKeyword(assetLibraryId, keyword);
	}

	@Override
	public Keyword postSiteKeyword(Long siteId, Keyword keyword)
		throws Exception {

		return _postSiteKeyword(
			keyword.getExternalReferenceCode(), keyword, siteId);
	}

	@Override
	public Keyword putAssetLibraryKeywordByExternalReferenceCode(
			Long assetLibraryId, String externalReferenceCode, Keyword keyword)
		throws Exception {

		AssetTag assetTag =
			_assetTagService.fetchAssetTagByExternalReferenceCode(
				externalReferenceCode, assetLibraryId);

		if (assetTag != null) {
			return _toKeyword(
				_assetTagService.updateTag(
					externalReferenceCode, assetTag.getTagId(),
					keyword.getName(), null));
		}

		return _postSiteKeyword(externalReferenceCode, keyword, assetLibraryId);
	}

	@Override
	public Keyword putKeyword(Long keywordId, Keyword keyword)
		throws Exception {

		AssetTag assetTag = _assetTagService.updateTag(
			keyword.getExternalReferenceCode(), keywordId, keyword.getName(),
			null);

		_setAssetTagGroupRels(assetTag, keyword);

		return _toKeyword(assetTag);
	}

	@Override
	public void putKeywordMerge(Long toKeywordId, Long[] fromKeywordIds)
		throws Exception {

		AssetTag assetTag = _assetTagService.getTag(toKeywordId);

		for (long fromKeywordId : fromKeywordIds) {
			_assetTagService.mergeTags(fromKeywordId, toKeywordId);
		}

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			assetTag.getTagId(),
			new long[] {GroupConstants.ANY_PARENT_GROUP_ID},
			DepotConstants.TYPE_SPACE);
	}

	@Override
	public void putKeywordSubscribe(Long keywordId) throws Exception {
		AssetTag assetTag = _assetTagLocalService.getAssetTag(keywordId);

		_assetTagService.subscribeTag(
			contextUser.getUserId(), assetTag.getGroupId(), keywordId);
	}

	@Override
	public void putKeywordUnsubscribe(Long keywordId) throws Exception {
		_assetTagService.unsubscribeTag(contextUser.getUserId(), keywordId);
	}

	@Override
	public Keyword putSiteKeywordByExternalReferenceCode(
			Long siteId, String externalReferenceCode, Keyword keyword)
		throws Exception {

		AssetTag assetTag =
			_assetTagLocalService.fetchAssetTagByExternalReferenceCode(
				externalReferenceCode, siteId);

		if (assetTag == null) {
			assetTag = _assetTagLocalService.fetchTag(
				siteId, keyword.getName());
		}

		if (assetTag != null) {
			return _toKeyword(
				_assetTagService.updateTag(
					externalReferenceCode, assetTag.getTagId(),
					keyword.getName(), null));
		}

		return _postSiteKeyword(externalReferenceCode, keyword, siteId);
	}

	@Override
	protected Long getPermissionCheckerGroupId(Object id) throws Exception {
		AssetTag assetTag = _assetTagService.getTag((Long)id);

		return assetTag.getGroupId();
	}

	@Override
	protected String getPermissionCheckerPortletName(Object id) {
		return AssetTagsPermission.RESOURCE_NAME;
	}

	@Override
	protected String getPermissionCheckerResourceName(Object id) {
		return AssetTagsPermission.RESOURCE_NAME;
	}

	private AssetTag _addAssetTag(
			String externalReferenceCode, Group group, Keyword keyword,
			Long siteId)
		throws Exception {

		if (!group.isCMS()) {
			return _assetTagService.addTag(
				externalReferenceCode, siteId, keyword.getName(),
				new ServiceContext());
		}

		long[] projectGroupIds = new long[0];

		if (FeatureFlagManagerUtil.isEnabled(
				group.getCompanyId(), "LPD-99403")) {

			projectGroupIds = _getValidatedProjectGroupIds(
				group.getCompanyId(), keyword);

			for (long projectGroupId : projectGroupIds) {
				if (projectGroupId == GroupConstants.ANY_PARENT_GROUP_ID) {
					continue;
				}

				AssetTagsPermission.check(
					PermissionThreadLocal.getPermissionChecker(),
					projectGroupId, ActionKeys.MANAGE_TAG);
			}
		}

		AssetTag assetTag = _reuseAssetTag(
			externalReferenceCode, keyword, projectGroupIds, siteId);

		if (assetTag != null) {
			return assetTag;
		}

		long[] assetLibraryGroupIds = TaxonomyGroupUtil.getAssetLibraryGroupIds(
			keyword.getAssetLibraries(), group.getCompanyId());

		if (ArrayUtil.isEmpty(keyword.getAssetLibraries())) {
			assetTag = _assetTagService.addTag(
				externalReferenceCode, siteId, keyword.getName(),
				new ServiceContext());
		}
		else {
			for (long assetLibraryGroupId : assetLibraryGroupIds) {
				AssetTagsPermission.check(
					PermissionThreadLocal.getPermissionChecker(),
					assetLibraryGroupId, ActionKeys.MANAGE_TAG);
			}

			assetTag = _assetTagLocalService.addTag(
				externalReferenceCode, contextUser.getUserId(), siteId,
				keyword.getName(), new ServiceContext());
		}

		if (FeatureFlagManagerUtil.isEnabled(
				group.getCompanyId(), "LPD-99403")) {

			_setProjectAssetTagGroupRels(projectGroupIds, assetTag.getTagId());
		}

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			assetTag.getTagId(), assetLibraryGroupIds,
			DepotConstants.TYPE_SPACE);

		return assetTag;
	}

	private BooleanFilter _getDepotEntryBooleanFilter(
			int depotEntryType, long groupId)
		throws Exception {

		BooleanFilter depotEntryBooleanFilter = new BooleanFilter();

		if (depotEntryType == DepotConstants.TYPE_PROJECT) {
			TermsFilter projectTermsFilter = new TermsFilter(
				"projectDepotEntryGroupIds");

			projectTermsFilter.addValues(
				String.valueOf(groupId),
				String.valueOf(GroupConstants.ANY_PARENT_GROUP_ID));

			depotEntryBooleanFilter.add(
				projectTermsFilter, BooleanClauseOccur.SHOULD);

			return depotEntryBooleanFilter;
		}

		TermsFilter termsFilter = new TermsFilter("groupIds");

		termsFilter.addValues(
			String.valueOf(groupId),
			String.valueOf(GroupConstants.ANY_PARENT_GROUP_ID));

		depotEntryBooleanFilter.add(termsFilter, BooleanClauseOccur.SHOULD);

		BooleanFilter cmsGroupBooleanFilter = new BooleanFilter();

		cmsGroupBooleanFilter.add(
			new ExistsFilter("groupIds"), BooleanClauseOccur.MUST_NOT);
		cmsGroupBooleanFilter.addRequiredTerm(
			Field.GROUP_ID,
			TaxonomyGroupUtil.getCMSGroupId(contextCompany.getCompanyId()));

		depotEntryBooleanFilter.add(
			cmsGroupBooleanFilter, BooleanClauseOccur.SHOULD);

		return depotEntryBooleanFilter;
	}

	private int _getDepotEntryType(long groupId) throws Exception {
		DepotEntry depotEntry = _depotEntryService.fetchGroupDepotEntry(
			groupId);

		if (depotEntry == null) {
			return DepotConstants.TYPE_ANY;
		}

		return depotEntry.getType();
	}

	private long[] _getGroupIds(int depotEntryType, long tagId) {
		return ListUtil.toLongArray(
			_assetTagGroupRelLocalService.
				getAssetTagGroupRelsByTagIdAndDepotEntryType(
					tagId, depotEntryType),
			AssetTagGroupRel::getGroupId);
	}

	private Page<Keyword> _getKeywordsPage(
			Map<String, Map<String, String>> actions, Long groupId,
			String search, Aggregation aggregation, Filter filter,
			Pagination pagination, Sort[] sorts)
		throws Exception {

		int depotEntryType = _getDepotEntryType(groupId);

		boolean scopedDepotEntry =
			(FeatureFlagManagerUtil.isEnabled(
				contextCompany.getCompanyId(), "LPD-99403") &&
			 (depotEntryType == DepotConstants.TYPE_PROJECT)) ||
			(depotEntryType == DepotConstants.TYPE_SPACE);

		return SearchUtil.search(
			actions,
			booleanQuery -> {
				if (!scopedDepotEntry) {
					return;
				}

				BooleanFilter booleanFilter =
					booleanQuery.getPreBooleanFilter();

				booleanFilter.add(
					_getDepotEntryBooleanFilter(depotEntryType, groupId),
					BooleanClauseOccur.MUST);
			},
			filter, AssetTag.class.getName(), search, pagination,
			queryConfig -> queryConfig.setSelectedFieldNames(
				Field.ENTRY_CLASS_PK),
			searchContext -> {
				searchContext.addVulcanAggregation(aggregation);
				searchContext.setAttribute(Field.NAME, search);
				searchContext.setCompanyId(contextCompany.getCompanyId());

				// Asset tag entries are never checked for VIEW permissions, but
				// instead are sanitized (see AssetTagService#sanitize) if the
				// user is not a company admin or the owner.

				searchContext.setUserId(UserConstants.USER_ID_DEFAULT);
				searchContext.setVulcanCheckPermissions(false);

				if (!scopedDepotEntry) {
					searchContext.setGroupIds(
						new long[] {
							groupId, GroupConstants.ANY_PARENT_GROUP_ID
						});
				}
			},
			sorts,
			document -> _toKeyword(
				_assetTagService.getTag(
					GetterUtil.getLong(document.get(Field.ENTRY_CLASS_PK)))));
	}

	private ProjectionList _getProjectionList() {
		ProjectionList projectionList = ProjectionFactoryUtil.projectionList();

		projectionList.add(
			ProjectionFactoryUtil.alias(
				ProjectionFactoryUtil.sqlProjection(
					"COALESCE((select count(entryId) assetCount from " +
						"AssetEntries_AssetTags where tagId = this_.tagId " +
							"group by tagId), 0) AS assetCount",
					new String[] {"assetCount"}, new Type[] {Type.INTEGER}),
				"assetCount"));
		projectionList.add(ProjectionFactoryUtil.property("companyId"));
		projectionList.add(ProjectionFactoryUtil.property("createDate"));
		projectionList.add(ProjectionFactoryUtil.property("groupId"));
		projectionList.add(ProjectionFactoryUtil.property("modifiedDate"));
		projectionList.add(ProjectionFactoryUtil.property("name"));
		projectionList.add(ProjectionFactoryUtil.property("tagId"));
		projectionList.add(ProjectionFactoryUtil.property("userId"));

		return projectionList;
	}

	private long _getTotalCount(String search, Long siteId) {
		DynamicQuery dynamicQuery = _assetTagLocalService.dynamicQuery();

		dynamicQuery.add(
			RestrictionsFactoryUtil.eq(
				"companyId", contextCompany.getCompanyId()));

		if (!Validator.isBlank(search)) {
			dynamicQuery.add(
				RestrictionsFactoryUtil.ilike(
					"name", StringUtil.quote(search, StringPool.PERCENT)));
		}

		if (siteId != null) {
			dynamicQuery.add(RestrictionsFactoryUtil.eq("groupId", siteId));
		}

		return _assetTagLocalService.dynamicQueryCount(dynamicQuery);
	}

	private long[] _getValidatedProjectGroupIds(long companyId, Keyword keyword)
		throws Exception {

		if (ArrayUtil.isEmpty(keyword.getProjects())) {
			return new long[0];
		}

		TaxonomyGroupUtil.validateProjects(keyword.getProjects(), companyId);

		return TaxonomyGroupUtil.getProjectGroupIds(
			keyword.getProjects(), companyId);
	}

	private Keyword _patchSiteKeyword(
			String externalReferenceCode, Keyword keyword, Long siteId)
		throws Exception {

		AssetTag assetTag =
			_assetTagService.fetchAssetTagByExternalReferenceCode(
				externalReferenceCode, siteId);

		if (assetTag == null) {
			assetTag = _assetTagService.getTag(siteId, keyword.getName());
		}

		assetTag = _assetTagService.updateTag(
			externalReferenceCode, assetTag.getTagId(), keyword.getName(),
			new ServiceContext());

		Group group = _groupLocalService.getGroup(siteId);

		if (group.isCMS()) {
			if (FeatureFlagManagerUtil.isEnabled(
					group.getCompanyId(), "LPD-99403") &&
				(keyword.getProjects() != null)) {

				_setProjectAssetTagGroupRels(
					ArrayUtil.append(
						_getGroupIds(
							DepotConstants.TYPE_PROJECT, assetTag.getTagId()),
						_getValidatedProjectGroupIds(
							group.getCompanyId(), keyword)),
					assetTag.getTagId());
			}

			if (keyword.getAssetLibraries() != null) {
				_assetTagGroupRelLocalService.setAssetTagGroupRels(
					assetTag.getTagId(),
					ArrayUtil.append(
						_getGroupIds(
							DepotConstants.TYPE_SPACE, assetTag.getTagId()),
						TaxonomyGroupUtil.getAssetLibraryGroupIds(
							keyword.getAssetLibraries(), group.getCompanyId())),
					DepotConstants.TYPE_SPACE);
			}
		}

		return _toKeyword(assetTag);
	}

	private Keyword _postSiteKeyword(
			String externalReferenceCode, Keyword keyword, Long siteId)
		throws Exception {

		return _toKeyword(
			_addAssetTag(
				externalReferenceCode, _groupLocalService.getGroup(siteId),
				keyword, siteId));
	}

	private AssetTag _reuseAssetTag(
			String externalReferenceCode, Keyword keyword,
			long[] projectGroupIds, Long siteId)
		throws Exception {

		boolean projectScoped = false;

		for (long projectGroupId : projectGroupIds) {
			if (projectGroupId != GroupConstants.ANY_PARENT_GROUP_ID) {
				projectScoped = true;

				break;
			}
		}

		if (!projectScoped) {
			return null;
		}

		AssetTag assetTag = _assetTagLocalService.fetchTag(
			siteId, keyword.getName());

		if ((assetTag == null) ||
			(Validator.isNotNull(externalReferenceCode) &&
			 !externalReferenceCode.equals(
				 assetTag.getExternalReferenceCode()))) {

			return null;
		}

		long[] currentProjectGroupIds = _getGroupIds(
			DepotConstants.TYPE_PROJECT, assetTag.getTagId());

		if (ArrayUtil.contains(
				currentProjectGroupIds, GroupConstants.ANY_PARENT_GROUP_ID)) {

			return assetTag;
		}

		long[] uniqueProjectGroupIds = ArrayUtil.unique(
			ArrayUtil.append(currentProjectGroupIds, projectGroupIds));

		if (uniqueProjectGroupIds.length != currentProjectGroupIds.length) {
			_setProjectAssetTagGroupRels(
				uniqueProjectGroupIds, assetTag.getTagId());
		}

		return assetTag;
	}

	private void _setAssetTagGroupRels(AssetTag assetTag, Keyword keyword)
		throws Exception {

		Group group = _groupLocalService.fetchGroup(assetTag.getGroupId());

		if ((group == null) || !group.isCMS()) {
			return;
		}

		if (FeatureFlagManagerUtil.isEnabled(
				assetTag.getCompanyId(), "LPD-99403") &&
			(keyword.getProjects() != null)) {

			_setProjectAssetTagGroupRels(
				_getValidatedProjectGroupIds(assetTag.getCompanyId(), keyword),
				assetTag.getTagId());
		}

		if (keyword.getAssetLibraries() != null) {
			_assetTagGroupRelLocalService.setAssetTagGroupRels(
				assetTag.getTagId(),
				TaxonomyGroupUtil.getAssetLibraryGroupIds(
					keyword.getAssetLibraries(), assetTag.getCompanyId()),
				DepotConstants.TYPE_SPACE);
		}
	}

	private void _setProjectAssetTagGroupRels(
			long[] projectGroupIds, long tagId)
		throws Exception {

		if (ArrayUtil.isEmpty(projectGroupIds)) {
			_assetTagGroupRelLocalService.
				deleteAssetTagGroupRelsByTagIdAndDepotEntryType(
					tagId, DepotConstants.TYPE_PROJECT);

			return;
		}

		_assetTagGroupRelLocalService.setAssetTagGroupRels(
			tagId, projectGroupIds, DepotConstants.TYPE_PROJECT);
	}

	private AssetTag _toAssetTag(Object[] assetTags) {
		return new AssetTagImpl() {
			{
				if (assetTags[0] != null) {
					setAssetCount((int)assetTags[0]);
				}

				setCompanyId((long)assetTags[1]);
				setCreateDate((Date)assetTags[2]);
				setGroupId((long)assetTags[3]);
				setModifiedDate((Date)assetTags[4]);
				setName((String)assetTags[5]);
				setTagId((long)assetTags[6]);
				setUserId((long)assetTags[7]);
			}
		};
	}

	private Keyword _toKeyword(AssetTag assetTag) throws Exception {
		return _keywordDTOConverter.toDTO(
			new DefaultDTOConverterContext(
				contextAcceptLanguage.isAcceptAllLanguages(),
				HashMapBuilder.put(
					"delete",
					addAction(
						ActionKeys.MANAGE_TAG, assetTag.getTagId(),
						"deleteKeyword", _assetTagModelResourcePermission)
				).put(
					"get",
					addAction(
						ActionKeys.MANAGE_TAG, assetTag.getTagId(),
						"getKeyword", _assetTagModelResourcePermission)
				).put(
					"replace",
					addAction(
						ActionKeys.MANAGE_TAG, assetTag.getTagId(),
						"putKeyword", _assetTagModelResourcePermission)
				).put(
					"subscribe",
					addAction(
						ActionKeys.SUBSCRIBE, assetTag.getTagId(),
						"putKeywordSubscribe", _assetTagModelResourcePermission)
				).put(
					"unsubscribe",
					addAction(
						ActionKeys.SUBSCRIBE, assetTag.getTagId(),
						"putKeywordUnsubscribe",
						_assetTagModelResourcePermission)
				).build(),
				_dtoConverterRegistry, assetTag.getTagId(),
				contextAcceptLanguage.getPreferredLocale(), contextUriInfo,
				contextUser),
			assetTag);
	}

	private static final EntityModel _entityModel = new KeywordEntityModel();

	@Reference
	private AssetTagGroupRelLocalService _assetTagGroupRelLocalService;

	@Reference
	private AssetTagLocalService _assetTagLocalService;

	@Reference(
		policy = ReferencePolicy.DYNAMIC,
		policyOption = ReferencePolicyOption.GREEDY,
		target = "(model.class.name=com.liferay.asset.kernel.model.AssetTag)"
	)
	private volatile ModelResourcePermission<AssetTag>
		_assetTagModelResourcePermission;

	@Reference
	private AssetTagService _assetTagService;

	@Reference
	private DepotEntryService _depotEntryService;

	@Reference
	private DTOConverterRegistry _dtoConverterRegistry;

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference(
		target = "(component.name=com.liferay.headless.admin.taxonomy.internal.dto.v1_0.converter.KeywordDTOConverter)"
	)
	private DTOConverter<AssetTag, Keyword> _keywordDTOConverter;

}