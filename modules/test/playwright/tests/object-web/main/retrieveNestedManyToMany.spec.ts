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
	'LPD-78504 Can get custom fields details in nested fields',
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
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

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

		// Create entries in both objects

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'EntryA'},
			applicationName1
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'EntryB'},
			applicationName2
		);

		// Link the entries via the relationship

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					entry1.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					entry2.externalReferenceCode,
			}
		);

		// Get entry1 with nested fields to see related entry2

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: entry1.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(result[relationshipName]).toBeDefined();
		expect(result[relationshipName]).toHaveLength(1);
		expect(result[relationshipName][0][fieldName2]).toBe('EntryB');
	}
);

test(
	'LPD-78504 Can get custom fields details in nested fields after object entry deletion',
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
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

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

		// Create entries

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'EntryA'},
			applicationName1
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'EntryB'},
			applicationName2
		);

		// Link entries

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					entry1.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					entry2.externalReferenceCode,
			}
		);

		// Delete the related entry

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName2,
			entry2.id.toString()
		);

		// Get entry1 with nested fields - related entries should be empty

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: entry1.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(result[relationshipName]).toBeDefined();
		expect(result[relationshipName]).toHaveLength(0);
	}
);

test(
	'LPD-78504 Can get custom fields details in nested fields with system object',
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
			'c/' + objectDefinition.name.toLowerCase() + 's';

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionId2: 0,
					objectDefinitionName2: 'User',
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		// Create a custom object entry

		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry1'},
			applicationName
		);

		// Get the admin user

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link entry to user

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName,
				currentExternalReferenceCode:
					entry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					adminUser.externalReferenceCode,
			}
		);

		// Get entry with nested fields to see related user

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(result[relationshipName]).toBeDefined();
		expect(result[relationshipName]).toHaveLength(1);
		expect(result[relationshipName][0].id).toBe(adminUser.id);
	}
);

test(
	'LPD-78504 Can get system fields details in nested fields',
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
			'c/' + objectDefinition.name.toLowerCase() + 's';

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		// Create a custom object entry

		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry1'},
			applicationName
		);

		// Get the admin user

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link user to custom entry via the user side

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Get the user account with nested fields to see custom object entries

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}?nestedFields=${relationshipName}`
		);

		expect(result[relationshipName]).toBeDefined();
		expect(result[relationshipName]).toHaveLength(1);
		expect(result[relationshipName][0].id).toBe(entry.id);
		expect(result[relationshipName][0][fieldName]).toBe('Entry1');
	}
);

test(
	'LPD-78504 Can get updated custom fields details in nested fields',
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
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

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

		// Create entries

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'EntryA'},
			applicationName1
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'OriginalValue'},
			applicationName2
		);

		// Link entries

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					entry1.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					entry2.externalReferenceCode,
			}
		);

		// Update the related entry

		await apiHelpers.objectEntry.patchObjectEntry(
			{[fieldName2]: 'UpdatedValue'},
			applicationName2,
			entry2.id
		);

		// Get entry1 with nested fields to verify the updated value

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: entry1.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(result[relationshipName]).toBeDefined();
		expect(result[relationshipName]).toHaveLength(1);
		expect(result[relationshipName][0][fieldName2]).toBe(
			'UpdatedValue'
		);
	}
);
