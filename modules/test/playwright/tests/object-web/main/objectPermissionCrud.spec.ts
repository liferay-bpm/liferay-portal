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
	'LPD-78504 Can access Picklist portlet with Access in Control Panel permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view and access the Picklist portlet with the Access in Control Panel permission
	}
);

test(
	'LPD-78504 Can add a Picklist with the Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to add a Picklist with the Add permission
	}
);

test(
	'LPD-78504 Can define single Picklist permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Picklist permissions with the Permissions permission
	}
);

test(
	'LPD-78504 Can delete a Picklist with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to delete a Picklist with the Delete permission
	}
);

test(
	'LPD-78504 Can delete a single Object Entry with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to delete a single Object Entry with the Delete permission
	}
);

test(
	'LPD-78504 Can delete a single Object with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to delete a single Object with the Delete permission
	}
);

test(
	'LPD-78504 Can delete a single Picklist with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to delete a single Picklist with the Delete permission
	}
);

test(
	'LPD-78504 Can edit its own entry with only Add Object Entry permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to edit its own Object entry with only the Add Object Entry permission
	}
);

test(
	'LPD-78504 Cannot add a Picklist without the Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to add a Picklist without the Add permission
	}
);

test(
	'LPD-78504 Cannot define single Picklist permissions without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Picklist permissions created by the user if the Permissions Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot delete own single Object Entry without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to delete a single Object Entry created by the user if the Delete Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot delete a Picklist without the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to delete a Picklist without the Delete permission
	}
);

test(
	'LPD-78504 Cannot delete a single Object without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to delete a single Object created by the user if the Delete Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot delete a single Picklist without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to delete a single Picklist created by the user if the Delete Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot update own single Object Entry without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Object Entry permissions created by the user if the Permissions Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot update own single Object Entry without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Object Entry created by the user if the Update Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot update a Picklist without the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a Picklist without the Update permission
	}
);

test(
	'LPD-78504 Cannot update single Object permission without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Object permissions created by the user if the Permissions Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot update a single Object without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Object created by the user if the Update Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot update a single Picklist without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to update a single Picklist created by the user if the Update Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot view own single Object Entry without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to view a single Object Entry created by the user if the View Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot view a Picklist without the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to view a Picklist without the View permission
	}
);

test(
	'LPD-78504 Cannot view a single Object without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to View a single Object created by the user if the View Owner permission is removed
	}
);

test(
	'LPD-78504 Cannot view a single Picklist without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to view a single Picklist created by the user if the View Owner permission is removed
	}
);

test(
	'LPD-78504 Can update a Picklist with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a Picklist with the Update permission
	}
);

test(
	'LPD-78504 Can update single Object Entry permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Object Entry permissions with the Permissions permission
	}
);

test(
	'LPD-78504 Can update a single Object Entry with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Object Entry with the Update permission
	}
);

test(
	'LPD-78504 Can update single Object permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Object permissions with the Permissions permission
	}
);

test(
	'LPD-78504 Can update a single Object with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Object with the Update permission
	}
);

test(
	'LPD-78504 Can update a single Picklist with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to update a single Picklist with the Update permission
	}
);

test(
	'LPD-78504 Can view and edit Picklist with Add Picklist permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view and edit its own Picklist with only the Add Picklist permission
	}
);

test(
	'LPD-78504 Can view its own entry with only Add Object Entry permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view its own Object entry with only the Add Object Entry permission
	}
);

test(
	'LPD-78504 Can view a Picklist with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view a Picklist with the View permission
	}
);

test(
	'LPD-78504 Can view a single Object Entry with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view a single Object Entry with the View permission
	}
);

test(
	'LPD-78504 Can view a single Object with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view a single Object with the View permission
	}
);

test(
	'LPD-78504 Can view a single Picklist with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view a single Picklist with the View permission
	}
);

test(
	'LPD-78504 Guest can add Object Entries with Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a guest user with the resource permission action of Add Object Entry activated can add new object entries and view its own entries
	}
);

test(
	'LPD-78504 Guest cannot add Object Entries without Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a guest user with the resource permission action of Add Object Entry unactivated cannot add new object entries
	}
);

test(
	'LPD-78504 Guest cannot view Object Entries without View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a guest user with the resource permission action of View unactivated cannot visualize object entries
	}
);

test(
	'LPD-78504 Guest can view Object Entries with View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a guest user with the resource permission action of View activated can visualize object entries
	}
);
