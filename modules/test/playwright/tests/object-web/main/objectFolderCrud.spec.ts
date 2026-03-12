/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinition,
	ObjectFolder,
} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

// Migrated from ObjectFolder.testcase

test(
	'Verify Object definitions can be moved to the current folder when the user is in the model builder view',
	{tag: '@LPS-185681'},
	async ({
		apiHelpers,
		modelBuilderDiagramPage,
		modelBuilderLeftSidebarPage,
		page,
		viewObjectDefinitionsPage: _viewObjectDefinitionsPage,
	}) => {
		let folderA: ObjectFolder;
		let folderB: ObjectFolder;
		let objectDefinition: ObjectDefinition;

		await test.step('Create folders and object definition', async () => {
			folderA = await apiHelpers.objectAdmin.postRandomObjectFolder();

			apiHelpers.data.push({id: folderA.id, type: 'objectFolder'});

			folderB = await apiHelpers.objectAdmin.postRandomObjectFolder();

			apiHelpers.data.push({id: folderB.id, type: 'objectFolder'});

			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFolderExternalReferenceCode:
						folderA.externalReferenceCode,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('Navigate to Folder B via Model Builder sidebar', async () => {

			// Navigate to Folder A in Model Builder

			await modelBuilderDiagramPage.goto({
				objectFolderName: folderA.name,
			});

			// Navigate to Folder B via left sidebar

			const folderBLocator =
				modelBuilderLeftSidebarPage.getOtherObjectFolderLocator(
					folderB.label['en_US']
				);

			await folderBLocator.getByTitle('Go to Folder').click();
		});

		await test.step('Move object definition to current folder', async () => {

			// The object from Folder A should appear in the "Other Folders" section

			await modelBuilderLeftSidebarPage.collapseOtherFoldersButton.click();

			// Click the kebab menu for the object and move to current folder

			await modelBuilderLeftSidebarPage.clickObjectDefinitionActionsButtonInSidebar(
				objectDefinition.label['en_US']
			);

			await page
				.getByRole('menuitem', {name: 'Move to Current Folder'})
				.click();
		});

		await test.step('Check that the object definition is visible in Folder B sidebar', async () => {
			await expect(
				modelBuilderLeftSidebarPage.sidebarItems.filter({
					hasText: objectDefinition.label['en_US'],
				})
			).toBeVisible();
		});
	}
);
