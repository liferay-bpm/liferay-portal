/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ApiHelper from '../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper';
import CategorizationProjects from '../../../../../src/main/resources/META-INF/resources/js/main_view/categorization/components/CategorizationProjects';

jest.mock(
	'../../../../../src/main/resources/META-INF/resources/js/common/services/ApiHelper',
	() => ({
		__esModule: true,
		default: {
			get: jest.fn(),
			getAll: jest.fn(),
		},
	})
);

const mockAssetLibraries = [
	{
		assetLibraryKey: 'approved-key',
		id: 1,
		name: 'Approved Project',
		settings: {logoColor: 'outline-7'},
		siteId: 101,
	},
	{
		assetLibraryKey: 'ghost-key',
		id: 2,
		name: 'aB3xZq9GhostName',
		settings: {logoColor: 'outline-3'},
		siteId: 102,
	},
];

const defaultProps = {
	checkboxText: 'vocabulary',
	setProjectInputError: jest.fn(),
	setSelectedProjects: jest.fn(),
};

describe('CategorizationProjects', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(ApiHelper.getAll as jest.Mock).mockResolvedValue(mockAssetLibraries);
		(ApiHelper.get as jest.Mock).mockResolvedValue({
			data: {items: [{embedded: {scopeId: 101}}]},
			error: null,
		});

		window.ResizeObserver = jest.fn().mockImplementation(() => ({
			disconnect: jest.fn(),
			observe: jest.fn(),
			unobserve: jest.fn(),
		}));
	});

	it('only lists projects backed by an approved project', async () => {
		const user = userEvent.setup();

		render(<CategorizationProjects {...defaultProps} />);

		await waitFor(() => {
			expect(ApiHelper.getAll).toHaveBeenCalled();
		});

		await user.click(screen.getByRole('checkbox'));

		await user.click(screen.getByRole('combobox'));

		await waitFor(() => {
			expect(screen.getAllByRole('option')).toHaveLength(1);
		});

		expect(screen.getByText('Approved Project')).toBeInTheDocument();
	});
});
