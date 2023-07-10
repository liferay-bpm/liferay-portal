/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.object.admin.rest.internal.resource.v1_0;

import com.liferay.object.admin.rest.dto.v1_0.ObjectFolder;
import com.liferay.object.admin.rest.resource.v1_0.ObjectFolderResource;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.util.Collections;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ServiceScope;

/**
 * @author Murilo Stodolni
 */
@Component(
	properties = "OSGI-INF/liferay/rest/v1_0/object-folder.properties",
	scope = ServiceScope.PROTOTYPE, service = ObjectFolderResource.class
)
public class ObjectFolderResourceImpl extends BaseObjectFolderResourceImpl {

	@Override
	public void deleteObjectFolder(Long objectFolderId) throws Exception {
		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}
	}

	@Override
	public ObjectFolder getObjectFolder(Long objectFolderId) throws Exception {
		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectFolder();
	}

	@Override
	public ObjectFolder getObjectFolderByExternalReferenceCode(
			String externalReferenceCode)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectFolder();
	}

	@Override
	public Page<ObjectFolder> getObjectFoldersPage(
			String search, Pagination pagination)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return Page.of(Collections.emptyList());
	}

	@Override
	public ObjectFolder postObjectFolder(ObjectFolder objectFolder)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectFolder();
	}

	@Override
	public ObjectFolder putObjectFolder(
			Long objectFolderId, ObjectFolder objectFolder)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectFolder();
	}

	@Override
	public ObjectFolder putObjectFolderByExternalReferenceCode(
			String externalReferenceCode, ObjectFolder objectFolder)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectFolder();
	}

}