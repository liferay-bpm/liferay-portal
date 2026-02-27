/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinitionAPI,
	ObjectRelationshipAPI,
} from '@liferay/object-admin-rest-client-js';
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
	'LPD-78504 Cannot get many to many related entry details when custom object is deactivated',
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

		// Deactivate the custom object

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: false}
		);

		// Try to get the nested fields - should return error

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/by-external-reference-code/${entry.externalReferenceCode}?nestedFields=${relationshipName}`
		);

		expect(response.ok()).toBe(false);

		// Reactivate for cleanup

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: true}
		);
	}
);

test(
	'LPD-78504 Cannot get many to many relationship details when custom object is deactivated',
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

		// Deactivate the custom object

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: false}
		);

		// Try to access the relationship endpoint - should return error

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(response.ok()).toBe(false);

		// Reactivate for cleanup

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: true}
		);
	}
);

test(
	'LPD-78504 Cannot get one to many related entry details when custom object is deactivated',
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

		// Deactivate the custom object

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: false}
		);

		// Try to get the custom entry with nested fields - should return error

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/by-external-reference-code/${entry.externalReferenceCode}?nestedFields=${relationshipName}`
		);

		expect(response.ok()).toBe(false);

		// Reactivate for cleanup

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: true}
		);
	}
);

test(
	'LPD-78504 Cannot get one to many relationship details when custom object is deactivated',
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

		// Deactivate the custom object

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: false}
		);

		// Try to access the relationship endpoint from the custom object side - should return error

		const response = await apiHelpers.getResponse(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}/${relationshipName}`
		);

		expect(response.ok()).toBe(false);

		// Reactivate for cleanup

		await objectDefinitionAPIClient.patchObjectDefinition(
			objectDefinition.id,
			{active: true}
		);
	}
);
