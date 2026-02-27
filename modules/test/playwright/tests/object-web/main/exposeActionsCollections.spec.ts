/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';
import {generateObjectFields} from './utils/generateObjectFields';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

test(
	'LPD-78504 Include createBatch in actions for object collection schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeCreateBatchInActionsForObjectCollectionSchema

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.createBatch).toBeDefined();
		expect(typeof response.actions.createBatch.href).toBe('string');
		expect(typeof response.actions.createBatch.method).toBe('string');
	}
);

test(
	'LPD-78504 Include create in actions for object collection schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeCreateInActionsForObjectCollectionSchema

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.create).toBeDefined();
		expect(typeof response.actions.create.href).toBe('string');
		expect(typeof response.actions.create.method).toBe('string');
	}
);

test(
	'LPD-78504 Include deleteBatch in actions for object collection schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeDeleteBatchInActionsForObjectCollectionSchema

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.deleteBatch).toBeDefined();
		expect(typeof response.actions.deleteBatch.href).toBe('string');
		expect(typeof response.actions.deleteBatch.method).toBe('string');
	}
);

test(
	'LPD-78504 Include updateBatch in actions for object collection schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeUpdateBatchInActionsForObjectCollectionSchema

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.updateBatch).toBeDefined();
		expect(typeof response.actions.updateBatch.href).toBe('string');
		expect(typeof response.actions.updateBatch.method).toBe('string');
	}
);
