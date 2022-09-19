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

import {BuilderScreen} from '@liferay/object-js-components-web';
import React from 'react';

import {TYPES, useViewContext} from '../objectViewContext';

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const ViewBuilderScreen: React.FC<{}> = () => {
	const [
		{
			objectFields,
			objectView: {objectViewColumns},
		},
		dispatch,
	] = useViewContext();

	const objectFieldNames = new Set(
		objectViewColumns.map(({objectFieldName}) => objectFieldName)
	);

	const selected = objectFields.filter(({name}) =>
		objectFieldNames.has(name)
	);

	const handleAddColumns = () => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalAddColumns', {
			getName: ({label}: ObjectField) => label[defaultLanguageId],
			header: Liferay.Language.get('add-columns'),
			items: objectFields,
			onSave: (selectedObjectFields: ObjectField[]) =>
				dispatch({
					payload: {
						selectedObjectFields,
					},
					type: TYPES.ADD_OBJECT_VIEW_COLUMN,
				}),
			selected,
			showModal: true,
			title: Liferay.Language.get('select-the-columns'),
		});
	};

	const handleEditColumns = (objectFieldName: string) => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalEditViewColumn', {
			dispatch,
			editingObjectFieldName: objectFieldName,
			objectViewColumns,
			showModal: true,
		});
	};

	const handleChangeColumnOrder = (
		draggedIndex: number,
		targetIndex: number
	) => {
		dispatch({
			payload: {draggedIndex, targetIndex},
			type: TYPES.CHANGE_OBJECT_VIEW_COLUMN_ORDER,
		});
	};

	const handleDeleteColumn = (objectFieldName: string) => {
		dispatch({
			payload: {objectFieldName},
			type: TYPES.DELETE_OBJECT_VIEW_COLUMN,
		});

		dispatch({
			payload: {objectFieldName},
			type: TYPES.DELETE_OBJECT_VIEW_SORT_COLUMN,
		});
	};

	return (
		<>
			<BuilderScreen
				emptyState={{
					buttonText: Liferay.Language.get('add-column'),
					description: Liferay.Language.get(
						'add-columns-to-start-creating-a-view'
					),
					title: Liferay.Language.get('no-columns-added-yet'),
				}}
				firstColumnHeader={Liferay.Language.get('name')}
				hasDragAndDrop
				objectColumns={objectViewColumns ?? []}
				onChangeColumnOrder={handleChangeColumnOrder}
				onDeleteColumn={handleDeleteColumn}
				openEditModal={handleEditColumns}
				openModal={handleAddColumns}
				secondColumnHeader={Liferay.Language.get('column-label')}
				title={Liferay.Language.get('columns')}
			/>
		</>
	);
};

export default ViewBuilderScreen;
