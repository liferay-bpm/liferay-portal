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
	'LPD-78504 Can create keyword while updating entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateKeywordWhileUpdatingEntry
	}
);

test(
	'LPD-78504 Can create site scoped keyword while updating site scoped object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateSiteScopedKeywordWhileUpdatingSiteScopedObjectEntry
	}
);

test(
	'LPD-78504 Can empty keywords of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanEmptyKeywordsOfObjectEntry
	}
);

test(
	'LPD-78504 Can filter entries by keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanFilterEntriesByKeyword
	}
);

test(
	'LPD-78504 Can get keywords of object entries collection',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetKeywordsOfObjectEntriesCollection
	}
);

test(
	'LPD-78504 Can get keywords of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetKeywordsOfObjectEntry
	}
);

test(
	'LPD-78504 Can update entry with existing keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithExistingKeyword
	}
);

test(
	'LPD-78504 Can update entry with unexisting keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithUnexistingKeyword
	}
);
