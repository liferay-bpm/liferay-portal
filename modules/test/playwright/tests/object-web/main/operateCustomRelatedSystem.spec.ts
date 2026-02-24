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
	'LPD-78504 Can create custom object and related system objects in many to many relationship child side',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectAndRelatedSystemObjectsInManyToManyRelationshipChildSide
	}
);

test(
	'LPD-78504 Can update custom and related system object in many to one relationship by patch',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomAndRelatedSystemObjectInManyToOneRelationshipByPatch
	}
);

test(
	'LPD-78504 Can update custom and related system objects in many to many relationship by patch',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomAndRelatedSystemObjectsInManyToManyRelationshipByPatch
	}
);

test(
	'LPD-78504 Can update custom and related system objects in many to many relationship child side by patch',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomAndRelatedSystemObjectsInManyToManyRelationshipChildSideByPatch
	}
);

test(
	'LPD-78504 Can update custom and related system objects in many to many relationship child side by put',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomAndRelatedSystemObjectsInManyToManyRelationshipChildSideByPut
	}
);

test(
	'LPD-78504 Can update custom and related system objects in one to many relationship by patch',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomAndRelatedSystemObjectsInOneToManyRelationshipByPatch
	}
);
