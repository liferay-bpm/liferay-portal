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
	'LPD-78504 Can return child and parents with post child student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnChildAndParentsWithPostChildStudentInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return child and parents with post child subject in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnChildAndParentsWithPostChildSubjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return child and parent with post child user in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnChildAndParentWithPostChildUserInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return child and system parent with post child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnChildAndSystemParentWithPostChildStudentInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return custom objects with post subject in many to one relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnCustomObjectsWithPostSubjectInManyToOneRelationshipWithItself
	}
);

test(
	'LPD-78504 Can return updated child and parents with patch child student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedChildAndParentsWithPatchChildStudentInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated child and parents with patch child user in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedChildAndParentsWithPatchChildUserInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated child and parent with patch child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedChildAndParentWithPatchChildStudentInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated child and system parent with patch child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedChildAndSystemParentWithPatchChildStudentInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated custom objects with patch subject in one to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedCustomObjectsWithPatchSubjectInOneToManyRelationshipWithItself
	}
);

test(
	'LPD-78504 Can return updated parent and children with patch parent student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedParentAndChildrenWithPatchParentStudentInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated parent and children with put parent student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedParentAndChildrenWithPutParentStudentInOneToManyRelationship
	}
);

test(
	'LPD-78504 Can return updated parent and children with put parent user in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanReturnUpdatedParentAndChildrenWithPutParentUserInOneToManyRelationship
	}
);
