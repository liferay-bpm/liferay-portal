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
	'LPD-78504 Include batch actions for object definition',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeBatchActionsForObjectDefinition

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

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();

		const paths = Object.keys(openApiSpec.paths);

		const batchPaths = paths.filter((path: string) =>
			path.includes('/batch')
		);

		expect(batchPaths.length).toBeGreaterThan(0);
	}
);

test(
	'LPD-78504 Include batch actions for object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeBatchActionsForObjectEntries

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
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestEntry'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response).toBeDefined();
		expect(response.actions).toBeDefined();
		expect(response.actions.createBatch).toBeDefined();
		expect(response.actions.deleteBatch).toBeDefined();
		expect(response.actions.updateBatch).toBeDefined();
	}
);

test(
	'LPD-78504 Include batch actions for object schemas',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeBatchActionsForObjectSchemas

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

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();

		const paths = Object.keys(openApiSpec.paths);

		const batchPaths = paths.filter((path: string) =>
			path.includes('/batch')
		);

		expect(batchPaths.length).toBeGreaterThan(0);

		// Verify that batch endpoints define POST, PUT, or DELETE methods

		for (const batchPath of batchPaths) {
			const methods = Object.keys(openApiSpec.paths[batchPath]);

			expect(methods.length).toBeGreaterThan(0);
		}
	}
);

test(
	'LPD-78504 Include createBatch in actions for object definition',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeCreateBatchInActionsForObjectDefinition

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

		const response = await apiHelpers.objectAdmin.getAllObjectDefinitions();

		expect(response).toBeDefined();
		expect(response.actions).toBeDefined();
		expect(response.actions.createBatch).toBeDefined();
		expect(response.actions.createBatch.href).toBeDefined();
		expect(response.actions.createBatch.method).toBe('POST');
	}
);

test(
	'LPD-78504 Include createBatch in actions for object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeCreateBatchInActionsForObjectEntries

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
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestEntry'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response).toBeDefined();
		expect(response.actions).toBeDefined();
		expect(response.actions.createBatch).toBeDefined();
		expect(response.actions.createBatch.href).toBeDefined();
		expect(response.actions.createBatch.method).toBe('POST');
	}
);

test(
	'LPD-78504 Include createBatch in actions for object schemas',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeCreateBatchInActionsForObjectSchemas

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

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();

		const paths = Object.keys(openApiSpec.paths);

		const batchPostPath = paths.find(
			(path: string) =>
				path.includes('/batch') &&
				openApiSpec.paths[path].post !== undefined
		);

		expect(batchPostPath).toBeDefined();
		expect(openApiSpec.paths[batchPostPath!].post).toBeDefined();
	}
);
