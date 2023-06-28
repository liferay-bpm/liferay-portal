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

import com.liferay.object.admin.rest.dto.v1_0.ObjectModel;
import com.liferay.object.admin.rest.resource.v1_0.ObjectModelResource;
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
	properties = "OSGI-INF/liferay/rest/v1_0/object-model.properties",
	scope = ServiceScope.PROTOTYPE, service = ObjectModelResource.class
)
public class ObjectModelResourceImpl extends BaseObjectModelResourceImpl {

	@Override
	public void deleteObjectModel(Long objectModelId) throws Exception {
		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}
	}

	@Override
	public ObjectModel getObjectModel(Long objectModelId) throws Exception {
		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectModel();
	}

	@Override
	public ObjectModel getObjectModelByExternalReferenceCode(
			String externalReferenceCode)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectModel();
	}

	@Override
	public Page<ObjectModel> getObjectModelsPage(
			String search, Pagination pagination)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return Page.of(Collections.emptyList());
	}

	@Override
	public ObjectModel postObjectModel(ObjectModel objectModel)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectModel();
	}

	@Override
	public ObjectModel putObjectModel(
			Long objectModelId, ObjectModel objectModel)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectModel();
	}

	@Override
	public ObjectModel putObjectModelByExternalReferenceCode(
			String externalReferenceCode, ObjectModel objectModel)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled("LPS-148856")) {
			throw new UnsupportedOperationException();
		}

		return new ObjectModel();
	}

}