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

import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.vulcan.dto.converter.DTOMapper;
import com.liferay.portal.vulcan.extension.ExtensionProvider;
import com.liferay.portal.vulcan.extension.PropertyDefinition;

import java.io.Serializable;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

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

		ObjectDefinition objectDefinition = _getObjectDefinition(
			companyId, className);

		Map<String, PropertyDefinition> extendedPropertyMap = new HashMap<>();

		for (ObjectField objectField :
				_objectFieldLocalService.getObjectFields(
					objectDefinition.getObjectDefinitionId())) {

			if (objectField.isSystem()) {
				continue;
			}

			PropertyDefinition.PropertyType propertyType = _getType(
				objectField);

			if (propertyType == null) {
				continue;
			}

			extendedPropertyMap.put(
				objectField.getName(),
				new PropertyDefinition(
					objectField.getName(), propertyType,
					objectField.isRequired()));
		}

		for (ObjectRelationship objectRelationship :
				_getObjectRelationships(objectDefinition)) {

			ObjectDefinition relatedObjectDefinition;

			if (objectRelationship.getObjectDefinitionId1() ==
					objectDefinition.getObjectDefinitionId()) {

				relatedObjectDefinition =
					_objectDefinitionLocalService.fetchObjectDefinition(
						objectRelationship.getObjectDefinitionId2());
			}
			else {
				relatedObjectDefinition =
					_objectDefinitionLocalService.fetchObjectDefinition(
						objectRelationship.getObjectDefinitionId1());
			}

			PropertyDefinition.PropertyType propertyType = _getType(
				relatedObjectDefinition, objectRelationship);

			if (propertyType == null) {
				continue;
			}

			extendedPropertyMap.put(
				objectRelationship.getName(),
				new PropertyDefinition(
					ObjectEntry.class, objectRelationship.getName(),
					propertyType,
					new ObjectEntryPropertyValidator(relatedObjectDefinition),
					false));
		}

		return extendedPropertyMap;
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

		if (_getObjectDefinition(companyId, className) != null) {
			return true;
		}

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

	private static PropertyDefinition.PropertyType _getType(
		ObjectDefinition objectDefinition,
		ObjectRelationship objectRelationship) {

		PropertyDefinition.PropertyType propertyType = null;

		if (StringUtil.equals(
				objectRelationship.getType(),
				ObjectRelationshipConstants.TYPE_ONE_TO_MANY)) {

			if (objectDefinition.getObjectDefinitionId() ==
					objectRelationship.getObjectDefinitionId1()) {

				propertyType = PropertyDefinition.PropertyType.SINGLE_ELEMENT;
			}
			else {
				propertyType = PropertyDefinition.PropertyType.MULTIPLE_ELEMENT;
			}
		}
		else if (StringUtil.equals(
					objectRelationship.getType(),
					ObjectRelationshipConstants.TYPE_MANY_TO_MANY)) {

			propertyType = PropertyDefinition.PropertyType.MULTIPLE_ELEMENT;
		}

		return propertyType;
	}

	private static PropertyDefinition.PropertyType _getType(
		ObjectField objectField) {

		PropertyDefinition.PropertyType propertyType = null;

		if (StringUtil.equals(
				objectField.getBusinessType(),
				ObjectFieldConstants.BUSINESS_TYPE_BOOLEAN)) {

			propertyType = PropertyDefinition.PropertyType.BOOLEAN;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_DECIMAL)) {

			propertyType = PropertyDefinition.PropertyType.DOUBLE;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_INTEGER)) {

			propertyType = PropertyDefinition.PropertyType.INTEGER;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_LONG_INTEGER)) {

			propertyType = PropertyDefinition.PropertyType.LONG;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_LONG_TEXT)) {

			propertyType = PropertyDefinition.PropertyType.TEXT;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_PRECISION_DECIMAL)) {

			propertyType = PropertyDefinition.PropertyType.BIG_DECIMAL;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_RICH_TEXT)) {

			propertyType = PropertyDefinition.PropertyType.TEXT;
		}
		else if (StringUtil.equals(
					objectField.getBusinessType(),
					ObjectFieldConstants.BUSINESS_TYPE_TEXT)) {

			propertyType = PropertyDefinition.PropertyType.TEXT;
		}

		// Complete the rest of the missing types, relationships, etc

		return propertyType;
	}

	private ObjectDefinition _getObjectDefinition(
		long companyId, String className) {

		String internalDTOClassName = _dtoMapper.getInternalDTOClassNameFrom(
			className);

		for (ObjectDefinition objectDefinition :
				_objectDefinitionLocalService.getObjectDefinitions(
					QueryUtil.ALL_POS, QueryUtil.ALL_POS)) {

			if ((objectDefinition.getCompanyId() == companyId) &&
				internalDTOClassName.equals(objectDefinition.getClassName())) {

				return objectDefinition;
			}
		}

		return null;
	}

	private List<ObjectRelationship> _getObjectRelationships(
		ObjectDefinition objectDefinition) {

		List<ObjectRelationship> objectRelationships = new ArrayList<>();

		for (ObjectRelationship objectRelationship :
				_objectRelationshipLocalService.getObjectRelationships(
					QueryUtil.ALL_POS, QueryUtil.ALL_POS)) {

			if ((objectRelationship.getObjectDefinitionId1() ==
					objectDefinition.getObjectDefinitionId()) ||
				(objectRelationship.getObjectDefinitionId2() ==
					objectDefinition.getObjectDefinitionId())) {

				objectRelationships.add(objectRelationship);
			}
		}

		return objectRelationships;
	}

	@Reference
	private DTOMapper _dtoMapper;

	// This probably should be the service and not the local service

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	// This probably should be the service and not the local service

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	// This probably should be the service and not the local service

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}