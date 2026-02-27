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

		// Create a oneToMany relationship where objectDefinition1 is the parent

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

		// Create a parent entry and a child entry

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentEntry'},
			applicationName1
		);

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName2]: 'ChildEntry'},
			applicationName2
		);

		// Link the parent to the child

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

		// Get the child entry with nestedFields to see the parent

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: applicationName2,
					externalReferenceCode:
						childEntry.externalReferenceCode,
					nestedField: relationshipName,
				}
			);

		// In a oneToMany relationship, the child should have a reference to the parent

		expect(result[`r_${relationshipName}_${objectDefinition1.name}Id`] ||
			result[relationshipName]).toBeDefined();

		// Verify the parent entry's nested fields show the child

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
			'ChildEntry'
		);
	}
);
