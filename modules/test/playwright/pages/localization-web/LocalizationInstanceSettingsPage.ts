/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {waitForSuccessAlert} from '../../utils/waitForSuccessAlert';
import {InstanceSettingsPage} from '../configuration-admin-web/InstanceSettingsPage';

export class LocalizationInstanceSettingsPage {
	readonly instanceSettingsPage: InstanceSettingsPage;
	readonly page: Page;
	readonly saveButton: Locator;
	readonly updateButton: Locator;

	constructor(page: Page) {
		this.instanceSettingsPage = new InstanceSettingsPage(page);
		this.page = page;
		this.saveButton = page.getByRole('button', {name: 'Save'});
		this.updateButton = page.getByRole('button', {name: 'Update'});
	}

	async goto() {
		await this.instanceSettingsPage.goToInstanceSetting(
			'Localization',
			'Language'
		);
	}

	async setDefaultLanguage(
		defaultLanguageLabel: string,
		languageOption: string
	) {
		await this.page.getByLabel(defaultLanguageLabel).click();
		await this.page
			.getByLabel(defaultLanguageLabel)
			.selectOption(languageOption);
		await this.saveConfiguration();
		await waitForSuccessAlert(this.page);
	}

	async moveLanguageToAvailable(status: string, selectedLanguage: string) {
		await this.page.getByLabel(status).selectOption(selectedLanguage);
		await this.page
			.getByRole('button', {
				name: 'Move selected items from Current to Available.',
			})
			.click();

		await this.saveConfiguration();
	}

	async moveLanguageToCurrent(status: string, selectedLanguage: string) {
		await expect(
			this.page
				.getByLabel(status)
				.locator(`option[value="${selectedLanguage}"]`)
		).toBeVisible();
		await this.page
			.getByLabel(status)
			.locator(`option[value="${selectedLanguage}"]`)
			.click();
		await this.page
			.getByRole('button', {
				name: 'Mova os itens selecionados de Disponível para Atual.',
			})
			.click();

		await this.page.getByRole('button', {name: 'Salvar'}).click();
	}

	async saveConfiguration() {
		this.saveButton.click();
	}
}
