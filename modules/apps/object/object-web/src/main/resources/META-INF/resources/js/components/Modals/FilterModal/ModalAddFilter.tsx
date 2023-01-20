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

import ClayButton from '@clayui/button';
import ClayModal from '@clayui/modal';
import {Observer} from '@clayui/modal/lib/types';
import {
	AutoComplete,
	SingleSelect,
	filterArrayByQuery,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import React, {FormEvent, useEffect, useMemo, useState} from 'react';

import {FilterValueContainer} from './FilterValueContainer';
import {getFilterTypeOperators, getValueList} from './filterUtil';
import {setFieldValues} from './setValuesUtil';

export interface OnSaveFilterProps {
	fieldLabel?: LocalizedValue<string>;
	filterBy?: string;
	filterType?: string;
	objectFieldBusinessType?: string;
	objectFieldName: string;
	value?: string;
	valueList?: IItem[];
}

interface ModalAddFilterProps {
	aggregationFilter?: boolean;
	creationLanguageId?: Locale;
	currentFilters: CurrentFilter[];
	disableDateValues?: boolean;
	editingFilter: boolean;
	editingObjectFieldName: string;
	filterOperators: TFilterOperators;
	filterTypeRequired?: boolean;
	header: string;
	objectFields: ObjectField[];
	observer: Observer;
	onClose: () => void;
	onSave: ({
		fieldLabel,
		filterBy,
		filterType,
		objectFieldBusinessType,
		objectFieldName,
		value,
		valueList,
	}: OnSaveFilterProps) => void;
	showFilterType: (selectedFilterBy: ObjectField) => boolean;
	validate: ({
		checkedItems,
		disableDateValues,
		items,
		selectedFilterBy,
		selectedFilterType,
		setErrors,
		value,
	}: FilterValidation) => FilterErrors;
	workflowStatusJSONArray: LabelValueObject[];
}

interface IItem extends LabelValueObject {
	checked?: boolean;
}

export type FilterErrors = {
	endDate?: string;
	items?: string;
	selectedFilterBy?: string;
	selectedFilterType?: string;
	startDate?: string;
	value?: string;
};

export type FilterValidation = {
	checkedItems: IItem[];
	disableDateValues?: boolean;
	items: IItem[];
	selectedFilterBy?: ObjectField;
	selectedFilterType?: LabelValueObject | null;
	setErrors: (value: FilterErrors) => void;
	value?: string;
};

export type CurrentFilter = {
	definition: {
		[key: string]: string[] | number[];
	} | null;
	fieldLabel?: string;
	filterBy?: string;
	filterType: string | null;
	label: LocalizedValue<string>;
	objectFieldBusinessType?: string;
	objectFieldName?: string;
	value?: string;
	valueList?: LabelValueObject[];
};

export function ModalAddFilter({
	aggregationFilter = false,
	creationLanguageId,
	currentFilters,
	disableDateValues = false,
	editingFilter,
	editingObjectFieldName,
	filterOperators,
	filterTypeRequired,
	header,
	objectFields,
	observer,
	onClose,
	onSave,
	showFilterType,
	validate,
	workflowStatusJSONArray,
}: ModalAddFilterProps) {
	const [items, setItems] = useState<IItem[]>([]);

	const [selectedFilterBy, setSelectedFilterBy] = useState<ObjectField>();

	const [
		selectedFilterType,
		setSelectedFilterType,
	] = useState<LabelValueObject | null>();
	const [value, setValue] = useState<string>();

	const [errors, setErrors] = useState<FilterErrors>({});

	const [query, setQuery] = useState<string>('');

	const filteredAvailableFields = useMemo(() => {
		return filterArrayByQuery({
			array: objectFields,
			creationLanguageId: creationLanguageId!,
			query,
			str: 'label',
		});
	}, [creationLanguageId, objectFields, query]);

	useEffect(() => {
		if (!selectedFilterBy && !editingObjectFieldName) {
			return setItems([]);
		}

		const setFieldValuesProps = {
			currentFilters,
			editingFilter,
			editingObjectFieldName,
			filterOperators,
			setItems,
			setSelectedFilterType,
			workflowStatusJSONArray,
		};

		if (selectedFilterBy) {
			setFieldValues({
				...setFieldValuesProps,
				objectField: selectedFilterBy,
			});

			return;
		}

		const objectField = objectFields.find(
			({name}) => name === editingObjectFieldName
		);

		if (objectField) {
			setFieldValues({
				...setFieldValuesProps,
				objectField,
			});

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		editingFilter,
		setFieldValues,
		selectedFilterBy,
		workflowStatusJSONArray,
	]);

	useEffect(() => {
		if (editingFilter) {
			const editingObjectFieldFilter = objectFields.find(
				(objectField) => objectField.name === editingObjectFieldName
			);

			setSelectedFilterBy(editingObjectFieldFilter);
		}
	}, [editingFilter, editingObjectFieldName, objectFields]);

	const handleSaveFilter = (event: FormEvent) => {
		event.preventDefault();

		const checkedItems = items.filter((item) => item.checked);

		const currentErrors = validate({
			checkedItems,
			disableDateValues,
			items,
			selectedFilterBy,
			selectedFilterType,
			setErrors,
			value,
		});

		if (Object.keys(currentErrors).length) {
			return;
		}

		const {businessType, label, name} = selectedFilterBy as ObjectField;

		onSave({
			fieldLabel: label,
			filterBy: name,
			filterType: selectedFilterType?.value,
			objectFieldBusinessType: businessType,
			objectFieldName: editingFilter ? editingObjectFieldName : name,
			value: value ?? undefined,
			valueList: getValueList(
				businessType,
				checkedItems,
				editingFilter,
				items,
				name
			),
		});

		onClose();
	};

	return (
		<ClayModal observer={observer}>
			<ClayModal.Header>{header}</ClayModal.Header>

			<ClayModal.Body>
				<AutoComplete<ObjectField>
					disabled={editingFilter}
					emptyStateMessage={Liferay.Language.get(
						'there-are-no-columns-available'
					)}
					error={errors.selectedFilterBy}
					items={filteredAvailableFields}
					label={Liferay.Language.get('filter-by')}
					onChangeQuery={setQuery}
					onSelectItem={(item) => {
						const userRelationship = !!item.objectFieldSettings?.find(
							({name, value}) =>
								name === 'objectDefinition1ShortName' &&
								value === 'User'
						);

						setSelectedFilterBy(item);
						setValue('');

						if (
							item.businessType === 'Relationship' &&
							userRelationship &&
							aggregationFilter
						) {
							return setSelectedFilterType({
								label: 'currentUser',
								value: 'currentUser',
							});
						}

						setSelectedFilterType(null);
					}}
					query={query}
					required
					value={getLocalizableLabel(
						creationLanguageId!,
						selectedFilterBy?.label
					)}
				>
					{({label, name}) => (
						<div className="d-flex justify-content-between">
							<div>
								{getLocalizableLabel(
									creationLanguageId!,
									label,
									name
								)}
							</div>
						</div>
					)}
				</AutoComplete>

				{selectedFilterBy && showFilterType(selectedFilterBy) && (
					<SingleSelect
						error={errors.selectedFilterType}
						label={Liferay.Language.get('filter-type')}
						onChange={(target: LabelValueObject) =>
							setSelectedFilterType(target)
						}
						options={getFilterTypeOperators(
							filterOperators,
							selectedFilterBy
						)}
						required={filterTypeRequired}
						value={selectedFilterType?.label ?? ''}
					/>
				)}

				<FilterValueContainer
					aggregationFilter={aggregationFilter}
					disableDateValues={disableDateValues}
					errors={errors}
					items={items}
					selectedFilterBy={selectedFilterBy as ObjectField}
					selectedFilterType={selectedFilterType as LabelValueObject}
					setItems={setItems}
					setValue={setValue}
					value={value as string}
				/>
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={() => onClose()}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton
							displayType="primary"
							onClick={handleSaveFilter}
						>
							{Liferay.Language.get('save')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</ClayModal>
	);
}
