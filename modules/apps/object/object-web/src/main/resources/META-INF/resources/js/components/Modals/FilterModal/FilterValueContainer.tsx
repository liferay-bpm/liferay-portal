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

import {
	DatePicker,
	Input,
	MultipleSelect,
} from '@liferay/object-js-components-web';
import React, {useState} from 'react';

import {FilterErrors} from './ModalAddFilter';
import {isMultiSelectValue} from './filterUtil';

interface FilterValueContainerProps {
	aggregationFilter: boolean;
	disableDateValues: boolean;
	errors: FilterErrors;
	items: IItem[];
	selectedFilterBy: ObjectField;
	selectedFilterType: LabelValueObject;
	setItems: (value: IItem[]) => void;
	setValue: (value: string) => void;
	value: string;
}

export function FilterValueContainer({
	aggregationFilter,
	disableDateValues,
	errors,
	items,
	selectedFilterBy,
	selectedFilterType,
	setItems,
	setValue,
	value,
}: FilterValueContainerProps) {
	const [filterStartDate, setFilterStartDate] = useState('');
	const [filterEndDate, setFilterEndDate] = useState('');

	return (
		<>
			{selectedFilterType &&
				(selectedFilterBy?.businessType === 'Integer' ||
					selectedFilterBy?.businessType === 'LongInteger') && (
					<Input
						error={errors.value}
						label={Liferay.Language.get('value')}
						onChange={({target: {value}}) => {
							const newValue = value.replace(/[\D]/g, '');
							setValue(newValue);
						}}
						required
						type="number"
						value={value}
					/>
				)}

			{isMultiSelectValue(
				aggregationFilter,
				selectedFilterBy,
				selectedFilterType
			) && (
				<MultipleSelect
					error={errors.items}
					label={Liferay.Language.get('value')}
					options={items}
					required
					setOptions={setItems}
				/>
			)}

			{selectedFilterType &&
				selectedFilterBy?.businessType === 'Date' &&
				!disableDateValues && (
					<div className="row">
						<div className="col-lg-6">
							<DatePicker
								error={errors.startDate}
								label={Liferay.Language.get('start')}
								onChange={(value) => {
									setItems([
										...items.filter(
											(item) => item.value !== 'ge'
										),
										{
											label: value,
											value: 'ge',
										},
									]);

									setFilterStartDate(value);
								}}
								required
								value={filterStartDate}
							/>
						</div>

						<div className="col-lg-6">
							<DatePicker
								error={errors.endDate}
								label={Liferay.Language.get('end')}
								onChange={(value) => {
									setItems([
										...items.filter(
											(item) => item.value !== 'le'
										),
										{
											label: value,
											value: 'le',
										},
									]);

									setFilterEndDate(value);
								}}
								required
								value={filterEndDate}
							/>
						</div>
					</div>
				)}
		</>
	);
}
