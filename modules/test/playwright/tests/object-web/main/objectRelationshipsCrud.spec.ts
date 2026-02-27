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
	'LPD-78504 Can add multiple One-to-Many relations with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;

		const _entryA = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			`c/${objectDefinition.name.toLowerCase()}s`
		);

		const _entryB = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			`c/${objectDefinition.name.toLowerCase()}s`
		);

		for (const entryLabel of ['Entry A', 'Entry B']) {
			await viewObjectEntriesPage.goto(objectDefinition.className);

			await page.getByRole('cell').getByRole('link').filter({hasText: entryLabel}).first().click();

			await viewObjectEntriesPage.editObjectEntryForm.waitFor({state: 'visible'});

			await page.getByLabel('Relationship').first().fill(userAccount.givenName);

			await page.getByRole('option', {name: userAccount.givenName}).click();

			await viewObjectEntriesPage.saveObjectEntryButton.click();

			await expect(viewObjectEntriesPage.successMessage).toBeVisible();

			await expect(
				page.getByText(userAccount.givenName)
			).toBeVisible();
		}
	}
);

test(
	'LPD-78504 Can add One-to-Many relation with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await page.getByLabel('Relationship').first().fill(userAccount.givenName);

		await page.getByRole('option', {name: userAccount.givenName}).click();

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await expect(
			page.getByText(userAccount.givenName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can add tabs for self Many-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName1 = 'rel' + getRandomInt();
		const relationshipName2 = 'rel' + getRandomInt();

		const {body: objectRelationship1} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName1,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship1.id,
			type: 'objectRelationship',
		});

		const {body: objectRelationship2} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship 2'},
					name: relationshipName2,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship2.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		for (const tabLabel of ['Relationship Tab A', 'Relationship Tab B']) {
			await objectLayoutsPage.addTab.click();

			await objectLayoutsPage.labelInput.fill(tabLabel);

			await objectLayoutsPage.relationshipType.click();

			await objectLayoutsPage.fieldList.click();

			await objectLayoutsPage.iframeLocator
				.getByRole('option', {name: 'Relationship'})
				.first()
				.click();

			await objectLayoutsPage.saveTabButton.click();

			await objectLayoutsPage.saveUpdateLayoutButton.click();
		}

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Relationship Tab A')
		).toBeVisible();

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Relationship Tab B')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can create Many-to-Many relationship with Native Object',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: 'User',
				objectRelationshipLabel: 'Relationship',
				type: 'Many to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await waitForAlert(
			page,
			'Success:Relationship was created successfully.'
		);

		await expect(
			page.getByRole('link', {exact: true, name: 'Relationship'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can create One-to-Many relationship for Native Object',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto('User');

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'One to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await waitForAlert(
			page,
			'Success:Relationship was created successfully.'
		);

		await expect(
			page.getByRole('link', {exact: true, name: 'Relationship'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can create One-to-Many relationship with Native Object',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto('User');

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'One to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await waitForAlert(
			page,
			'Success:Relationship was created successfully.'
		);

		await expect(
			page.getByRole('link', {exact: true, name: 'Relationship'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can delete entries using Cascade deletion type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const textFieldName = objectFields[0].name;

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
				titleObjectFieldName: textFieldName,
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					deletionType: 'cascade',
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		const _entryA = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		const _entryB = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			restPath
		);

		const _entryC = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry C'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry B'}).click();

		await page.waitForTimeout(1000);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry B'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry C'}).click();

		await page.waitForTimeout(1000);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('button', {name: 'Actions'}).filter({hasText: ''}).first().click();
		await page.getByRole('menuitem', {name: 'Delete'}).click();
		await page.getByRole('button', {name: 'Delete'}).click();

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry B'})
		).toBeHidden();

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry C'})
		).toBeHidden();

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can delete Many-to-Many relationship between Custom Object entry and Native Object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
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

		const userAccount1 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const userAccount2 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionName2: 'User',
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		const _entryA = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		const _entryB = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			restPath
		);

		for (const entryLabel of ['Entry A', 'Entry B']) {
			await viewObjectEntriesPage.goto(objectDefinition.className);

			await page.getByRole('cell').getByRole('link').filter({hasText: entryLabel}).first().click();

			await page.getByRole('tab', {name: 'Relationship Tab'}).click();

			await page.getByLabel('Add Relationship').first().click();

			await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount1.givenName}).click();

			await page.waitForTimeout(1000);

			await page.reload();

			await page.getByRole('tab', {name: 'Relationship Tab'}).click();

			await page.getByLabel('Add Relationship').first().click();

			await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount2.givenName}).click();

			await page.waitForTimeout(1000);
		}

		for (const entryLabel of ['Entry A', 'Entry B']) {
			await viewObjectEntriesPage.goto(objectDefinition.className);

			await page.getByRole('cell').getByRole('link').filter({hasText: entryLabel}).first().click();

			await page.getByRole('tab', {name: 'Relationship Tab'}).click();

			const actionsButtons = page.getByRole('button', {name: 'Actions'});

			if (await actionsButtons.first().isVisible()) {
				await actionsButtons.first().click();
				await page.getByRole('menuitem', {name: 'Delete'}).click();
				await page.getByRole('button', {name: 'Delete'}).click();

				await page.waitForTimeout(1000);
			}

			if (await actionsButtons.first().isVisible()) {
				await actionsButtons.first().click();
				await page.getByRole('menuitem', {name: 'Delete'}).click();
				await page.getByRole('button', {name: 'Delete'}).click();
			}
		}

		await expect(
			page.getByText(userAccount1.givenName)
		).toBeHidden();

		await expect(
			page.getByText(userAccount2.givenName)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete Many-to-Many relationship from parent side',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto('User');

		await objectRelationshipsPage.actionsButton.first().click();

		await objectRelationshipsPage.deleteObjectRelationshipOption.click();

		await page.frameLocator('iframe').getByPlaceholder('').fill(relationshipName);

		await page.frameLocator('iframe').getByRole('button', {name: 'Delete'}).click();

		await expect(
			page.getByRole('link', {exact: true, name: 'Relationship'})
		).toBeHidden();

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(item) =>
					item.id === objectRelationship.id &&
					item.type === 'objectRelationship'
			),
			1
		);
	}
);

test(
	'LPD-78504 Can delete One-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
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

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto('User');

		await objectRelationshipsPage.actionsButton.first().click();

		await objectRelationshipsPage.deleteObjectRelationshipOption.click();

		await page.frameLocator('iframe').getByPlaceholder('').fill(relationshipName);

		await page.frameLocator('iframe').getByRole('button', {name: 'Delete'}).click();

		await expect(
			page.getByRole('link', {exact: true, name: 'Relationship'})
		).toBeHidden();

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(item) =>
					item.id === objectRelationship.id &&
					item.type === 'objectRelationship'
			),
			1
		);
	}
);

test(
	'LPD-78504 Can delete One-to-Many relationship between Custom Object entry and Native Object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
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

		const userAccount1 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const userAccount2 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		const _entryA = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		const _entryB = await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount1.givenName}).click();

		await page.waitForTimeout(1000);

		await page.reload();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount2.givenName}).click();

		await page.waitForTimeout(1000);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		const actionsButtons = page.getByRole('button', {name: 'Actions'});

		await actionsButtons.first().click();
		await page.getByRole('menuitem', {name: 'Delete'}).click();
		await page.getByRole('button', {name: 'Delete'}).click();

		await page.waitForTimeout(1000);

		await expect(
			page.getByText(userAccount1.givenName)
		).toBeHidden();

		await actionsButtons.first().click();
		await page.getByRole('menuitem', {name: 'Delete'}).click();
		await page.getByRole('button', {name: 'Delete'}).click();

		await expect(
			page.getByText(userAccount2.givenName)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can do nested relation in a One-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const textFieldName = objectFields[0].name;

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
				titleObjectFieldName: textFieldName,
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US'], 'Relationship'],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry B'}).click();

		await page.waitForTimeout(1000);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry B'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry A'}).click();

		await page.waitForTimeout(1000);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'})
		).toBeVisible();

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry B'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can edit Many-to-Many relationship of Custom Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
		const objectFields1 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const textFieldName1 = objectFields1[0].name;
		const textFieldName2 = objectFields2[0].name;

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields1,
				status: {code: 0},
				titleObjectFieldName: textFieldName1,
			});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 0},
				titleObjectFieldName: textFieldName2,
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition1.id
		);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition2.id
		);

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition1.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId1: objectDefinition1.id,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition1.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields1[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath1 = `c/${objectDefinition1.name.toLowerCase()}s`;
		const restPath2 = `c/${objectDefinition2.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName1]: 'Entry A'},
			restPath1
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName2]: 'Entry B'},
			restPath2
		);

		await viewObjectEntriesPage.goto(objectDefinition1.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry B'}).click();

		await page.waitForTimeout(1000);

		await expect(
			page.getByText('Entry B')
		).toBeVisible();

		await viewObjectEntriesPage.goto(objectDefinition2.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry B'}).first().click();

		await page.getByLabel(objectFields2[0].label['en_US'], {exact: true}).fill('Entry C');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition1.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await expect(
			page.getByText('Entry C')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can identify Parent and Child relationship through labels',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'Many to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await waitForAlert(
			page,
			'Success:Relationship was created successfully.'
		);

		await expect(page.getByText('Parent')).toBeVisible();
		await expect(page.getByText('Child')).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot delete Many-to-Many relationship from child side',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.actionsButton.first().click();

		await objectRelationshipsPage.deleteObjectRelationshipOption.click();

		await expect(
			page.getByText(
				'This relationship cannot be deleted from the child side.'
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot delete relationship with incorrect input',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.actionsButton.first().click();

		await objectRelationshipsPage.deleteObjectRelationshipOption.click();

		await page.frameLocator('iframe').getByPlaceholder('').fill('IncorrectInput');

		await page.frameLocator('iframe').getByRole('button', {name: 'Delete'}).click();

		await expect(
			page.frameLocator('iframe').getByText('Input and relationship name do not match.')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot leave Relationship Label blank',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		await expect(
			addNewObjectRelationshipModalPage.modalHeader
		).toBeVisible();

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.nameInput.fill(
			'relationship'
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectType(
			'One to Many'
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectManyRecordsOf(
			objectDefinition.label['en_US']
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.saveButton.click();

		await expect(
			page.locator('.modal-content').getByText('Required')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot leave Relationship tab on first place by removing fields tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.iframeLocator
			.getByLabel('Mark as Default')
			.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.addTab.click();
		await objectLayoutsPage.labelInput.fill('Relationship Tab');
		await objectLayoutsPage.relationshipType.click();
		await objectLayoutsPage.fieldList.click();
		await objectLayoutsPage.iframeLocator
			.getByRole('option', {name: 'Relationship'})
			.first()
			.click();
		await objectLayoutsPage.saveTabButton.click();

		await objectLayoutsPage.iframeLocator.getByText('Field Tab').click();

		await objectLayoutsPage.iframeLocator
			.getByRole('menuitem', {name: 'Delete'})
			.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block 1',
		});

		await objectLayoutsPage.openObjectLayoutObjectField();

		await objectLayoutsPage.addObjectLayoutObjectField(
			objectFields[0].label['en_US']
		);

		await objectLayoutsPage.saveUpdateLayoutButton.click();

		await expect(
			objectLayoutsPage.iframeLocator.getByText(
				"The layout's first tab must be a field tab."
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot relate an entry with itself',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectLayoutsPage,
		objectRelationshipsPage,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const textFieldName = objectFields[0].name;

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
				titleObjectFieldName: textFieldName,
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'Many to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry Test'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry Test'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		const selectFrame = page.frameLocator('iframe[title="Select"]');

		await expect(
			selectFrame.getByRole('link', {name: 'Entry Test'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot select Relationship field for Object Entry Title',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await editObjectDetailsPage.goto(objectDefinition.label['en_US']);

		await editObjectDetailsPage.goToDetailsTab();

		await page.getByText('Entry Title Field').click();

		const titleFieldOptions = page.getByRole('listbox');

		await expect(
			titleFieldOptions.getByRole('option', {name: 'Relationship'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot update Name, Type or Object from parent Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
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

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await page
			.getByRole('link', {exact: true, name: 'Relationship'})
			.first()
			.click();

		const iframe = page.frameLocator('iframe');

		await expect(
			iframe.getByLabel('NameMandatory')
		).toBeDisabled();

		await expect(
			iframe.getByText(objectDefinition.label['en_US'])
		).toBeVisible();

		await expect(
			iframe.getByText('Many to Many')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can relate Many-to-Many Custom Object entry with Native Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
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

		const userAccount1 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const userAccount2 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionName2: 'User',
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry B'},
			restPath
		);

		for (const entryLabel of ['Entry A', 'Entry B']) {
			await viewObjectEntriesPage.goto(objectDefinition.className);

			await page.getByRole('cell').getByRole('link').filter({hasText: entryLabel}).first().click();

			await page.getByRole('tab', {name: 'Relationship Tab'}).click();

			await page.getByLabel('Add Relationship').first().click();

			await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount1.givenName}).click();

			await page.waitForTimeout(1000);

			await expect(page.getByText(userAccount1.givenName)).toBeVisible();

			await page.getByLabel('Add Relationship').first().click();

			await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount2.givenName}).click();

			await page.waitForTimeout(1000);

			await expect(page.getByText(userAccount2.givenName)).toBeVisible();
		}
	}
);

test(
	'LPD-78504 Can relate One-to-Many Custom Object entry with Native Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
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

		const userAccount1 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const userAccount2 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const userAccount3 =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2: 'L_USER',
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionName2: 'User',
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry A'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		for (const userAccount of [userAccount1, userAccount2, userAccount3]) {
			await page.getByLabel('Add Relationship').first().click();

			await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: userAccount.givenName}).click();

			await page.waitForTimeout(1000);

			await expect(page.getByText(userAccount.givenName)).toBeVisible();
		}
	}
);

test(
	'LPD-78504 Can relate One-to-Many Native Object with Custom site scoped Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount();

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1: 'L_USER',
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await page.getByLabel('Relationship').first().fill(userAccount.givenName);

		await page.getByRole('option', {name: userAccount.givenName}).click();

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await expect(
			page.getByText(userAccount.givenName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can see label when creating Relationship Tab',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectLayoutsPage,
		objectRelationshipsPage,
		page: _page,
	}) => {
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'Many to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.iframeLocator
			.getByLabel('Mark as Default')
			.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.addTab.click();

		await objectLayoutsPage.relationshipType.click();

		await objectLayoutsPage.fieldList.click();

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Parent')
		).toBeVisible();

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Child')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can see label when editing Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
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

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await expect(page.getByText('Parent')).toBeVisible();
		await expect(page.getByText('Child')).toBeVisible();

		await page
			.getByRole('row')
			.filter({hasText: 'Parent'})
			.getByRole('link', {exact: true, name: 'Relationship'})
			.click();

		const iframe = page.frameLocator('iframe');

		await expect(iframe.getByText('Parent')).toBeVisible();

		await objectRelationshipsPage.cancelButton.click();

		await page
			.getByRole('row')
			.filter({hasText: 'Child'})
			.getByRole('link', {exact: true, name: 'Relationship'})
			.click();

		await expect(iframe.getByText('Child')).toBeVisible();
	}
);

test(
	'LPD-78504 Can see related entries on Relationship tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const textFieldName = objectFields[0].name;

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
				titleObjectFieldName: textFieldName,
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		const relationshipName = 'rel' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition.externalReferenceCode,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode1:
						objectDefinition.externalReferenceCode,
					objectDefinitionExternalReferenceCode2:
						objectDefinition.externalReferenceCode,
					objectDefinitionId1: objectDefinition.id,
					objectDefinitionId2: objectDefinition.id,
					objectDefinitionName2: objectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.createObjectRelationshipTab(
			layoutName,
			'Relationship Tab',
			'Relationship'
		);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry Test A'},
			restPath
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry Test B'},
			restPath
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await page.getByRole('cell').getByRole('link').filter({hasText: 'Entry Test A'}).first().click();

		await page.getByRole('tab', {name: 'Relationship Tab'}).click();

		await page.getByLabel('Add Relationship').first().click();

		await page.frameLocator('iframe[title="Select"]').getByRole('link', {name: 'Entry Test B'}).click();

		await page.waitForTimeout(1000);

		await expect(
			page.getByText('Entry Test B')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can set Title Field for Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers: _apiHelpers, editObjectDetailsPage, page}) => {
		await editObjectDetailsPage.goto('User');

		await editObjectDetailsPage.goToDetailsTab();

		await page.getByText('Entry Title Field').click();

		await page.getByRole('option', {name: 'Screen Name'}).click();

		await editObjectDetailsPage.saveObjectDefinition();

		await waitForAlert(page);

		await editObjectDetailsPage.goto('User');

		await editObjectDetailsPage.goToDetailsTab();

		await expect(
			page.getByText('Screen Name')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can switch relationship order between parent and child',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
	}) => {
		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto(
			objectDefinition1.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		await expect(
			addNewObjectRelationshipModalPage.modalHeader
		).toBeVisible();

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.labelInput.fill(
			'Relationship'
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectType(
			'One to Many'
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectManyRecordsOf(
			objectDefinition2.label['en_US']
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.reverseOrderButton.click();

		await expect(
			addNewObjectRelationshipModalPage.objectRelationshipFormPage.oneRecordOfInput
		).toHaveText(objectDefinition2.label['en_US']);

		await expect(
			addNewObjectRelationshipModalPage.objectRelationshipFormPage.manyRecordsOfInput
		).toHaveText(objectDefinition1.label['en_US']);

		const objectRelationship =
			await addNewObjectRelationshipModalPage.objectRelationshipFormPage.saveButton.click().then(
				async () => {
					const response = await page.waitForResponse(
						'**/object-relationships'
					);

					return response.json();
				}
			);

		if (objectRelationship?.id) {
			apiHelpers.data.push({
				id: objectRelationship.id,
				type: 'objectRelationship',
			});
		}
	}
);

test(
	'LPD-78504 Can view and add Object entries after creating a Relationship',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page,
		viewObjectEntriesPage,
	}) => {
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

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		await objectDefinitionAPIClient.postObjectDefinitionPublish(
			objectDefinition.id
		);

		const textFieldName = objectFields[0].name;
		const restPath = `c/${objectDefinition.name.toLowerCase()}s`;

		await apiHelpers.objectEntry.postObjectEntry(
			{[textFieldName]: 'Entry Test'},
			restPath
		);

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		const objectRelationship =
			await addNewObjectRelationshipModalPage.handleForm({
				manyRecordsOf: objectDefinition.label['en_US'],
				objectRelationshipLabel: 'Relationship',
				type: 'One to Many',
			});

		apiHelpers.data.push({
			id: objectRelationship.id,
			type: 'objectRelationship',
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(
			page.getByRole('cell').getByRole('link').filter({hasText: 'Entry Test'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Switch button is not present when M:M relationship is selected',
	{tag: '@LPD-78504'},
	async ({
		addNewObjectRelationshipModalPage,
		apiHelpers,
		objectRelationshipsPage,
		page: _page,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		await expect(
			addNewObjectRelationshipModalPage.modalHeader
		).toBeVisible();

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectType(
			'Many to Many'
		);

		await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectManyRecordsOf(
			objectDefinition.label['en_US']
		);

		await expect(
			addNewObjectRelationshipModalPage.objectRelationshipFormPage.reverseOrderButton
		).toBeHidden();
	}
);
