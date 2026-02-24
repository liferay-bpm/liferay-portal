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
	'LPD-78504 Can create action Add an Object Entry using oldValue with On After Delete trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Delete (Add an Object Entry)
	}
);

test(
	'LPD-78504 Can create action Add an Object Entry using oldValue with On After Update trigger and Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Update (Add an Object Entry) using Picklist field
	}
);

test(
	'LPD-78504 Can create action Notification using oldValue with On After Add trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Add (Notification) using any field
	}
);

test(
	'LPD-78504 Can create action Notification using oldValue with On After Delete trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Delete (Notification) using any field
	}
);

test(
	'LPD-78504 Can create action Notification using oldValue with On After Update trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Update (Notification) using any field
	}
);

test(
	'LPD-78504 Can create action Notification using oldValue with On After Update trigger on Account Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Update (Notification) in Account System
	}
);

test(
	'LPD-78504 Can create action Notification using oldValue with On After Update trigger on User Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Update (Notification) in User System Object
	}
);

test(
	'LPD-78504 Can create action Update an Object Entry using oldValue with On After Update trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Update (Update an object Entry) using any field
	}
);

test(
	'LPD-78504 Can create action using oldValue with On After Add trigger and Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if actions works with oldValue function when trigger is On After Add (Add an Object Entry) using Picklist field
	}
);

test(
	'LPD-78504 Can create validation using oldValue function with Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if it is possible to create a validation using the oldValue function using the Picklist field
	}
);
