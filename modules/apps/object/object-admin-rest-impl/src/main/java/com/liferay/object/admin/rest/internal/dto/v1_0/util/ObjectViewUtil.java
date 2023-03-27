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

import com.liferay.object.admin.rest.dto.v1_0.ObjectView;
import com.liferay.object.admin.rest.dto.v1_0.ObjectViewColumn;
import com.liferay.object.admin.rest.dto.v1_0.ObjectViewFilterColumn;
import com.liferay.object.admin.rest.dto.v1_0.ObjectViewSortColumn;
import com.liferay.object.service.ObjectViewService;
import com.liferay.object.service.persistence.ObjectViewColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewFilterColumnPersistence;
import com.liferay.object.service.persistence.ObjectViewSortColumnPersistence;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

/**
 * @author Mateus Santana
 */
public class ObjectViewUtil {

	public static void toServiceBuilderView(
			long objectDefinitionId, ObjectView objectView,
			ObjectViewColumnPersistence objectViewColumnPersistence,
			ObjectViewFilterColumnPersistence objectViewFilterColumnPersistence,
			ObjectViewService objectViewService,
			ObjectViewSortColumnPersistence objectViewSortColumnPersistence)
		throws PortalException {

		objectViewService.addObjectView(
			objectDefinitionId,
			GetterUtil.getBoolean(objectView.getDefaultObjectView()),
			LocalizedMapUtil.getLocalizedMap(objectView.getName()),
			TransformUtil.transformToList(
				objectView.getObjectViewColumns(),
				objectViewColumn -> _toServiceBuilderObjectViewColumn(
					objectViewColumn, objectViewColumnPersistence)),
			TransformUtil.transformToList(
				objectView.getObjectViewFilterColumns(),
				objectViewFilterColumn ->
					_toServiceBuilderObjectViewFilterColumn(
						objectViewFilterColumn,
						objectViewFilterColumnPersistence)),
			TransformUtil.transformToList(
				objectView.getObjectViewSortColumns(),
				objectViewSortColumns -> _toServiceBuilderObjectViewSortColumn(
					objectViewSortColumns, objectViewSortColumnPersistence)));
	}

	private static com.liferay.object.model.ObjectViewColumn
		_toServiceBuilderObjectViewColumn(
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

	private static com.liferay.object.model.ObjectViewFilterColumn
		_toServiceBuilderObjectViewFilterColumn(
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

	private static com.liferay.object.model.ObjectViewSortColumn
		_toServiceBuilderObjectViewSortColumn(
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