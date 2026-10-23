/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.launch.entry.manager;

import com.liferay.item.selector.ItemSelectorCriterion;
import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.object.entry.util.ObjectEntryVersionConverterUtil;
import com.liferay.object.exception.NoSuchObjectEntryVersionDraftException;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.rest.dto.v1_0.Status;
import com.liferay.object.rest.manager.v1_0.DefaultObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.DefaultObjectEntryManagerProvider;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionDraftLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.object.util.comparator.ObjectEntryVersionVersionComparator;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.reflect.ReflectionUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.RequestBackedPortletURLFactory;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.vulcan.dto.converter.DTOConverter;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;

import java.io.Serializable;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Carolina Barbosa
 */
@Component(
	property = "launch.entry.manager.class.name=com.liferay.object.model.ObjectEntry",
	service = LaunchEntryManager.class
)
public class ObjectEntryLaunchEntryManager implements LaunchEntryManager {

	@Override
	public Draft addDraft(long classPK, String versionKey)
		throws PortalException {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		return _toDraft(
			_objectEntryVersionDraftLocalService.addObjectEntryVersionDraft(
				serviceContext.getUserId(), classPK,
				GetterUtil.getInteger(versionKey)));
	}

	@Override
	public void deleteDraft(long classPK, long draftId) throws PortalException {
		ObjectEntryVersionDraft objectEntryVersionDraft =
			_fetchObjectEntryVersionDraft(classPK, draftId);

		if (objectEntryVersionDraft == null) {
			return;
		}

		_objectEntryVersionDraftLocalService.deleteObjectEntryVersionDraft(
			objectEntryVersionDraft);
	}

	@Override
	public Draft fetchDraft(long classPK, long draftId) {
		return _toDraft(_fetchObjectEntryVersionDraft(classPK, draftId));
	}

	@Override
	public Item fetchItem(long classPK) {
		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			classPK);

		if (objectEntry == null) {
			return null;
		}

		return new Item() {

			@Override
			public long getGroupId() {
				return objectEntry.getGroupId();
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
				ObjectDefinition objectDefinition =
					_objectDefinitionLocalService.fetchObjectDefinition(
						objectEntry.getObjectDefinitionId());

				return objectDefinition.getLabel(locale);
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
	public long getClassPK(Map<String, String> selectedItemData) {
		return GetterUtil.getLong(selectedItemData.get("classPK"));
	}

	@Override
	public ItemSelectorCriterion getItemSelectorCriterion() {
		return null;
	}

	@Override
	public String getLabel(Locale locale) {
		return _language.get(locale, "content");
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

		ObjectEntryVersionDraft objectEntryVersionDraft =
			_fetchObjectEntryVersionDraft(classPK, draftId);

		if (objectEntryVersionDraft == null) {
			throw new NoSuchObjectEntryVersionDraftException();
		}

		try {
			ObjectEntry objectEntry = _objectEntryLocalService.getObjectEntry(
				classPK);

			ObjectDefinition objectDefinition =
				objectEntry.getObjectDefinition();

			DefaultObjectEntryManager defaultObjectEntryManager =
				DefaultObjectEntryManagerProvider.provide(
					_objectEntryManagerRegistry.getObjectEntryManager(
						objectEntry.getCompanyId(),
						objectDefinition.getStorageType()));

			ServiceContext serviceContext =
				ServiceContextThreadLocal.getServiceContext();

			User user = _userLocalService.getUser(serviceContext.getUserId());

			defaultObjectEntryManager.updateObjectEntry(
				new DefaultDTOConverterContext(
					false, null, null, null, null, user.getLocale(), null,
					user),
				objectDefinition, classPK,
				_getDTOObjectEntry(objectEntry, objectEntryVersionDraft, user));
		}
		catch (PortalException portalException) {
			throw portalException;
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}

		_objectEntryVersionDraftLocalService.deleteObjectEntryVersionDraft(
			objectEntryVersionDraft);

		return _toVersion(
			_objectEntryVersionLocalService.fetchLatestObjectEntryVersion(
				classPK));
	}

	private ObjectEntryVersionDraft _fetchObjectEntryVersionDraft(
		long classPK, long draftId) {

		ObjectEntryVersionDraft objectEntryVersionDraft =
			_objectEntryVersionDraftLocalService.fetchObjectEntryVersionDraft(
				draftId);

		if ((objectEntryVersionDraft == null) ||
			(objectEntryVersionDraft.getObjectEntryId() != classPK)) {

			return null;
		}

		return objectEntryVersionDraft;
	}

	private com.liferay.object.rest.dto.v1_0.ObjectEntry _getDTOObjectEntry(
			ObjectEntry objectEntry,
			ObjectEntryVersionDraft objectEntryVersionDraft, User user)
		throws Exception {

		DTOConverter<ObjectEntry, ?> dtoConverter =
			(DTOConverter<ObjectEntry, ?>)_dtoConverterRegistry.getDTOConverter(
				ObjectEntry.class.getName());

		DefaultDTOConverterContext dtoConverterContext =
			new DefaultDTOConverterContext(
				false, null, _dtoConverterRegistry, null, null,
				user.getLocale(), null, user);

		dtoConverterContext.setAttribute("addActions", Boolean.FALSE);
		dtoConverterContext.setAttribute(
			"objectEntryVersion",
			ObjectEntryVersionConverterUtil.toObjectEntryVersion(
				objectEntryVersionDraft));

		com.liferay.object.rest.dto.v1_0.ObjectEntry dtoObjectEntry =
			(com.liferay.object.rest.dto.v1_0.ObjectEntry)dtoConverter.toDTO(
				dtoConverterContext, objectEntry);

		dtoObjectEntry.setStatus(
			() -> new Status() {
				{
					setCode(() -> WorkflowConstants.STATUS_APPROVED);
				}
			});

		return dtoObjectEntry;
	}

	private Draft _toDraft(ObjectEntryVersionDraft objectEntryVersionDraft) {
		if (objectEntryVersionDraft == null) {
			return null;
		}

		return new Draft() {

			@Override
			public long getDraftId() {
				return objectEntryVersionDraft.getObjectEntryVersionDraftId();
			}

			@Override
			public String getEditURL(
				String redirect,
				RequestBackedPortletURLFactory requestBackedPortletURLFactory) {

				return StringPool.BLANK;
			}

			@Override
			public Date getModifiedDate() {
				return objectEntryVersionDraft.getModifiedDate();
			}

			@Override
			public Serializable getPreviewPrimaryKey() {
				return "draft_" +
					objectEntryVersionDraft.getObjectEntryVersionDraftId();
			}

			@Override
			public int getStatus() {
				return objectEntryVersionDraft.getStatus();
			}

			@Override
			public String getUserName() {
				return objectEntryVersionDraft.getUserName();
			}

		};
	}

	private Version _toVersion(ObjectEntryVersion objectEntryVersion) {
		if (objectEntryVersion == null) {
			return null;
		}

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
			public Serializable getPreviewPrimaryKey() {
				return "version_" +
					objectEntryVersion.getObjectEntryVersionId();
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

	@Reference
	private DTOConverterRegistry _dtoConverterRegistry;

	@Reference
	private Language _language;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

	@Reference
	private ObjectEntryVersionDraftLocalService
		_objectEntryVersionDraftLocalService;

	@Reference
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;

	@Reference
	private UserLocalService _userLocalService;

}