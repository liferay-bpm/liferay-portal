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
	'LPD-78504 Can map and view entries for field group',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapAndViewEntriesForFieldGroup
	}
);

test(
	'LPD-78504 Can map BigDecimal type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapBigDecimalTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Boolean type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapBooleanTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Date type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapDateTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Double type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapDoubleTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Integer type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapIntegerTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Long type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapLongTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map Picklist type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapPicklistTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can map String type and view entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanMapStringTypeAndViewEntries
	}
);

test(
	'LPD-78504 Can submit entry with Double field blank that is not required',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSubmitEntryWithDoubleFieldBlank
	}
);

test(
	'LPD-78504 Entries are not deleted when form is deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: EntriesAreNotDeletedWhenFormIsDeleted
	}
);

test(
	'LPD-78504 Can see entries of a field with capitalized letters in the name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: FieldWithCapitalizedLetters
	}
);
