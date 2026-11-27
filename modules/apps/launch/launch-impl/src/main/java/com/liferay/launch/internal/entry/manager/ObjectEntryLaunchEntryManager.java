/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.internal.entry.manager;

import com.liferay.item.selector.ItemSelectorCriterion;
import com.liferay.item.selector.criteria.InfoItemItemSelectorReturnType;
import com.liferay.item.selector.criteria.info.item.criterion.InfoItemItemSelectorCriterion;
import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.object.constants.ObjectEntryConstants;
import com.liferay.object.exception.NoSuchObjectEntryException;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.rest.dto.v1_0.TaxonomyCategoryBrief;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.object.util.comparator.ObjectEntryVersionVersionComparator;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.reflect.ReflectionUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.BaseModel;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.portlet.RequestBackedPortletURLFactory;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ListUtil;

import java.io.Serializable;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author Carolina Barbosa
 */
public class ObjectEntryLaunchEntryManager implements LaunchEntryManager {

	public ObjectEntryLaunchEntryManager(
		GroupLocalService groupLocalService, ObjectDefinition objectDefinition,
		ObjectEntryLocalService objectEntryLocalService,
		ObjectEntryVersionLocalService objectEntryVersionLocalService) {

		_groupLocalService = groupLocalService;
		_objectDefinition = objectDefinition;
		_objectEntryLocalService = objectEntryLocalService;
		_objectEntryVersionLocalService = objectEntryVersionLocalService;
	}

	@Override
	public Draft addDraft(long classPK, long launchSetId, String versionKey)
		throws PortalException {

		int version = GetterUtil.getInteger(versionKey);

		ObjectEntryVersion objectEntryVersion =
			_objectEntryVersionLocalService.getObjectEntryVersion(
				classPK, version);

		com.liferay.object.rest.dto.v1_0.ObjectEntry contentObjectEntry =
			com.liferay.object.rest.dto.v1_0.ObjectEntry.unsafeToDTO(
				objectEntryVersion.getContent());

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		serviceContext = (ServiceContext)serviceContext.clone();

		serviceContext.setAssetCategoryIds(
			TransformUtil.transformToLongArray(
				ListUtil.fromArray(
					contentObjectEntry.getTaxonomyCategoryBriefs()),
				TaxonomyCategoryBrief::getTaxonomyCategoryId));
		serviceContext.setAssetTagNames(contentObjectEntry.getKeywords());

		Map<String, Object> properties = contentObjectEntry.getProperties();

		return _toDraft(
			_objectEntryLocalService.addDraftObjectEntry(
				serviceContext.getUserId(), classPK, version,
				(Map<String, Serializable>)properties.get("properties"),
				serviceContext));
	}

	@Override
	public void deleteDraft(long classPK, long draftId) throws PortalException {
		ObjectEntry objectEntry = _fetchDraftObjectEntry(classPK, draftId);

		if (objectEntry == null) {
			return;
		}

		_objectEntryLocalService.deleteObjectEntry(objectEntry);
	}

	@Override
	public Draft fetchDraft(long classPK, long draftId) {
		return _toDraft(_fetchDraftObjectEntry(classPK, draftId));
	}

	@Override
	public Item fetchItem(long classPK) {
		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			classPK);

		if ((objectEntry == null) ||
			(objectEntry.getObjectDefinitionId() !=
				_objectDefinition.getObjectDefinitionId())) {

			return null;
		}

		return new Item() {

			@Override
			public long getGroupId() {
				if (objectEntry.getGroupId() > 0) {
					return objectEntry.getGroupId();
				}

				Group group = _groupLocalService.fetchCompanyGroup(
					objectEntry.getCompanyId());

				return group.getGroupId();
			}

			@Override
			public Serializable getPrimaryKey() {
				return objectEntry.getObjectEntryId();
			}

			@Override
			public String getTitle(Locale locale) {
				try {
					return objectEntry.getTitleValue();
				}
				catch (PortalException portalException) {
					return ReflectionUtil.throwException(portalException);
				}
			}

			@Override
			public String getTypeName(Locale locale) {
				return _objectDefinition.getLabel(locale);
			}

		};
	}

	@Override
	public Version fetchPublishedVersion(long classPK) {
		return _toVersion(
			_objectEntryVersionLocalService.
				fetchLatestApprovedObjectEntryVersion(
					classPK,
					ObjectEntryVersionVersionComparator.getInstance(false)));
	}

	@Override
	public Version fetchVersion(long classPK, String versionKey) {
		return _toVersion(
			_objectEntryVersionLocalService.fetchObjectEntryVersion(
				classPK, GetterUtil.getInteger(versionKey)));
	}

	@Override
	public String getClassName() {
		return _objectDefinition.getClassName();
	}

	@Override
	public long getClassPK(Map<String, String> selectedItemData) {
		return GetterUtil.getLong(selectedItemData.get("classPK"));
	}

	@Override
	public ItemSelectorCriterion getItemSelectorCriterion() {
		InfoItemItemSelectorCriterion infoItemItemSelectorCriterion =
			new InfoItemItemSelectorCriterion();

		infoItemItemSelectorCriterion.setDesiredItemSelectorReturnTypes(
			new InfoItemItemSelectorReturnType());
		infoItemItemSelectorCriterion.setIncludeUnconnectedGroups(true);
		infoItemItemSelectorCriterion.setItemType(
			_objectDefinition.getClassName());

		return infoItemItemSelectorCriterion;
	}

	@Override
	public String getLabel(Locale locale) {
		return _objectDefinition.getLabel(locale);
	}

	@Override
	public Class<?> getModelClass() {
		return ObjectEntry.class;
	}

	@Override
	public List<Version> getVersions(long classPK) {
		return TransformUtil.transform(
			_objectEntryVersionLocalService.getObjectEntryVersions(classPK),
			this::_toVersion);
	}

	@Override
	public Version publishDraft(long classPK, long draftId)
		throws PortalException {

		if (_fetchDraftObjectEntry(classPK, draftId) == null) {
			throw new NoSuchObjectEntryException(
				StringBundler.concat(
					"No draft exists with the key {classPK=", classPK,
					", draftId=", draftId, "}"));
		}

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		_objectEntryLocalService.publishDraftObjectEntry(
			serviceContext.getUserId(), draftId, serviceContext);

		return _toVersion(
			_objectEntryVersionLocalService.fetchLatestObjectEntryVersion(
				classPK));
	}

	private ObjectEntry _fetchDraftObjectEntry(long classPK, long draftId) {
		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			draftId);

		if ((objectEntry == null) ||
			(objectEntry.getHeadObjectEntryId() != classPK) ||
			(objectEntry.getType() != ObjectEntryConstants.TYPE_DRAFT)) {

			return null;
		}

		return objectEntry;
	}

	private Draft _toDraft(ObjectEntry objectEntry) {
		if (objectEntry == null) {
			return null;
		}

		return new Draft() {

			@Override
			public long getDraftId() {
				return objectEntry.getObjectEntryId();
			}

			@Override
			public String getEditURL(
				String redirect,
				RequestBackedPortletURLFactory requestBackedPortletURLFactory) {

				return StringPool.BLANK;
			}

			@Override
			public Date getModifiedDate() {
				return objectEntry.getModifiedDate();
			}

			@Override
			public BaseModel<?> getPreviewBaseModel() {
				return objectEntry;
			}

			@Override
			public int getStatus() {
				return objectEntry.getStatus();
			}

			@Override
			public String getUserName() {
				return objectEntry.getUserName();
			}

		};
	}

	private Version _toVersion(ObjectEntryVersion objectEntryVersion) {
		if (objectEntryVersion == null) {
			return null;
		}

		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			objectEntryVersion.getObjectEntryId());

		return new Version() {

			@Override
			public String getLabel(Locale locale) {
				return String.valueOf(objectEntryVersion.getVersion());
			}

			@Override
			public Date getModifiedDate() {
				return objectEntryVersion.getModifiedDate();
			}

			@Override
			public BaseModel<?> getPreviewBaseModel() {
				ObjectEntry previewObjectEntry =
					(ObjectEntry)objectEntry.clone();

				previewObjectEntry.setVersion(objectEntryVersion.getVersion());

				return previewObjectEntry;
			}

			@Override
			public int getStatus() {
				return objectEntryVersion.getStatus();
			}

			@Override
			public String getUserName() {
				return objectEntryVersion.getUserName();
			}

			@Override
			public String getVersionKey() {
				return String.valueOf(objectEntryVersion.getVersion());
			}

		};
	}

	private final GroupLocalService _groupLocalService;
	private final ObjectDefinition _objectDefinition;
	private final ObjectEntryLocalService _objectEntryLocalService;
	private final ObjectEntryVersionLocalService
		_objectEntryVersionLocalService;

}