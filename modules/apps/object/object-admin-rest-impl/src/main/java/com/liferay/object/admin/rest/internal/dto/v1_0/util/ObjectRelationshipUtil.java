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

package com.liferay.object.admin.rest.internal.dto.v1_0.util;

import com.liferay.object.admin.rest.dto.v1_0.ObjectRelationship;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectRelationshipService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

/**
 * @author Mateus Santana
 */
public class ObjectRelationshipUtil {

	public static void toServiceBuilderRelationship(
			long objectDefinitionId, ObjectRelationship objectRelationship,
			ObjectRelationshipService objectRelationshipService,
			ObjectDefinitionLocalService objectDefinitionLocalService,
			Company contextCompany, User contextUser)
		throws PortalException {

		long objectDefinitionId2 = GetterUtil.getLong(
			objectRelationship.getObjectDefinitionId2());

		if ((objectDefinitionId2 == 0) &&
			(objectRelationship.getObjectDefinitionExternalReferenceCode2() !=
				null)) {

			ObjectDefinition objectDefinition =
				objectDefinitionLocalService.
					fetchObjectDefinitionByExternalReferenceCode(
						objectRelationship.
							getObjectDefinitionExternalReferenceCode2(),
						contextCompany.getCompanyId());

			if (objectDefinition == null) {
				objectDefinition =
					objectDefinitionLocalService.addObjectDefinition(
						objectRelationship.
							getObjectDefinitionExternalReferenceCode2(),
						contextUser.getUserId());
			}

			objectDefinitionId2 = objectDefinition.getObjectDefinitionId();
		}

		objectRelationshipService.addObjectRelationship(
			objectDefinitionId, objectDefinitionId2,
			GetterUtil.getLong(objectRelationship.getParameterObjectFieldId()),
			objectRelationship.getDeletionTypeAsString(),
			LocalizedMapUtil.getLocalizedMap(objectRelationship.getLabel()),
			objectRelationship.getName(), objectRelationship.getTypeAsString());
	}

}