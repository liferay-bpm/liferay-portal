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
	'LPD-78504 Allow Multiple Selections option is not available for Select From List field when form is mapped to an object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that Allow Multiple Selections option is not available for Select From List field when a form is mapped to an object
	}
);

test(
	'LPD-78504 Can delete a form mapped to an object after adding entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a form mapped to an object after adding entries on it
	}
);

test(
	'LPD-78504 Can map and view entries for Rich Text field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that when using objects as storage type the user can map to Rich Text Field and view its entries
	}
);

test(
	'LPD-78504 Can map Clob type and view entries with Multiple Lines',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to map an Object field of Clob type and view its entries (Multiple Lines)
	}
);

test(
	'LPD-78504 Can map Clob type and view entries with Single Line',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to map an Object field of Clob type and view its entries (Single Line)
	}
);

test(
	'LPD-78504 Cannot edit Picklist entries in Forms Sidebar',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that Picklist entries cannot be edited in the Forms Sidebar
	}
);

test(
	'LPD-78504 Cannot select an unpublished Object in form settings',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to select an unpublished Object
	}
);

test(
	'LPD-78504 Can retrieve Data Providers on Select from List field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to retrieve objects data from Data Providers and use in a Select from List field in Forms
	}
);

test(
	'LPD-78504 Can retrieve Data Providers on Text field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to retrieve objects data from Data Providers and use in a Text field in Form
	}
);

test(
	'LPD-78504 Can send form email when form is related with Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that an email is sent when an object entry is added to a form using the objects storage type
	}
);

test(
	'LPD-78504 Can submit form entries using object storage type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to submit form entries using object storage type and view them
	}
);
