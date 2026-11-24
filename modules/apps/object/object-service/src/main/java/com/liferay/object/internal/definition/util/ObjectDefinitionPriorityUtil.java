/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.definition.util;

import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.service.persistence.ObjectFieldPersistence;
import com.liferay.object.service.persistence.ObjectRelationshipPersistence;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Mario Gomes
 */
public class ObjectDefinitionPriorityUtil {

	public static int getNextPriority(
		long objectDefinitionId, ObjectFieldPersistence objectFieldPersistence,
		ObjectRelationshipPersistence objectRelationshipPersistence) {

		List<ObjectField> objectFields =
			objectFieldPersistence.findByObjectDefinitionId(objectDefinitionId);
		List<ObjectRelationship> objectRelationships =
			objectRelationshipPersistence.findByObjectDefinitionId1(
				objectDefinitionId);

		if (objectFields.isEmpty() && objectRelationships.isEmpty()) {
			return 0;
		}

		int priority = Integer.MIN_VALUE;

		for (ObjectField objectField : objectFields) {
			priority = Math.max(priority, objectField.getPriority());
		}

		for (ObjectRelationship objectRelationship : objectRelationships) {
			priority = Math.max(priority, objectRelationship.getPriority());
		}

		if (priority <= (Integer.MAX_VALUE - _PRIORITY_INTERVAL)) {
			return priority + _PRIORITY_INTERVAL;
		}

		return _resetPriorities(
			objectFieldPersistence, objectFields, objectRelationshipPersistence,
			objectRelationships);
	}

	private static int _getPriority(Object model) {
		if (model instanceof ObjectField) {
			ObjectField objectField = (ObjectField)model;

			return objectField.getPriority();
		}

		ObjectRelationship objectRelationship = (ObjectRelationship)model;

		return objectRelationship.getPriority();
	}

	private static int _resetPriorities(
		ObjectFieldPersistence objectFieldPersistence,
		List<ObjectField> objectFields,
		ObjectRelationshipPersistence objectRelationshipPersistence,
		List<ObjectRelationship> objectRelationships) {

		List<Object> models = new ArrayList<>(objectFields);

		models.addAll(objectRelationships);

		models.sort(
			(model1, model2) -> Integer.compare(
				_getPriority(model1), _getPriority(model2)));

		int count = Math.min(
			models.size(), Integer.MAX_VALUE / _PRIORITY_INTERVAL);

		for (int i = 0; i < models.size(); i++) {
			int priority = Math.min(i, count) * _PRIORITY_INTERVAL;

			Object model = models.get(i);

			if (model instanceof ObjectField) {
				ObjectField objectField = (ObjectField)model;

				objectField.setPriority(priority);

				objectFieldPersistence.update(objectField);
			}
			else {
				ObjectRelationship objectRelationship =
					(ObjectRelationship)model;

				objectRelationship.setPriority(priority);

				objectRelationshipPersistence.update(objectRelationship);
			}
		}

		return count * _PRIORITY_INTERVAL;
	}

	private static final int _PRIORITY_INTERVAL = 1000000;

}