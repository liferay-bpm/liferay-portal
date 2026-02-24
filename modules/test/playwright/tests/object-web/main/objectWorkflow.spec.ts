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
	'LPD-78504 Can preview entry information on My Workflow Tasks',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that the user is able to preview the entry information inside of the My Workflow Tasks
	}
);

test(
	'LPD-78504 Can view entry information through View button on My Workflow Tasks',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that the user is able to view the entire entry information by clicking on View button
	}
);

test(
	'LPD-78504 Workflow is not triggered for draft entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify when a user creates an object entry and saves it as a draft the workflow related to that object definition is not triggered
	}
);
