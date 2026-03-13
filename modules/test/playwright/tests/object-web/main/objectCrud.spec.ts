/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinition,
	ObjectRelationship,
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

// Migrated from Object.testcase

test(
	'Verify it is possible to delete an object after deleting the relationship',
	{tag: '@LPS-150886'},
	async ({
		apiHelpers,
		objectRelationshipsPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		let objectDefinition1: ObjectDefinition;
		let objectDefinition2: ObjectDefinition;
		let relationshipName: string;

		await test.step('Create object definitions', async () => {
			const objectFields = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});

			objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: generateObjectFields({
						objectFieldBusinessTypes: ['Text'],
					}),
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});
		});

		await test.step('Create object relationship', async () => {
			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			relationshipName = 'relationship' + getRandomInt();

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
		});

		await test.step('Verify that an object that has a relationship cannot be deleted', async () => {
			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
				objectDefinition1.label['en_US']
			);

			await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

			await expect(page.getByText('Deletion Not Allowed')).toBeVisible();

			await page.getByRole('button', {name: 'Done'}).click();
		});

		await test.step('Delete the relationship first', async () => {
			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.actionsButton.click();

			await objectRelationshipsPage.deleteObjectRelationshipOption.click();

			await page
				.getByPlaceholder('Confirm relationship name', {exact: false})
				.fill(relationshipName);

			await page.getByRole('button', {name: 'Delete'}).click();

			await expect(page.getByText('No Results Found')).toBeVisible({
				timeout: 15000,
			});
		});

		await test.step('Now delete the object definition', async () => {
			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
				objectDefinition1.label['en_US']
			);

			await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

			await page
				.getByPlaceholder('Confirm Object Definition Name')
				.fill(objectDefinition1.name);

			await page
				.getByRole('button', {exact: true, name: 'Delete'})
				.click();

			apiHelpers.data.splice(
				apiHelpers.data.findIndex(
					(object) =>
						object.id === objectDefinition1.id &&
						object.type === 'objectDefinition'
				),
				1
			);

			await expect(
				viewObjectDefinitionsPage.frontendDataSetEntries.filter({
					hasText: objectDefinition1.label['en_US'],
				})
			).toBeHidden();
		});
	}
);

test(
	'Verify it is possible to delete a published object',
	{tag: '@LPS-150886'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		await page
			.getByPlaceholder('Confirm Object Definition Name')
			.fill(objectDefinition.name);

		await page.getByRole('button', {exact: true, name: 'Delete'}).click();

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(object) =>
					object.id === objectDefinition.id &&
					object.type === 'objectDefinition'
			),
			1
		);

		await expect(
			viewObjectDefinitionsPage.frontendDataSetEntries.filter({
				hasText: objectDefinition.label['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'Verify it is possible to delete a relationship of a native object',
	{tag: '@LPS-135406'},
	async ({
		apiHelpers,
		objectRelationshipsPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		let userObjectRelationship: ObjectRelationship;
		let relationshipLabel: string;
		let relationshipName: string;

		await test.step('Create object definition and relationship', async () => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			relationshipLabel = 'Relationship' + getRandomInt();
			relationshipName = 'relationship' + getRandomInt();

			const {body: objectRelationship} =
				await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
					'L_USER',
					{
						label: {en_US: relationshipLabel},
						name: relationshipName,
						objectDefinitionExternalReferenceCode2:
							objectDefinition.externalReferenceCode,
						objectDefinitionId2: objectDefinition.id,
						objectDefinitionName2: objectDefinition.name,
						type: 'oneToMany',
					}
				);

			userObjectRelationship = objectRelationship;

			apiHelpers.data.push({
				id: objectRelationship.id,
				type: 'objectRelationship',
			});
		});

		await test.step("Navigate to the User system object's Relationships tab", async () => {
			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
				'User'
			);

			await objectRelationshipsPage.relationshipTabItem.click();
		});

		await test.step('Delete the relationship', async () => {
			await page
				.getByRole('row', {name: relationshipLabel})
				.getByRole('button')
				.click();

			await objectRelationshipsPage.deleteObjectRelationshipOption.click();

			await page
				.getByPlaceholder('Confirm relationship name', {exact: false})
				.fill(relationshipName);

			await page.getByRole('button', {name: 'Delete'}).click();

			apiHelpers.data.splice(
				apiHelpers.data.findIndex(
					(object) =>
						object.id === userObjectRelationship.id &&
						object.type === 'objectRelationship'
				),
				1
			);
		});

		await test.step('Check that the relationship is deleted', async () => {
			await expect(
				page.getByRole('link', {name: relationshipName})
			).not.toBeVisible();
		});
	}
);

test(
	'Verify it is possible to filter object entries by API',
	{tag: '@LPS-158615'},
	async ({apiHelpers}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: [
				{businessType: 'Text', indexedAsKeyword: true},
			],
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
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Apple'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Apple Sauce'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Banana'},
			applicationName
		);

		const searchParams = new URLSearchParams();
		searchParams.append('filter', `${fieldName} eq 'Apple'`);

		const {items} =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName,
				searchParams
			);

		expect(items).toHaveLength(1);
		expect(items[0][fieldName]).toBe('Apple');
	}
);

test(
	'Verify it is not possible to delete an object that has a relationship',
	{tag: '@LPS-150886'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: generateObjectFields({
					objectFieldBusinessTypes: ['Text'],
				}),
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition2.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
			ObjectRelationshipAPI
		);

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: 'relationship' + getRandomInt(),
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		await expect(page.getByText('Deletion Not Allowed')).toBeVisible();
	}
);

test(
	'Verify the custom object label cannot be used to confirm the deletion',
	{tag: '@LPS-150886'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		// Type a wrong value (not the name)

		await page
			.getByPlaceholder('Confirm Object Definition Name', {
				exact: false,
			})
			.fill('WrongValue');

		const deleteButton = page.getByRole('button', {
			exact: true,
			name: 'Delete',
		});

		await expect(deleteButton).toBeDisabled();
	}
);

test('Verify it is possible to search object entries by API', async ({
	apiHelpers,
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

	const applicationName = 'c/' + objectDefinition.name.toLowerCase() + 's';
	const fieldName = objectFields[0].name!;

	const entryA = await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryA'},
		applicationName
	);

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryB'},
		applicationName
	);

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryC'},
		applicationName
	);

	const searchParams = new URLSearchParams();
	searchParams.append('search', 'EntryA');

	const {items} =
		await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
			applicationName,
			searchParams
		);

	expect(items.length).toBeGreaterThan(0);
	expect(items[0].id).toBe(entryA.id);
});

test('Verify it is possible to sort object entries by API', async ({
	apiHelpers,
}) => {
	const objectFields = generateObjectFields({
		objectFieldBusinessTypes: [
			{businessType: 'Text', indexedAsKeyword: true},
		],
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

	const applicationName = 'c/' + objectDefinition.name.toLowerCase() + 's';
	const fieldName = objectFields[0].name!;

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryC'},
		applicationName
	);

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryZ'},
		applicationName
	);

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'EntryA'},
		applicationName
	);

	const searchParams = new URLSearchParams();
	searchParams.append('sort', `${fieldName}:asc`);

	const {items} =
		await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
			applicationName,
			searchParams
		);

	expect(items[0][fieldName]).toBe('EntryA');
	expect(items[1][fieldName]).toBe('EntryC');
	expect(items[2][fieldName]).toBe('EntryZ');
});

test.fixme(
	'Verify it is possible to update Custom Object when changing the localization on Instance Settings',
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		// Navigate to Instance Settings > Localization and change default language

		await page.goto(
			'/group/guest/~/control_panel/manage/-/instance_settings'
		);

		await page.getByRole('link', {name: 'Localization'}).click();

		await page.getByRole('link', {name: 'Language'}).click();

		// Change default language to Portuguese (Brazil)

		await page.getByRole('combobox').selectOption('pt_BR');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Navigate to Object Admin and update the object label

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			objectDefinition.label['en_US']
		);

		const newLabel = 'Objeto Personalizado ' + getRandomInt();

		await page.getByLabel('LabelMandatory').clear();
		await page.getByLabel('LabelMandatory').fill(newLabel);

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await expect(page.getByLabel('LabelMandatory')).toHaveValue(newLabel);

		// Restore default language to English

		await page.goto(
			'/group/guest/~/control_panel/manage/-/instance_settings'
		);

		await page.getByRole('link', {name: 'Localization'}).click();

		await page.getByRole('link', {name: 'Language'}).click();

		await page.getByRole('combobox').selectOption('en_US');

		await page.getByRole('button', {name: 'Save'}).click();
	}
);

test(
	'Verify it is possible to update the label of relationship field of custom object from a native object',
	{tag: '@LPS-135406'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		const relationshipLabel = 'Relationship' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: relationshipLabel},
					name: 'relationship' + getRandomInt(),
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

		// Navigate to the custom object's Fields tab to update the relationship field label

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(relationshipLabel);

		const iframeLocator = page.frameLocator('iframe');
		const newLabel = 'New Relationship' + getRandomInt();

		await iframeLocator.getByLabel('LabelMandatory').clear();
		await iframeLocator.getByLabel('LabelMandatory').fill(newLabel);

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(page, 'The object field was updated successfully');

		await page.reload();

		await expect(page.getByText(newLabel)).toBeVisible();
	}
);

test(
	'Verify it is possible to update the label of relationship of native object',
	{tag: '@LPS-135406'},
	async ({
		apiHelpers,
		objectRelationshipsPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
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

		const relationshipLabel = 'Relationship' + getRandomInt();

		const {body: objectRelationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: relationshipLabel},
					name: 'relationship' + getRandomInt(),
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

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink('User');

		await objectRelationshipsPage.relationshipTabItem.click();

		await page.getByRole('link', {name: relationshipLabel}).click();

		const newLabel = 'New Relationship' + getRandomInt();

		await objectRelationshipsPage.labelInput.fill(newLabel);

		await objectRelationshipsPage.saveObjectRelationship();

		await expect(page.getByRole('link', {name: newLabel})).toBeVisible();
	}
);

test(
	'Verify an error message is shown when the user enters the wrong value in the confirmation field',
	{tag: '@LPS-162024'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		await page
			.getByPlaceholder('Confirm Object Definition Name')
			.fill('wrongvalue');

		await expect(page.getByText('Input does not match')).toBeVisible();
	}
);

test('Verify it is possible to view the custom object after restarting portal', async ({
	apiHelpers,
	page,
	viewObjectDefinitionsPage,
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

	const applicationName = 'c/' + objectDefinition.name.toLowerCase() + 's';
	const fieldName = objectFields[0].name!;

	await apiHelpers.objectEntry.postObjectEntry(
		{[fieldName]: 'Entry Test'},
		applicationName
	);

	// Simulate "restart" by navigating away and back

	await page.goto('/');

	await viewObjectDefinitionsPage.goto();

	await expect(
		viewObjectDefinitionsPage.frontendDataSetEntries.filter({
			hasText: objectDefinition.label['en_US'],
		})
	).toBeVisible();
});

test.fixme(
	'Verify it is possible to add an Object Entry Title Field when changing the localization on Instance Settings',
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			'L_ACCOUNT_ENTRY',
			{
				label: {en_US: 'Relationship'},
				name: 'relationship' + getRandomInt(),
				objectDefinitionExternalReferenceCode2:
					objectDefinition.externalReferenceCode,
				objectDefinitionId2: objectDefinition.id,
				objectDefinitionName2: objectDefinition.name,
				type: 'oneToMany',
			}
		);

		// Change default language to Portuguese (Brazil)

		await page.goto(
			'/group/guest/~/control_panel/manage/-/instance_settings'
		);

		await page.getByRole('link', {name: 'Localization'}).click();

		await page.getByRole('link', {name: 'Language'}).click();

		await page.getByRole('combobox').selectOption('pt_BR');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Set the title field on Account system object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			'Account'
		);

		await page.getByLabel('Object Entry Title Field').click();
		await page.getByRole('option', {name: 'Type'}).click();

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Publish the custom object

		// Restore default language to English

		await page.goto(
			'/group/guest/~/control_panel/manage/-/instance_settings'
		);

		await page.getByRole('link', {name: 'Localization'}).click();

		await page.getByRole('link', {name: 'Language'}).click();

		await page.getByRole('combobox').selectOption('en_US');

		await page.getByRole('button', {name: 'Save'}).click();
	}
);

test(
	'Verify the delete modal contains a warning message with the number of entries that will be deleted',
	{tag: '@LPS-150886'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry A'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry B'},
			applicationName
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		await expect(page.getByText('Delete Object Definition')).toBeVisible();

		await expect(page.getByText('2 object entries')).toBeVisible();
	}
);
