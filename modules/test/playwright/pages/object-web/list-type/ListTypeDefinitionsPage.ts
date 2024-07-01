/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {FrameLocator, Locator, Page} from '@playwright/test';

import {ApplicationsMenuPage} from '../../product-navigation-applications-menu/ApplicationsMenuPage';
import { PORTLET_URLS } from '../../../utils/portletUrls';

export class ListTypeDefinitionsPage {
	readonly addPicklistItemButton: Locator;
	readonly addPicklistButton: Locator;
	readonly addPickListEntryButton: Locator;
	readonly applicationsMenuPage: ApplicationsMenuPage;
	readonly frameLocator: FrameLocator;
	readonly page: Page;
	readonly picklistItemNameInput: Locator;
	readonly picklistNameInput: Locator;
	readonly picklistNameInputsidebar: Locator;
	readonly picklistItemSelectTranslation: Locator;
	readonly picklistSelectTranslation: Locator;
	readonly picklistEntryKey: Locator;
	readonly savePicklistButton: Locator;
	readonly savePicklistButtonSidebar: Locator;

	constructor(page: Page) {
		this.addPicklistItemButton = page
		.frameLocator('iframe')
		.getByLabel('Add Item')
		.first();
		this.addPicklistButton = page
			.getByRole('button', {
				name: 'Add Picklist',
			})
			.first();
		this.applicationsMenuPage = new ApplicationsMenuPage(page);
		this.page = page;
		this.picklistItemNameInput = page.getByPlaceholder('Text to translate...');
		this.picklistNameInput = page.getByLabel('Name');
		this.picklistNameInputsidebar = page
		.frameLocator('iframe')
		.getByPlaceholder('Text to translate...');
		this.picklistItemSelectTranslation = page
		.getByRole('button', { name: 'en_US' });
		this.picklistSelectTranslation = page
		.frameLocator('iframe')
		.getByRole('button', { name: 'en_US' });
		this.savePicklistButton = page.getByRole('button', {
			name: 'Save',
		});
		this.savePicklistButtonSidebar = page
		.frameLocator('iframe')
		.getByRole('button', { name: 'Save' })
		this.frameLocator = page.frameLocator('iframe');
		this.picklistEntryKey = page.getByLabel('Key');
		this.addPickListEntryButton = page
			.frameLocator('iframe')
			.getByLabel('Add Item');
	}

	async createPicklist(picklistName: string) {
		await this.addPicklistButton.click();
		await this.picklistNameInput.click();
		await this.picklistNameInput.fill(picklistName);
		await this.savePicklistButton.click();
	}

	async addPicklistItem(
		picklistName: string,
		picklistNameEntry: string,
		picklistKeyEntry?: string
	) {
		await this.page.getByRole('link', {name: picklistName}).click();
		await this.addPickListEntryButton.click();
		await this.picklistNameInput.fill(picklistNameEntry);

		if (picklistKeyEntry) {
			await this.picklistEntryKey.fill(picklistKeyEntry);
		}

		await this.savePicklistButton.click();
	}

	async translatePicklist(
		listTypeDefinitionName: string,
		locationCode: string
	) {
		await this.page.getByRole('link', {name: listTypeDefinitionName}).click();

		await this.picklistSelectTranslation.click();

		await this.page.frameLocator('iframe').getByRole('menuitem', { name: `${locationCode} Untranslated` });

		await this.picklistNameInputsidebar.click();

		const listTypeDefinitionNameTranslated = listTypeDefinitionName + ' translated';

		await this.picklistNameInputsidebar.fill(listTypeDefinitionNameTranslated);

		await this.savePicklistButtonSidebar.click();
	}

	async translatePicklistItem(
		listTypeDefinitionName: string, 
		listTypeEntryName: string, 
		locationCode: string
	) {
		await this.page.getByRole('link', {name: listTypeDefinitionName}).click();
		
		await this.page.frameLocator('iframe')
			.getByRole('link', { name: listTypeEntryName })
			.click();

		await this.savePicklistButton.waitFor({ state: 'visible' });

		await this.picklistItemSelectTranslation.click();

		await this.page.getByRole('menuitem', { name: `${locationCode} Untranslated` }).click();

		await this.picklistItemNameInput.click();

		const listTypeEntryNameTranslated = listTypeEntryName + ' translated';

		await this.picklistItemNameInput
			.fill(listTypeEntryNameTranslated);

		await this.savePicklistButton.click();

		await this.savePicklistButtonSidebar.click();
	}

	async goto(siteUrl?: Site['friendlyUrlPath']) {
		await this.page.goto(
			`/group${siteUrl ?? '/guest'}${
				PORTLET_URLS.picklists}`,
			{waitUntil: 'load'} 
		);
	}
}
