/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.exception;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.portal.kernel.exception.PortalException;

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

	public static class MustAddAtLeastOneField
		extends RequiredObjectFieldException {

		public MustAddAtLeastOneField() {
			super(
				"At least one object field must be added",
				"at-least-one-object-field-must-be-added");
		}

	}

	public static class MustIntroduceNewCustomField
		extends RequiredObjectFieldException {

		public MustIntroduceNewCustomField(ObjectDefinition objectDefinition) {
			super(
				"Deletion not allowed because a relationship field is being ",
				"used in the object definition " +
					objectDefinition.getShortName());

			_arguments = Collections.singletonList(
				objectDefinition.getShortName());
			_messageKey =
				"deletion-not-allowed-because-a-relationship-field-is-being-" +
					"used-in-the-object-definition-x";
		}

	}

	private RequiredObjectFieldException(String message, String messageKey) {
		super(message);

		_messageKey = messageKey;
	}

	private static List<Object> _arguments;
	private static String _messageKey;

}