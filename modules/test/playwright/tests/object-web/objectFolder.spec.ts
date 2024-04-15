/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {loginTest} from '../../fixtures/loginTest';
import {objectPagesTest} from '../../fixtures/objectPagesTest';
import {getRandomInt} from '../../utils/getRandomInt';

export const test = mergeTests(apiHelpersTest, loginTest(), objectPagesTest);

test.describe('Manage object definitions through Model Builder', () => {
	test('navigate between object folders by Model Builder', async ({
		apiHelpers,
		modelBuilderPage,
	}) => {
		const objectFolders: ObjectFolder[] = await Promise.all(
			Array.apply(null, Array(5)).map(async () => {
				return await apiHelpers.objectAdmin.postRandomObjectFolder();
			})
		);

		await modelBuilderPage.goto({objectFolderName: 'Default'});

		for (const objectFolder of objectFolders) {
			await expect(modelBuilderPage.otherObjectFolders).toBeVisible();

			const otherObjectFolderLocator =
				modelBuilderPage.otherObjectFolderLocator({
					objectFolderLabel: objectFolder.label['en_US'],
				});

			await otherObjectFolderLocator.hover();

			await otherObjectFolderLocator
				.getByRole('button', {name: 'Go to Folder'})
				.click();

			await expect(otherObjectFolderLocator).toBeHidden();

			await expect(
				modelBuilderPage.objectFolderLabelHeaderLocator({
					objectFolderLabel: objectFolder.label['en_US'],
				})
			).toBeVisible();
		}

		// Clean up

		for (const objectFolder of objectFolders) {
			await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
		}
	});

	test('can edit object folder label and ERC by Model Builder', async ({
		apiHelpers,
		modalEditObjectFolderPage,
		modelBuilderPage,
		viewObjectDefinitionsPage,
	}) => {
		const objectFolder =
			await apiHelpers.objectAdmin.postRandomObjectFolder();

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.page
			.locator('li')
			.filter({hasText: objectFolder.label['en_US']})
			.click();

		await viewObjectDefinitionsPage.viewInModelBuilder();

		await modelBuilderPage.editObjectFolderDetailsButton.click();

		const editedObjectFolderLabel =
			'objectFolderLabelEdited' + getRandomInt();
		const editedObjectFolderERC = 'objectFolderERCEdited' + getRandomInt();

		await modalEditObjectFolderPage.editObjectFolderDetails(
			editedObjectFolderERC,
			editedObjectFolderLabel
		);

		expect(
			modelBuilderPage.objectFolderLabelHeaderLocator({
				objectFolderLabel: editedObjectFolderLabel,
			})
		).toBeVisible();

		expect(
			modelBuilderPage.getObjectFolderERCHeaderLocator(
				editedObjectFolderERC
			)
		).toBeVisible();

		// Clean up

		await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
	});
});

test.describe('Manage object definitions through ViewObjectDefinitions', () => {
	test('created object folders are on the left side bar', async ({
		apiHelpers,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		const objectFolderExternalReferenceCode =
			'objectFolder' + getRandomInt();

		const objectFolder = await viewObjectDefinitionsPage.createObjectFolder(
			objectFolderExternalReferenceCode
		);

		await expect(
			viewObjectDefinitionsPage.page
				.locator('li')
				.filter({hasText: objectFolderExternalReferenceCode})
		).toBeVisible();

		// Clean up

		await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
	});

	test('default folder does not contains delete and edit options', async ({
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickDefaultObjectFolder();

		await viewObjectDefinitionsPage.openObjectFolderActions();

		await expect(
			viewObjectDefinitionsPage.objectFolderDeleteFolderOption
		).toBeHidden();

		await expect(
			viewObjectDefinitionsPage.objectFolderEditLabelAndERCOption
		).toBeHidden();
	});

	test('navigate between object folders by ViewObjectDefinitions', async ({
		apiHelpers,
		viewObjectDefinitionsPage,
	}) => {
		const objectFolders: ObjectFolder[] = await Promise.all(
			Array.apply(null, Array(5)).map(async () => {
				return await apiHelpers.objectAdmin.postRandomObjectFolder();
			})
		);

		await viewObjectDefinitionsPage.goto();

		for (const objectFolder of objectFolders) {
			await expect(viewObjectDefinitionsPage.objectFolders).toBeVisible();

			viewObjectDefinitionsPage.openObjectFolder(
				objectFolder.label['en_US']
			);

			expect(
				viewObjectDefinitionsPage.objectFolderCardHeaderLabel({
					objectFolderLabel: objectFolder.label['en'],
				})
			).toBeVisible();
		}

		// Clean up

		for (const objectFolder of objectFolders) {
			await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
		}
	});

	test('can edit object folder label and ERC in the ViewObjectDefinitions page', async ({
		apiHelpers,
		modalEditObjectFolderPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		const objectFolder =
			await apiHelpers.objectAdmin.postRandomObjectFolder();

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.page
			.locator('li')
			.filter({hasText: objectFolder.label['en_US']})
			.click();

		await viewObjectDefinitionsPage.openObjectFolderActions();

		await viewObjectDefinitionsPage.objectFolderEditLabelAndERCOption.click();

		const editedObjectFolderLabel =
			'objectFolderLabelEdited' + getRandomInt();
		const editedObjectFolderERC = 'objectFolderERCEdited' + getRandomInt();

		await modalEditObjectFolderPage.editObjectFolderDetails(
			editedObjectFolderERC,
			editedObjectFolderLabel
		);

		expect(page.getByText(editedObjectFolderLabel).first()).toBeVisible();
		expect(page.getByText(editedObjectFolderERC)).toBeVisible();

		// Clean up

		await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
	});
});
