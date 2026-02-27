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
	'LPD-78504 Can get relationship details',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetRelationshipDetails

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
			'c/' + objectDefinition1.name!.toLowerCase() + 's';
		const applicationName2 =
			'c/' + objectDefinition2.name!.toLowerCase() + 's';

		const fieldName1 = objectFields1[0].name!;
		const fieldName2 = objectFields2[0].name!;

		const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName1]: 'ParentValue'},
			applicationName1
		);

		const childEntry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName2]: 'ChildValue',
				[`r_${relationshipName}_c_${objectDefinition1.name}Id`]:
					parentEntry.id,
			},
			applicationName2
		);

		const collectionName =
			objectDefinition1.name!.charAt(0).toLowerCase() +
			objectDefinition1.name!.slice(1) +
			's';

		const graphqlResponse = await apiHelpers.post(
			`${apiHelpers.baseUrl}graphql`,
			{
				data: {
					query: `{
						c {
							${collectionName} {
								items {
									id
									${fieldName1}
									${relationshipName} {
										items {
											id
											${fieldName2}
										}
									}
								}
							}
						}
					}`,
				},
			}
		);

		expect(graphqlResponse.data.c[collectionName]).toBeDefined();

		const items = graphqlResponse.data.c[collectionName].items;

		expect(items).toHaveLength(1);
		expect(items[0].id).toBe(parentEntry.id);
		expect(items[0][fieldName1]).toBe('ParentValue');

		const relatedItems = items[0][relationshipName].items;

		expect(relatedItems).toHaveLength(1);
		expect(relatedItems[0].id).toBe(childEntry.id);
		expect(relatedItems[0][fieldName2]).toBe('ChildValue');
	}
);
