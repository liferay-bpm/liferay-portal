/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.impl;

import com.liferay.object.model.ObjectEntryVersion;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.object.service.base.ObjectEntryVersionServiceBaseImpl;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = {
		"json.web.service.context.name=object",
		"json.web.service.context.path=ObjectEntryVersion"
	},
	service = AopService.class
)
public class ObjectEntryVersionServiceImpl
	extends ObjectEntryVersionServiceBaseImpl {

	@Override
	public ObjectEntryVersion getObjectEntryVersion(long objectEntryId, int version)
		throws PortalException {

		_checkModelResourcePermission(objectEntryId);

		return _objectEntryVersionLocalService.getObjectEntryVersion(
			objectEntryId, version);
	}


	@Reference
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;
}