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
import {getRandomInt} from '../../../utils/getRandomInt';
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

async function createObjectDefinition(
	apiHelpers: any,
	{enableCategorization = true}: {enableCategorization?: boolean} = {}
) {
	const objectFields = generateObjectFields({
		objectFieldBusinessTypes: ['Text'],
	});

	const defName = 'ObjDef' + getRandomInt();

	const objectDefinition = await apiHelpers.post(
		`${apiHelpers.baseUrl}object-admin/v1.0/object-definitions`,
		{
			data: {
				active: true,
				enableCategorization,
				externalReferenceCode: defName,
				label: {en_US: defName},
				name: defName,
				objectFields,
				panelCategoryKey: '',
				pluralLabel: {en_US: defName},
				scope: 'company',
				status: {code: 0},
				titleObjectFieldName: 'id',
			},
		}
	);

	apiHelpers.data.push({
		id: objectDefinition.id,
		type: 'objectDefinition',
	});

	const applicationName = 'c/' + objectDefinition.name.toLowerCase() + 's';
	const fieldName = objectFields[0].name!;

	return {applicationName, fieldName, objectDefinition};
}

function findSchema(openApiSpec: any, schemaName: string) {
	return (
		openApiSpec.components?.schemas?.[schemaName] ||
		Object.values(openApiSpec.components?.schemas || {}).find(
			(s: any) => s.xml?.name === schemaName
		)
	);
}

test(
	'LPD-78504 Can get parameters of keywords and categories in endpoint',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetParametersOfKeywordsAndCategoriesInEndpoint

		const {applicationName, objectDefinition} =
			await createObjectDefinition(apiHelpers, {
				enableCategorization: true,
			});

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.components).toBeDefined();

		const schema = findSchema(openApiSpec, objectDefinition.name);

		expect(schema).toBeDefined();
		expect(schema.properties.keywords).toBeDefined();
		expect(schema.properties.taxonomyCategoryBriefs).toBeDefined();
	}
);

test(
	'LPD-78504 Cannot add object entry with keywords and categories when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotAddObjectEntryWithKeywordsAndCategoriesWhenCategorizationNotEnabled

		const {applicationName, fieldName} = await createObjectDefinition(
			apiHelpers,
			{enableCategorization: false}
		);

		// Create an entry with keywords and taxonomyCategoryIds

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'TestValue',
				keywords: ['keyword1', 'keyword2'],
				taxonomyCategoryIds: [12345],
			},
			applicationName
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();
		expect(entry[fieldName]).toBe('TestValue');

		// Verify keywords and taxonomyCategoryBriefs are not present on the
		// created entry since categorization is disabled

		expect(entry.keywords).toBeUndefined();
		expect(entry.taxonomyCategoryBriefs).toBeUndefined();
	}
);

test(
	'LPD-78504 Cannot get keywords and categories values when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotGetKeywordsAndCategoriesValuesWhenCategorizationNotEnabled

		const {applicationName, fieldName} = await createObjectDefinition(
			apiHelpers,
			{enableCategorization: false}
		);

		// Create an entry

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();

		// Fetch the individual entry by ID

		const fetchedEntry = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(fetchedEntry).toBeDefined();
		expect(fetchedEntry[fieldName]).toBe('TestValue');

		// Verify keywords and taxonomyCategoryBriefs are not present

		expect(fetchedEntry.keywords).toBeUndefined();
		expect(fetchedEntry.taxonomyCategoryBriefs).toBeUndefined();
	}
);

test(
	'LPD-78504 Cannot get keywords and categories when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotGetKeywordsAndCategoriesWhenCategorizationNotEnabled

		const {applicationName, fieldName} = await createObjectDefinition(
			apiHelpers,
			{enableCategorization: false}
		);

		// Create an entry

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		// Fetch the collection of entries

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/`
		);

		expect(response).toBeDefined();
		expect(response.totalCount).toBeGreaterThanOrEqual(1);

		// Verify that no entries in the collection have keywords or
		// taxonomyCategoryBriefs since categorization is disabled

		for (const item of response.items) {
			expect(item.keywords).toBeUndefined();
			expect(item.taxonomyCategoryBriefs).toBeUndefined();
		}
	}
);

test(
	'LPD-78504 Cannot see taxonomy category brief in schema when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotSeeTaxonomyCategoryBriefInSchemaWhenCategorizationNotEnabled

		const {applicationName, objectDefinition} =
			await createObjectDefinition(apiHelpers, {
				enableCategorization: false,
			});

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.components).toBeDefined();

		const schema = findSchema(openApiSpec, objectDefinition.name);

		expect(schema).toBeDefined();

		// Verify that keywords and taxonomyCategoryBriefs are NOT in the
		// schema properties when categorization is disabled

		expect(schema.properties.keywords).toBeUndefined();
		expect(schema.properties.taxonomyCategoryBriefs).toBeUndefined();
	}
);
