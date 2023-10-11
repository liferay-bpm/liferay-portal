/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.exception;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.portal.kernel.exception.PortalException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @author Marco Leo
 */
public class RequiredObjectFieldException extends PortalException {

	public List<Object> getArguments() {
		return _arguments;
	}

	public String getMessageKey() {
		return _messageKey;
	}

	public static class MustNotDeleteLastCustomObjectField
		extends RequiredObjectFieldException {

		public MustNotDeleteLastCustomObjectField(
			ObjectDefinition objectDefinition, ObjectField objectField) {

			super(
				Arrays.asList(
					objectField.getName(), objectDefinition.getShortName()),
				String.format(
					"\"%s\" cannot be deleted because it is the only custom " +
						"object field of the object definition \"%s\"",
					objectField.getName(), objectDefinition.getShortName()),
				"x-is-the-only-custom-object-field-of-the-published-object-" +
					"definition-x-and-cannot-be-deleted");
		}

	}

	public static class MustNotDeleteObjectField
		extends RequiredObjectFieldException {

		public MustNotDeleteObjectField(ObjectField objectField) {
			super(
				Collections.singletonList(objectField.getName()),
				String.format(
					"Object field \"%s\" cannot be deleted",
					objectField.getName()),
				"object-field-x-cannot-be-deleted");
		}

	}

	private RequiredObjectFieldException(
		List<Object> arguments, String message, String messageKey) {

		super(message);

		_arguments = arguments;
		_messageKey = messageKey;
	}

	private final List<Object> _arguments;
	private final String _messageKey;

}