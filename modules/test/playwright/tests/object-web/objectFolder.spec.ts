/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {loginTest} from '../../fixtures/loginTest';
import {objectPagesTest} from '../../fixtures/objectPagesTest';
import {getRandomInt} from '../../utils/getRandomInt';

export const test = mergeTests(apiHelpersTest, loginTest(), objectPagesTest);

test('created object folders are on the left side bar', async ({
	apiHelpers,
	objectDefinitionsPage,
}) => {
	await objectDefinitionsPage.goto();

	const objectFolderExternalReferenceCode = 'objectFolder' + getRandomInt();

	const objectFolder = await objectDefinitionsPage.createObjectFolder(
		objectFolderExternalReferenceCode
	);

	await expect(
		objectDefinitionsPage.page
			.locator('li')
			.filter({hasText: objectFolderExternalReferenceCode})
	).toBeVisible();

	// Clean up

	await apiHelpers.objectAdmin.deleteObjectFolder(objectFolder.id);
});

test('default folder does not contains delete and edit options', async ({
	objectDefinitionsPage,
}) => {
	await objectDefinitionsPage.goto();

	await objectDefinitionsPage.clickDefaultObjectFolder();

	await objectDefinitionsPage.openObjectFolderActions();

	await expect(
		objectDefinitionsPage.objectFolderDeleteFolderOption
	).toBeHidden();

	await expect(
		objectDefinitionsPage.objectFolderEditLabelAndERCOption
	).toBeHidden();
});

test('object definitions from a deleted folder are moved to the default folder', async ({
	apiHelpers,
	objectDefinitionsPage,
}) => {
	const defaultLanguage = 'en_US';

	const objectFolder = await apiHelpers.objectAdmin.postRandomObjectFolder();

	const objectDefinition1 =
		await apiHelpers.objectAdmin.postRandomObjectDefinition(
			objectFolder.externalReferenceCode
		);
	const objectDefinition2 =
		await apiHelpers.objectAdmin.postRandomObjectDefinition(
			objectFolder.externalReferenceCode
		);

	await objectDefinitionsPage.goto();

	await objectDefinitionsPage.openObjectFolder(
		objectFolder.externalReferenceCode
	);

	await objectDefinitionsPage.openObjectFolderActions();

	await objectDefinitionsPage.deleteObjectFolder(objectFolder.name);

	await objectDefinitionsPage.clickDefaultObjectFolder();

	await expect(
		objectDefinitionsPage.frontendDataSetEntries.filter({
			hasText: objectDefinition1.label[defaultLanguage],
		})
	).toBeVisible();

	await expect(
		objectDefinitionsPage.frontendDataSetEntries.filter({
			hasText: objectDefinition2.label[defaultLanguage],
		})
	).toBeVisible();

	// Clean up

	await apiHelpers.objectAdmin.deleteObjectDefinition(objectDefinition1.id);
	await apiHelpers.objectAdmin.deleteObjectDefinition(objectDefinition2.id);
});
