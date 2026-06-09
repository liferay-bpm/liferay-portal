/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import React, {useState as useStateMock} from 'react';

import ScriptManagementContainer from '../components/ScriptManagementContainer';

jest.mock('react', () => ({
	...(jest.requireActual('react') as {}),
	useState: jest.fn(),
}));

const setAllowScriptContent = jest.fn();

beforeAll(() => {

	// @ts-ignore

	useStateMock.mockImplementation((allowScriptContent: boolean) => [
		allowScriptContent,
		setAllowScriptContent,
	]);
});

describe('ScriptManagementContainer component', () => {
	it('check if checkbox label renders correctly', () => {
		const {getByLabelText} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={false}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL=""
			/>
		);

		const input = getByLabelText(
			'allow-administrator-to-create-and-execute-code-in-liferay'
		);

		expect(input).toBeInTheDocument();
	});

	it('check if Script Management title renders correctly', () => {
		const {getByText} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={false}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL=""
			/>
		);

		const scriptManagementTitle = getByText('script-management');

		expect(scriptManagementTitle).toBeInTheDocument();
	});

	it('check if checkbox description renders correctly', () => {
		const {getByText} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={false}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL=""
			/>
		);

		const checkboxDescription = getByText(
			'administrators-can-create-and-execute-code-in-their-virtual-instance'
		);

		expect(checkboxDescription).toBeInTheDocument();
	});

	it('check if checkbox will be checked if allowScriptContentToBeExecutedOrIncluded is true', () => {
		const {getByRole} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={true}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL=""
			/>
		);

		const checkboxInput = getByRole('checkbox');

		expect(checkboxInput).toBeChecked();
	});

	it('check if checkbox will be not checked if allowScriptContentToBeExecutedOrIncluded is false', () => {
		const {getByRole} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={false}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL=""
			/>
		);

		const checkboxInput = getByRole('checkbox');

		expect(checkboxInput).not.toBeChecked();
	});

	it('check if the hidden input value reflects the configuration when enabled', () => {
		const {container} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={true}
				baseResourceURL=""
				formName=""
				namespace="_test_"
				redirectURL=""
			/>
		);

		const hiddenInput = container.querySelector(
			'input[name="_test_allowScriptContentToBeExecutedOrIncluded"]'
		);

		expect(hiddenInput).toHaveValue('true');
	});

	it('check if the cancel link points to the redirect URL', () => {
		const {getByText} = render(
			<ScriptManagementContainer
				allowScriptContentToBeExecutedOrIncluded={false}
				baseResourceURL=""
				formName=""
				namespace=""
				redirectURL="/test-redirect"
			/>
		);

		const cancelLink = getByText('cancel');

		expect(cancelLink).toHaveAttribute('href', '/test-redirect');
	});
});
