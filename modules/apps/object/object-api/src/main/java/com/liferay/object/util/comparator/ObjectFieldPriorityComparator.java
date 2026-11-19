/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.util.comparator;

import com.liferay.object.model.ObjectField;
import com.liferay.portal.kernel.util.DateUtil;
import com.liferay.portal.kernel.util.OrderByComparator;

/**
 * @author Mario Gomes
 */
public class ObjectFieldPriorityComparator
	extends OrderByComparator<ObjectField> {

	public static final String ORDER_BY_ASC =
		"ObjectField.priority ASC, ObjectField.createDate ASC, " +
			"ObjectField.objectFieldId ASC";

	public static final String ORDER_BY_DESC =
		"ObjectField.priority DESC, ObjectField.createDate DESC, " +
			"ObjectField.objectFieldId DESC";

	public static final String[] ORDER_BY_FIELDS = {
		"priority", "createDate", "objectFieldId"
	};

	public static ObjectFieldPriorityComparator getInstance(boolean ascending) {
		if (ascending) {
			return _INSTANCE_ASCENDING;
		}

		return _INSTANCE_DESCENDING;
	}

	@Override
	public int compare(ObjectField objectField1, ObjectField objectField2) {
		int value = Integer.compare(
			objectField1.getPriority(), objectField2.getPriority());

		if (value == 0) {
			value = DateUtil.compareTo(
				objectField1.getCreateDate(), objectField2.getCreateDate());
		}

		if (value == 0) {
			value = Long.compare(
				objectField1.getObjectFieldId(),
				objectField2.getObjectFieldId());
		}

		if (_ascending) {
			return value;
		}

		return -value;
	}

	@Override
	public String getOrderBy() {
		if (_ascending) {
			return ORDER_BY_ASC;
		}

		return ORDER_BY_DESC;
	}

	@Override
	public String[] getOrderByFields() {
		return ORDER_BY_FIELDS;
	}

	@Override
	public boolean isAscending() {
		return _ascending;
	}

	private ObjectFieldPriorityComparator(boolean ascending) {
		_ascending = ascending;
	}

	private static final ObjectFieldPriorityComparator _INSTANCE_ASCENDING =
		new ObjectFieldPriorityComparator(true);

	private static final ObjectFieldPriorityComparator _INSTANCE_DESCENDING =
		new ObjectFieldPriorityComparator(false);

	private final boolean _ascending;

}