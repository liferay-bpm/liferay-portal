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
	'LPD-78504 Can return nested fields details in oneToMany relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return nested fields details in oneToMany relationship after object deletion',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyRelationshipAfterObjectDeletion
	}
);

test(
	'LPD-78504 Can return nested fields details in oneToMany updated relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnNestedFieldsDetailsInOneToManyUpdatedRelationship
	}
);
