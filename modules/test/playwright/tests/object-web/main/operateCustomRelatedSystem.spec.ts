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
	'LPD-78504 Can create system object entries with patch custom object in one to many relationship',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Create a custom entry first

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CustomParentEntry'},
			applicationName
		);

		// Patch custom entry to create related system (user) entries via nested field

		const patchedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{
				[fieldName]: 'CustomParentEntry',
				[relationship.name!]: [
					{
						alternateName: 'PatchUser' + randomNumber,
						emailAddress:
							'PatchUser' + randomNumber + '@liferay.com',
						familyName: 'PatchFamily' + randomNumber,
						givenName: 'PatchGiven' + randomNumber,
					},
				],
			},
			applicationName,
			customEntry.id
		);

		expect(patchedEntry[fieldName]).toBe('CustomParentEntry');

		// Verify the related system entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(1);
		expect(result[relationship.name!][0].givenName).toBe(
			'PatchGiven' + randomNumber
		);
	}
);

test(
	'LPD-78504 Can create system object entries with post custom object in one to many relationship',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Post a custom entry with nested system (user) entries

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'CustomParentPostEntry',
				[relationship.name!]: [
					{
						alternateName: 'PostUser' + randomNumber,
						emailAddress:
							'PostUser' + randomNumber + '@liferay.com',
						familyName: 'PostFamily' + randomNumber,
						givenName: 'PostGiven' + randomNumber,
					},
				],
			},
			applicationName
		);

		expect(customEntry[fieldName]).toBe('CustomParentPostEntry');

		// Verify the related system entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(1);
		expect(result[relationship.name!][0].givenName).toBe(
			'PostGiven' + randomNumber
		);
	}
);

test(
	'LPD-78504 Can create system object entries with put custom object in one to many relationship',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Create a custom entry first

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CustomParentPutEntry'},
			applicationName
		);

		// Put custom entry to create related system (user) entries via nested field

		const updatedEntry = await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName]: 'CustomParentPutEntry',
				[relationship.name!]: [
					{
						alternateName: 'PutUser' + randomNumber,
						emailAddress:
							'PutUser' + randomNumber + '@liferay.com',
						familyName: 'PutFamily' + randomNumber,
						givenName: 'PutGiven' + randomNumber,
					},
				],
			},
			applicationName,
			customEntry.id
		);

		expect(updatedEntry[fieldName]).toBe('CustomParentPutEntry');

		// Verify the related system entries were created

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(result[relationship.name!]).toBeDefined();
		expect(result[relationship.name!].length).toBe(1);
		expect(result[relationship.name!][0].givenName).toBe(
			'PutGiven' + randomNumber
		);
	}
);

test(
	'LPD-78504 Can update system object entries with patch custom object in one to many relationship',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Create a custom entry with a nested system (user) entry

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'CustomParentForUpdate',
				[relationship.name!]: [
					{
						alternateName: 'OrigUser' + randomNumber,
						emailAddress:
							'OrigUser' + randomNumber + '@liferay.com',
						familyName: 'OrigFamily' + randomNumber,
						givenName: 'OrigGiven' + randomNumber,
					},
				],
			},
			applicationName
		);

		// Get the created related user entry

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);

		const relatedUserERC =
			initialResult[relationship.name!][0].externalReferenceCode;

		const randomNumber2 = getRandomInt();

		// Patch custom entry to update the existing user and add a new one

		await apiHelpers.objectEntry.patchObjectEntry(
			{
				[fieldName]: 'UpdatedCustomParent',
				[relationship.name!]: [
					{
						externalReferenceCode: relatedUserERC,
						familyName: 'UpdatedFamily' + randomNumber,
						givenName: 'UpdatedGiven' + randomNumber,
					},
					{
						alternateName: 'NewUser' + randomNumber2,
						emailAddress:
							'NewUser' + randomNumber2 + '@liferay.com',
						familyName: 'NewFamily' + randomNumber2,
						givenName: 'NewGiven' + randomNumber2,
					},
				],
			},
			applicationName,
			customEntry.id
		);

		// Verify the entries were updated and created

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[fieldName]).toBe('UpdatedCustomParent');
		expect(updatedResult[relationship.name!].length).toBe(2);

		const givenNames = updatedResult[relationship.name!].map(
			(entry: ObjectEntry) => entry.givenName
		);

		expect(givenNames).toContain('UpdatedGiven' + randomNumber);
		expect(givenNames).toContain('NewGiven' + randomNumber2);
	}
);

test(
	'LPD-78504 Can update system object entries with put custom object in one to many relationship',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Create a custom entry with a nested system (user) entry

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: 'CustomParentForPutUpdate',
				[relationship.name!]: [
					{
						alternateName: 'OrigPutUser' + randomNumber,
						emailAddress:
							'OrigPutUser' + randomNumber + '@liferay.com',
						familyName: 'OrigPutFamily' + randomNumber,
						givenName: 'OrigPutGiven' + randomNumber,
					},
				],
			},
			applicationName
		);

		// Get the created related user entry

		const initialResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(initialResult[relationship.name!].length).toBe(1);

		const relatedUserERC =
			initialResult[relationship.name!][0].externalReferenceCode;

		const randomNumber2 = getRandomInt();

		// Put custom entry to update the existing user and add a new one

		const updatedEntry = await apiHelpers.objectEntry.putObjectEntry(
			{
				[fieldName]: 'UpdatedCustomParentViaPut',
				[relationship.name!]: [
					{
						externalReferenceCode: relatedUserERC,
						familyName: 'UpdatedPutFamily' + randomNumber,
						givenName: 'UpdatedPutGiven' + randomNumber,
					},
					{
						alternateName: 'NewPutUser' + randomNumber2,
						emailAddress:
							'NewPutUser' + randomNumber2 + '@liferay.com',
						familyName: 'NewPutFamily' + randomNumber2,
						givenName: 'NewPutGiven' + randomNumber2,
					},
				],
			},
			applicationName,
			customEntry.id
		);

		expect(updatedEntry[fieldName]).toBe(
			'UpdatedCustomParentViaPut'
		);

		// Verify the entries were updated and created

		const updatedResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName,
					externalReferenceCode:
						customEntry.externalReferenceCode,
					nestedField: relationship.name!,
				}
			);

		expect(updatedResult[relationship.name!].length).toBe(2);

		const givenNames = updatedResult[relationship.name!].map(
			(entry: ObjectEntry) => entry.givenName
		);

		expect(givenNames).toContain('UpdatedPutGiven' + randomNumber);
		expect(givenNames).toContain('NewPutGiven' + randomNumber2);
	}
);

test(
	'LPD-78504 Cannot create system object entries with nonexistent nested field',
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		// Custom object as parent, User system object as child

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const randomNumber = getRandomInt();

		// Post custom entry with a non-existent relationship name should fail

		try {
			await apiHelpers.objectEntry.postObjectEntry(
				{
					[fieldName]: 'CustomParentValue',
					nonExistentRelationship: [
						{
							alternateName: 'ErrorUser' + randomNumber,
							emailAddress:
								'ErrorUser' +
								randomNumber +
								'@liferay.com',
							familyName: 'ErrorFamily' + randomNumber,
							givenName: 'ErrorGiven' + randomNumber,
						},
					],
				},
				applicationName
			);

			// If we get here, the request did not fail as expected

			expect(true).toBe(false);
		}
		catch (error) {
			expect(error).toBeDefined();
		}
	}
);
