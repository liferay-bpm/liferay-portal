/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.util;

import com.liferay.object.model.ObjectAction;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;

/**
 * @author Nathaly Gomes
 */
public class ObjectDescriptionUtil {

	public static String getDescription(ObjectDefinition objectDefinition) {
		return _getDescription(
			objectDefinition.getDescription(LocaleUtil.US, false),
			objectDefinition.getDescription(
				objectDefinition.getDefaultLanguageId(), false));
	}

	public static String getDescription(
		ObjectDefinition objectDefinition, ObjectAction objectAction) {

		return _getDescription(
			objectAction.getDescription(LocaleUtil.US, false),
			objectAction.getDescription(
				objectDefinition.getDefaultLanguageId(), false));
	}

	public static String getDescription(
		ObjectDefinition objectDefinition, ObjectField objectField) {

		return _getDescription(
			objectField.getDescription(LocaleUtil.US, false),
			objectField.getDescription(
				objectDefinition.getDefaultLanguageId(), false));
	}

	public static String getDescription(
		ObjectDefinition objectDefinition,
		ObjectRelationship objectRelationship) {

		return _getDescription(
			objectRelationship.getDescription(LocaleUtil.US, false),
			objectRelationship.getDescription(
				objectDefinition.getDefaultLanguageId(), false));
	}

	private static String _getDescription(
		String englishDescription, String defaultLanguageDescription) {

		if (Validator.isNotNull(englishDescription)) {
			return englishDescription;
		}

		if (Validator.isNotNull(defaultLanguageDescription)) {
			return defaultLanguageDescription;
		}

		return null;
	}

}