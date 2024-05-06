/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

export class EditObjectValidationPage {
	readonly addObjectFieldsButton: Locator;
	readonly addTwoObjectFieldsError: Locator;
	readonly page: Page;
	readonly saveFieldsButton: Locator;
	readonly saveValidationButton: Locator;
	readonly selectAllFields: Locator;
	readonly uniqueCompositeKeyTab: Locator;

	constructor(page: Page) {
		this.addObjectFieldsButton = page
			.frameLocator('iframe')
			.getByRole('button', {name: 'Add Fields'});
		this.addTwoObjectFieldsError = page.getByText(
			'Add a minimum of two object fields to create unique composite keys.'
		);
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

	getObjectFieldAlreadyHasEntryErrorLocator(objectFields: string) {
		return this.page.getByText(
			`The selected fields "${objectFields}" cannot be added to the unique composite key since they already contain data. Modifying the unique composite key in this manner would impact data integrity.`
		);
	}
}
