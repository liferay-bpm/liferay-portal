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
	'LPD-78504 Can empty taxonomy category briefs of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanEmptyTaxonomyCategoryBriefsOfObjectEntry
	}
);

test(
	'LPD-78504 Can filter entries by taxonomy category',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanFilterEntriesByTaxonomyCategory
	}
);

test(
	'LPD-78504 Can get taxonomy category briefs of entries collection',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetTaxonomyCategoryBriefsOfEntriesCollection
	}
);

test(
	'LPD-78504 Can get taxonomy category briefs of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetTaxonomyCategoryBriefsOfObjectEntry
	}
);

test(
	'LPD-78504 Can update entry with existing taxonomy category',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithExistingTaxonomyCategory
	}
);

test(
	'LPD-78504 Can update site scoped object entry with taxonomy category of different site scope',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateSiteScopedObjectEntryWithTaxonomyCategoryOfDifferentSiteScope
	}
);

test(
	'LPD-78504 Can update site scoped object entry with taxonomy category within same scope',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateSiteScopedObjectEntryWithTaxonomyCategoryWithinSameScope
	}
);
