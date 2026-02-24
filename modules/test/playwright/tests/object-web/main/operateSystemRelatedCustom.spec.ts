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
	'LPD-78504 Can update user and create related students with patch parent system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedStudentsWithPatchParentSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related students with put parent system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedStudentsWithPutParentSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related student with patch child system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedStudentWithPatchChildSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related student with put child system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedStudentWithPutChildSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related subjects with patch parent system object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedSubjectsWithPatchParentSystemObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related subjects with patch request in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedSubjectsWithPatchRequestInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related subjects with put child system object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedSubjectsWithPutChildSystemObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and create related subjects with put parent system object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndCreateRelatedSubjectsWithPutParentSystemObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and related students with patch parent system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndRelatedStudentsWithPatchParentSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and related student with patch child system object in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndRelatedStudentWithPatchChildSystemObjectInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and related subjects with patch parent system object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndRelatedSubjectsWithPatchParentSystemObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update user and related subjects with patch request in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateUserAndRelatedSubjectsWithPatchRequestInManyToManyRelationship
	}
);
