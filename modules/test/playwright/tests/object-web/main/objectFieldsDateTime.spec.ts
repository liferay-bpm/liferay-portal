/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

test(
	'LPD-78504 Can add a custom object entry with a date and time field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddEntry
		// LPS-143068 - Verify a custom object entry with a date and time field can be created
	}
);

test(
	'LPD-78504 Can update a custom object entry with a date and time field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateEntry
		// LPS-143068 - Verify a custom object entry with a date and time field can be updated
	}
);
