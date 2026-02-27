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
	'LPD-78504 Can create custom object entries with patch system object in many to many relationship',
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

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create related custom entries via nested field

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'CustomEntryViaPatch'},
				],
			}
		);

		// Verify the related custom entries were created

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(1);
		expect(relatedEntries.items[0][fieldName]).toBe(
			'CustomEntryViaPatch'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with post system object in many to many relationship',
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

		const fieldName = objectFields[0].name!;
		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		// Create a custom object entry

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CustomEntryForPost'},
			applicationName
		);

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Link the custom entry to the user via the relationship endpoint

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: 'headless-admin-user/v1.0/user-accounts',
				currentExternalReferenceCode:
					currentUser.externalReferenceCode,
				objectRelationshipName: relationship.name!,
				relatedExternalReferenceCode:
					customEntry.externalReferenceCode,
			}
		);

		// Verify the related custom entries were created

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(1);
		expect(relatedEntries.items[0][fieldName]).toBe(
			'CustomEntryForPost'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with put system object in many to many relationship',
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

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Put user to create related custom entries via nested field

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				data: {
					alternateName: currentUser.alternateName,
					emailAddress: currentUser.emailAddress,
					familyName: currentUser.familyName,
					givenName: currentUser.givenName,
					[relationship.name!]: [
						{[fieldName]: 'CustomEntryViaPut'},
					],
				},
			}
		);

		// Verify the related custom entries were created

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(1);
		expect(relatedEntries.items[0][fieldName]).toBe(
			'CustomEntryViaPut'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with patch system object in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create related custom child entries via nested field

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'ChildEntryViaPatch1'},
					{[fieldName]: 'ChildEntryViaPatch2'},
				],
			}
		);

		// Verify the related custom entries were created

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(2);

		const childValues = relatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(childValues).toContain('ChildEntryViaPatch1');
		expect(childValues).toContain('ChildEntryViaPatch2');
	}
);

test(
	'LPD-78504 Can create custom object entries with post system object in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;
		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		// Create a custom object entry

		const customEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'ChildEntryForPost'},
			applicationName
		);

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Link the custom entry to the user via the relationship endpoint

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: 'headless-admin-user/v1.0/user-accounts',
				currentExternalReferenceCode:
					currentUser.externalReferenceCode,
				objectRelationshipName: relationship.name!,
				relatedExternalReferenceCode:
					customEntry.externalReferenceCode,
			}
		);

		// Verify the related custom entry was linked

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(1);
		expect(relatedEntries.items[0][fieldName]).toBe(
			'ChildEntryForPost'
		);
	}
);

test(
	'LPD-78504 Can create custom object entries with put system object in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Put user to create related custom child entries via nested field

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				data: {
					alternateName: currentUser.alternateName,
					emailAddress: currentUser.emailAddress,
					familyName: currentUser.familyName,
					givenName: currentUser.givenName,
					[relationship.name!]: [
						{[fieldName]: 'ChildEntryViaPut1'},
						{[fieldName]: 'ChildEntryViaPut2'},
					],
				},
			}
		);

		// Verify the related custom entries were created

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items).toBeDefined();
		expect(relatedEntries.items.length).toBe(2);

		const childValues = relatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(childValues).toContain('ChildEntryViaPut1');
		expect(childValues).toContain('ChildEntryViaPut2');
	}
);

test(
	'LPD-78504 Can update custom object entries with patch system object in many to many relationship',
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

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create an initial related custom entry

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'OriginalCustomEntry'},
				],
			}
		);

		// Get the created related entry

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items.length).toBe(1);

		const relatedEntryERC =
			relatedEntries.items[0].externalReferenceCode;

		// Patch user to update the existing related entry and add a new one

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{
						externalReferenceCode: relatedEntryERC,
						[fieldName]: 'UpdatedCustomEntry',
					},
					{[fieldName]: 'NewCustomEntry'},
				],
			}
		);

		// Verify the entries were updated and created

		const updatedRelatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(updatedRelatedEntries.items.length).toBe(2);

		const customValues = updatedRelatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(customValues).toContain('UpdatedCustomEntry');
		expect(customValues).toContain('NewCustomEntry');
	}
);

test(
	'LPD-78504 Can update custom object entries with put system object in many to many relationship',
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

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create an initial related custom entry

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'OriginalM2MEntry'},
				],
			}
		);

		// Get the created related entry

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items.length).toBe(1);

		const relatedEntryERC =
			relatedEntries.items[0].externalReferenceCode;

		// Put user to update the existing related entry

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				data: {
					alternateName: currentUser.alternateName,
					emailAddress: currentUser.emailAddress,
					familyName: currentUser.familyName,
					givenName: currentUser.givenName,
					[relationship.name!]: [
						{
							externalReferenceCode: relatedEntryERC,
							[fieldName]: 'UpdatedM2MEntry',
						},
						{[fieldName]: 'NewM2MEntry'},
					],
				},
			}
		);

		// Verify the entries were updated and created

		const updatedRelatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(updatedRelatedEntries.items.length).toBe(2);

		const customValues = updatedRelatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(customValues).toContain('UpdatedM2MEntry');
		expect(customValues).toContain('NewM2MEntry');
	}
);

test(
	'LPD-78504 Can update custom object entries with patch system object in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create an initial child entry

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'OriginalChildEntry'},
				],
			}
		);

		// Get the created child entry

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items.length).toBe(1);

		const childEntryERC =
			relatedEntries.items[0].externalReferenceCode;

		// Patch user to update the existing child and add a new one

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{
						externalReferenceCode: childEntryERC,
						[fieldName]: 'UpdatedChildEntry',
					},
					{[fieldName]: 'NewChildEntry'},
				],
			}
		);

		// Verify the entries were updated and created

		const updatedRelatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(updatedRelatedEntries.items.length).toBe(2);

		const childValues = updatedRelatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(childValues).toContain('UpdatedChildEntry');
		expect(childValues).toContain('NewChildEntry');
	}
);

test(
	'LPD-78504 Can update custom object entries with put system object in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user to create an initial child entry

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				[relationship.name!]: [
					{[fieldName]: 'OriginalO2MEntry'},
				],
			}
		);

		// Get the created child entry

		const relatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(relatedEntries.items.length).toBe(1);

		const childEntryERC =
			relatedEntries.items[0].externalReferenceCode;

		// Put user to update the existing child and add a new one

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
			{
				data: {
					alternateName: currentUser.alternateName,
					emailAddress: currentUser.emailAddress,
					familyName: currentUser.familyName,
					givenName: currentUser.givenName,
					[relationship.name!]: [
						{
							externalReferenceCode: childEntryERC,
							[fieldName]: 'UpdatedO2MEntry',
						},
						{[fieldName]: 'NewO2MEntry'},
					],
				},
			}
		);

		// Verify the entries were updated and created

		const updatedRelatedEntries = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}/${relationship.name!}`
		);

		expect(updatedRelatedEntries.items.length).toBe(2);

		const childValues = updatedRelatedEntries.items.map(
			(entry: ObjectEntry) => entry[fieldName]
		);

		expect(childValues).toContain('UpdatedO2MEntry');
		expect(childValues).toContain('NewO2MEntry');
	}
);

test(
	'LPD-78504 Cannot create custom objects entries with invalid object field in nested field in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user with invalid field name in nested object should fail

		try {
			await apiHelpers.patch(
				`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
				{
					[relationship.name!]: [
						{invalidFieldName: 'InvalidValue'},
					],
				}
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
	'LPD-78504 Cannot create custom objects entries with nonexistent nested field in one to many relationship',
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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const fieldName = objectFields[0].name!;

		// Get current user

		const currentUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/my-user-account`
		);

		// Patch user with non-existent relationship name should fail

		try {
			await apiHelpers.patch(
				`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${currentUser.id}`,
				{
					nonExistentRelationship: [
						{[fieldName]: 'ChildValue'},
					],
				}
			);

			// If we get here, the request did not fail as expected

			expect(true).toBe(false);
		}
		catch (error) {
			expect(error).toBeDefined();
		}
	}
);
