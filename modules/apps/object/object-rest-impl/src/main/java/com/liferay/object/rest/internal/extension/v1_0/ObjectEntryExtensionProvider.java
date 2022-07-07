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

import com.liferay.portal.vulcan.extension.ExtensionProvider;
import com.liferay.portal.vulcan.extension.PropertyDefinition;

import java.io.Serializable;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.osgi.service.component.annotations.Component;

/**
 * @author Carlos Correa
 * @author Javier de Arcos
 */
@Component(immediate = true, service = ExtensionProvider.class)
public class ObjectEntryExtensionProvider implements ExtensionProvider {

	@Override
	public Map<String, Serializable> getExtendedProperties(
		long companyId, Object entity) {

		// Return a Map with the property name as key and the property value as
		// value of all extended properties that can be applied to the given
		// entity. To do so you might cast and inspect the entity to get the
		// internal id or the external reference code to get the related
		// extended fields with its values.

		return Collections.singletonMap("field", "value");
	}

	@Override
	public Map<String, PropertyDefinition> getExtendedPropertyDefinitions(
		long companyId, String className) {

		// Return a Map with the property name as key and the property
		// definition as value of all extended properties that can be applied
		// to the given class name. The property definition is defined at least
		// by a property name, property type and a flag to denote if it is
		// required or not. A className in the case of an object and a custom
		// validator can be defined as well

		return Collections.singletonMap(
			"field",
			new PropertyDefinition(
				"field", PropertyDefinition.PropertyType.TEXT, false));
	}

	@Override
	public Collection<String> getFilteredPropertyNames(
		long companyId, Object entity) {

		// Return a collection of the strings that want to be filtered of the
		// given entity. I think this case it is not needed in the case of
		// Objects

		return null;
	}

	@Override
	public boolean isApplicableExtension(long companyId, String className) {

		// Return if the current extension provider is applicable to the given
		// company id and class name. In the case of objects we consider that
		// you may want to look for an Object definition of type system that
		// matches with the companyId and class name.
		// IMPORTANT! The class name is the one used by the APIs (the external
		// model). You should convert from this external model to the internal
		// model stored in the Object Definition data table.

		return false;
	}

	@Override
	public void setExtendedProperties(
		long companyId, Object entity,
		Map<String, Serializable> extendedProperties) {

		// This method will be called by the Entity Extension Infrastructure
		// after creating or updating the base entity. Then with the
		// information about the company, the entity and extended properties
		// you should process and/or store the values wherever you think is
		// right (I guess in some related object entry)

	}

}