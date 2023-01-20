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

export function getCheckedItems(
	itemValues: LabelValueObject[] | PickListItem[],
	type: 'Picklist' | 'status',
	valuesArray: number[] | string[] | null
) {
	let newItemsValues: IItem[] = [];

	newItemsValues = itemValues.map((itemValue) => {
		let item: IItem = {
			checked: false,
			label: '',
			value: '',
		};

		if (type === 'status') {
			const {label, value} = itemValue as LabelValueObject;

			item = {
				...item,
				label,
				value,
			};

			if ((valuesArray as number[]).includes(Number(value))) {
				item.checked = true;
			}
		}

		if (type === 'Picklist') {
			const {key, name} = itemValue as PickListItem;

			item = {
				...item,
				label: name,
				value: key,
			};

			if ((valuesArray as string[])?.includes(key)) {
				item.checked = true;
			}
		}

		return item;
	});

	return newItemsValues;
}

export function getCheckedRelationshipItems(
	relatedEntries: ObjectEntry[],
	titleFieldName: string,
	systemField: boolean,
	systemObject: boolean,
	valuesArray: string[]
): IItem[] {
	let newItemsValues: IItem[] = [];

	newItemsValues = relatedEntries.map((entry) => {
		const item = {
			checked: false,
			value: systemObject
				? String(entry.id)
				: entry.externalReferenceCode,
		} as IItem;

		if (valuesArray.includes(entry.externalReferenceCode)) {
			item.checked = true;
		}

		if (systemField) {
			return getSystemFieldLabelFromEntry(
				titleFieldName,
				entry,
				item
			) as IItem;
		}

		return {
			...item,
			label: entry[titleFieldName] as string,
		};
	});

	return newItemsValues;
}

export function getFilterTypeOperators(
	filterOperators: TFilterOperators,
	selectedFilterBy: ObjectField
) {
	const {businessType, name} = selectedFilterBy as ObjectField;

	if (businessType === 'Integer' || businessType === 'LongInteger') {
		return filterOperators.numericOperators;
	}

	if (
		businessType === 'Picklist' ||
		businessType === 'MultiselectPicklist' ||
		name === 'status' ||
		businessType === 'Relationship'
	) {
		return filterOperators.picklistOperators;
	}

	if (businessType === 'Date') {
		return filterOperators.dateOperators;
	}

	return [];
}

export function getSystemFieldLabelFromEntry(
	titleFieldName: string,
	entry: ObjectEntry,
	itemObject: LabelValueObject
) {
	if (titleFieldName === 'creator') {
		const {name} = entry.creator;

		return {
			...itemObject,
			label: name,
		};
	}

	if (titleFieldName === 'status') {
		const {label_i18n} = entry.status;

		return {
			...itemObject,
			label: label_i18n,
		};
	}

	if (titleFieldName === 'createDate') {
		return {
			...itemObject,
			label: entry['dateCreated'],
		};
	}

	if (titleFieldName === 'modifiedDate') {
		return {
			...itemObject,
			label: entry['dateModified'],
		};
	}

	return {
		...itemObject,
		label: entry[titleFieldName],
	};
}

export function getValueList(
	businessType: string,
	checkedItems: IItem[],
	editingFilter: boolean,
	items: IItem[],
	name: string
) {
	if (
		name === 'status' ||
		businessType === 'MultiselectPicklist' ||
		businessType === 'Picklist' ||
		businessType === 'Relationship'
	) {
		return checkedItems;
	}

	if (!editingFilter && businessType === 'Date') {
		return items;
	}

	return undefined;
}

export function isMultiSelectValue(
	aggregationFilter: boolean,
	selectedFilterBy: ObjectField,
	selectedFilterType: LabelValueObject
) {
	if (
		aggregationFilter &&
		selectedFilterBy?.businessType === 'Relationship'
	) {
		return false;
	}

	if (
		selectedFilterType &&
		(selectedFilterBy?.name === 'status' ||
			selectedFilterBy?.businessType === 'MultiselectPicklist' ||
			selectedFilterBy?.businessType === 'Picklist' ||
			selectedFilterBy?.businessType === 'Relationship')
	) {
		return true;
	}
}
