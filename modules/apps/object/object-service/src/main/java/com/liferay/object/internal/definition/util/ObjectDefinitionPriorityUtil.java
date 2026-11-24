/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.definition.util;

import com.liferay.object.model.ObjectFieldTable;
import com.liferay.object.model.ObjectRelationshipTable;
import com.liferay.object.service.persistence.ObjectFieldPersistence;
import com.liferay.object.service.persistence.ObjectRelationshipPersistence;
import com.liferay.petra.sql.dsl.DSLFunctionFactoryUtil;
import com.liferay.petra.sql.dsl.DSLQueryFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;

import java.util.List;

/**
 * @author Mario Gomes
 */
public class ObjectDefinitionPriorityUtil {

	public static int getNextPriority(
		long objectDefinitionId, ObjectFieldPersistence objectFieldPersistence,
		ObjectRelationshipPersistence objectRelationshipPersistence) {

		List<Integer> objectFieldPriorities = objectFieldPersistence.dslQuery(
			DSLQueryFactoryUtil.select(
				DSLFunctionFactoryUtil.max(
					ObjectFieldTable.INSTANCE.priority
				).as(
					"maxPriority"
				)
			).from(
				ObjectFieldTable.INSTANCE
			).where(
				ObjectFieldTable.INSTANCE.objectDefinitionId.eq(
					objectDefinitionId)
			));
		List<Integer> objectRelationshipPriorities =
			objectRelationshipPersistence.dslQuery(
				DSLQueryFactoryUtil.select(
					DSLFunctionFactoryUtil.max(
						ObjectRelationshipTable.INSTANCE.priority
					).as(
						"maxPriority"
					)
				).from(
					ObjectRelationshipTable.INSTANCE
				).where(
					ObjectRelationshipTable.INSTANCE.objectDefinitionId1.eq(
						objectDefinitionId)
				));

		int priority = Math.max(
			GetterUtil.getInteger(
				objectFieldPriorities.get(0), Integer.MIN_VALUE),
			GetterUtil.getInteger(
				objectRelationshipPriorities.get(0), Integer.MIN_VALUE));

		if (priority == Integer.MIN_VALUE) {
			return _PRIORITY_INTERVAL;
		}

		return priority + _PRIORITY_INTERVAL;
	}

	private static final int _PRIORITY_INTERVAL = 1000;

}