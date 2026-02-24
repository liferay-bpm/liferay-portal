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
	'LPD-78504 Can change permissions assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanChangePermissionsAssignedToObjectEntry
	}
);

test(
	'LPD-78504 Can change permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanChangePermissionsOfNewRoleAssignedToObjectEntry
	}
);

test(
	'LPD-78504 Can empty permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanEmptyPermissionsOfNewRoleAssignedToObjectEntry
	}
);

test(
	'LPD-78504 Can get company permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetCompanyPermissionsOfNewRoleAssignedToObjectEntry
	}
);

test(
	'LPD-78504 Can get permissions assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetPermissionsAssignedToObjectEntry
	}
);

test(
	'LPD-78504 Cannot empty company permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotEmptyCompanyPermissionsOfNewRoleAssignedToObjectEntry
	}
);
