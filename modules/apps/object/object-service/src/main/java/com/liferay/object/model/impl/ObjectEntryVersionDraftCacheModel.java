/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.model.impl;

import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.petra.lang.HashUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.model.CacheModel;
import com.liferay.portal.kernel.model.MVCCModel;

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;

import java.util.Date;

/**
 * The cache model class for representing ObjectEntryVersionDraft in entity cache.
 *
 * @author Marco Leo
 * @generated
 */
public class ObjectEntryVersionDraftCacheModel
	implements CacheModel<ObjectEntryVersionDraft>, Externalizable, MVCCModel {

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}

		if (!(object instanceof ObjectEntryVersionDraftCacheModel)) {
			return false;
		}

		ObjectEntryVersionDraftCacheModel objectEntryVersionDraftCacheModel =
			(ObjectEntryVersionDraftCacheModel)object;

		if ((objectEntryVersionDraftId ==
				objectEntryVersionDraftCacheModel.objectEntryVersionDraftId) &&
			(mvccVersion == objectEntryVersionDraftCacheModel.mvccVersion)) {

			return true;
		}

		return false;
	}

	@Override
	public int hashCode() {
		int hashCode = HashUtil.hash(0, objectEntryVersionDraftId);

		return HashUtil.hash(hashCode, mvccVersion);
	}

	@Override
	public long getMvccVersion() {
		return mvccVersion;
	}

	@Override
	public void setMvccVersion(long mvccVersion) {
		this.mvccVersion = mvccVersion;
	}

	@Override
	public String toString() {
		StringBundler sb = new StringBundler(25);

		sb.append("{mvccVersion=");
		sb.append(mvccVersion);
		sb.append(", objectEntryVersionDraftId=");
		sb.append(objectEntryVersionDraftId);
		sb.append(", companyId=");
		sb.append(companyId);
		sb.append(", userId=");
		sb.append(userId);
		sb.append(", userName=");
		sb.append(userName);
		sb.append(", createDate=");
		sb.append(createDate);
		sb.append(", modifiedDate=");
		sb.append(modifiedDate);
		sb.append(", objectDefinitionId=");
		sb.append(objectDefinitionId);
		sb.append(", objectEntryId=");
		sb.append(objectEntryId);
		sb.append(", content=");
		sb.append(content);
		sb.append(", version=");
		sb.append(version);
		sb.append(", status=");
		sb.append(status);
		sb.append("}");

		return sb.toString();
	}

	@Override
	public ObjectEntryVersionDraft toEntityModel() {
		ObjectEntryVersionDraftImpl objectEntryVersionDraftImpl =
			new ObjectEntryVersionDraftImpl();

		objectEntryVersionDraftImpl.setMvccVersion(mvccVersion);
		objectEntryVersionDraftImpl.setObjectEntryVersionDraftId(
			objectEntryVersionDraftId);
		objectEntryVersionDraftImpl.setCompanyId(companyId);
		objectEntryVersionDraftImpl.setUserId(userId);

		if (userName == null) {
			objectEntryVersionDraftImpl.setUserName("");
		}
		else {
			objectEntryVersionDraftImpl.setUserName(userName);
		}

		if (createDate == Long.MIN_VALUE) {
			objectEntryVersionDraftImpl.setCreateDate(null);
		}
		else {
			objectEntryVersionDraftImpl.setCreateDate(new Date(createDate));
		}

		if (modifiedDate == Long.MIN_VALUE) {
			objectEntryVersionDraftImpl.setModifiedDate(null);
		}
		else {
			objectEntryVersionDraftImpl.setModifiedDate(new Date(modifiedDate));
		}

		objectEntryVersionDraftImpl.setObjectDefinitionId(objectDefinitionId);
		objectEntryVersionDraftImpl.setObjectEntryId(objectEntryId);

		if (content == null) {
			objectEntryVersionDraftImpl.setContent("");
		}
		else {
			objectEntryVersionDraftImpl.setContent(content);
		}

		objectEntryVersionDraftImpl.setVersion(version);
		objectEntryVersionDraftImpl.setStatus(status);

		objectEntryVersionDraftImpl.resetOriginalValues();

		return objectEntryVersionDraftImpl;
	}

	@Override
	public void readExternal(ObjectInput objectInput)
		throws ClassNotFoundException, IOException {

		mvccVersion = objectInput.readLong();

		objectEntryVersionDraftId = objectInput.readLong();

		companyId = objectInput.readLong();

		userId = objectInput.readLong();
		userName = objectInput.readUTF();
		createDate = objectInput.readLong();
		modifiedDate = objectInput.readLong();

		objectDefinitionId = objectInput.readLong();

		objectEntryId = objectInput.readLong();
		content = (String)objectInput.readObject();

		version = objectInput.readInt();

		status = objectInput.readInt();
	}

	@Override
	public void writeExternal(ObjectOutput objectOutput) throws IOException {
		objectOutput.writeLong(mvccVersion);

		objectOutput.writeLong(objectEntryVersionDraftId);

		objectOutput.writeLong(companyId);

		objectOutput.writeLong(userId);

		if (userName == null) {
			objectOutput.writeUTF("");
		}
		else {
			objectOutput.writeUTF(userName);
		}

		objectOutput.writeLong(createDate);
		objectOutput.writeLong(modifiedDate);

		objectOutput.writeLong(objectDefinitionId);

		objectOutput.writeLong(objectEntryId);

		if (content == null) {
			objectOutput.writeObject("");
		}
		else {
			objectOutput.writeObject(content);
		}

		objectOutput.writeInt(version);

		objectOutput.writeInt(status);
	}

	public long mvccVersion;
	public long objectEntryVersionDraftId;
	public long companyId;
	public long userId;
	public String userName;
	public long createDate;
	public long modifiedDate;
	public long objectDefinitionId;
	public long objectEntryId;
	public String content;
	public int version;
	public int status;

}
// LIFERAY-SERVICE-BUILDER-HASH:1236189108