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
	'LPD-78504 Can add and view object entries with auto increment fields via page builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddObjectEntryViaPageBuilder
		// LPS-169223 - Verify the user can add and view object entries that contain auto increment fields in page builder
	}
);

test(
	'LPD-78504 Can increment auto increment field after importing an object entry with modified value',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanIncrementAfterImportingObjectEntry
		// LPS-169223 - Verify after importing an object entry with a modified auto increment field value, new object entries increment based off of the modified value
	}
);

test(
	'LPD-78504 Can verify auto increment field is read only in object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: VerifyFieldIsReadOnly
		// LPS-169223 - Verify the auto increment fields in object entries are read only
	}
);
