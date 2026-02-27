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
	'LPD-78504 Can get object endpoints from current instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
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

		expect(response).toBeDefined();
		expect(response.items).toBeDefined();
		expect(Array.isArray(response.items)).toBe(true);

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();
	}
);

test(
	'LPD-78504 Cannot get object endpoints from other instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
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

		// Verify the object is accessible from the current instance

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response).toBeDefined();
		expect(response.items).toBeDefined();

		// Try to access with a non-existent scope key to simulate a different instance

		const otherInstanceResponse = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/scopes/99999`,
			false
		);

		const statusCode = otherInstanceResponse.status();

		// The request should either return an empty result or a 404/403

		expect([200, 403, 404]).toContain(statusCode);

		if (statusCode === 200) {
			const body = await otherInstanceResponse.json();

			expect(body.totalCount).toBe(0);
		}
	}
);

test(
	'LPD-78504 Cannot get object entry from other instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
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

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();

		// Verify the entry is accessible from the current instance

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry[fieldName]).toBe('TestValue');

		// Try to access the entry from a different scope (simulating other instance)

		const otherScopeResponse = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/scopes/99999/${entry.id}`,
			false
		);

		const statusCode = otherScopeResponse.status();

		expect([403, 404]).toContain(statusCode);
	}
);
