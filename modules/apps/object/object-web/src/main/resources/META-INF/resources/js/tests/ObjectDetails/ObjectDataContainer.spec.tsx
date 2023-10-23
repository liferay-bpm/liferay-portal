/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom/extend-expect';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {ObjectDataContainer} from '../../components/ObjectDetails/ObjectDataContainer';

const baseValuesMock = {
	active: false,
	defaultLanguageId: 'en_US',
	externalReferenceCode: '',
	id: 0,
	label: {en_US: 'Label Test'},
	name: 'Object Name',
	pluralLabel: {en_US: 'Plural Label Test'},
	titleObjectFieldName: '',
	modifiable: false,
	system: false,
} as Partial<ObjectDefinition>;

describe('ObjectDataContainer component', () => {
	it('check whether the object name input value is displayed correctly and is required', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={false}
				isApproved={false}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		const objectNameInput = document.getElementById(
			'lfr-objects__object-data-container-name'
		);

		expect(objectNameInput).toBeRequired();
		expect(objectNameInput).toHaveValue('Object Name');
	});

	it('check when object is published whether object name input is disabled', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={true}
				isApproved={true}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		const objectNameInput = document.getElementById(
			'lfr-objects__object-data-container-name'
		);

		expect(objectNameInput).toBeDisabled();
	});

	it('check whether the object label input value is displayed correctly', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={false}
				isApproved={false}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		expect(screen.getByDisplayValue('Label Test')).toBeInTheDocument();
	});

	it('check whether the input value of the object plural label is displayed correctly', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={false}
				isApproved={false}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		expect(
			screen.getByDisplayValue('Plural Label Test')
		).toBeInTheDocument();
	});

	it('check if the object table name is displayed correctly and is disabled', () => {
		render(
			<ObjectDataContainer
				dbTableName="DBTableName"
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={false}
				isApproved={false}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		const tableNameInput = screen.getByDisplayValue('DBTableName');

		expect(tableNameInput).toBeInTheDocument();
		expect(tableNameInput).toBeDisabled();
	});

	it('make sure active object toggle is not checked and disabled by default', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={false}
				isApproved={false}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={baseValuesMock}
			/>
		);

		const toggleElement = screen.getByLabelText('activate-x');

		expect(toggleElement).not.toBeChecked();
		expect(toggleElement).toBeDisabled();
	});

	it('check when the object is published if the active object toggle is checked and not disabled', () => {
		render(
			<ObjectDataContainer
				dbTableName=""
				errors={{}}
				handleChange={() => {}}
				hasUpdateObjectDefinitionPermission={true}
				isApproved={true}
				isLinkedObjectDefinition={false}
				onSubmit={() => {}}
				setValues={() => {}}
				values={{
					...baseValuesMock,
					active: true,
				}}
			/>
		);

		const toggleElement = screen.getByLabelText('activate-x');

		expect(toggleElement).toBeChecked();
		expect(toggleElement).not.toBeDisabled();
	});
});
