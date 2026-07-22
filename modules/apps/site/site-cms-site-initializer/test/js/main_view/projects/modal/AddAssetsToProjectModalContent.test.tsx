/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import ApiHelper from '../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper';
import AddAssetsToProjectModalContent from '../../../../../src/main/resources/META-INF/resources/js/main_view/projects/modal/AddAssetsToProjectModalContent';
import * as BulkActionTrigger from '../../../../../src/main/resources/META-INF/resources/js/main_view/props_transformer/actions/triggerAssetBulkAction';

jest.mock(
	'../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper'
);

jest.mock('frontend-js-web', () => ({
	sub: (message: string) => message,
}));

jest.mock('@clayui/multi-select', () => {
	const MockMultiSelect = ({items, onItemsChange, sourceItems}: any) => (
		<div>
			<div data-testid="selected-items">
				{items.map((item: any) => (
					<span key={item.value}>{item.label}</span>
				))}
			</div>

			<div data-testid="source-items">
				{sourceItems.map((item: any) => (
					<button
						data-testid={`add-${item.value}`}
						key={item.value}
						onClick={() => onItemsChange([...items, item])}
						type="button"
					>
						{item.label}
					</button>
				))}
			</div>
		</div>
	);

	MockMultiSelect.Item = ({children}: any) => <div>{children}</div>;

	return {
		__esModule: true,
		default: MockMultiSelect,
	};
});

const PROJECT_OBJECT_DEFINITION_ID = 101;

const projectSearchItems = [
	{embedded: {id: 1, scopeKey: 'project-1-scope', title: 'Project 1'}},
	{embedded: {id: 2, scopeKey: 'project-2-scope', title: 'Project 2'}},
];

const selectedData = {
	items: [
		{
			embedded: {externalReferenceCode: 'ASSET-1'},
			entryClassName: 'com.liferay.object.model.ObjectDefinition#ABCD',
		},
	],
	selectAll: false,
} as any;

describe('AddAssetsToProjectModalContent', () => {
	let triggerSpy: jest.SpyInstance;

	beforeEach(() => {
		(global as any).Liferay = {
			Language: {
				get: jest.fn((key: string) => key),
			},
		};

		(ApiHelper.get as jest.Mock).mockResolvedValue({
			data: {items: projectSearchItems, lastPage: 1},
			error: null,
		});

		triggerSpy = jest
			.spyOn(BulkActionTrigger, 'triggerAssetBulkAction')
			.mockImplementation(() => {});
	});

	afterEach(() => {
		triggerSpy.mockRestore();

		jest.resetAllMocks();
	});

	it('lists the selectable projects', async () => {
		render(
			<AddAssetsToProjectModalContent
				closeModal={jest.fn()}
				cmpProjectObjectDefinitionId={PROJECT_OBJECT_DEFINITION_ID}
				selectedData={selectedData}
			/>
		);

		await waitFor(() =>
			expect(
				screen.getByTestId('add-project-1-scope')
			).toBeInTheDocument()
		);

		expect(screen.getByTestId('add-project-2-scope')).toBeInTheDocument();
	});

	it('triggers the bulk action with project scope keys and target name', async () => {
		render(
			<AddAssetsToProjectModalContent
				apiURL="/bulk-api"
				closeModal={jest.fn()}
				cmpProjectObjectDefinitionId={PROJECT_OBJECT_DEFINITION_ID}
				selectedData={selectedData}
			/>
		);

		await waitFor(() =>
			expect(
				screen.getByTestId('add-project-2-scope')
			).toBeInTheDocument()
		);

		fireEvent.click(screen.getByTestId('add-project-2-scope'));

		fireEvent.click(screen.getByText('add'));

		await waitFor(() => expect(triggerSpy).toHaveBeenCalledTimes(1));

		expect(triggerSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				additionalData: {targetName: 'Project 2'},
				keyValues: {projectScopeKeys: ['project-2-scope']},
				type: 'AddObjectToProjectBulkSelectionAction',
			})
		);
	});

	it('does not fetch projects without an object definition id', () => {
		render(
			<AddAssetsToProjectModalContent
				closeModal={jest.fn()}
				cmpProjectObjectDefinitionId={null}
				selectedData={selectedData}
			/>
		);

		expect(ApiHelper.get).not.toHaveBeenCalled();
	});
});
