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
	'LPD-78504 View action with notification after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewActionWithNotificationAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View object definition details after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewObjectDefinitionDetailsAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View object entry after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewObjectEntryAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View object field after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewObjectFieldAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View object layout after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewObjectLayoutAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View object relationship after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewObjectRelationshipAfterUpgrade7413U33
	}
);

test(
	'LPD-78504 View picklist after upgrade 7413U33',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewPicklistAfterUpgrade7413U33
	}
);
