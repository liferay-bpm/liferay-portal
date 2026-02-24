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

// Migrated from Object.testcase

test(
	'LPD-78504 Verify that it is possible to delete an object after deleting the relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is possible to delete a published object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is the user is able to delete a relationship of object native',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is possible to filter object entries by API',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is not possible to delete an object that has a relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the custom object label cannot be used to confirm the deletion',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to search object entries by API',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to sort object entries by API',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update Custom Object when changing the localization on Instance Settings',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the label of relationship field of custom object from a native object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the label of relationship of native object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that an error message is shown when the user enters the wrong value in the confirmation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is possible to view the custom object after restarting portal',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add an Object Entry Title Field when changing the localization on Instance Settings',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the delete modal contains a warning message with the number of entries that will be deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);
