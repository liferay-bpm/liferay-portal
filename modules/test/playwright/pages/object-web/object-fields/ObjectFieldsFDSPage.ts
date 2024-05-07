/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

export class ObjectFieldsFDSPage {
	readonly deleteObjectFieldOption: Locator;
	readonly fieldsTabItem: Locator;
	readonly page: Page;

	constructor(page: Page) {
		this.deleteObjectFieldOption = page.getByRole('menuitem', {
			name: 'Delete',
		});
		this.fieldsTabItem = page.locator('.navbar-text-truncate').filter({
			hasText: 'Fields',
		});
		this.page = page;
	}

	async deleteObjectField(nth: number) {
		await this.page.locator('.dnd-td.item-actions').nth(nth).waitFor();

		await this.page
			.locator('.dnd-td.item-actions')
			.nth(nth)
			.locator('.dropdown-toggle')
			.click();

		await this.deleteObjectFieldOption.click();
	}

	async goto() {
		await this.fieldsTabItem.click();
	}
}
