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
	'LPD-78504 Can add and view a long text (Clob) entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddClobLongText
		// LPS-142659 - Verify that the user is able to add an entry of long text and view the entry
	}
);

test(
	'LPD-78504 Can display empty date value on object view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDisplayEmptyDateValue
		// LPS-147658 - Verify it is possible to submit an empty value for a Date field and it will be correctly displayed on the View
	}
);

test(
	'LPD-78504 Can edit a long text (Clob) field entry and view update on entry table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditClobField
		// LPS-142659 - Verify it is possible to edit a entry of Clob field and view the update on entry table
	}
);

test(
	'LPD-78504 Can view only first line of upload text field on object view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOnlyFirstLineOfUploadTextField
		// LPS-143064 - Verify that, when seeing an object view with uploads, the user must only be able to read the first line of the text without considering its format
	}
);

test(
	'LPD-78504 Can verify Clob entry is displayed on auto-generated table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: ClobDisplayed
		// LPS-142659 - Verify that a Clob entry is correctly displayed on the auto-generated table on the Custom Object Portlet
	}
);

test(
	'LPD-78504 Can verify Clob long text is truncated on object portlet table view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: ClobLongTextWillTruncate
		// LPS-142659 - Text will be truncated on the Object portlet table view if it has more than 56 characters
	}
);

test(
	'LPD-78504 Can verify picklist entry is displayed on auto-generated table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: PicklistDisplayed
		// LPS-136595 - Verify that a Picklist entry is correctly displayed on the auto-generated table on the Custom Object Portlet
	}
);
