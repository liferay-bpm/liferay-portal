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
	'LPD-78504 Can return nested fields details in oneToMany relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyRelationship

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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName1 =
			'c/' + objectDefinition1.name.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create a parent entry in objectDefinition1

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		// Create a child entry in objectDefinition2

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'ChildValue'},
			applicationName2
		);

		// Link the child to the parent via the relationship API

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					parentEntry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					childEntry.externalReferenceCode,
			}
		);

		// GET parent entry with nestedFields to see child entries

		const parentResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode:
						parentEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(parentResult[relationshipName]).toBeDefined();
		expect(parentResult[relationshipName]).toHaveLength(1);
		expect(parentResult[relationshipName][0][fieldName2]).toBe(
			'ChildValue'
		);
		expect(parentResult[relationshipName][0].id).toBe(childEntry.id);
	}
);

test(
	'LPD-78504 Can return nested fields details in oneToMany relationship after object deletion',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyRelationshipAfterObjectDeletion

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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName1 =
			'c/' + objectDefinition1.name.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create a parent entry

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		// Create a child entry

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'ChildValue'},
			applicationName2
		);

		// Link the child to the parent via the relationship API

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					parentEntry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					childEntry.externalReferenceCode,
			}
		);

		// Verify the child appears in nested fields

		const resultBeforeDeletion =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode:
						parentEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(resultBeforeDeletion[relationshipName]).toHaveLength(1);
		expect(
			resultBeforeDeletion[relationshipName][0][fieldName2]
		).toBe('ChildValue');

		// Delete the child entry

		await apiHelpers.objectEntry.deleteObjectEntry(
			applicationName2,
			childEntry.id.toString()
		);

		// GET parent with nestedField again and verify the child is gone

		const resultAfterDeletion =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode:
						parentEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(resultAfterDeletion[relationshipName]).toHaveLength(0);
	}
);

test(
	'LPD-78504 Can return nested fields details in oneToMany updated relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyUpdatedRelationship

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
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const applicationName1 =
			'c/' + objectDefinition1.name.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name.toLowerCase() + 's';

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		// Create a parent entry

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		// Create a child entry

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'ChildValue'},
			applicationName2
		);

		// Link the child to the parent via the relationship API

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: applicationName1,
				currentExternalReferenceCode:
					parentEntry.externalReferenceCode,
				objectRelationshipName: relationshipName,
				relatedExternalReferenceCode:
					childEntry.externalReferenceCode,
			}
		);

		// Verify the child appears in nested fields with original value

		const resultBeforeUpdate =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode:
						parentEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(resultBeforeUpdate[relationshipName]).toHaveLength(1);
		expect(resultBeforeUpdate[relationshipName][0][fieldName2]).toBe(
			'ChildValue'
		);

		// Update the child entry's text field

		await apiHelpers.objectEntry.patchObjectEntry(
			{[fieldName2]: 'UpdatedChildValue'},
			applicationName2,
			childEntry.id
		);

		// GET parent with nestedField and verify the updated value is reflected

		const resultAfterUpdate =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName1,
					externalReferenceCode:
						parentEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		expect(resultAfterUpdate[relationshipName]).toHaveLength(1);
		expect(resultAfterUpdate[relationshipName][0][fieldName2]).toBe(
			'UpdatedChildValue'
		);
		expect(resultAfterUpdate[relationshipName][0].id).toBe(
			childEntry.id
		);
	}
);
