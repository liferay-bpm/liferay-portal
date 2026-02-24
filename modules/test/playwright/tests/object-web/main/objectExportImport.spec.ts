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
	'LPD-78504 Field values persist for object entries with 100 fields after export and import',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify the field values persist for object entries with 100 fields
	}
);

test(
	'LPD-78504 Can cancel importing an object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to cancel importing an object
	}
);

test(
	'LPD-78504 Can clear the JSON file on the import dialog',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to clear the JSON file on the import dialog
	}
);

test(
	'LPD-78504 Can export an object with Actions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to export an object with Actions
	}
);

test(
	'LPD-78504 Can export an object with Aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to export an object entry with aggregation field
	}
);

test(
	'LPD-78504 Can import and export Custom Views structure',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to export imported object with custom views
	}
);

test(
	'LPD-78504 Can import and export State Manager structure',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to export imported object with state
	}
);

test(
	'LPD-78504 Can import and export Validation structure',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to export imported object with validation structure
	}
);

test(
	'LPD-78504 Can import data structure to custom objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify if it is possible to import the data structure to a custom objects
	}
);

test(
	'LPD-78504 Can import and maintain Fields after importing an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to maintain Fields after importing an Object
	}
);

test(
	'LPD-78504 Can import and maintain Layouts after importing an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to maintain Layouts after importing an Object
	}
);

test(
	'LPD-78504 Can import an object with Actions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to import object with Actions
	}
);

test(
	'LPD-78504 Can import the same object more than once',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to import the same object more than one time
	}
);

test(
	'LPD-78504 Can import and maintain Scope after importing an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to maintain Scope after importing an Object
	}
);

test(
	'LPD-78504 Imported custom object is created with Draft status',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that an imported custom object is created with Draft Status
	}
);
