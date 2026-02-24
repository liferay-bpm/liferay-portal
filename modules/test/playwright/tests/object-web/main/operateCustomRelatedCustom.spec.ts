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
	'LPD-78504 Can create custom object entries with patch object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPatchObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can create custom object entries with put child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPutChildObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can create custom object entries with put parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectEntriesWithPutParentObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can create custom objects entries with post child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectsEntriesWithPostChildObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can create custom objects entries with post parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateCustomObjectsEntriesWithPostParentObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can create two custom object entries with post object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateTwoCustomObjectEntriesWithPostObjectInManyToManyRelationshipWithItself
	}
);

test(
	'LPD-78504 Cannot create custom objects entries with invalid object field in nested field in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotCreateCustomObjectsEntriesWithInvalidObjectFieldInNestedFieldInManyToManyRelationship
	}
);

test(
	'LPD-78504 Cannot create custom objects entries with nonexistent nested field in many to many relationships',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotCreateCustomObjectsEntriesWithNonexistentNestedFieldInManyToManyRelationships
	}
);

test(
	'LPD-78504 Can update and create custom object entries with patch object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateAndCreateCustomObjectEntriesWithPatchObjectInManyToManyRelationshipWithItself
	}
);

test(
	'LPD-78504 Can update custom object entries with patch parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPatchParentObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update custom object entries with put child object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutChildObjectInManyToManyRelationship
	}
);

test(
	'LPD-78504 Can update custom object entries with put child object in many to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutChildObjectInManyToManyRelationshipWithItself
	}
);

test(
	'LPD-78504 Can update custom object entries with put parent object in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdateCustomObjectEntriesWithPutParentObjectInManyToManyRelationship
	}
);
