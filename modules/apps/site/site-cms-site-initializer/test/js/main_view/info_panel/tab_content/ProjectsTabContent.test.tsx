/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import ApiHelper from '../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper';
import {
	AssetTypeInfoPanelContext,
	IAssetTypeInfoPanelContext,
} from '../../../../../src/main/resources/META-INF/resources/js/main_view/info_panel/context';
import ProjectsTabContent from '../../../../../src/main/resources/META-INF/resources/js/main_view/info_panel/tab_content/ProjectsTabContent';

jest.mock(
	'../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper'
);

const mockOpenToast = jest.fn();

jest.mock('frontend-js-components-web', () => ({
	openToast: (...args: unknown[]) => mockOpenToast(...args),
}));

jest.mock('@clayui/multi-select', () => {
	const MockMultiSelect = ({items, onItemsChange, sourceItems}: any) => (
		<div>
			<div data-testid="selected-items">
				{items.map((item: any) => (
					<button
						data-testid={`remove-${item.value}`}
						key={item.value}
						onClick={() =>
							onItemsChange(
								items.filter(
									(selectedItem: any) =>
										selectedItem.value !== item.value
								)
							)
						}
						type="button"
					>
						{item.label}
					</button>
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
const PROJECT_ASSET_RELATIONSHIP_OBJECT_DEFINITION_ID = 202;

const ENTRY_CLASS_NAME = 'com.liferay.object.model.ObjectDefinition#ABCD';
const ENTRY_EXTERNAL_REFERENCE_CODE = 'ASSET-ERC';
const ENTRY_GROUP_EXTERNAL_REFERENCE_CODE = 'asset-scope';

const projectSearchItems = [
	{
		embedded: {
			externalReferenceCode: 'PROJECT-1-ERC',
			id: 1,
			scopeKey: 'project-1-scope',
			title: 'Project 1',
		},
	},
	{
		embedded: {
			externalReferenceCode: 'PROJECT-2-ERC',
			id: 2,
			scopeKey: 'project-2-scope',
			title: 'Project 2',
		},
	},
];

function mockSearch({linkItems = []}: {linkItems?: any[]} = {}) {
	(ApiHelper.get as jest.Mock).mockImplementation((url: string) => {
		if (
			url.includes(
				String(PROJECT_ASSET_RELATIONSHIP_OBJECT_DEFINITION_ID)
			)
		) {
			return Promise.resolve({
				data: {items: linkItems, lastPage: 1},
				error: null,
			});
		}

		if (url.includes(String(PROJECT_OBJECT_DEFINITION_ID))) {
			return Promise.resolve({
				data: {items: projectSearchItems, lastPage: 1},
				error: null,
			});
		}

		return Promise.resolve({data: {items: [], lastPage: 1}, error: null});
	});
}

function renderComponent() {
	return render(
		<AssetTypeInfoPanelContext.Provider
			value={
				{
					asset: {
						externalReferenceCode: ENTRY_EXTERNAL_REFERENCE_CODE,
					},
					assetLibrary: {
						externalReferenceCode:
							ENTRY_GROUP_EXTERNAL_REFERENCE_CODE,
					},
					cmpProjectAssetRelationshipObjectDefinitionId:
						PROJECT_ASSET_RELATIONSHIP_OBJECT_DEFINITION_ID,
					cmpProjectObjectDefinitionId: PROJECT_OBJECT_DEFINITION_ID,
					selectedAssets: [{entryClassName: ENTRY_CLASS_NAME}],
				} as unknown as IAssetTypeInfoPanelContext
			}
		>
			<ProjectsTabContent />
		</AssetTypeInfoPanelContext.Provider>
	);
}

describe('ProjectsTabContent', () => {
	beforeEach(() => {
		(global as any).Liferay = {
			Language: {
				get: jest.fn((key: string) => key),
			},
		};
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('lists every project the asset can be linked to', async () => {
		mockSearch();

		renderComponent();

		await waitFor(() =>
			expect(screen.getByTestId('add-1')).toBeInTheDocument()
		);

		expect(screen.getByTestId('add-2')).toBeInTheDocument();
	});

	it('preselects the projects the asset is already linked to', async () => {
		mockSearch({
			linkItems: [
				{
					embedded: {
						classExternalReferenceCode:
							ENTRY_EXTERNAL_REFERENCE_CODE,
						className: ENTRY_CLASS_NAME,
						groupExternalReferenceCode:
							ENTRY_GROUP_EXTERNAL_REFERENCE_CODE,
						id: 500,
						r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId: 1,
					},
				},
			],
		});

		renderComponent();

		await waitFor(() =>
			expect(screen.getByTestId('remove-1')).toBeInTheDocument()
		);
	});

	it('creates a link built from the info-panel asset identity', async () => {
		mockSearch();

		(ApiHelper.post as jest.Mock).mockResolvedValue({
			data: {externalReferenceCode: 'LINK-2-ERC', id: 600},
			error: null,
		});

		renderComponent();

		await waitFor(() =>
			expect(screen.getByTestId('add-2')).toBeInTheDocument()
		);

		fireEvent.click(screen.getByTestId('add-2'));

		await waitFor(() =>
			expect(ApiHelper.post).toHaveBeenCalledWith(
				'/o/cmp/project-asset-relationships/scopes/project-2-scope',
				{
					classExternalReferenceCode: ENTRY_EXTERNAL_REFERENCE_CODE,
					className: ENTRY_CLASS_NAME,
					groupExternalReferenceCode:
						ENTRY_GROUP_EXTERNAL_REFERENCE_CODE,
					r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId: 2,
				}
			)
		);
	});

	it('deletes the link when a project is deselected', async () => {
		mockSearch({
			linkItems: [
				{
					embedded: {
						classExternalReferenceCode:
							ENTRY_EXTERNAL_REFERENCE_CODE,
						className: ENTRY_CLASS_NAME,
						groupExternalReferenceCode:
							ENTRY_GROUP_EXTERNAL_REFERENCE_CODE,
						id: 500,
						r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId: 1,
					},
				},
			],
		});

		(ApiHelper.delete as jest.Mock).mockResolvedValue({
			data: {},
			error: null,
		});

		renderComponent();

		await waitFor(() =>
			expect(screen.getByTestId('remove-1')).toBeInTheDocument()
		);

		fireEvent.click(screen.getByTestId('remove-1'));

		await waitFor(() =>
			expect(ApiHelper.delete).toHaveBeenCalledWith(
				'/o/cmp/project-asset-relationships/500'
			)
		);
	});
});
