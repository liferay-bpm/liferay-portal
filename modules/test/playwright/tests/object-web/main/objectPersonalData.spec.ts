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
	'LPD-78504 Can anonymize object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify the object entries can be anonymized
	}
);

test(
	'LPD-78504 Can delete object entries via personal data management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that the entries of an object can be deleted via personal data management
	}
);

test(
	'LPD-78504 Can export object entries via personal data management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify a user personal data can be exported
	}
);
