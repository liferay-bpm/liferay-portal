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
	'LPD-78504 Can add multiple One-to-Many relations with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to relate 2 entries from a Custom Object entry with the same Native Object entry in a One-to-Many relation
	}
);

test(
	'LPD-78504 Can add One-to-Many relation with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to add a One-to-Many relation from a Custom Object entry with a Native Object entry
	}
);

test(
	'LPD-78504 Can add tabs for self Many-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to add two relationship tabs with the Many-to-Many self-relationship
	}
);

test(
	'LPD-78504 Can create Many-to-Many relationship with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to create a Many-to-Many relationship between a Custom Object and Native Object
	}
);

test(
	'LPD-78504 Can create One-to-Many relationship for Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to create a Relationship One-to-Many from a Native Object to a Custom Object
	}
);

test(
	'LPD-78504 Can create One-to-Many relationship with Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to create a One-to-Many relationship between a Custom Object and Native Object
	}
);

test(
	'LPD-78504 Can delete entries using Cascade deletion type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that when the Object has the Deletion Type Cascade and the user deletes an entry with Parent and Child entries related, only the entry and its child are deleted
	}
);

test(
	'LPD-78504 Can delete Many-to-Many relationship between Custom Object entry and Native Object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a relationship between a Custom Object entry and Native Object entry (Many-to-Many)
	}
);

test(
	'LPD-78504 Can delete Many-to-Many relationship from parent side',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a Many-to-Many relationship from the parent side
	}
);

test(
	'LPD-78504 Can delete One-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a relationship between a Custom Object entry and Native Object entry (One-to-Many)
	}
);

test(
	'LPD-78504 Can delete One-to-Many relationship between Custom Object entry and Native Object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a relationship between a Custom Object entry and Native Object entry (One-to-Many) with multiple users
	}
);

test(
	'LPD-78504 Can do nested relation in a One-to-Many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to do a nested relation in a One-to-Many relationship
	}
);

test(
	'LPD-78504 Can edit Many-to-Many relationship of Custom Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to edit the relationships of the Custom Object entry (Many-to-Many)
	}
);

test(
	'LPD-78504 Can identify Parent and Child relationship through labels',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to identify the Parent and Child relationship through specific labels
	}
);

test(
	'LPD-78504 Cannot delete Many-to-Many relationship from child side',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is not possible to delete a Many-to-Many relationship from the child side
	}
);

test(
	'LPD-78504 Cannot delete relationship with incorrect input',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is not possible to delete a relationship with an incorrect input
	}
);

test(
	'LPD-78504 Cannot leave Relationship Label blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to leave the Relationship Label blank
	}
);

test(
	'LPD-78504 Cannot leave Relationship tab on first place by removing fields tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is not possible to leave a layout with a Relationship tab on first place by removing the fields tab
	}
);

test(
	'LPD-78504 Cannot relate an entry with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is not possible to relate an entry to itself
	}
);

test(
	'LPD-78504 Cannot select Relationship field for Object Entry Title',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is not possible to select a Relationship field for the Object Entry Title
	}
);

test(
	'LPD-78504 Cannot update Name, Type or Object from parent Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that the user is not allowed to update the Name, Type or Object from the parent Relationship
	}
);

test(
	'LPD-78504 Can relate Many-to-Many Custom Object entry with Native Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to relate a Custom Object entry with many Native Object entries (Many-to-Many)
	}
);

test(
	'LPD-78504 Can relate One-to-Many Custom Object entry with Native Object entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to relate a Custom Object entry with many Native Object entries (One-to-Many)
	}
);

test(
	'LPD-78504 Can relate One-to-Many Native Object with Custom site scoped Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to add a One-to-Many relation from a Custom Object scoped by Site entry with a Native Object entry
	}
);

test(
	'LPD-78504 Can see label when creating Relationship Tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a label is displayed on the creation of a Relationship Tab to differentiate parent from child information
	}
);

test(
	'LPD-78504 Can see label when editing Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that a label Parent/Child is displayed when editing the Relationship
	}
);

test(
	'LPD-78504 Can see related entries on Relationship tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to see all related entries to the entry on the relationship tab
	}
);

test(
	'LPD-78504 Can set Title Field for Native Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to set a Title Field for a Native Object
	}
);

test(
	'LPD-78504 Can switch relationship order between parent and child',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify the user can switch the relationship order between the parent and child object definitions
	}
);

test(
	'LPD-78504 Can view and add Object entries after creating a Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify it is possible to view and add entries on an Object after creating a Relationship One to Many for it
	}
);

test(
	'LPD-78504 Switch button is not present when M:M relationship is selected',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that switch button is not present when the M:M relationship is selected
	}
);
