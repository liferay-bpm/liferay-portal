/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.impl;

import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.service.base.ObjectEntryVersionDraftLocalServiceBaseImpl;
import com.liferay.object.service.persistence.ObjectEntryVersionPersistence;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.workflow.WorkflowConstants;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = "model.class.name=com.liferay.object.model.ObjectEntryVersionDraft",
	service = AopService.class
)
public class ObjectEntryVersionDraftLocalServiceImpl
	extends ObjectEntryVersionDraftLocalServiceBaseImpl {

	@Override
	public ObjectEntryVersionDraft addObjectEntryVersionDraft(
			long userId, long objectEntryId, int version)
		throws PortalException {

		ObjectEntryVersionDraft objectEntryVersionDraft =
			objectEntryVersionDraftPersistence.create(
				counterLocalService.increment());

		User user = _userLocalService.getUser(userId);

		objectEntryVersionDraft.setCompanyId(user.getCompanyId());
		objectEntryVersionDraft.setUserId(user.getUserId());
		objectEntryVersionDraft.setUserName(user.getFullName());

		ObjectEntryVersion objectEntryVersion =
			_objectEntryVersionPersistence.findByOEI_V(objectEntryId, version);

		objectEntryVersionDraft.setObjectDefinitionId(
			objectEntryVersion.getObjectDefinitionId());

		objectEntryVersionDraft.setObjectEntryId(objectEntryId);
		objectEntryVersionDraft.setContent(objectEntryVersion.getContent());
		objectEntryVersionDraft.setVersion(version);
		objectEntryVersionDraft.setStatus(WorkflowConstants.STATUS_DRAFT);

		return objectEntryVersionDraftPersistence.update(
			objectEntryVersionDraft);
	}

	@Override
	public void deleteObjectEntryVersionDraftByObjectDefinitionId(
		long objectDefinitionId) {

		objectEntryVersionDraftPersistence.removeByObjectDefinitionId(
			objectDefinitionId);
	}

	@Override
	public void deleteObjectEntryVersionDrafts(long objectEntryId) {
		objectEntryVersionDraftPersistence.removeByObjectEntryId(objectEntryId);
	}

	@Reference
	private ObjectEntryVersionPersistence _objectEntryVersionPersistence;

	@Reference
	private UserLocalService _userLocalService;

}