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
	'LPD-78504 Can break many to many relationship from system side',
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

		// Create manyToMany from custom object to User (system object)

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

		// Verify entries are related from the custom object side

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);
		expect(relatedBefore.items[0].id).toBe(adminUser.id);

		// Unlink from the custom object side

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
	'LPD-78504 Can break one to many relationship from system side',
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

		// Link the user to the custom entry

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Verify entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);
		expect(relatedBefore.items[0].id).toBe(entry.id);

		// Unlink from the User (system) side

		await apiHelpers.delete(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.id}`
		);

		// Verify entries are no longer related

		const relatedAfter = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
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
	'LPD-78504 System entries survive when custom object with cascade relationship is deleted',
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

		// Create oneToMany from User (parent) to custom object (child) with cascade

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

		// Create a custom object entry

		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'CascadeEntry1'},
			applicationName
		);

		// Get the admin user account

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link the user to the custom entry

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Verify entries are related

		const relatedBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedBefore.items).toHaveLength(1);

		// Delete the custom object entry (the child)

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName,
			entry.id.toString()
		);

		// Verify the custom entry is deleted

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.status()).toBe(404);

		// Verify the user (system entry) still exists

		const userAfter =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userAfter.id).toBe(adminUser.id);

		// Verify the relationship from the User side shows no related entries

		const relatedAfter = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(relatedAfter.items).toHaveLength(0);
	}
);
