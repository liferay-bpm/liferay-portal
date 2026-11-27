/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {getSubtasks} from '../../js/utils/api';

const mockGet = jest.fn();

jest.mock('@liferay/site-cms-site-initializer', () => ({
	ApiHelper: {get: (...args: any[]) => mockGet(...args)},
}));

async function getRequestedURL(apiURL: string) {
	mockGet.mockResolvedValueOnce({data: {items: []}, error: null});

	await getSubtasks({apiURL, parentTaskId: 7});

	return new URL(mockGet.mock.calls[mockGet.mock.calls.length - 1][0]);
}

describe('getSubtasks', () => {
	it('adds the parent task to the filter of the API URL', async () => {
		const url = await getRequestedURL(
			'/o/search/v1.0/search?filter=(objectDefinitionId eq 1)&nestedFields=embedded'
		);

		expect(url.searchParams.get('filter')).toBe(
			'(objectDefinitionId eq 1) and cmpParentTaskId eq 7'
		);
		expect(url.searchParams.get('nestedFields')).toBe(
			'embedded,embedded.cmpTaskToCMPTasks'
		);
	});

	it('filters by the parent task when the API URL has no filter', async () => {
		const url = await getRequestedURL('/o/search/v1.0/search');

		expect(url.searchParams.get('filter')).toBe('cmpParentTaskId eq 7');
		expect(url.searchParams.get('nestedFields')).toBe(
			'embedded.cmpTaskToCMPTasks'
		);
	});
});
