/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

import {clickAndExpectToBeHidden} from '../../utils/clickAndExpectToBeHidden';
import {clickAndExpectToBeVisible} from '../../utils/clickAndExpectToBeVisible';
import {openFieldset} from '../../utils/openFieldset';
import {waitForAlert} from '../../utils/waitForAlert';
import {DocumentLibraryPage} from './DocumentLibraryPage';

export class DocumentLibraryEditFilePage {
	readonly page: Page;

	readonly categorizationDropdownButton: Locator;
	readonly categorizationFields: Locator;
	readonly descriptionInput: Locator;
	readonly documentLibraryPage: DocumentLibraryPage;
	readonly fileTitleInput: Locator;
	readonly legalVocabularyOption: Locator;
	readonly otherVocabularyOption: Locator;
	readonly permissionViewSelector: Locator;
	readonly publishButton: Locator;
	readonly publishDateSelector: Locator;
	readonly saveAndCheckInButton: Locator;
	readonly saveButton: Locator;
	readonly scheduleButton: Locator;
	readonly selectFileButton: Locator;
	readonly selectForUpdateButton: Locator;
	readonly submitForWorkflowButton: Locator;
	readonly titleSelector: Locator;
	readonly vocabularySelect: Locator;

	constructor(page: Page) {
		this.page = page;

		this.categorizationDropdownButton = page.getByRole('button', {
			name: 'Categorization',
		});
		this.categorizationFields = page
			.locator('div')
			.filter({hasText: /^legalother$/})
			.nth(1);
		this.descriptionInput = page.locator(
			'#_com_liferay_document_library_web_portlet_DLAdminPortlet_description'
		);
		this.documentLibraryPage = new DocumentLibraryPage(page);
		this.fileTitleInput = page.getByLabel('Title Required');
		this.legalVocabularyOption = page.getByRole('option', {name: 'legal'});
		this.otherVocabularyOption = page.getByRole('option', {name: 'other'});
		this.permissionViewSelector = page.getByLabel(
			'Viewable and Downloadable By'
		);
		this.publishButton = page.getByRole('button', {
			exact: true,
			name: 'Publish',
		});
		this.publishDateSelector = page.getByLabel('Publish Date');
		this.saveAndCheckInButton = page.getByRole('button', {
			name: 'Save and Check In',
		});
		this.saveButton = page.getByRole('button', {exact: true, name: 'Save'});
		this.scheduleButton = page.getByRole('button', {name: 'Schedule'});
		this.selectFileButton = page.getByRole('button', {name: 'Select File'});
		this.selectForUpdateButton = page.getByLabel('Upload', {exact: true});
		this.submitForWorkflowButton = page.getByRole('button', {
			name: 'Submit for Workflow',
		});
		this.titleSelector = page.getByLabel('Title');
		this.vocabularySelect = page.getByLabel('Vocabulary Name', {
			exact: true,
		});
	}

	async goto(siteUrl?: Site['friendlyUrlPath']) {
		await this.documentLibraryPage.goto(siteUrl);
		await this.documentLibraryPage.goToCreateNewFile();
	}

	async assertPrivateFileIconInSelectPopUp(assetType: string) {
		await this.documentLibraryPage.assertPrivateFileIcon(
			this.page.frameLocator(`iframe[title="Select ${assetType}"]`)
		);
	}

	async changeViewInItemSelector(assetType: string, viewType: string) {
		const modalIframe = this.page.frameLocator(
			`iframe[title="Select ${assetType}"]`
		);

		await clickAndExpectToBeVisible({
			autoClick: true,
			target: modalIframe.getByRole('menuitem', {name: viewType}),
			trigger: modalIframe.getByLabel(
				'Select View, Currently Selected: '
			),
		});
	}

	async goToNewFileDifferentType(
		type: string,
		siteUrl?: Site['friendlyUrlPath']
	) {
		await this.documentLibraryPage.goto(siteUrl);

		await this.documentLibraryPage.goToCreateNewFileWithDifferentType(type);
	}

	async openFieldset(
		name: 'Categorization' | 'Display Page' | 'Permissions'
	) {
		return await openFieldset(this.page, name);
	}

	async publishFileEntry() {
		if (await this.saveButton.isVisible()) {
			await this.saveButton.click();
		}
		else {
			await this.publishButton.click();
		}

		await waitForAlert(this.page);
	}

	async publishNewBasicFileEntry(
		title: string,
		siteUrl?: Site['friendlyUrlPath']
	) {
		await this.goto(siteUrl);

		await this.titleSelector.fill(title);

		if (await this.saveButton.isVisible()) {
			await this.saveButton.click();
		}
		else {
			await this.publishButton.click();
		}
		await waitForAlert(
			this.page,
			'Success:Your request completed successfully.'
		);
	}
	async publishNewBasicFileEntryWithoutGoTo(title: string) {
		await this.titleSelector.fill(title);

		if (await this.saveButton.isVisible()) {
			await this.saveButton.click();
		}
		else {
			await this.publishButton.click();
		}
	}

	async publishMultipleFiles(dTypeTitle: string, filePaths: string[]) {
		await this.page.getByRole('button', {name: 'Select Files'}).waitFor();
		await this.page.locator('input[type="file"]').setInputFiles(filePaths);

		await this.page.getByLabel('Select All').check();

		await this.page.getByRole('button', {name: 'Document Type'}).click();
		await this.page.getByRole('button', {name: 'Basic Document'}).click();

		await this.page.getByRole('menuitem', {name: dTypeTitle}).click();

		await clickAndExpectToBeVisible({
			autoClick: false,
			target: this.page.locator(
				'#_com_liferay_document_library_web_portlet_DLAdminPortlet_documentLibraryContainer'
			),
			trigger: this.page.getByRole('button', {name: 'Publish'}),
		});
	}

	async publishNewFileWithoutGuestViewPermission(
		title: string,
		siteUrl?: Site['friendlyUrlPath']
	) {
		await this.goto(siteUrl);

		await this.titleSelector.fill(title);

		if (await this.permissionViewSelector.isVisible()) {
			await this.permissionViewSelector.selectOption('Site Member');
		}
		else {
			await this.page.getByRole('button', {name: 'Permissions'}).click();
			await this.permissionViewSelector.selectOption('Site Member');
		}

		await this.publishButton.click();
	}

	async publishNewFileWithOwnerViewPermission(
		title: string,
		siteUrl?: Site['friendlyUrlPath']
	) {
		await this.goto(siteUrl);

		await this.titleSelector.fill(title);

		const permissionsRoleSelector = this.page.getByLabel(
			'Viewable and Downloadable By'
		);

		if (await permissionsRoleSelector.isVisible()) {
			await permissionsRoleSelector.selectOption('Owner');
		}
		else {
			await this.page.getByRole('button', {name: 'Permissions'}).click();
			await permissionsRoleSelector.selectOption('Owner');
		}

		await this.publishButton.click();
	}

	async goToPublishNewFileWithScheduleDate(
		scheduleDate: string,
		title: string,
		siteUrl?: Site['friendlyUrlPath']
	) {
		await this.goto(siteUrl);
		await this.publishNewFileWithScheduleDate(scheduleDate, title);
	}

	async publishNewFileWithScheduleDate(scheduleDate: string, title: string) {
		await this.titleSelector.fill(title);

		const isClosed =
			!(await this.scheduleButton.getAttribute('aria-expanded')) ||
			(await this.scheduleButton.getAttribute('aria-expanded')) ===
				'false';

		if (isClosed) {
			await this.scheduleButton.click();
		}

		await this.publishDateSelector.click();
		await this.publishDateSelector.fill(scheduleDate);
		await this.publishDateSelector.click();
		await this.publishDateSelector.press('Escape');
		await this.page
			.locator(
				'[id="_com_liferay_document_library_web_portlet_DLAdminPortlet_displayDateTime"]'
			)
			.fill('00:00');

		if (await this.saveButton.isVisible()) {
			await this.saveButton.click();
		}
		else {
			await this.publishButton.click();
		}
	}

	async selectSpecificDisplayPage(displayPageName: string) {
		const fieldset = await this.openFieldset('Display Page');

		await fieldset
			.getByTitle('Display Page Template Type')
			.selectOption('Specific');

		await fieldset.getByRole('button', {name: 'Select'}).click();

		const selectDisplayPageModal = this.page.frameLocator(
			'iframe[title*="Select Page"]'
		);

		await selectDisplayPageModal
			.locator('.card-type-asset')
			.filter({hasText: displayPageName})
			.click({trial: true});

		await clickAndExpectToBeHidden({
			target: this.page.locator('.modal-title', {
				hasText: 'Select Page',
			}),
			trigger: selectDisplayPageModal
				.locator('.card-type-asset')
				.filter({hasText: displayPageName}),
		});
	}
}
