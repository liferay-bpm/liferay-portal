/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect} from '@playwright/test';

import {InstanceSettingsPage} from '../../configuration-admin-web/InstanceSettingsPage';
import {ApplicationsMenuPage} from '../../product-navigation-applications-menu/ApplicationsMenuPage';

export class ObjectConfigurationPage {
	readonly applicationsMenuPage: ApplicationsMenuPage;
	readonly instanceSettingsPage: InstanceSettingsPage;
	readonly matcherField: Locator;
	readonly page: Page;
	readonly saveButton: Locator;
	readonly successMessage: Locator;

	constructor(page: Page) {
		this.applicationsMenuPage = new ApplicationsMenuPage(page);
		this.instanceSettingsPage = new InstanceSettingsPage(page);
		this.matcherField = page.getByLabel('Matcher Field');
		this.page = page;
		this.page.on('dialog', async (dialog) => {
			await dialog.accept();
		});
		this.saveButton = page.getByRole('button', {name: 'Save'});
		this.successMessage = page.getByText(
			'Your request completed successfully'
		);
	}

	async configureSchedule(value: string) {
		await this.page.getByLabel('Check Interval').fill(value);

		await this.saveButton.click();

		await expect(this.successMessage).toBeVisible();

		await expect(this.page.getByLabel('Check Interval')).toHaveValue(value);
	}

	async checkDefaultInterval() {
		await expect(this.page.getByLabel('Check Interval')).toHaveValue('15');
	}

	async goTo() {
		await this.instanceSettingsPage.goToInstanceSetting(
			'Object',
			'Schedule'
		);

		await this.page.waitForTimeout(500);
	}
}
