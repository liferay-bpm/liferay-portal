/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {waitForAlert} from '../../../utils/waitForAlert';
import {getObjectEntryUIDateTimeFormat} from './utils/dateFormat';

export const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-17564': {enabled: true},
	}),
	loginTest(),
	objectPagesTest
);

test.describe('Manage schedule properties through Object Entries', () => {
	test('can create, read, update, and delete a reviewDate of an object entry', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
				titleObjectFieldName: 'textField',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.neverReview.uncheck();

		await page.getByRole('button', {name: 'Choose date'}).click();

		await page.getByLabel('Select Current Date').click();

		await page.keyboard.press('Escape');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		const reviewDateInput = page.locator('input[id$="reviewDate"]');

		const date1 = getObjectEntryUIDateTimeFormat(new Date());

		await expect(reviewDateInput).toHaveValue(date1);

		const newDate = new Date();

		newDate.setDate(newDate.getDate() + 1);

		const date2 = getObjectEntryUIDateTimeFormat(newDate);

		await reviewDateInput.fill(date2);

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await expect(reviewDateInput).toHaveValue(date2);

		await viewObjectEntriesPage.neverReview.check();

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await expect(reviewDateInput).toHaveValue('');
	});

	test('cannot submit an empty reviewDate when neverReview is not checked', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
				titleObjectFieldName: 'textField',
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.neverReview.uncheck();

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(page.getByText('This field is required')).toBeVisible();
	});
});
