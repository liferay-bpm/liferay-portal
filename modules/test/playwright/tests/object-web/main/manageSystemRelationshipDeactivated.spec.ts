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
	'LPD-78504 Cannot get many to many related entry details when custom object is deactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetManyToManyRelatedEntryDetailsWhenCustomObjectIsDeactivated
	}
);

test(
	'LPD-78504 Cannot get many to many relationship details when custom object is deactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetManyToManyRelationshipDetailsWhenCustomObjectIsDeactivated
	}
);

test(
	'LPD-78504 Cannot get one to many related entry details when custom object is deactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetOneToManyRelatedEntryDetailsWhenCustomObjectIsDeactivated
	}
);

test(
	'LPD-78504 Cannot get one to many relationship details when custom object is deactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotGetOneToManyRelationshipDetailsWhenCustomObjectIsDeactivated
	}
);
