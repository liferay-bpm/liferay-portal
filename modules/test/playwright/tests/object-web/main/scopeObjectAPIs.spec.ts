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
	'LPD-78504 Can create object entry by scope key',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanCreateObjectEntryByScopeKey

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;
		const fieldValue = getRandomString();

		// Create an entry using the site scope key

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue},
			applicationName,
			site.key
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();
		expect(entry[fieldName]).toBe(fieldValue);

		// Retrieve entries by scope and verify the entry exists

		const response =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntriesByScope(
				applicationName,
				site.key
			);

		expect(response.totalCount).toBeGreaterThanOrEqual(1);

		const matchingEntry = response.items.find(
			(item: ObjectEntry) => item.id === entry.id
		);

		expect(matchingEntry).toBeDefined();
		expect(matchingEntry[fieldName]).toBe(fieldValue);
	}
);

test(
	'LPD-78504 Can create object entry in virtual instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateObjectEntryInVirtualInstance

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
		const fieldValue = getRandomString();

		// Create an entry in the current (default) instance

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue},
			applicationName
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();

		// Verify the entry is accessible from the current instance

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry).toBeDefined();
		expect(fetchedEntry[fieldName]).toBe(fieldValue);

		// Verify the entry appears in the instance-scoped listing

		const response =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName
			);

		expect(response.totalCount).toBeGreaterThanOrEqual(1);

		const matchingEntry = response.items.find(
			(item: ObjectEntry) => item.id === entry.id
		);

		expect(matchingEntry).toBeDefined();
		expect(matchingEntry[fieldName]).toBe(fieldValue);
	}
);

test(
	'LPD-78504 Can include object field in API explorer',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanIncludeObjectFieldInAPIExplorer

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

		// Fetch the OpenAPI spec for this object

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.info).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();

		// Verify the object field appears in the schema properties

		const schemas = openApiSpec.components?.schemas;

		expect(schemas).toBeDefined();

		const schemaName = objectDefinition.name;
		const schema = schemas[schemaName!];

		expect(schema).toBeDefined();
		expect(schema.properties).toBeDefined();
		expect(schema.properties[fieldName]).toBeDefined();
		expect(schema.properties[fieldName].type).toBe('string');
	}
);

test(
	'LPD-78504 Can scope object by instance in export task',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		// Corresponds to Poshi test: CanScopeObjectByInstanceInExportTask

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
		const fieldValue1 = getRandomString();
		const fieldValue2 = getRandomString();

		// Create multiple entries scoped to the current instance

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue1},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue2},
			applicationName
		);

		// Trigger an export batch for this object's entries

		const exportBatch = await apiHelpers.post(
			`${apiHelpers.baseUrl}${applicationName}/export-batch`,
			{data: {}}
		);

		expect(exportBatch).toBeDefined();
		expect(exportBatch.id).toBeDefined();

		// Wait for the export task to complete

		await page.waitForTimeout(2000);

		const exportTask =
			await apiHelpers.headlessBatchEngine.getExportTask(exportBatch.id);

		expect(exportTask.executeStatus).toBe('COMPLETED');
		expect(exportTask.totalItemsCount).toBeGreaterThanOrEqual(2);
	}
);
