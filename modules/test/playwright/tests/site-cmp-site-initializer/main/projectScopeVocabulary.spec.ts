/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {loginTest} from '../../../fixtures/loginTest';
import getRandomString from '../../../utils/getRandomString';
import {cmsPagesTest} from '../../site-cms-site-initializer/main/fixtures/cmsPagesTest';
import {cmpPagesTest} from './fixtures/cmpPagesTest';

const test = mergeTests(
	cmpPagesTest,
	cmsPagesTest,
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-58677': {enabled: true},
		'LPD-86291': {enabled: true},
	}),
	loginTest()
);

test(
	'Does not list a canceled project in the vocabulary project selector',
	{tag: '@LPD-97935'},
	async ({
		apiHelpers,
		editProjectPage,
		editVocabularyPage,
		page,
		projectsPage,
	}) => {
		const approvedProjectTitle = getRandomString();

		// An approved project is the control: it must stay selectable

		await apiHelpers.objectEntry.postObjectEntry(
			{title: approvedProjectTitle},
			'cmp/projects'
		);

		// Record the projects the selector lists before the canceled project

		await editVocabularyPage.goto();

		await editVocabularyPage.openProjectSelector();

		const optionCount = await page.getByRole('option').count();

		// Start a new project, then cancel without saving

		await projectsPage.goto();

		await projectsPage.newProjectButton.click();

		await editProjectPage.cancelButton.click();

		// Canceling discards the draft project before navigating back; wait
		// for the projects list so the discard has completed

		await projectsPage.newProjectButton.waitFor();

		// The canceled project must not have leaked into the selector

		await editVocabularyPage.goto();

		await editVocabularyPage.openProjectSelector();

		await expect(
			page.getByRole('option', {name: approvedProjectTitle})
		).toHaveCount(1);

		await expect(page.getByRole('option')).toHaveCount(optionCount);
	}
);
