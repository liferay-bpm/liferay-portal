/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

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

test.fixme(
	'LPD-78504 Verify Object definitions can be moved to the current folder when the user is in the model builder view',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		modelBuilderDiagramPage,
		modelBuilderLeftSidebarPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		const folderA =
			await apiHelpers.objectAdmin.postRandomObjectFolder();

		apiHelpers.data.push({id: folderA.id, type: 'objectFolder'});

		const folderB =
			await apiHelpers.objectAdmin.postRandomObjectFolder();

		apiHelpers.data.push({id: folderB.id, type: 'objectFolder'});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode:
					folderA.externalReferenceCode,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Navigate to Folder A in Model Builder

		await modelBuilderDiagramPage.goto({
			objectFolderName: folderA.name,
		});

		// Navigate to Folder B via left sidebar

		await modelBuilderLeftSidebarPage.collapseOtherFoldersButton.click();

		const folderBLocator =
			modelBuilderLeftSidebarPage.getOtherObjectFolderLocator(
				folderB.label['en_US']
			);

		await folderBLocator.getByTitle('Go to Folder').click();

		// The object from Folder A should appear in the "Other Folders" section

		await modelBuilderLeftSidebarPage.collapseOtherFoldersButton.click();

		// Click the kebab menu for the object and move to current folder

		await modelBuilderLeftSidebarPage.clickObjectDefinitionActionsButtonInSidebar(
			objectDefinition.label['en_US']
		);

		await page
			.getByRole('menuitem', {name: 'Move to Current Folder'})
			.click();

		// Verify the object is now in Folder B's sidebar

		await expect(
			modelBuilderLeftSidebarPage.sidebarItems.filter({
				hasText: objectDefinition.label['en_US'],
			})
		).toBeVisible();
	}
);
