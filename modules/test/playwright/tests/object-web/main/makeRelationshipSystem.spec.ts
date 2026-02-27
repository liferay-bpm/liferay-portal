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
	'LPD-78504 Can delete custom object entry related to system object by many to many',
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

		// Link the custom entry to the user

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

		// Delete the custom entry

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName,
			entry.id.toString()
		);

		// Verify the user account still exists

		const userResult =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userResult.id).toBe(adminUser.id);

		// Verify the custom entry no longer exists

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.status()).toBe(404);
	}
);

test(
	'LPD-78504 Can delete custom object entry related to system object by one to many',
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

		// Get the admin user

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link user to custom entry

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Delete the custom entry

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName,
			entry.id.toString()
		);

		// Verify the user account still exists

		const userResult =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		expect(userResult.id).toBe(adminUser.id);

		// Verify the relationship endpoint returns empty

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(result.items).toHaveLength(0);
	}
);

test(
	'LPD-78504 Can relate custom object entries to system object entries',
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

		// Get the admin user

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link user to custom entry via relationship endpoint

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}/${entry.externalReferenceCode}`
		);

		// Verify the relationship endpoint returns the custom entry

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${adminUser.id}/${relationshipName}`
		);

		expect(result.items).toHaveLength(1);
		expect(result.items[0].id).toBe(entry.id);
		expect(result.items[0][fieldName]).toBe('Entry1');
	}
);

test(
	'LPD-78504 Can relate custom object entries to system object entries by many to many',
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

		// Link via the custom object side

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

		// Verify the relationship endpoint returns the user

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(result.items).toHaveLength(1);
		expect(result.items[0].id).toBe(adminUser.id);
	}
);

test(
	'LPD-78504 Deleted object entries do not appear in many to many relationship details',
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

		// Get the admin user

		const adminUser =
			await apiHelpers.headlessAdminUser.getMyUserAccount();

		// Link both entries to the user

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName,
				currentExternalReferenceCode:
					entry1.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					adminUser.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName,
				currentExternalReferenceCode:
					entry2.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					adminUser.externalReferenceCode,
			}
		);

		// Verify both entries are related

		const resultBefore = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry1.id}/${relationshipName}`
		);

		expect(resultBefore.items).toHaveLength(1);

		// Delete entry1

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName,
			entry1.id.toString()
		);

		// Verify the remaining entry still shows the user in its relationship

		const resultAfter = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry2.id}/${relationshipName}`
		);

		expect(resultAfter.items).toHaveLength(1);
		expect(resultAfter.items[0].id).toBe(adminUser.id);

		// Verify the deleted entry's relationship is no longer accessible

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry1.id}/${relationshipName}`
		);

		expect(response.status()).toBe(404);
	}
);
