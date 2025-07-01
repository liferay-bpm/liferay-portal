/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../fixtures/apiHelpersTest';
import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {documentLibraryPagesTest} from '../../../fixtures/documentLibraryPages.fixtures';
import {loginTest} from '../../../fixtures/loginTest';
import {workflowPagesTest} from '../../../fixtures/workflowPagesTest';
import {createCategories} from '../../../helpers/CreateCategories';
import {expandSection} from '../../../utils/expandSection';
import getGlobalSiteId from '../../../utils/getGlobalSiteId';
import {assetCategoriesPagesTest} from '../../asset-categories-admin-web/main/fixtures/assetCategoriesAdminPagesTest';
import {cmsPagesTest} from '../../site-cms-site-initializer/main/fixtures/cmsPagesTest';

export const test = mergeTests(
	apiHelpersTest,
	dataApiHelpersTest,
	assetCategoriesPagesTest,
	cmsPagesTest,
	documentLibraryPagesTest,
	workflowPagesTest,
	loginTest()
);

test.afterEach(async ({documentLibraryPage, page}) => {
	await test.step('Cleanup: delete folder', async () => {
		await documentLibraryPage.goto();

		const folderLocator = page.locator(
			`.card-body:has-text('DM Folder Name')`
		);

		if (await folderLocator.isVisible()) {
			await documentLibraryPage.deleteFolder('DM Folder Name');
		}
	});
});

test(
	'save as draft and view categories',
	{tag: '@LPD-53559'},
	async ({
		apiHelpers,
		documentLibraryEditFilePage,
		documentLibraryEditFolderPage,
		documentLibraryPage,
		page,
		workflowTasksPage,
	}) => {
		await test.step('Create Categories', async () => {
			const categoryNames = [{name: 'legal'}, {name: 'other'}];

			const categories: Array<any> = await createCategories({
				apiHelpers,
				categoryNames,
				siteId: await getGlobalSiteId(apiHelpers),
				vocabularyName: 'Vocabulary Name',
			});

			apiHelpers.data.push({
				id: categories[0].vocabularyId,
				type: 'taxonomyVocabulary',
			});
		});

		await test.step('Create folder', async () => {
			await documentLibraryPage.goto();

			await documentLibraryPage.goToCreateNewFolder();

			await documentLibraryEditFolderPage.fillTitle('DM Folder Name');

			await documentLibraryEditFolderPage.saveButton.click();
		});

		await test.step('Configure folder workflow', async () => {
			await documentLibraryPage.goToEditFolder('DM Folder Name');

			await documentLibraryPage.updateDocumentTypeRestrictionsAndWorkflow();
		});

		await test.step('Create and submit file', async () => {
			await documentLibraryPage.openFolder('DM Folder Name');

			await documentLibraryPage.goToCreateNewFile();

			await documentLibraryPage.uploadFile(
				page,
				__dirname,
				'Document_1.doc'
			);

			await documentLibraryEditFilePage.fileTitleInput.fill(
				'DM Document Title'
			);

			await documentLibraryEditFilePage.categorizationDropdownButton.waitFor();

			await expandSection(
				documentLibraryEditFilePage.categorizationDropdownButton
			);

			await documentLibraryEditFilePage.vocabularySelect.fill('legal');

			await documentLibraryEditFilePage.legalVocabularyOption.click();

			await documentLibraryEditFilePage.vocabularySelect.fill('other');

			await documentLibraryEditFilePage.otherVocabularyOption.click();

			await documentLibraryEditFilePage.submitForWorkflowButton.click();
		});

		await test.step('Approve file workflow', async () => {
			await workflowTasksPage.assignAndAprove('DM Document Title');
		});

		await test.step('Edit and validate categories after approval', async () => {
			await documentLibraryPage.openFolderAction({
				fileName: 'DM Document Title',
				folderName: 'DM Folder Name',
				goTo: true,
				typeAction: 'edit',
			});

			await documentLibraryEditFilePage.categorizationDropdownButton.waitFor();

			await expandSection(
				documentLibraryEditFilePage.categorizationDropdownButton
			);

			await expect(
				documentLibraryEditFilePage.categorizationFields
			).toBeVisible();
		});

		await test.step('Save and check-in document', async () => {
			await documentLibraryPage.openFolderAction({
				fileName: 'DM Document Title',
				folderName: 'DM Folder Name',
				goTo: true,
				typeAction: 'checkout',
			});

			await expect(documentLibraryPage.draftStatus).toBeVisible();

			await documentLibraryPage.openMoreFilesActions('DM Document Title');

			await documentLibraryPage.editButton.click();

			await documentLibraryEditFilePage.categorizationDropdownButton.waitFor();

			await expandSection(
				documentLibraryEditFilePage.categorizationDropdownButton
			);

			await expect(
				documentLibraryEditFilePage.categorizationFields
			).toBeVisible();

			await documentLibraryEditFilePage.saveAndCheckInButton.click();

			await documentLibraryEditFilePage.saveButton.click();
		});

		await test.step('Edit from pending and validate categories again', async () => {
			await documentLibraryPage.pendingStatus.click();

			await documentLibraryPage.openMoreFilesActions('DM Document Title');

			await documentLibraryPage.editButton.click();

			await documentLibraryEditFilePage.categorizationDropdownButton.waitFor();

			await expandSection(
				documentLibraryEditFilePage.categorizationDropdownButton
			);

			await expect(
				documentLibraryEditFilePage.categorizationFields
			).toBeVisible();
		});

		await test.step('Approve workflow again after edit', async () => {
			await workflowTasksPage.assignAndAprove('DM Document Title');
		});

		await test.step('Approve workflow again after edit', async () => {
			await documentLibraryPage.openFolderAction({
				fileName: 'DM Document Title',
				folderName: 'DM Folder Name',
				goTo: true,
				typeAction: 'edit',
			});

			await documentLibraryEditFilePage.categorizationDropdownButton.waitFor();

			await expandSection(
				documentLibraryEditFilePage.categorizationDropdownButton
			);

			await expect(
				documentLibraryEditFilePage.categorizationFields
			).toBeVisible();
		});
	}
);
