/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.impl;

import com.liferay.object.model.ObjectFolderItem;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFolderLocalService;
import com.liferay.object.service.base.ObjectFolderItemLocalServiceBaseImpl;
import com.liferay.object.service.persistence.ObjectFolderItemPK;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;

import java.util.List;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Murilo Stodolni
 */
@Component(
	property = "model.class.name=com.liferay.object.model.ObjectFolderItem",
	service = AopService.class
)
public class ObjectFolderItemLocalServiceImpl
	extends ObjectFolderItemLocalServiceBaseImpl {

	@Override
	public ObjectFolderItem addObjectFolderItem(
			long objectDefinitionId, long objectFolderId, long userId,
			int positionX, int positionY)
		throws PortalException {

		_objectDefinitionLocalService.getObjectDefinition(objectDefinitionId);

		_objectFolderLocalService.getObjectFolder(objectFolderId);

		ObjectFolderItem objectFolderItem = objectFolderItemPersistence.create(
			new ObjectFolderItemPK(objectDefinitionId, objectFolderId));

		User user = _userLocalService.getUser(userId);

		objectFolderItem.setCompanyId(user.getCompanyId());

		objectFolderItem.setUserId(userId);
		objectFolderItem.setUserName(user.getFullName());

		objectFolderItem.setPositionX(positionX);
		objectFolderItem.setPositionY(positionY);

		return objectFolderItemPersistence.update(objectFolderItem);
	}

	@Override
	public ObjectFolderItem deleteObjectFolderItem(
			long objectDefinitionId, long objectFolderId)
		throws PortalException {

		ObjectFolderItem objectFolderItem =
			objectFolderItemPersistence.findByPrimaryKey(
				new ObjectFolderItemPK(objectDefinitionId, objectFolderId));

		return objectFolderItemLocalService.deleteObjectFolderItem(
			objectFolderItem);
	}

	@Override
	public ObjectFolderItem deleteObjectFolderItem(
		ObjectFolderItem objectFolderItem) {

		return objectFolderItemPersistence.remove(objectFolderItem);
	}

	@Override
	public void deleteObjectFolderItemsByObjectDefinitionId(
		long objectDefinitionId) {

		List<ObjectFolderItem> objectFolderItems =
			objectFolderItemPersistence.findByObjectDefinitionId(
				objectDefinitionId);

		for (ObjectFolderItem objectFolderItem : objectFolderItems) {
			objectFolderItemPersistence.remove(objectFolderItem);
		}
	}

	@Override
	public void deleteObjectFolderItemsByObjectFolderId(long objectFolderId) {
		List<ObjectFolderItem> objectFolderItems =
			objectFolderItemPersistence.findByObjectFolderId(objectFolderId);

		for (ObjectFolderItem objectFolderItem : objectFolderItems) {
			objectFolderItemPersistence.remove(objectFolderItem);
		}
	}

	@Override
	public List<ObjectFolderItem> fetchObjectFolderItemsByObjectDefinitionId(
		long objectDefinitionId) {

		return objectFolderItemPersistence.findByObjectDefinitionId(
			objectDefinitionId);
	}

	@Override
	public List<ObjectFolderItem> fetchObjectFolderItemsByObjectFolderId(
		long objectFolderId) {

		return objectFolderItemPersistence.findByObjectFolderId(objectFolderId);
	}

	@Override
	public ObjectFolderItem getObjectFolderItem(
			long objectDefinitionId, long objectFolderId)
		throws PortalException {

		return objectFolderItemPersistence.findByPrimaryKey(
			new ObjectFolderItemPK(objectDefinitionId, objectFolderId));
	}

	@Override
	public ObjectFolderItem updateObjectFolderItem(
			long objectDefinitionId, long objectFolderId, int positionX,
			int positionY)
		throws PortalException {

		ObjectFolderItem objectFolderItem =
			objectFolderItemPersistence.findByPrimaryKey(
				new ObjectFolderItemPK(objectDefinitionId, objectFolderId));

		objectFolderItem.setPositionX(positionX);
		objectFolderItem.setPositionY(positionY);

		return objectFolderItemPersistence.update(objectFolderItem);
	}

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectFolderLocalService _objectFolderLocalService;

	@Reference
	private UserLocalService _userLocalService;

}