/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectDefinitionAPI} from '@liferay/object-admin-rest-client-js';
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

test.beforeEach(({page}) => {
	test.skip(true, 'Requires Salesforce storage type configuration');

	page.setViewportSize({height: 1080, width: 1920});
});

test(
	'LPD-78504 Assert CRUD with created custom object using Salesforce storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: AssertCRUDWithCreatedCustomObject

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinitionName = 'Name' + getRandomInt();
		const objectDefinitionLabel = getRandomString();

		const {body: objectDefinition} =
			await objectDefinitionAPIClient.postObjectDefinition({
				active: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: objectDefinitionLabel + 's',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				storageType: 'salesforce',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldLabel = objectFields[0].label['en_US'];
		const fieldName = objectFields[0].name!;

		// Create

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const createValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: createValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.backButton.click();

		// Read

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(createValue)
		).toBeVisible();

		// Update

		await page.getByRole('button', {name: 'Actions'}).click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		const updateValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: updateValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue)
		).toBeVisible();

		// Delete

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await viewObjectEntriesPage.deletionConfirmationModal
			.getByRole('button', {
				name: 'Delete',
			})
			.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue, {exact: true})
		).toBeAttached({attached: false});
	}
);

test(
	'LPD-78504 Assert CRUD with created standard object using Salesforce storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: AssertCRUDWithCreatedStandardObject

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinitionName = 'Name' + getRandomInt();
		const objectDefinitionLabel = getRandomString();

		const {body: objectDefinition} =
			await objectDefinitionAPIClient.postObjectDefinition({
				active: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: objectDefinitionLabel + 's',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				storageType: 'salesforce',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldLabel = objectFields[0].label['en_US'];
		const fieldName = objectFields[0].name!;

		// Create

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const createValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: createValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.backButton.click();

		// Read

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(createValue)
		).toBeVisible();

		// Update

		await page.getByRole('button', {name: 'Actions'}).click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		const updateValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: updateValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue)
		).toBeVisible();

		// Delete

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await viewObjectEntriesPage.deletionConfirmationModal
			.getByRole('button', {
				name: 'Delete',
			})
			.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue, {exact: true})
		).toBeAttached({attached: false});
	}
);

test(
	'LPD-78504 Assert CRUD with form container using Salesforce storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: AssertCRUDWithFormContainer

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinitionName = 'Name' + getRandomInt();
		const objectDefinitionLabel = getRandomString();

		const {body: objectDefinition} =
			await objectDefinitionAPIClient.postObjectDefinition({
				active: true,
				enableFormContainer: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: objectDefinitionLabel + 's',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				storageType: 'salesforce',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldLabel = objectFields[0].label['en_US'];
		const fieldName = objectFields[0].name!;

		// Create

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const createValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: createValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.backButton.click();

		// Read

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(createValue)
		).toBeVisible();

		// Update

		await page.getByRole('button', {name: 'Actions'}).click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		const updateValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: updateValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue)
		).toBeVisible();

		// Delete

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await viewObjectEntriesPage.deletionConfirmationModal
			.getByRole('button', {
				name: 'Delete',
			})
			.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue, {exact: true})
		).toBeAttached({attached: false});
	}
);

test(
	'LPD-78504 Assert CRUD with imported custom object using Salesforce storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: AssertCRUDWithImportedCustomObject

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinitionName = 'Name' + getRandomInt();
		const objectDefinitionLabel = getRandomString();

		const {body: objectDefinition} =
			await objectDefinitionAPIClient.postObjectDefinition({
				active: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: objectDefinitionLabel + 's',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				storageType: 'salesforce',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldLabel = objectFields[0].label['en_US'];
		const fieldName = objectFields[0].name!;

		// Create

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const createValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: createValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.backButton.click();

		// Read

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(createValue)
		).toBeVisible();

		// Update

		await page.getByRole('button', {name: 'Actions'}).click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		const updateValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: updateValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue)
		).toBeVisible();

		// Delete

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await viewObjectEntriesPage.deletionConfirmationModal
			.getByRole('button', {
				name: 'Delete',
			})
			.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue, {exact: true})
		).toBeAttached({attached: false});
	}
);

test(
	'LPD-78504 Assert CRUD with imported standard object using Salesforce storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		// Corresponds to Poshi test: AssertCRUDWithImportedStandardObject

		const objectDefinitionAPIClient =
			await apiHelpers.buildRestClient(ObjectDefinitionAPI);

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinitionName = 'Name' + getRandomInt();
		const objectDefinitionLabel = getRandomString();

		const {body: objectDefinition} =
			await objectDefinitionAPIClient.postObjectDefinition({
				active: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: objectDefinitionLabel + 's',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				storageType: 'salesforce',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldLabel = objectFields[0].label['en_US'];
		const fieldName = objectFields[0].name!;

		// Create

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const createValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: createValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.backButton.click();

		// Read

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(createValue)
		).toBeVisible();

		// Update

		await page.getByRole('button', {name: 'Actions'}).click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		const updateValue = getRandomString();

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: fieldLabel,
			objectFieldValue: updateValue,
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue)
		).toBeVisible();

		// Delete

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await viewObjectEntriesPage.deletionConfirmationModal
			.getByRole('button', {
				name: 'Delete',
			})
			.click();

		await expect(
			page
				.locator(`.cell-${fieldLabel}`)
				.nth(1)
				.getByText(updateValue, {exact: true})
		).toBeAttached({attached: false});
	}
);
