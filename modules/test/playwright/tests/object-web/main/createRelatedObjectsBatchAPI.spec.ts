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
	'LPD-78504 Can create multiple manyToMany relationships between two objects using batch API',
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

		// Create a parent entry in objectDefinition1

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentEntry'},
			applicationName1
		);

		// Use the batch API to create multiple related entries in objectDefinition2 at once

		const batchData = [
			{[fieldName2]: 'BatchEntry1'},
			{[fieldName2]: 'BatchEntry2'},
			{[fieldName2]: 'BatchEntry3'},
		];

		await apiHelpers.post(
			`${apiHelpers.baseUrl}${applicationName2}/batch`,
			{data: batchData}
		);

		// Wait for batch processing

		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Get all entries from objectDefinition2

		const {items: entries2} =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName2
			);

		expect(entries2.length).toBeGreaterThanOrEqual(3);

		// Link each entry to the parent via the relationship

		for (const entry2 of entries2) {
			await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
				{
					applicationName: applicationName1,
					currentExternalReferenceCode:
						parentEntry.externalReferenceCode,
					objectRelationshipName: relationshipName,
					relatedExternalReferenceCode:
						entry2.externalReferenceCode,
				}
			);
		}

		// Verify the relationship endpoint returns all related entries

		const result = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName1}/${parentEntry.id}/${relationshipName}`
		);

		expect(result.items.length).toBeGreaterThanOrEqual(3);

		const relatedFieldValues = result.items.map(
			(item: any) => item[fieldName2]
		);

		expect(relatedFieldValues).toContain('BatchEntry1');
		expect(relatedFieldValues).toContain('BatchEntry2');
		expect(relatedFieldValues).toContain('BatchEntry3');
	}
);
