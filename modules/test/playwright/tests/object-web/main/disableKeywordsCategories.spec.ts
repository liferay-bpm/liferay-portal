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
	'LPD-78504 Can get parameters of keywords and categories in endpoint',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetParametersOfKeywordsAndCategoriesInEndpoint
	}
);

test(
	'LPD-78504 Cannot add object entry with keywords and categories when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotAddObjectEntryWithKeywordsAndCategoriesWhenCategorizationNotEnabled
	}
);

test(
	'LPD-78504 Cannot get keywords and categories values when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetKeywordsAndCategoriesValuesWhenCategorizationNotEnabled
	}
);

test(
	'LPD-78504 Cannot get keywords and categories when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetKeywordsAndCategoriesWhenCategorizationNotEnabled
	}
);

test(
	'LPD-78504 Cannot see taxonomy category brief in schema when categorization not enabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotSeeTaxonomyCategoryBriefInSchemaWhenCategorizationNotEnabled
	}
);
