/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';
import React from 'react';

import MultipleSelect, {
	isFormFieldSettings,
} from '../../../src/main/resources/META-INF/resources/Select/MultipleSelect';

describe('Field MultipleSelect', () => {
	const options = [
		{
			active: false,
			checked: false,
			label: 'Option 1',
			reference: 'Option30987029',
			type: 'checkbox',
			value: 'Option30987029',
		},
		{
			active: false,
			checked: false,
			label: 'Option 2',
			reference: 'Option30987030',
			type: 'checkbox',
			value: 'Option30987030',
		},
	];

	it('has aria-labelledby', () => {
		const {container} = render(
			<MultipleSelect
				id="MultipleSelectId"
				label="Multiple Select"
				options={options}
			/>
		);

		const multipleSelectInput = container.querySelector(
			'input[aria-labelledby="MultipleSelectId"]'
		);

		expect(multipleSelectInput).toBeInTheDocument();
	});

	it('has placeholder', () => {
		const {container} = render(
			<MultipleSelect
				id="MultipleSelectId"
				label="Multiple Select"
				options={options}
			/>
		);

		const multipleSelectInput = container.querySelector(
			'input[placeholder="choose-options"]'
		);

		expect(multipleSelectInput).toBeInTheDocument();
	});

	it('can be required', () => {
		const {container} = render(
			<MultipleSelect
				id="MultipleSelectId"
				label="Multiple Select"
				options={options}
				required
			/>
		);

		const multipleSelectInput = container.querySelector(
			'input[aria-required="true"]'
		);

		expect(multipleSelectInput).toBeInTheDocument();
	});

	describe('isFormFieldSettings(activeTabTitle, readOnly, viewMode)', () => {
		it('checks if MultipleSelect is being used by the field settings in Forms ', () => {
			expect(isFormFieldSettings('basic', false, false)).toBeTruthy();
		});

		it('checks if MultipleSelect is not being used by the field settings in Forms ', () => {
			expect(isFormFieldSettings(undefined, true, true)).toBeFalsy();
		});
	});
});
