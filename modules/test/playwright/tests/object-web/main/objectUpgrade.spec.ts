/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectActionAPI,
	ObjectRelationshipAPI,
} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {editObjectDefinitionPagesTest} from '../../../fixtures/editObjectDefinitionPagesTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {listTypeDefinitionsPagesTest} from '../../../fixtures/listTypeDefinitionsPagesTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
import {generateObjectFields} from './utils/generateObjectFields';

const test = mergeTests(
	dataApiHelpersTest,
	editObjectDefinitionPagesTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	listTypeDefinitionsPagesTest,
	loginTest(),
	objectPagesTest
);

test(
	'LPD-78504 View action with notification after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		// Corresponds to Poshi test: ViewActionWithNotificationAfterUpgrade7413U33

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const notificationTemplate =
			await apiHelpers.notification.postRandomNotificationTemplate(
				'notification template test ' + getRandomInt()
			);

		apiHelpers.data.push({
			id: notificationTemplate.id,
			type: 'notificationTemplate',
		});

		const actionName = 'action' + getRandomInt();

		const objectActionAPIClient =
			await apiHelpers.buildRestClient(ObjectActionAPI);

		await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
			objectDefinition.externalReferenceCode!,
			{
				active: true,
				label: {en_US: actionName},
				name: actionName,
				objectActionExecutorKey: 'notification',
				objectActionTriggerKey: 'onAfterAdd',
				parameters: {
					notificationTemplateId: notificationTemplate.id,
					type: 'email',
				},
			}
		);

		await viewObjectActionsPage.goto(
			objectDefinition.label!['en_US']
		);

		await expect(page.getByText(actionName)).toBeVisible();
	}
);

test(
	'LPD-78504 View object definition details after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, page}) => {
		// Corresponds to Poshi test: ViewObjectDefinitionDetailsAfterUpgrade7413U33

		const objectDefinitionERC =
			'ObjectDefinition' + getRandomInt();

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectDefinitionExternalReferenceCode:
					objectDefinitionERC,
				panelCategoryKey: 'control_panel.object',
				scope: 'company',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await editObjectDetailsPage.goto(
			objectDefinition.label!['en_US']
		);

		await editObjectDetailsPage.goToDetailsTab();

		await expect(
			page.getByText(objectDefinitionERC, {exact: true}).first()
		).toBeVisible();

		await expect(page.getByText('Company', {exact: true})).toBeVisible();
	}
);

test(
	'LPD-78504 View object entry after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: ViewObjectEntryAfterUpgrade7413U33

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

		const fieldName = objectFields[0].name!;
		const entryValue = 'TestValue' + getRandomInt();

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: entryValue},
			applicationName
		);

		await viewObjectEntriesPage.goto(objectDefinition.className!);

		await expect(page.getByText(entryValue)).toBeVisible();
	}
);

test(
	'LPD-78504 View object field after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Corresponds to Poshi test: ViewObjectFieldAfterUpgrade7413U33

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text', 'Integer', 'Boolean'],
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

		await objectFieldsPage.goto(objectDefinition.label!['en_US']);

		for (const objectField of objectFields) {
			await expect(
				page.getByRole('link', {
					name: objectField.label!['en_US'],
				})
			).toBeVisible();
		}
	}
);

test(
	'LPD-78504 View object layout after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		// Corresponds to Poshi test: ViewObjectLayoutAfterUpgrade7413U33

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label!['en_US']);

		// Create a layout since API-created objects don't auto-create one

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await expect(
			page.getByRole('link', {name: layoutName})
		).toBeVisible();
	}
);

test(
	'LPD-78504 View object relationship after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
		// Corresponds to Poshi test: ViewObjectRelationshipAfterUpgrade7413U33

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectRelationshipLabel =
			'Relationship' + getRandomInt();
		const objectRelationshipName =
			'relationship' + getRandomInt();

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: objectRelationshipLabel},
				name: objectRelationshipName,
				objectDefinitionExternalReferenceCode1:
					objectDefinition1.externalReferenceCode,
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId1: objectDefinition1.id,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		await objectRelationshipsPage.goto(
			objectDefinition1.label!['en_US']
		);

		await expect(
			page.getByRole('link', {name: objectRelationshipLabel})
		).toBeVisible();
	}
);

test(
	'LPD-78504 View picklist after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, listTypeDefinitionPage, page}) => {
		// Corresponds to Poshi test: ViewPicklistAfterUpgrade7413U33

		const listTypeDefinition =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: listTypeDefinition.id,
			type: 'listTypeDefinition',
		});

		const entryName = 'Entry' + getRandomInt();

		await apiHelpers.listTypeAdmin.postListTypeEntry({
			key: entryName.toLowerCase(),
			listTypeDefinitionExternalReferenceCode:
				listTypeDefinition.externalReferenceCode,
			name_i18n: {en_US: entryName},
		});

		await listTypeDefinitionPage.goto();

		await expect(
			page.getByRole('link', {name: listTypeDefinition.name})
		).toBeVisible();
	}
);
