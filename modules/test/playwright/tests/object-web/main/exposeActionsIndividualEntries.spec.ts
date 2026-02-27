/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectActionAPI} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';
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
	'LPD-78504 Include delete in actions for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeDeleteInActionsForObjectEntitiesSchema

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
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.delete).toBeDefined();
		expect(response.actions.delete.href).toBeDefined();
		expect(response.actions.delete.method).toBe('DELETE');
	}
);

test(
	'LPD-78504 Include get in actions for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeGetInActionsForObjectEntitiesSchema

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
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.get).toBeDefined();
		expect(response.actions.get.href).toBeDefined();
		expect(response.actions.get.method).toBe('GET');
	}
);

test(
	'LPD-78504 Include permissions in actions for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludePermissionsInActionsForObjectEntitiesSchema

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
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.permissions).toBeDefined();
		expect(response.actions.permissions.href).toBeDefined();
		expect(response.actions.permissions.method).toBe('PUT');
	}
);

test(
	'LPD-78504 Include replace in actions for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeReplaceInActionsForObjectEntitiesSchema

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
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.replace).toBeDefined();
		expect(response.actions.replace.href).toBeDefined();
		expect(response.actions.replace.method).toBe('PUT');
	}
);

test(
	'LPD-78504 Include standalone custom action for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeStandaloneCustomActionForObjectEntitiesSchema

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

		const objectActionAPIClient =
			await apiHelpers.buildRestClient(ObjectActionAPI);

		const actionName = 'customStandaloneAction' + getRandomInt();

		const {body: objectAction} =
			await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
				objectDefinition.externalReferenceCode!,
				{
					active: true,
					label: {
						en_US: actionName,
					},
					name: actionName,
					objectActionExecutorKey: 'add-object-entry',
					objectActionTriggerKey: 'standalone',
					parameters: {
						objectDefinitionExternalReferenceCode:
							objectDefinition.externalReferenceCode,
						predefinedValues: [
							{
								businessType: 'Text',
								inputAsValue: true,
								label: {
									en_US: objectFields[0].label!.en_US,
								},
								name: objectFields[0].name,
								value: 'predefined value',
							},
						],
					},
					system: false,
				}
			);

		apiHelpers.data.push({
			id: objectAction.id,
			type: 'objectAction',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions[actionName]).toBeDefined();
		expect(response.actions[actionName].href).toBeDefined();
		expect(response.actions[actionName].method).toBe('PUT');
	}
);

test(
	'LPD-78504 Include update in actions for object entities schema',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: IncludeUpdateInActionsForObjectEntitiesSchema

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
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'TestValue'},
			applicationName
		);

		const response = await apiHelpers.get(
			`${apiHelpers.baseUrl}${applicationName}/${entry.id}`
		);

		expect(response.actions).toBeDefined();
		expect(response.actions.update).toBeDefined();
		expect(response.actions.update.href).toBeDefined();
		expect(response.actions.update.method).toBe('PATCH');
	}
);
