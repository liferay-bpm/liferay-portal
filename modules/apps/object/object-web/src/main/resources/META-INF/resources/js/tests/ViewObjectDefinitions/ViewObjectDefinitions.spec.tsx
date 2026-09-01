/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import ViewObjectDefinitions from '../../components/ViewObjectDefinitions/ViewObjectDefinitions';

// The sidebar renders Liferay.Language.get('object-folders').toUpperCase(), and
// Liferay.Language.get returns the key itself under test.

const OBJECT_FOLDERS_TITLE = 'OBJECT-FOLDERS';

const defaultProps = {
	baseResourceURL: 'http://localhost/resource',
	editObjectDefinitionURL: 'http://localhost/edit',
	id: 'objectDefinitions',
	importObjectDefinitionURL: 'http://localhost/import-definition',
	importObjectFolderURL: 'http://localhost/import-folder',
	learnResourceContext: {},
	modelBuilderURL: 'http://localhost/model-builder',
	nameMaxLength: '41',
	objectDefinitionExternalReferenceCode: '',
	objectDefinitionsCreationMenu: {primaryItems: []},
	objectDefinitionsFDSActionDropdownItems: [],
	objectDefinitionsFDSName: 'objectDefinitions',
	objectDefinitionsStorageTypes: [],
	objectFolderPermissionsURL: 'http://localhost/permissions',
	portletNamespace: '_test_',
	url: 'http://localhost/definitions',
	views: [],
};

// Without this the type check fails, because TypeScript types the global fetch
// as the browser one, which has no mockResponseOnce. The method is really there
// at run time: node-scripts/util/jest/setup.js swaps the global fetch for
// jest-fetch-mock before every test.

type FetchMock = {
	mockResponseOnce: (body: string, init?: {status: number}) => void;
};

describe('ViewObjectDefinitions', () => {
	it('renders the object folders sidebar when the object folders request fails', async () => {
		(fetch as unknown as FetchMock).mockResponseOnce(
			JSON.stringify({status: 'INTERNAL_SERVER_ERROR'}),
			{status: 500}
		);

		render(<ViewObjectDefinitions {...defaultProps} />);

		expect(
			await screen.findByText(OBJECT_FOLDERS_TITLE)
		).toBeInTheDocument();
	});
});
