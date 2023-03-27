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

import com.liferay.object.admin.rest.dto.v1_0.ObjectLayout;
import com.liferay.object.admin.rest.dto.v1_0.ObjectLayoutBox;
import com.liferay.object.admin.rest.dto.v1_0.ObjectLayoutColumn;
import com.liferay.object.admin.rest.dto.v1_0.ObjectLayoutRow;
import com.liferay.object.admin.rest.dto.v1_0.ObjectLayoutTab;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectLayoutService;
import com.liferay.object.service.persistence.ObjectLayoutBoxPersistence;
import com.liferay.object.service.persistence.ObjectLayoutColumnPersistence;
import com.liferay.object.service.persistence.ObjectLayoutRowPersistence;
import com.liferay.object.service.persistence.ObjectLayoutTabPersistence;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Map;

/**
 * @author Gabriel Albuquerque
 */
public class ObjectRelationshipUtil {

	public static ObjectLayout toObjectLayout(
			Map<String, Map<String, String>> actions,
			ObjectDefinitionLocalService objectDefinitionLocalService,
			ObjectFieldLocalService objectFieldLocalService,
			com.liferay.object.model.ObjectLayout serviceBuilderObjectLayout)
		throws PortalException {

		if (serviceBuilderObjectLayout == null) {
			return null;
		}

		ObjectDefinition objectDefinition =
			objectDefinitionLocalService.getObjectDefinition(
				serviceBuilderObjectLayout.getObjectDefinitionId());

		ObjectLayout objectLayout = new ObjectLayout() {
			{
				dateCreated = serviceBuilderObjectLayout.getCreateDate();
				dateModified = serviceBuilderObjectLayout.getModifiedDate();
				defaultObjectLayout =
					serviceBuilderObjectLayout.getDefaultObjectLayout();
				id = serviceBuilderObjectLayout.getObjectLayoutId();
				name = LocalizedMapUtil.getLanguageIdMap(
					serviceBuilderObjectLayout.getNameMap());
				objectDefinitionExternalReferenceCode =
					objectDefinition.getExternalReferenceCode();
				objectDefinitionId =
					serviceBuilderObjectLayout.getObjectDefinitionId();
				objectLayoutTabs = TransformUtil.transformToArray(
					serviceBuilderObjectLayout.getObjectLayoutTabs(),
					objectLayoutTab -> toObjectLayoutTab(
						objectFieldLocalService, objectLayoutTab),
					ObjectLayoutTab.class);
			}
		};

		objectLayout.setActions(actions);

		return objectLayout;
	}

	public static ObjectLayoutTab toObjectLayoutTab(
		ObjectFieldLocalService objectFieldLocalService,
		com.liferay.object.model.ObjectLayoutTab objectLayoutTab) {

		if (objectLayoutTab == null) {
			return null;
		}

		return new ObjectLayoutTab() {
			{
				id = objectLayoutTab.getObjectLayoutTabId();
				name = LocalizedMapUtil.getLanguageIdMap(
					objectLayoutTab.getNameMap());
				objectLayoutBoxes = TransformUtil.transformToArray(
					objectLayoutTab.getObjectLayoutBoxes(),
					objectLayoutBox -> _toObjectLayoutBox(
						objectFieldLocalService, objectLayoutBox),
					ObjectLayoutBox.class);
				objectRelationshipId =
					objectLayoutTab.getObjectRelationshipId();
				priority = objectLayoutTab.getPriority();
			}
		};
	}

	public static void toServiceBuilderObjectLayout(
			long objectDefinitionId, ObjectLayout objectLayout,
			ObjectLayoutService objectLayoutService,
			ObjectLayoutBoxPersistence objectLayoutBoxPersistence,
			ObjectLayoutColumnPersistence objectLayoutColumnPersistence,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectLayoutRowPersistence objectLayoutRowPersistence,
			ObjectLayoutTabPersistence objectLayoutTabPersistence)
		throws PortalException {

		objectLayoutService.addObjectLayout(
			objectDefinitionId,
			GetterUtil.getBoolean(objectLayout.getDefaultObjectLayout()),
			LocalizedMapUtil.getLocalizedMap(objectLayout.getName()),
			transformToList(
				objectLayout.getObjectLayoutTabs(),
				objectLayoutTab -> _toServiceBuilderObjectLayoutTab(
					objectDefinitionId, objectLayoutTab,
					objectLayoutBoxPersistence, objectLayoutColumnPersistence,
					objectFieldLocalService, objectLayoutRowPersistence,
					objectLayoutTabPersistence)));
	}

	private static ObjectLayoutBox _toObjectLayoutBox(
		ObjectFieldLocalService objectFieldLocalService,
		com.liferay.object.model.ObjectLayoutBox objectLayoutBox) {

		if (objectLayoutBox == null) {
			return null;
		}

		return new ObjectLayoutBox() {
			{
				collapsable = objectLayoutBox.getCollapsable();
				id = objectLayoutBox.getObjectLayoutBoxId();
				name = LocalizedMapUtil.getLanguageIdMap(
					objectLayoutBox.getNameMap());
				objectLayoutRows = TransformUtil.transformToArray(
					objectLayoutBox.getObjectLayoutRows(),
					objectLayoutRow -> _toObjectLayoutRow(
						objectFieldLocalService, objectLayoutRow),
					ObjectLayoutRow.class);
				priority = objectLayoutBox.getPriority();
				type = Type.create(objectLayoutBox.getType());
			}
		};
	}

	private static ObjectLayoutColumn _toObjectLayoutColumn(
		ObjectFieldLocalService objectFieldLocalService,
		com.liferay.object.model.ObjectLayoutColumn
			serviceBuilderObjectLayoutColumn) {

		if (serviceBuilderObjectLayoutColumn == null) {
			return null;
		}

		ObjectField objectField = objectFieldLocalService.fetchObjectField(
			serviceBuilderObjectLayoutColumn.getObjectFieldId());

		return new ObjectLayoutColumn() {
			{
				id = serviceBuilderObjectLayoutColumn.getObjectLayoutColumnId();
				objectFieldName = objectField.getName();
				priority = serviceBuilderObjectLayoutColumn.getPriority();
				size = serviceBuilderObjectLayoutColumn.getSize();
			}
		};
	}

	private static ObjectLayoutRow _toObjectLayoutRow(
		ObjectFieldLocalService objectFieldLocalService,
		com.liferay.object.model.ObjectLayoutRow
			serviceBuilderObjectLayoutRow) {

		if (serviceBuilderObjectLayoutRow == null) {
			return null;
		}

		return new ObjectLayoutRow() {
			{
				id = serviceBuilderObjectLayoutRow.getObjectLayoutRowId();
				objectLayoutColumns = TransformUtil.transformToArray(
					serviceBuilderObjectLayoutRow.getObjectLayoutColumns(),
					objectLayoutColumn -> _toObjectLayoutColumn(
						objectFieldLocalService, objectLayoutColumn),
					ObjectLayoutColumn.class);
				priority = serviceBuilderObjectLayoutRow.getPriority();
			}
		};
	}

	private static com.liferay.object.model.ObjectLayoutBox
		_toServiceBuilderObjectLayoutBox(
			long objectDefinitionId, ObjectLayoutBox objectLayoutBox,
			ObjectLayoutBoxPersistence objectLayoutBoxPersistence,
			ObjectLayoutColumnPersistence objectLayoutColumnPersistence,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectLayoutRowPersistence objectLayoutRowPersistence) {

		com.liferay.object.model.ObjectLayoutBox serviceBuilderObjectLayoutBox =
			objectLayoutBoxPersistence.create(0L);

		serviceBuilderObjectLayoutBox.setCollapsable(
			objectLayoutBox.getCollapsable());
		serviceBuilderObjectLayoutBox.setNameMap(
			LocalizedMapUtil.getLocalizedMap(objectLayoutBox.getName()));
		serviceBuilderObjectLayoutBox.setObjectLayoutRows(
			transformToList(
				objectLayoutBox.getObjectLayoutRows(),
				objectLayoutRow -> _toServiceBuilderObjectLayoutRow(
					objectDefinitionId, objectLayoutRow,
					objectLayoutColumnPersistence, objectFieldLocalService,
					objectLayoutRowPersistence)));
		serviceBuilderObjectLayoutBox.setPriority(
			objectLayoutBox.getPriority());
		serviceBuilderObjectLayoutBox.setType(
			objectLayoutBox.getTypeAsString());

		return serviceBuilderObjectLayoutBox;
	}

	private static com.liferay.object.model.ObjectLayoutColumn
		_toServiceBuilderObjectLayoutColumn(
			long objectDefinitionId, ObjectLayoutColumn objectLayoutColumn,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectLayoutColumnPersistence objectLayoutColumnPersistence) {

		com.liferay.object.model.ObjectLayoutColumn
			serviceBuilderObjectLayoutColumn =
				objectLayoutColumnPersistence.create(0L);

		ObjectField objectField = objectFieldLocalService.fetchObjectField(
			objectDefinitionId, objectLayoutColumn.getObjectFieldName());

		serviceBuilderObjectLayoutColumn.setObjectFieldId(
			objectField.getObjectFieldId());

		serviceBuilderObjectLayoutColumn.setPriority(
			objectLayoutColumn.getPriority());
		serviceBuilderObjectLayoutColumn.setSize(
			GetterUtil.getInteger(objectLayoutColumn.getSize(), 12));

		return serviceBuilderObjectLayoutColumn;
	}

	private static com.liferay.object.model.ObjectLayoutRow
		_toServiceBuilderObjectLayoutRow(
			long objectDefinitionId, ObjectLayoutRow objectLayoutRow,
			ObjectLayoutColumnPersistence objectLayoutColumnPersistence,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectLayoutRowPersistence objectLayoutRowPersistence) {

		com.liferay.object.model.ObjectLayoutRow serviceBuilderObjectLayoutRow =
			objectLayoutRowPersistence.create(0L);

		serviceBuilderObjectLayoutRow.setObjectLayoutColumns(
			transformToList(
				objectLayoutRow.getObjectLayoutColumns(),
				objectLayoutColumn -> _toServiceBuilderObjectLayoutColumn(
					objectDefinitionId, objectLayoutColumn,
					objectFieldLocalService, objectLayoutColumnPersistence)));
		serviceBuilderObjectLayoutRow.setPriority(
			objectLayoutRow.getPriority());

		return serviceBuilderObjectLayoutRow;
	}

	private static com.liferay.object.model.ObjectLayoutTab
		_toServiceBuilderObjectLayoutTab(
			long objectDefinitionId, ObjectLayoutTab objectLayoutTab,
			ObjectLayoutBoxPersistence objectLayoutBoxPersistence,
			ObjectLayoutColumnPersistence objectLayoutColumnPersistence,
			ObjectFieldLocalService objectFieldLocalService,
			ObjectLayoutRowPersistence objectLayoutRowPersistence,
			ObjectLayoutTabPersistence objectLayoutTabPersistence) {

		com.liferay.object.model.ObjectLayoutTab serviceBuilderObjectLayoutTab =
			objectLayoutTabPersistence.create(0L);

		serviceBuilderObjectLayoutTab.setNameMap(
			LocalizedMapUtil.getLocalizedMap(objectLayoutTab.getName()));
		serviceBuilderObjectLayoutTab.setObjectLayoutBoxes(
			transformToList(
				objectLayoutTab.getObjectLayoutBoxes(),
				objectLayoutBox -> _toServiceBuilderObjectLayoutBox(
					objectDefinitionId, objectLayoutBox,
					objectLayoutBoxPersistence, objectLayoutColumnPersistence,
					objectFieldLocalService, objectLayoutRowPersistence)));
		serviceBuilderObjectLayoutTab.setObjectRelationshipId(
			GetterUtil.getLong(objectLayoutTab.getObjectRelationshipId()));
		serviceBuilderObjectLayoutTab.setPriority(
			objectLayoutTab.getPriority());

		return serviceBuilderObjectLayoutTab;
	}

}