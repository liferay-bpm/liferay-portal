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

import {FilterErrors, FilterValidation} from '../../ModalAddFilter';
import {TYPES, useViewContext} from '../objectViewContext';

const REQUIRED_MSG = Liferay.Language.get('required');

export function FilterScreen() {
	const [
		{filterOperators, objectFields, objectView, workflowStatusJSONArray},
		dispatch,
	] = useViewContext();

	const {objectViewFilterColumns} = objectView;

	const handleDeleteColumn = (objectFieldName: string) => {
		dispatch({
			payload: {objectFieldName},
			type: TYPES.DELETE_OBJECT_VIEW_FILTER_COLUMN,
		});
	};

	const validateFilters = ({
		checkedItems,
		disableDateValues,
		selectedFilterBy,
		selectedFilterType,
		setErrors,
	}: FilterValidation) => {
		setErrors({});
		const currentErrors: FilterErrors = {};

		if (!selectedFilterBy) {
			currentErrors.selectedFilterBy = REQUIRED_MSG;
		}

		if (
			!selectedFilterType &&
			!disableDateValues &&
			(selectedFilterBy?.name !== 'status' ||
				selectedFilterBy?.businessType !== 'Picklist')
		) {
			currentErrors.selectedFilterType = REQUIRED_MSG;
		}

		if (
			selectedFilterType &&
			(selectedFilterBy?.name === 'status' ||
				selectedFilterBy?.businessType === 'Picklist' ||
				selectedFilterBy?.businessType === 'Relationship') &&
			!checkedItems.length
		) {
			currentErrors.items = REQUIRED_MSG;
		}

		setErrors(currentErrors);

		return currentErrors;
	};

	const filterModalConfig = {
		currentFilters: objectViewFilterColumns,
		disableDateValues: true,
		filterOperators,
		showModal: true,
		validate: validateFilters,
		workflowStatusJSONArray,
	};

	const handleAddFilters = () => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalAddFilter', {
			header: Liferay.Language.get('new-filter'),
			modalType: 'add',
			objectFields: objectFields.filter(
				(objectField: ObjectFieldView) => {
					if (
						objectField.businessType === 'Picklist' ||
						objectField.businessType === 'MultiselectPicklist' ||
						(Liferay.FeatureFlags['LPS-152650'] &&
							objectField.businessType === 'Relationship') ||
						objectField.name === 'createDate' ||
						objectField.name === 'modifiedDate' ||
						(objectField.name === 'status' &&
							!objectField.hasFilter)
					) {
						return objectField;
					}
				}
			),
			onSave: (
				objectFieldName: string,
				filterBy?: string,
				fieldLabel?: LocalizedValue<string>,
				objectFieldBusinessType?: string,
				filterType?: string,
				valueList?: IItem[]
			) => {
				dispatch({
					payload: {
						filterType,
						objectFieldName,
						valueList,
					},
					type: TYPES.ADD_OBJECT_VIEW_FILTER_COLUMN,
				});
			},
			...filterModalConfig,
		});
	};

	const handleEditFilters = (objectFieldName: string) => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalAddFilter', {
			editingObjectFieldName: objectFieldName,
			header: Liferay.Language.get('edit-filter'),
			modalType: 'edit',
			objectFields,
			onSave: (
				objectFieldName: string,
				filterBy?: string,
				fieldLabel?: LocalizedValue<string>,
				objectFieldBusinessType?: string,
				filterType?: string,
				valueList?: IItem[]
			) => {
				dispatch({
					payload: {
						filterType,
						objectFieldName,
						valueList,
					},
					type: TYPES.EDIT_OBJECT_VIEW_FILTER_COLUMN,
				});
			},
			...filterModalConfig,
		});
	};

	return (
		<>
			<BuilderScreen
				emptyState={{
					buttonText: Liferay.Language.get('new-filter'),
					description: Liferay.Language.get(
						'start-creating-a-filter-to-display-specific-data'
					),
					title: Liferay.Language.get('no-filter-was-created-yet'),
				}}
				filter
				firstColumnHeader={Liferay.Language.get('filter-by')}
				objectColumns={
					objectViewFilterColumns.map((filterColumn) => {
						if (
							filterColumn.objectFieldName === 'createDate' ||
							filterColumn.objectFieldName === 'modifiedDate'
						) {
							return {
								...filterColumn,
								disableEdit: true,
							};
						}
						else {
							return filterColumn;
						}
					}) ?? []
				}
				onDeleteColumn={handleDeleteColumn}
				openEditModal={handleEditFilters}
				openModal={handleAddFilters}
				secondColumnHeader={Liferay.Language.get('type')}
				thirdColumnHeader={Liferay.Language.get('value')}
				title={Liferay.Language.get('filters')}
			/>
		</>
	);
}

interface IItem extends LabelValueObject {
	checked?: boolean;
}
