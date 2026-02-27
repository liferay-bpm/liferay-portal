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
	'LPD-78504 Can break many to many relationship between custom and system object by deleting relationship',
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

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the custom entry to the user via the relationship

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName,
				currentExternalReferenceCode: entry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					adminUser.externalReferenceCode,
			}
		);

		// Verify entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);
		expect(relatedBefore.items[0].id).toBe(adminUser.id);

		// Delete the relationship definition

		await objectRelationshipAPIClient.deleteObjectRelationship(
			relationship.id
		);

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(item) =>
					item.id === relationship.id &&
					item.type === 'objectRelationship'
			),
			1
		);

		// Verify the custom entry still exists

		const customEntry =
			await apiHelpers.objectEntry.getObjectEntryById(
				applicationName,
				entry.id.toString()
			);

		expect(customEntry.id).toBe(entry.id);

		// Verify the user still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);

		// Verify the relationship endpoint returns 404

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(response.status()).toBe(404);
	}
);

test(
	'LPD-78504 Can break many to many relationship between custom and system object entry',
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

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the custom entry to the user

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName,
				currentExternalReferenceCode: entry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					adminUser.externalReferenceCode,
			}
		);

		// Verify entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);

		// Unlink the entries by calling DELETE on the relationship endpoint

		await apiHelpers.delete(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}/${adminUser.id}`
		);

		// Verify entries are no longer related

		const relatedAfter = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(relatedAfter.items).toHaveLength(0);

		// Verify the custom entry still exists

		const customEntry =
			await apiHelpers.objectEntry.getObjectEntryById(
				applicationName,
				entry.id.toString()
			);

		expect(customEntry.id).toBe(entry.id);

		// Verify the user still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);
	}
);

test(
	'LPD-78504 Can break one to many relationship between custom and system object by deleting relationship',
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

		// Create oneToMany from User (parent) to custom object (child)

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

		// Create a custom object entry

		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry1'},
			applicationName
		);

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the user to the custom entry via the relationship

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Verify entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);
		expect(relatedBefore.items[0].id).toBe(entry.id);

		// Delete the relationship definition

		await objectRelationshipAPIClient.deleteObjectRelationship(
			relationship.id
		);

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(item) =>
					item.id === relationship.id &&
					item.type === 'objectRelationship'
			),
			1
		);

		// Verify the custom entry still exists

		const customEntry =
			await apiHelpers.objectEntry.getObjectEntryById(
				applicationName,
				entry.id.toString()
			);

		expect(customEntry.id).toBe(entry.id);

		// Verify the user still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);

		// Verify the relationship endpoint returns 404

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(response.status()).toBe(404);
	}
);

test(
	'LPD-78504 Can break one to many relationship between custom and system object entry',
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

		// Create oneToMany from User (parent) to custom object (child)

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

		// Create two custom object entries

		const fieldName = objectFields[0].name!;

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry1'},
			applicationName
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry2'},
			applicationName
		);

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the user to both custom entries

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry1.externalReferenceCode}`
		);

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry2.externalReferenceCode}`
		);

		// Verify both entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(2);

		// Unlink entry1 from the user

		await apiHelpers.delete(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry1.id}`
		);

		// Verify only entry2 remains related

		const relatedAfter = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedAfter.items).toHaveLength(1);
		expect(relatedAfter.items[0].id).toBe(entry2.id);

		// Verify both entries still exist independently

		const customEntry1 =
			await apiHelpers.objectEntry.getObjectEntryById(
				applicationName,
				entry1.id.toString()
			);

		expect(customEntry1.id).toBe(entry1.id);

		const customEntry2 =
			await apiHelpers.objectEntry.getObjectEntryById(
				applicationName,
				entry2.id.toString()
			);

		expect(customEntry2.id).toBe(entry2.id);

		// Verify the user still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);
	}
);

test(
	'LPD-78504 Custom object entries are deleted when system object relationship is deleted with cascade',
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

		// Create oneToMany from User (parent) to custom object (child) with cascade deletion

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					deletionType: 'cascade',
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

		// Create custom object entries

		const fieldName = objectFields[0].name!;

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CascadeEntry1'},
			applicationName
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CascadeEntry2'},
			applicationName
		);

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the user to both custom entries

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry1.externalReferenceCode}`
		);

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry2.externalReferenceCode}`
		);

		// Verify both entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(2);

		// Delete the relationship definition (cascade should delete child entries)

		await objectRelationshipAPIClient.deleteObjectRelationship(
			relationship.id
		);

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(item) =>
					item.id === relationship.id &&
					item.type === 'objectRelationship'
			),
			1
		);

		// Verify the custom entries no longer exist (cascade deleted)

		const response1 = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry1.id}`
		);

		expect(response1.status()).toBe(404);

		const response2 = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry2.id}`
		);

		expect(response2.status()).toBe(404);

		// Verify the user (system object) still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);
	}
);
