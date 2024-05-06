/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

export class EditObjectValidationPage {
	readonly addFieldsButton: Locator;
	readonly page: Page;
	readonly saveFieldsButton: Locator;
	readonly saveValidationButton: Locator;
	readonly selectAllFields: Locator;
	readonly uniqueCompositeKeyTab: Locator;

	constructor(page: Page) {
		this.addFieldsButton = page
			.frameLocator('iframe')
			.getByRole('button', {name: 'Add Fields'});
		this.page = page;
		this.saveFieldsButton = page.getByText('Save');
		this.saveValidationButton = page
			.frameLocator('iframe')
			.getByRole('button', {name: 'Save'});
		this.selectAllFields = page.locator(
			'input[name="selectAllObjectFields"]'
		);
		this.uniqueCompositeKeyTab = page
			.frameLocator('iframe')
			.getByRole('tab')
			.filter({hasText: 'Unique Composite Key'});
	}

	async chooseFields(fieldName: string) {
		await this.page.getByLabel(fieldName).check();
		await this.saveFieldsButton.click();
	}

	async clickSelectAllFields() {
		await this.selectAllFields.click();
		await this.saveFieldsButton.click();
	}
}
