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

package com.liferay.object.entry.util;

import com.liferay.dynamic.data.mapping.expression.CreateExpressionRequest;
import com.liferay.dynamic.data.mapping.expression.DDMExpression;
import com.liferay.dynamic.data.mapping.expression.DDMExpressionFactory;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.dynamic.data.mapping.expression.ObjectEntryDDMExpressionFieldAccessor;
import com.liferay.object.exception.ObjectFieldReadOnlyException;
import com.liferay.object.field.setting.util.ObjectFieldSettingUtil;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectFieldSettingLocalServiceUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.util.Validator;

import java.math.BigDecimal;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * @author Paulo Albuquerque
 */
public class ObjectEntryReadOnlyUtil {

	public static void validateReadOnly(
			long objectDefinitionId, Map<String, Object> expressionVariables,
			Map<String, Object> values,
			DDMExpressionFactory ddmExpressionFactory,
			ObjectFieldLocalService objectFieldLocalService)
		throws PortalException {

		if (expressionVariables.isEmpty()) {
			_fillDefaultValues(
				expressionVariables,
				objectFieldLocalService.getObjectFields(objectDefinitionId));
		}

		expressionVariables.put(
			"currentUserId", PrincipalThreadLocal.getUserId());

		for (Map.Entry<String, Object> entry : values.entrySet()) {
			if (Objects.equals(entry.getKey(), "status")) {
				continue;
			}

			ObjectField objectField = objectFieldLocalService.fetchObjectField(
				objectDefinitionId, entry.getKey());

			if ((objectField == null) ||
				Objects.equals(
					objectField.getReadOnly(),
					ObjectFieldConstants.READ_ONLY_FALSE)) {

				continue;
			}

			if (Objects.equals(
					objectField.getReadOnly(),
					ObjectFieldConstants.READ_ONLY_TRUE)) {

				_verifyReadOnlyTrue(
					entry.getKey(), entry.getValue(), expressionVariables,
					objectField.getName());

				continue;
			}

			DDMExpression<Boolean> ddmExpression =
				ddmExpressionFactory.createExpression(
					CreateExpressionRequest.Builder.newBuilder(
						objectField.getReadOnlyConditionExpression()
					).withDDMExpressionFieldAccessor(
						new ObjectEntryDDMExpressionFieldAccessor(
							expressionVariables)
					).build());

			ddmExpression.setVariables(expressionVariables);

			if (ddmExpression.evaluate()) {
				_verifyReadOnlyTrue(
					entry.getKey(), entry.getValue(), expressionVariables,
					objectField.getName());
			}
		}
	}

	private static void _fillDefaultValues(
		Map<String, Object> existingValues, List<ObjectField> objectFields) {

		for (ObjectField objectField : objectFields) {
			String defaultValue =
				ObjectFieldSettingUtil.getDefaultValueAsString(
					null, objectField.getObjectFieldId(),
					ObjectFieldSettingLocalServiceUtil.getService(), null);

			if (defaultValue != null) {
				existingValues.put(objectField.getName(), defaultValue);
			}

			if (Objects.equals(
					objectField.getDBType(),
					ObjectFieldConstants.DB_TYPE_STRING) ||
				Objects.equals(
					objectField.getDBType(),
					ObjectFieldConstants.DB_TYPE_CLOB)) {

				existingValues.put(objectField.getName(), StringPool.BLANK);
			}
			else if (Objects.equals(
						objectField.getDBType(),
						ObjectFieldConstants.DB_TYPE_DOUBLE) ||
					 Objects.equals(
						 objectField.getDBType(),
						 ObjectFieldConstants.DB_TYPE_INTEGER) ||
					 Objects.equals(
						 objectField.getDBType(),
						 ObjectFieldConstants.DB_TYPE_LONG)) {

				existingValues.put(objectField.getName(), 0);
			}
			else if (Objects.equals(
						objectField.getDBType(),
						ObjectFieldConstants.DB_TYPE_BIG_DECIMAL)) {

				existingValues.put(objectField.getName(), BigDecimal.ZERO);
			}
			else if (Objects.equals(
						objectField.getDBType(),
						ObjectFieldConstants.DB_TYPE_BOOLEAN)) {

				existingValues.put(objectField.getName(), false);
			}
			else {
				existingValues.put(objectField.getName(), null);
			}
		}
	}

	private static void _verifyReadOnlyTrue(
			String entryKey, Object entryValue,
			Map<String, Object> existingValues, String objectFieldName)
		throws PortalException {

		Object existingValue = existingValues.get(entryKey);

		if (!((Validator.isNull(existingValue) &&
			   Validator.isNull(entryValue)) ||
			  Objects.equals(entryValue, existingValue))) {

			throw new ObjectFieldReadOnlyException(
				"The object field " + objectFieldName + " is readOnly");
		}
	}

}