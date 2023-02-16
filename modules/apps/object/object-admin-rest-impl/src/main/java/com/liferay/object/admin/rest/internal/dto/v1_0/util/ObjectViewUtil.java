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

package com.liferay.object.admin.rest.internal.dto.v1_0.util;

import com.liferay.object.admin.rest.dto.v1_0.ObjectViewColumn;
import com.liferay.object.admin.rest.dto.v1_0.ObjectViewFilterColumn;
import com.liferay.object.admin.rest.dto.v1_0.ObjectViewSortColumn;
import com.liferay.object.service.persistence.ObjectViewColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewFilterColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewSortColumnPersistence;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

/**
 * @author Paulo Albuquerque
 */
public class ObjectViewUtil {

	public static com.liferay.object.model.ObjectViewColumn toObjectViewColumn(
		ObjectViewColumn objectViewColumn,
		ObjectViewColumnPersistence objectViewColumnPersistence) {

		com.liferay.object.model.ObjectViewColumn
			serviceBuilderObjectViewColumn = objectViewColumnPersistence.create(
				0L);

		serviceBuilderObjectViewColumn.setLabelMap(
			LocalizedMapUtil.getLocalizedMap(objectViewColumn.getLabel()));
		serviceBuilderObjectViewColumn.setObjectFieldName(
			objectViewColumn.getObjectFieldName());
		serviceBuilderObjectViewColumn.setPriority(
			objectViewColumn.getPriority());

		return serviceBuilderObjectViewColumn;
	}

	public static com.liferay.object.model.ObjectViewFilterColumn
		toObjectViewFilterColumn(
			ObjectViewFilterColumn objectViewFilterColumn,
			ObjectViewFilterColumnPersistence
				objectViewFilterColumnPersistence) {

		com.liferay.object.model.ObjectViewFilterColumn
			serviceBuilderObjectViewFilterColumn =
				objectViewFilterColumnPersistence.create(0L);

		serviceBuilderObjectViewFilterColumn.setFilterType(
			objectViewFilterColumn.getFilterTypeAsString());
		serviceBuilderObjectViewFilterColumn.setJSON(
			objectViewFilterColumn.getJson());
		serviceBuilderObjectViewFilterColumn.setObjectFieldName(
			objectViewFilterColumn.getObjectFieldName());

		return serviceBuilderObjectViewFilterColumn;
	}

	public static com.liferay.object.model.ObjectViewSortColumn
		toObjectViewSortColumn(
			ObjectViewSortColumn objectViewSortColumn,
			ObjectViewSortColumnPersistence objectViewSortColumnPersistence) {

		com.liferay.object.model.ObjectViewSortColumn
			serviceBuilderObjectViewSortColumn =
				objectViewSortColumnPersistence.create(0L);

		serviceBuilderObjectViewSortColumn.setObjectFieldName(
			objectViewSortColumn.getObjectFieldName());
		serviceBuilderObjectViewSortColumn.setPriority(
			objectViewSortColumn.getPriority());
		serviceBuilderObjectViewSortColumn.setSortOrder(
			objectViewSortColumn.getSortOrderAsString());

		return serviceBuilderObjectViewSortColumn;
	}

}