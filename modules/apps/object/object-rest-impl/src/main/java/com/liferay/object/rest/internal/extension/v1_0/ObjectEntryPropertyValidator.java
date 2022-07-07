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

package com.liferay.object.rest.internal.extension.v1_0;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.portal.vulcan.extension.PropertyDefinition;
import com.liferay.portal.vulcan.extension.validation.DefaultPropertyValidator;

/**
 * @author Carlos Correa
 */
public class ObjectEntryPropertyValidator extends DefaultPropertyValidator {

	public ObjectEntryPropertyValidator(ObjectDefinition objectDefinition) {
		_objectDefinition = objectDefinition;
	}

	@Override
	public void validate(
		PropertyDefinition propertyDefinition, Object fieldValue) {

		PropertyDefinition.PropertyType propertyType =
			propertyDefinition.getPropertyType();

		if (propertyType == PropertyDefinition.PropertyType.SINGLE_ELEMENT) {

			// do something, it could be a reverse oneToMany relationship!

		}
		else if (propertyType ==
					PropertyDefinition.PropertyType.MULTIPLE_ELEMENT) {

			// do something, it could be a reverse manyToMany relationship!

		}

		super.validate(propertyDefinition, fieldValue);
	}

	private final ObjectDefinition _objectDefinition;

}