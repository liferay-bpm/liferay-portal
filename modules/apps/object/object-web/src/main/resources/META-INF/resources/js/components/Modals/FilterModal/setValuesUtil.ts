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

import {API} from '@liferay/object-js-components-web';

import {CurrentFilter} from './ModalAddFilter';
import {
	getCheckedItems,
	getCheckedRelationshipItems,
	getSystemFieldLabelFromEntry,
} from './filterUtil';

type AttachmentEntry = {
	id: number;
	link: {
		href: string;
		label: string;
	};
	name: string;
};

interface SetFieldValuesProps {
	currentFilters: CurrentFilter[];
	editingFilter: boolean;
	editingObjectFieldName: string;
	filterOperators: TFilterOperators;
	objectField: ObjectField;
	setItems: (value: IItem[]) => void;
	setSelectedFilterType: (value: LabelValueObject) => void;
	workflowStatusJSONArray: LabelValueObject[];
}

interface SetPicklistFieldValuesProps
	extends Omit<SetFieldValuesProps, 'workflowStatusJSONArray'> {}

interface SetRelationshipFieldValuesProps extends SetPicklistFieldValuesProps {}

interface SetStatusFieldValuesProps
	extends Omit<SetFieldValuesProps, 'objectField'> {}

const setEditingFilterType = (
	currentFilters: CurrentFilter[],
	editingObjectFieldName: string,
	filterOperators: TFilterOperators,
	setSelectedFilterType: (value: LabelValueObject) => void
) => {
	const currentFilterColumn = currentFilters.find((filterColumn) => {
		if (filterColumn.objectFieldName === editingObjectFieldName) {
			return filterColumn;
		}
	});

	const definition = currentFilterColumn?.definition;
	const filterType = currentFilterColumn?.filterType;

	const valuesArray =
		definition && filterType ? definition[filterType] : null;

	const editingFilterType = filterOperators.picklistOperators.find(
		(filterType) => filterType.value === currentFilterColumn?.filterType
	);

	if (editingFilterType) {
		setSelectedFilterType({
			label: editingFilterType.label,
			value: editingFilterType.value,
		});
	}

	return valuesArray;
};

async function setPicklistFieldValues({
	currentFilters,
	editingFilter,
	editingObjectFieldName,
	filterOperators,
	objectField,
	setItems,
	setSelectedFilterType,
}: SetPicklistFieldValuesProps) {
	if (objectField.listTypeDefinitionId) {
		const items = await API.getPickListItems(
			objectField.listTypeDefinitionId
		);

		if (editingFilter) {
			const valuesArray = setEditingFilterType(
				currentFilters,
				editingObjectFieldName,
				filterOperators,
				setSelectedFilterType
			);

			return setItems(getCheckedItems(items, 'Picklist', valuesArray));
		}

		return setItems(
			items.map((item) => {
				return {
					label: item.name,
					value: item.key,
				};
			})
		);
	}
}

function setStatusFieldValues({
	currentFilters,
	editingFilter,
	editingObjectFieldName,
	filterOperators,
	setItems,
	setSelectedFilterType,
	workflowStatusJSONArray,
}: SetStatusFieldValuesProps) {
	if (editingFilter) {
		const valuesArray = setEditingFilterType(
			currentFilters,
			editingObjectFieldName,
			filterOperators,
			setSelectedFilterType
		);

		const chekedItems = getCheckedItems(
			workflowStatusJSONArray,
			'status',
			valuesArray
		);

		return setItems(chekedItems);
	}

	const workflowStatusItems = workflowStatusJSONArray.map(
		(workflowStatus) => {
			return {
				label: workflowStatus.label,
				value: workflowStatus.value,
			};
		}
	);

	return setItems(workflowStatusItems);
}

async function setRelationshipFieldValues({
	currentFilters,
	editingFilter,
	editingObjectFieldName,
	filterOperators,
	objectField,
	setItems,
	setSelectedFilterType,
}: SetRelationshipFieldValuesProps) {
	const {objectFieldSettings} = objectField;

	const [{value}] = objectFieldSettings as NameValueObject[];

	const [
		{objectFields, restContextPath, system, titleObjectFieldName},
	] = await API.getObjectDefinitions(`filter=name eq '${value}'`);

	const titleField = objectFields.find(
		(objectField) => objectField.name === titleObjectFieldName
	) as ObjectField;

	const relatedEntries = await API.getList<ObjectEntry>(`${restContextPath}`);

	if (!relatedEntries) {
		setItems([]);

		return;
	}

	if (editingFilter) {
		const valuesArray = setEditingFilterType(
			currentFilters,
			editingObjectFieldName,
			filterOperators,
			setSelectedFilterType
		);

		return setItems(
			getCheckedRelationshipItems(
				relatedEntries,
				titleField.name,
				titleField.system as boolean,
				system,
				valuesArray as string[]
			)
		);
	}

	const newItems = relatedEntries.map((entry) => {
		const newItemsObject = {
			value: system ? String(entry.id) : entry.externalReferenceCode,
		} as LabelValueObject;

		if (titleField.system) {
			return getSystemFieldLabelFromEntry(
				titleField.name,
				entry,
				newItemsObject
			) as LabelValueObject;
		}

		let label = entry[titleField?.name] as string;

		if (titleField.businessType === 'Attachment') {
			label = (entry as {
				[key: string]: AttachmentEntry;
			})[titleField.name].name;
		}

		return {
			...newItemsObject,
			label,
		};
	});

	return setItems(newItems);
}

export async function setFieldValues({
	currentFilters,
	editingFilter,
	editingObjectFieldName,
	filterOperators,
	objectField,
	setItems,
	setSelectedFilterType,
	workflowStatusJSONArray,
}: SetFieldValuesProps) {
	if (
		objectField.businessType === 'MultiselectPicklist' ||
		objectField?.businessType === 'Picklist'
	) {
		await setPicklistFieldValues({
			currentFilters,
			editingFilter,
			editingObjectFieldName,
			filterOperators,
			objectField,
			setItems,
			setSelectedFilterType,
		});
	}
	else if (objectField.name === 'status') {
		setStatusFieldValues({
			currentFilters,
			editingFilter,
			editingObjectFieldName,
			filterOperators,
			setItems,
			setSelectedFilterType,
			workflowStatusJSONArray,
		});
	}
	else if (objectField.businessType === 'Relationship') {
		await setRelationshipFieldValues({
			currentFilters,
			editingFilter,
			editingObjectFieldName,
			filterOperators,
			objectField,
			setItems,
			setSelectedFilterType,
		});
	}
}
