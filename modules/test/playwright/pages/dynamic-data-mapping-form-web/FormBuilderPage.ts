/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {FormsPage} from './FormsPage';

export class FormBuilderPage {
	readonly formPage: FormsPage;
	readonly formTitle: Locator;
	readonly page: Page;
	readonly previewButton: Locator;
	readonly publishButton: Locator;
	readonly newFormHeading: Locator;
	readonly newPageButton: Locator;
	readonly settingsButton: Locator;
	readonly selectStorageType: Locator;
	readonly selectObjectStorageType: Locator;
	readonly selectObject: Locator;
	readonly settingsDoneButton: Locator;
	readonly selectFromList: Locator;

	constructor(page: Page) {
		this.formTitle = page.getByPlaceholder('Untitled Form');
		this.formPage = new FormsPage(page);
		this.page = page;
		this.previewButton = page.getByRole('button', {name: 'Preview'});
		this.publishButton = page.getByRole('button', {name: 'Publish'});
		this.newFormHeading = page.getByRole('heading', {name: 'New Form'});
		this.newPageButton = page.getByRole('button', {name: 'New Page'});
		this.settingsButton = page
		.locator('[id="_com_liferay_dynamic_data_mapping_form_web_portlet_DDMFormAdminPortlet_managementToolbar"]')
		.getByRole('button')
		.first();
		this.selectStorageType = page.getByLabel('Select a Storage Type');
		this.selectObjectStorageType = page.getByRole('option', { name: 'Object' });
		this.selectObject = page.getByLabel('Select Object');
		this.settingsDoneButton = page.getByRole('button', { name: 'Done' });
		this.selectFromList = page.getByRole('button', { name: 'Press enter to add Select from List field. Select from List Select options from a list.' });
	}

	async clickPreviewButton() {
		await this.previewButton.click();
	}

	async fillFormTitle(title: string) {
		await this.formTitle.fill(title);
	}

	async selectObjectStorage(objectDefinition: ObjectDefinition) {
		await this.settingsButton.click();

		await this.selectStorageType.click();

		await this.selectObjectStorageType.click();

		await this.selectObject.click();

		await this.page.getByRole('option', { name: objectDefinition.label['en_US'] }).click();
	
		await this.settingsDoneButton.click();
	}

	async goToNew() {
		await this.formPage.goTo();

		await expect(this.formPage.formsHeader).toBeVisible();

		await this.formPage.clickManagementToolbarNewButton();
	}
}
