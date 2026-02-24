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
	'LPD-78504 Can delete custom object entry related to system object by many to many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanDeleteCustomObjectEntryRelaatedToSystemObjectByManyToMany
	}
);

test(
	'LPD-78504 Can delete custom object entry related to system object by one to many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanDeleteCustomObjectEntryRelatedToSystemObjectByOneToMany
	}
);

test(
	'LPD-78504 Can relate custom object entries to system object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanRelateCustomObjectEntriesToSystemObjectEntries
	}
);

test(
	'LPD-78504 Can relate custom object entries to system object entries by many to many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanRelateCustomObjectEntriesToSystemObjectEntriesByManyToMany
	}
);

test(
	'LPD-78504 Deleted object entries do not appear in many to many relationship details',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: DeletedObjectEntriesDoNotAppearInManyToManyRelationshipDetails
	}
);
