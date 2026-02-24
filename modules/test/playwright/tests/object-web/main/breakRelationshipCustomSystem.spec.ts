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
	'LPD-78504 Can break manyToMany relationship with custom object as parent',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanBreakManyToManyRelationshipWithCustomObjectAsParent
	}
);

test(
	'LPD-78504 Can break manyToMany relationship with system object as parent in virtual instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanBreakManyToManyRelationshipWithSystemObjectAsParentInVirtualInstance
	}
);

test(
	'LPD-78504 Can break oneToMany relationship keeping other entries related',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanBreakOneToManyRelationshipKeepingOtherEntriesRelated
	}
);

test(
	'LPD-78504 Can break oneToMany relationship with custom object as parent',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanBreakOneToManyRelationshipWithCustomObjectAsParent
	}
);

test(
	'LPD-78504 Can break oneToMany relationship with custom object as parent in virtual instance',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanBreakOneToManyRelationshipWithCustomObjectAsParentInVirtualInstance
	}
);
