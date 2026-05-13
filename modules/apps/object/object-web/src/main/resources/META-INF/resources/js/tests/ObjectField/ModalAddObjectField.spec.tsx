/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {API} from '@liferay/object-js-components-web';

// @ts-ignore

import fetchMock from 'fetch-mock';

import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {ModalAddObjectField} from '../../components/ObjectField/ModalAddObjectField';

const OBJECT_DEFINITION_BY_EXTERNAL_REFERENCE_CODE_URL =
	/\/o\/object-admin\/v1.0\/object-definitions\/by-external-reference-code\/.*/;

const objectDefinition = {
	id: 12345,
	name: 'objectDefinition',
	objectFields: [
		{
			businessType: 'Assignee',
			externalReferenceCode: 'assignee01',
			label: 'My Assignee field',
			name: 'assignee',
		},
	],
};

jest.mock('frontend-js-web', () => ({
	...(jest.requireActual('frontend-js-web') as object),
	createResourceURL: jest.fn(() => {
		return {
			href: 'http://localhost/url',
		};
	}),
}));

const renderComponent = () => {
	return render(
		<ModalAddObjectField
			baseResourceURL="/o/object-admin/v1.0/"
			creationLanguageId="en_US"
			objectDefinitionExternalReferenceCode="externalReferenceCode"
			onAfterSubmit={() => {}}
			setVisible={() => {}}
		/>
	);
};

describe('The ModalAddObjectField', () => {
	afterEach(() => {
		fetchMock.restore();
		jest.restoreAllMocks();
	});

	beforeEach(() => {
		fetchMock.get('http://localhost/url', {
			objectFieldBusinessTypes: [
				{
					businessType: 'Assignee',
					dbType: 'Long',
					description: '',
					label: 'Assignee',
				},
			],
		});

		fetchMock.get(OBJECT_DEFINITION_BY_EXTERNAL_REFERENCE_CODE_URL, {
			body: objectDefinition,
		});
	});

	it('shows an error when trying to add a second assignee object field', async () => {
		renderComponent();

		await waitFor(async () => {
			expect(await screen.findByText('new-field')).toBeInTheDocument();
		});

		fireEvent.change(await screen.findByLabelText('label' + 'mandatory'), {
			target: {value: 'New Assignee Field'},
		});

		fireEvent.click(await screen.findByText('type'));

		fireEvent.click(await screen.findByText('Assignee'));

		fireEvent.click(await screen.findByRole('button', {name: 'save'}));

		expect(
			await screen.findByText(
				'an-object-definition-can-only-have-one-assignee-field'
			)
		).toBeVisible();
	});
});

describe('when a picklist without items is selected', () => {
	afterEach(() => {
		fetchMock.restore();
		jest.restoreAllMocks();
	});

	beforeEach(() => {
		fetchMock.get('http://localhost/url', {
			objectFieldBusinessTypes: [
				{
					businessType: 'Picklist',
					dbType: 'String',
					description: '',
					label: 'Picklist',
				},
			],
		});

		fetchMock.get(OBJECT_DEFINITION_BY_EXTERNAL_REFERENCE_CODE_URL, {
			body: objectDefinition,
		});

		jest.spyOn(API, 'getListTypeDefinitions').mockResolvedValue([
			{
				externalReferenceCode: 'empty-picklist-erc',
				id: 1,
				listTypeEntries: [],
				name: 'Empty Picklist',
			} as any,
		]);
	});

	it('does not show the Default Value dropdown', async () => {
		renderComponent();

		await waitFor(async () => {
			expect(await screen.findByText('new-field')).toBeInTheDocument();
		});

		fireEvent.change(await screen.findByLabelText('label' + 'mandatory'), {
			target: {value: 'My Empty Picklist Field'},
		});

		fireEvent.click(await screen.findByText('type'));
		fireEvent.click(await screen.findByText('Picklist'));

		fireEvent.click(await screen.findByText('picklist'));
		fireEvent.click(await screen.findByText('Empty Picklist'));

		const markAsStateToggle = await screen.findByRole('switch', {
			name: 'mark-as-state',
		});

		expect(markAsStateToggle).toBeDisabled();
		expect(markAsStateToggle).not.toBeChecked();

		expect(screen.queryByText('default-value')).not.toBeInTheDocument();

		const mandatoryToggle = await screen.findByRole('switch', {
			name: 'mandatory',
		});

		fireEvent.click(mandatoryToggle);

		expect(
			screen.queryByText(
				'this-picklist-has-no-items-so-making-it-mandatory-will-prevent-users-from-creating-object-entries-until-at-least-one-item-is-added-to-the-picklist'
			)
		).toBeInTheDocument();
	});
});
