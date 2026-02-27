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
	'LPD-78504 Can create multiple many to many relationships between two objects',
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

		// Create the first manyToMany relationship

		const relationshipName1 = 'relationship' + getRandomInt();

		const {body: relationship1} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: 'Relationship1'},
					name: relationshipName1,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship1.id,
			type: 'objectRelationship',
		});

		// Create the second manyToMany relationship

		const relationshipName2 = 'relationship' + getRandomInt();

		const {body: relationship2} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: 'Relationship2'},
					name: relationshipName2,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship2.id,
			type: 'objectRelationship',
		});

		// Verify both relationships exist

		expect(relationship1.id).toBeDefined();
		expect(relationship1.name).toBe(relationshipName1);
		expect(relationship1.type).toBe('manyToMany');

		expect(relationship2.id).toBeDefined();
		expect(relationship2.name).toBe(relationshipName2);
		expect(relationship2.type).toBe('manyToMany');
	}
);

test(
	'LPD-78504 Can create multiple one to many relationships between two objects',
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

		// Create the first oneToMany relationship

		const relationshipName1 = 'relationship' + getRandomInt();

		const {body: relationship1} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: 'Relationship1'},
					name: relationshipName1,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship1.id,
			type: 'objectRelationship',
		});

		// Create the second oneToMany relationship

		const relationshipName2 = 'relationship' + getRandomInt();

		const {body: relationship2} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: 'Relationship2'},
					name: relationshipName2,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship2.id,
			type: 'objectRelationship',
		});

		// Verify both relationships exist

		expect(relationship1.id).toBeDefined();
		expect(relationship1.name).toBe(relationshipName1);
		expect(relationship1.type).toBe('oneToMany');

		expect(relationship2.id).toBeDefined();
		expect(relationship2.name).toBe(relationshipName2);
		expect(relationship2.type).toBe('oneToMany');
	}
);

test(
	'LPD-78504 Can get empty page with no entries related',
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

		const applicationName1 =
			'c/' + objectDefinition1.name.toLowerCase() + 's';

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
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

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		// Create an entry in objectDefinition1 only

		const fieldName1 = objectFields1[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'Entry1'},
			applicationName1
		);

		// Access the relationship endpoint with no entries related

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName1}/${entry.id}/${relationshipName}`
		);

		expect(result.items).toHaveLength(0);
		expect(result.totalCount).toBe(0);
	}
);
