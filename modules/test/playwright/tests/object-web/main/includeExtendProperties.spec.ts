/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectRelationshipAPI} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
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
	'LPD-78504 Can generate OpenAPI for object with relationship to unpublished object',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const objectFields1 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields1,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		const applicationName =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.info).toBeDefined();
		expect(openApiSpec.paths).toBeDefined();
	}
);

test(
	'LPD-78504 Can include properties in schemas with many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const objectFields1 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields1,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'manyToMany',
			}
		);

		const applicationName =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		const schemaName = objectDefinition1.name!;

		const schema =
			openApiSpec.components?.schemas?.[schemaName] ||
			Object.values(openApiSpec.components?.schemas || {}).find(
				(s: any) =>
					s.properties && s.properties[relationshipName]
			);

		expect(schema).toBeDefined();
		expect((schema as any).properties[relationshipName]).toBeDefined();
	}
);

test(
	'LPD-78504 Can include properties in schemas with one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const objectFields1 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields1,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		const applicationName =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		const schemaName = objectDefinition1.name!;

		const schema =
			openApiSpec.components?.schemas?.[schemaName] ||
			Object.values(openApiSpec.components?.schemas || {}).find(
				(s: any) =>
					s.properties && s.properties[relationshipName]
			);

		expect(schema).toBeDefined();
		expect((schema as any).properties[relationshipName]).toBeDefined();
	}
);

test(
	'LPD-78504 Can include property in schema for custom object',
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

		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/openapi.json`
		);

		const schemaName = objectDefinition.name!;

		const schema =
			openApiSpec.components?.schemas?.[schemaName] ||
			Object.values(openApiSpec.components?.schemas || {}).find(
				(s: any) => s.properties && s.properties[fieldName]
			);

		expect(schema).toBeDefined();
		expect((schema as any).properties[fieldName]).toBeDefined();
	}
);

test(
	'LPD-78504 Can include property in schema for system object',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const openApiSpec = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/openapi.json`
		);

		expect(openApiSpec).toBeDefined();
		expect(openApiSpec.components).toBeDefined();
		expect(openApiSpec.components.schemas).toBeDefined();

		const userAccountSchema = openApiSpec.components.schemas.UserAccount;

		expect(userAccountSchema).toBeDefined();
		expect(userAccountSchema.properties).toBeDefined();
		expect(userAccountSchema.properties.emailAddress).toBeDefined();
		expect(userAccountSchema.properties.familyName).toBeDefined();
		expect(userAccountSchema.properties.givenName).toBeDefined();
	}
);
