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
	'LPD-78504 Can create custom object entries with patch object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPatchObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create a parent entry without nested fields

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		// Patch the parent entry to create a related child entry via nested field

		const patchedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{
				[fieldName1]: 'ParentValue',
				[relationship.name!]: [{[fieldName2]: 'ChildCreatedViaPatch'}],
			},
			applicationName1,
			parentEntry.id
		);

		expect(patchedEntry[fieldName1]).toBe('ParentValue');

		// Verify the related entry was created by getting with nested fields

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(1);
		expect(result[relationship.name!][0][fieldName2]).toBe(
			'ChildCreatedViaPatch'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with put child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPutChildObjectInManyToManyRelationship

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

		const applicationName2 =
			'c/' + objectDefinition2.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// The reverse relationship name for M2M child side

		const reverseRelationshipName = relationship.name! + 'ObjectEntries';

		// Create a child entry first

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'ChildValue'},
			applicationName2
		);

		// PUT on child side to create a related parent entry

		const updatedEntry = await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName2]: 'ChildValue',
				[reverseRelationshipName]: [
					{[fieldName1]: 'ParentCreatedViaPut'},
				],
			},
			applicationName2,
			childEntry.id
		);

		expect(updatedEntry[fieldName2]).toBe('ChildValue');

		// Verify the related entry was created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName2,
					externalReferenceCode: childEntry.externalReferenceCode,
					nestedField: reverseRelationshipName,
				}
			);

		expect(result[reverseRelationshipName]).toBeDefined();
		expect(result[reverseRelationshipName].length).toBe(1);
		expect(result[reverseRelationshipName][0][fieldName1]).toBe(
			'ParentCreatedViaPut'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with put parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPutParentObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create a parent entry first

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		// PUT on parent side to create a related child entry

		const updatedEntry = await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName1]: 'ParentValue',
				[relationship.name!]: [
					{[fieldName2]: 'ChildCreatedViaPut'},
				],
			},
			applicationName1,
			parentEntry.id
		);

		expect(updatedEntry[fieldName1]).toBe('ParentValue');

		// Verify the related entry was created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(1);
		expect(result[relationship.name!][0][fieldName2]).toBe(
			'ChildCreatedViaPut'
		);
	}
);

test(
	'LPD-78504 Can create custom objects entries with post child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectsEntriesWithPostChildObjectInManyToManyRelationship

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

		const applicationName2 =
			'c/' + objectDefinition2.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// The reverse relationship name for M2M child side

		const reverseRelationshipName = relationship.name! + 'ObjectEntries';

		// POST child entry with nested parent entries

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName2]: 'ChildValue',
				[reverseRelationshipName]: [
					{[fieldName1]: 'ParentFromChildPost1'},
					{[fieldName1]: 'ParentFromChildPost2'},
				],
			},
			applicationName2
		);

		expect(childEntry[fieldName2]).toBe('ChildValue');

		// Verify the related parent entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName2,
					externalReferenceCode: childEntry.externalReferenceCode,
					nestedField: reverseRelationshipName,
				}
			);

		expect(result[reverseRelationshipName]).toBeDefined();
		expect(result[reverseRelationshipName].length).toBe(2);

		const parentValues = result[reverseRelationshipName].map(
			(entry: ObjectEntry) => entry[fieldName1]
		);

		expect(parentValues).toContain('ParentFromChildPost1');
		expect(parentValues).toContain('ParentFromChildPost2');
	}
);

test(
	'LPD-78504 Can create custom objects entries with post parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectsEntriesWithPostParentObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// POST parent entry with nested child entries

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName1]: 'ParentValue',
				[relationship.name!]: [
					{[fieldName2]: 'ChildFromParentPost1'},
					{[fieldName2]: 'ChildFromParentPost2'},
				],
			},
			applicationName1
		);

		expect(parentEntry[fieldName1]).toBe('ParentValue');

		// Verify the related child entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(2);

		const childValues = result[relationship.name!].map(
			(entry: ObjectEntry) => entry[fieldName2]
		);

		expect(childValues).toContain('ChildFromParentPost1');
		expect(childValues).toContain('ChildFromParentPost2');
	}
);

test(
	'LPD-78504 Can create two custom object entries with post object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateTwoCustomObjectEntriesWithPostObjectInManyToManyRelationshipWithItself

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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Self-referencing M2M relationship

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'SelfRelationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		// POST entry with nested entries of the same object type

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'MainEntry',
				[relationship.name!]: [
					{[fieldName]: 'RelatedEntry1'},
					{[fieldName]: 'RelatedEntry2'},
				],
			},
			applicationName
		);

		expect(entry[fieldName]).toBe('MainEntry');

		// Verify the related entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(2);

		const relatedValues = result[relationship.name!].map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(relatedValues).toContain('RelatedEntry1');
		expect(relatedValues).toContain('RelatedEntry2');
	}
);

test(
	'LPD-78504 Cannot create custom objects entries with invalid object field in nested field in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotCreateCustomObjectsEntriesWithInvalidObjectFieldInNestedFieldInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;

		// POST with invalid field name in nested object should fail

		try {
			await apiHelpers.objectEntry.postObjectEntry(
				{
					[fieldName1]: 'ParentValue',
					[relationship.name!]: [
						{invalidFieldName: 'InvalidValue'},
					],
				},
				applicationName1
			);

			// If we get here, the request did not fail as expected

			expect(true).toBe(false);
		}
		catch (error) {
			expect(error).toBeDefined();
		}
	}
);

test(
	'LPD-78504 Cannot create custom objects entries with nonexistent nested field in many to many relationships',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotCreateCustomObjectsEntriesWithNonexistentNestedFieldInManyToManyRelationships

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// POST with non-existent relationship name should fail

		try {
			await apiHelpers.objectEntry.postObjectEntry(
				{
					[fieldName1]: 'ParentValue',
					nonExistentRelationship: [
						{[fieldName2]: 'ChildValue'},
					],
				},
				applicationName1
			);

			// If we get here, the request did not fail as expected

			expect(true).toBe(false);
		}
		catch (error) {
			expect(error).toBeDefined();
		}
	}
);

test(
	'LPD-78504 Can update and create custom object entries with patch object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateAndCreateCustomObjectEntriesWithPatchObjectInManyToManyRelationshipWithItself

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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Self-referencing M2M relationship

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'SelfRelationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		// Create an entry with one related entry

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'MainEntry',
				[relationship.name!]: [{[fieldName]: 'RelatedEntry1'}],
			},
			applicationName
		);

		// Verify the first related entry exists

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);
		expect(initialResult[relationship.name!][0][fieldName]).toBe(
			'RelatedEntry1'
		);

		// PATCH to update the entry and create additional related entries

		await apiHelpers.objectEntry.patchObjectEntry(
			{
				[fieldName]: 'UpdatedMainEntry',
				[relationship.name!]: [
					{
						externalReferenceCode:
							initialResult[relationship.name!][0]
								.externalReferenceCode,
						[fieldName]: 'UpdatedRelatedEntry1',
					},
					{[fieldName]: 'NewRelatedEntry2'},
				],
			},
			applicationName,
			entry.id
		);

		// Verify the update and the new related entry

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[fieldName]).toBe('UpdatedMainEntry');
		expect(updatedResult[relationship.name!].length).toBe(2);

		const relatedValues = updatedResult[relationship.name!].map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(relatedValues).toContain('UpdatedRelatedEntry1');
		expect(relatedValues).toContain('NewRelatedEntry2');
	}
);

test(
	'LPD-78504 Can update custom object entries with patch parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPatchParentObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create parent entry with a nested child entry

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName1]: 'ParentValue',
				[relationship.name!]: [{[fieldName2]: 'ChildValue'}],
			},
			applicationName1
		);

		// Verify the child was created

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);

		const childErc =
			initialResult[relationship.name!][0].externalReferenceCode;

		// PATCH parent to update the related child entry

		await apiHelpers.objectEntry.patchObjectEntry(
			{
				[fieldName1]: 'UpdatedParentValue',
				[relationship.name!]: [
					{
						externalReferenceCode: childErc,
						[fieldName2]: 'UpdatedChildValue',
					},
				],
			},
			applicationName1,
			parentEntry.id
		);

		// Verify updates

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[fieldName1]).toBe('UpdatedParentValue');
		expect(updatedResult[relationship.name!].length).toBe(1);
		expect(updatedResult[relationship.name!][0][fieldName2]).toBe(
			'UpdatedChildValue'
		);
	}
);

test(
	'LPD-78504 Can update custom object entries with put child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutChildObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;
		const reverseRelationshipName = relationship.name! + 'ObjectEntries';

		// Create child entry with a nested parent entry

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName2]: 'ChildValue',
				[reverseRelationshipName]: [
					{[fieldName1]: 'ParentValue'},
				],
			},
			applicationName2
		);

		// Verify the parent was created

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName2,
					externalReferenceCode: childEntry.externalReferenceCode,
					nestedField: reverseRelationshipName,
				}
			);

		expect(initialResult[reverseRelationshipName].length).toBe(1);

		const parentErc =
			initialResult[reverseRelationshipName][0].externalReferenceCode;

		// PUT child to update the related parent entry

		await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName2]: 'UpdatedChildValue',
				[reverseRelationshipName]: [
					{
						externalReferenceCode: parentErc,
						[fieldName1]: 'UpdatedParentValue',
					},
				],
			},
			applicationName2,
			childEntry.id
		);

		// Verify updates

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName2,
					externalReferenceCode: childEntry.externalReferenceCode,
					nestedField: reverseRelationshipName,
				}
			);

		expect(updatedResult[fieldName2]).toBe('UpdatedChildValue');
		expect(updatedResult[reverseRelationshipName].length).toBe(1);
		expect(updatedResult[reverseRelationshipName][0][fieldName1]).toBe(
			'UpdatedParentValue'
		);
	}
);

test(
	'LPD-78504 Can update custom object entries with put child object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutChildObjectInManyToManyRelationshipWithItself

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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Self-referencing M2M relationship

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'SelfRelationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		// Create an entry with a related entry

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'MainEntry',
				[relationship.name!]: [{[fieldName]: 'RelatedEntry'}],
			},
			applicationName
		);

		// Get the related entry's ERC

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);

		const relatedErc =
			initialResult[relationship.name!][0].externalReferenceCode;

		// PUT to update both the entry and its related entry

		await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName]: 'UpdatedMainEntry',
				[relationship.name!]: [
					{
						externalReferenceCode: relatedErc,
						[fieldName]: 'UpdatedRelatedEntry',
					},
				],
			},
			applicationName,
			entry.id
		);

		// Verify updates

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode: entry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[fieldName]).toBe('UpdatedMainEntry');
		expect(updatedResult[relationship.name!].length).toBe(1);
		expect(updatedResult[relationship.name!][0][fieldName]).toBe(
			'UpdatedRelatedEntry'
		);
	}
);

test(
	'LPD-78504 Can update custom object entries with put parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutParentObjectInManyToManyRelationship

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

		const applicationName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create parent entry with a nested child entry

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName1]: 'ParentValue',
				[relationship.name!]: [{[fieldName2]: 'ChildValue'}],
			},
			applicationName1
		);

		// Verify the child was created

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);

		const childErc =
			initialResult[relationship.name!][0].externalReferenceCode;

		// PUT parent to update the related child entry

		await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName1]: 'UpdatedParentValue',
				[relationship.name!]: [
					{
						externalReferenceCode: childErc,
						[fieldName2]: 'UpdatedChildValue',
					},
				],
			},
			applicationName1,
			parentEntry.id
		);

		// Verify updates

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode: parentEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[fieldName1]).toBe('UpdatedParentValue');
		expect(updatedResult[relationship.name!].length).toBe(1);
		expect(updatedResult[relationship.name!][0][fieldName2]).toBe(
			'UpdatedChildValue'
		);
	}
);
