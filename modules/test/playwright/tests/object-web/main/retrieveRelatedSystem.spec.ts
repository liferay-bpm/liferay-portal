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
	'LPD-78504 Can get relationship details through relationship endpoint without related entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanGetRelationshipDetailsThroughRelationshipEndpointWithoutRelatedEntries
	}
);

test(
	'LPD-78504 Cannot get details after relationship is deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanNotGetDetailsAfterRelationshipIsDeleted
	}
);

test(
	'LPD-78504 Can return details in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnDetailsInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return details in many to many relationship after object entry deletion',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnDetailsInManyToManyRelationshipAfterObjectEntryDeletion
	}
);

test(
	'LPD-78504 Can return details in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnDetailsInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return details in one to many relationship after object entry deletion',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnDetailsInOneToManyRelationshipAfterObjectEntryDeletion
	}
);
