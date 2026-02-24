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
	'LPD-78504 Can verify updating default value configuration for picklist field only affects new entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanOnlyAffectNewEntriesByUpdatingConfiguration
		// LPS-181204 - Verify updating the default value configuration for the Picklist field only affects new object entries
	}
);

test(
	'LPD-78504 Can set picklist default value via expression builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSetPicklistViaExpressionBuilder
		// LPS-163716 - Verify it is possible to create an object entry with the Picklist default value set via Expression Builder
	}
);

test(
	'LPD-78504 Can set picklist default value via input as value',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSetPicklistViaInputAsValue
		// LPS-163716 - Verify it is possible to create an object entry with the Picklist default value set via Input as Value
	}
);
