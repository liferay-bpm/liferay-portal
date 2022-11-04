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

import ClayAlert from '@clayui/alert';
import {BuilderScreen} from '@liferay/object-js-components-web';
import React from 'react';

import {TYPES, useViewContext} from '../objectViewContext';

export function DefaultSortScreen() {
	const [
		{
			objectFields,
			objectView: {objectViewColumns, objectViewSortColumns},
		},
		dispatch,
	] = useViewContext();

	const modalConfig = {
		dispatch,
		objectFields,
		objectViewColumns,
		objectViewSortColumns,
	};

	const handleAddColumns = () => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalDefaultSortColumn', {
			header: Liferay.Language.get('new-default-sort'),
			modalType: 'add',
			showModal: true,
			...modalConfig,
		});
	};

	const handleEditColumns = (objectFieldName: string) => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalDefaultSortColumn', {
			editingObjectFieldName: objectFieldName,
			header: Liferay.Language.get('edit-default-sort'),
			modalType: 'edit',
			showModal: true,
			...modalConfig,
		});
	};

	const handleChangeColumnOrder = (
		draggedIndex: number,
		targetIndex: number
	) => {
		dispatch({
			payload: {draggedIndex, targetIndex},
			type: TYPES.CHANGE_OBJECT_VIEW_SORT_COLUMN_ORDER,
		});
	};

	const handleDeleteColumn = (objectFieldName: string) => {
		dispatch({
			payload: {objectFieldName},
			type: TYPES.DELETE_OBJECT_VIEW_SORT_COLUMN,
		});
	};

	return (
		<>
			<ClayAlert
				className="lfr-objects__side-panel-content-container"
				displayType="info"
				title={`${Liferay.Language.get('info')}:`}
			>
				{Liferay.Language.get(
					'the-hierarchy-of-the-default-sorting-will-be-defined-by-the-vertical-order-of-the-fields'
				)}
			</ClayAlert>

			<BuilderScreen
				defaultSort
				emptyState={{
					buttonText: Liferay.Language.get('new-default-sort'),
					description: Liferay.Language.get(
						'start-creating-a-sort-to-display-specific-data'
					),
					title: Liferay.Language.get(
						'no-default-sort-was-created-yet'
					),
				}}
				firstColumnHeader={Liferay.Language.get('name')}
				hasDragAndDrop
				objectColumns={objectViewSortColumns ?? []}
				onChangeColumnOrder={handleChangeColumnOrder}
				onDeleteColumn={handleDeleteColumn}
				openEditModal={handleEditColumns}
				openModal={handleAddColumns}
				secondColumnHeader={Liferay.Language.get('sorting')}
				title={Liferay.Language.get('default-sort')}
			/>
		</>
	);
}
