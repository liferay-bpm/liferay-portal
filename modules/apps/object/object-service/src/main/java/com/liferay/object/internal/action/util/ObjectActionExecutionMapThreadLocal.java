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

package com.liferay.object.internal.action.util;

import com.liferay.petra.lang.CentralizedThreadLocal;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * @author Guilherme Camacho
 */
public class ObjectActionExecutionMapThreadLocal {

	public static void addObjectActionExecutionItem(
		long objectActionId, long objectEntryId) {

		Map<Long, Set<Long>> objectActionExecutionMap =
			getObjectActionExecutionMap();

		Set<Long> objectEntryIds = objectActionExecutionMap.get(objectActionId);

		if (objectEntryIds == null) {
			objectEntryIds = new HashSet<>();

			objectActionExecutionMap.put(objectActionId, objectEntryIds);
		}

		objectEntryIds.add(objectEntryId);

		objectActionExecutionMap.put(objectActionId, objectEntryIds);
	}

	public static void clearObjectActionExecutionMap() {
		Map<Long, Set<Long>> objectActionExecutionMap =
			getObjectActionExecutionMap();

		objectActionExecutionMap.clear();
	}

	public static Map<Long, Set<Long>> getObjectActionExecutionMap() {
		return _objectActionExecutionMapThreadLocal.get();
	}

	public static void setObjectActionExecutionMap(
		Map<Long, Set<Long>> objectActionExecutionMap) {

		_objectActionExecutionMapThreadLocal.set(objectActionExecutionMap);
	}

	private static final ThreadLocal<Map<Long, Set<Long>>>
		_objectActionExecutionMapThreadLocal = new CentralizedThreadLocal<>(
			ObjectActionExecutionMapThreadLocal.class.getName() +
				"._objectActionIdsThreadLocal",
			HashMap::new);

}