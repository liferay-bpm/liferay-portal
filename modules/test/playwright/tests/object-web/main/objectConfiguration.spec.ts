/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {mergeTests} from '@playwright/test';

import {collectionsPagesTest} from '../../../fixtures/collectionsPagesTest';
import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {fragmentsPagesTest} from '../../../fixtures/fragmentPagesTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {pageEditorPagesTest} from '../../../fixtures/pageEditorPagesTest';

export const test = mergeTests(
	collectionsPagesTest,
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-17564': {enabled: true},
	}),
	fragmentsPagesTest,
	isolatedSiteTest,
	loginTest(),
	objectPagesTest,
	pageEditorPagesTest
);

test('Assert default schedule value and that it is possible to update it', async ({
	objectConfigurationPage,
}) => {
	await objectConfigurationPage.goTo();

	await objectConfigurationPage.checkDefaultInterval();

	await objectConfigurationPage.configureSchedule('20');
});
