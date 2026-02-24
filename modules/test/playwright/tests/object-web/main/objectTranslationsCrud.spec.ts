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
	'LPD-78504 Cannot add translation to a non-translatable field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify a translation cannot be added to a custom object entry if the field is not translatable
	}
);

test(
	'LPD-78504 Cannot save object without translation after changing default language',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify after changing the default language the object definition cannot be saved without filling out the required fields
	}
);

test(
	'LPD-78504 Can use unique value with translatable fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify an object entry can contain translations and be restricted by unique values
	}
);
