/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.model.listener;

import com.liferay.document.library.kernel.model.DLFolder;
import com.liferay.document.library.kernel.model.DLFolderConstants;
import com.liferay.document.library.kernel.service.DLFolderLocalService;
import com.liferay.document.library.kernel.util.DLAppHelperThreadLocal;
import com.liferay.object.constants.ObjectEntryFolderConstants;
import com.liferay.object.entry.folder.util.ObjectEntryFolderThreadLocal;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryFolderLocalService;
import com.liferay.petra.lang.SafeCloseable;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.model.Repository;
import com.liferay.portal.kernel.portletfilerepository.PortletFileRepository;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.service.RepositoryLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.util.TempFileEntryUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Adolfo Pérez
 */
@Component(service = ModelListener.class)
public class GroupModelListener extends BaseModelListener<Group> {

	@Override
	public void onAfterCreate(Group group) throws ModelListenerException {
		if ((group.getType() != GroupConstants.TYPE_DEPOT) ||
			!FeatureFlagManagerUtil.isEnabled(
				group.getCompanyId(), "LPD-17564")) {

			return;
		}

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			serviceContext = new ServiceContext();
		}

		serviceContext.setAddGroupPermissions(true);
		serviceContext.setAddGuestPermissions(true);

		try {
			long groupId = group.getGroupId();

			long companyId = group.getCompanyId();

			ObjectDefinition objectDefinition =
				_objectDefinitionLocalService.
					getObjectDefinitionByExternalReferenceCode(
						"L_BASIC_DOCUMENT", companyId);

			Repository repository =
				_portletFileRepository.fetchPortletRepository(
					groupId, objectDefinition.getPortletId());

			if (repository == null) {
				repository = _portletFileRepository.addPortletRepository(
					groupId, objectDefinition.getPortletId(), serviceContext);
			}

			long userId = PrincipalThreadLocal.getUserId();

			try (SafeCloseable safeCloseable =
					DLAppHelperThreadLocal.setEnabledWithSafeCloseable(false)) {

				_repositoryLocalService.addRepository(
					null, userId, groupId,
					PortalUtil.getClassNameId(
						"com.liferay.portal.repository.temporaryrepository." +
							"TemporaryFileEntryRepository"),
					DLFolderConstants.DEFAULT_PARENT_FOLDER_ID,
					TempFileEntryUtil.class.getName(), StringPool.BLANK,
					TempFileEntryUtil.class.getName(), new UnicodeProperties(),
					true, serviceContext);
			}

			DLFolder dlFolder = _dlFolderLocalService.fetchFolder(
				groupId, repository.getDlFolderId(), String.valueOf(userId));

			if (dlFolder == null) {
				_dlFolderLocalService.addFolder(
					null, _userLocalService.getGuestUserId(companyId), groupId,
					repository.getRepositoryId(), false,
					repository.getDlFolderId(), String.valueOf(userId), null,
					false, serviceContext);
			}
		}
		catch (PortalException portalException) {
			throw new ModelListenerException(portalException);
		}
	}

	@Override
	public void onBeforeRemove(Group group) throws ModelListenerException {
		try {
			_onBeforeRemove(group);
		}
		catch (Exception exception) {
			throw new ModelListenerException(exception);
		}
	}

	private void _onBeforeRemove(Group group) throws Exception {
		if ((group.getType() != GroupConstants.TYPE_DEPOT) ||
			!FeatureFlagManagerUtil.isEnabled(
				group.getCompanyId(), "LPD-17564")) {

			return;
		}

		try (SafeCloseable safeCloseable =
				ObjectEntryFolderThreadLocal.
					setForceDeleteSystemObjectEntryFolderWithSafeCloseable(
						true)) {

			_objectEntryFolderLocalService.
				deleteObjectEntryFolderByExternalReferenceCode(
					ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_CONTENTS,
					group.getGroupId(), group.getCompanyId());
			_objectEntryFolderLocalService.
				deleteObjectEntryFolderByExternalReferenceCode(
					ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_FILES,
					group.getGroupId(), group.getCompanyId());
		}
	}

	@Reference
	private DLFolderLocalService _dlFolderLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryFolderLocalService _objectEntryFolderLocalService;

	@Reference
	private PortletFileRepository _portletFileRepository;

	@Reference
	private RepositoryLocalService _repositoryLocalService;

	@Reference
	private UserLocalService _userLocalService;

}