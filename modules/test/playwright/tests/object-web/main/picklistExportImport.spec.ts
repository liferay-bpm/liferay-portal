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
	'LPD-78504 Can add entry with mandatory picklist field imported',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAddEntryWithMandatoryPicklistFieldImported (stub)
	}
);

test(
	'LPD-78504 Can add entry with picklist and custom object imported',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAddEntryWithPicklistAndCustomObjectImported
	}
);

test(
	'LPD-78504 Can add entry with picklist imported',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAddEntryWithPicklistImported
	}
);

test(
	'LPD-78504 Can add entry with state of picklist imported',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAddEntryWithStateOfPicklistImported
	}
);

test(
	'LPD-78504 Can add entry with translation of picklist imported',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAddEntryWithTranslationPicklistImported
	}
);

test(
	'LPD-78504 Can export picklist as JSON',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanExportPicklist
	}
);

test(
	'LPD-78504 Cannot import wrong picklist JSON file',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotImportWrongPicklist
	}
);

test(
	'LPD-78504 Can overwrite picklist when ERC is duplicated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanOverwritePicklistWhenERCisDuplicated
	}
);
