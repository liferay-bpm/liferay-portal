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

import com.liferay.object.admin.rest.dto.v1_0.ObjectValidationRule;
import com.liferay.object.service.ObjectValidationRuleService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

/**
 * @author Mateus Santana
 */
public class ObjectValidationRuleUtil {

	public static void toServiceBuilderValidationRule(
		long objectDefinitionId, ObjectValidationRule objectValidationRule,
		ObjectValidationRuleService objectValidationRuleService)
		throws PortalException {

		objectValidationRuleService.addObjectValidationRule(
			objectDefinitionId,
			GetterUtil.getBoolean(objectValidationRule.getActive()),
			objectValidationRule.getEngine(),
			LocalizedMapUtil.getLocalizedMap(
				objectValidationRule.getErrorLabel()),
			LocalizedMapUtil.getLocalizedMap(
				objectValidationRule.getName()),
			objectValidationRule.getScript());
	}

}