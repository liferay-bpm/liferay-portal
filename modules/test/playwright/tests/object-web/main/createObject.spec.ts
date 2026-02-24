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

// Migrated from CreateObject.testcase

test(
	'LPD-78504 Verify it is possible to view and access the Object Admin portlet with the Access in Control Panel permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a Block',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add Entries with Custom Layout Created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a field after the Object is published and submit entries to it',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with one column',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with three columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with two columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a Tab with Fields Type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add an Object Entry Title Field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add an Object with the Add Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add a relation with an entry through the Relationship field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to add many relations through the Relationship tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to cancel the creation of a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to cancel the creation of a Field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to cancel the creation of a Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to Cancel the update of a Layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to collapse and expand a block of fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a BigDecimal field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Boolean field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Date field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Double field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create an Integer field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Layout for an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Long field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Many to Many Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a One to Many Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to create a String field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to delete a Custom Object field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Custom Object field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Field on Layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the user can delete an inactive custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Layout for an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to delete an Object with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when the admin user deletes the relationship between Account and the Object the Account Restriction is disabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to add an Object without the Add Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to add a Tab with Relationship Type in an Object without Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Relationship tab cannot be added first',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is not possible to create a Field with a duplicated Field Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is not possible to create an Object with a duplicated Object Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to create duplicated Relationship name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to delete an Object without the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Field Name field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Label field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Object Label field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Object Name field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Picklist field empty when creating an Object Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Relationship Name blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Relationship Object blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Relationship Type blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Type field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to publish an Object without the Publish Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to save with the first character of the Object Name in lower case',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to save with special characters for the Field Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to save with the first character of the Field Name in upper case',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to save with special characters for the Object Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to set a layout as default without all the required fields on the first tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that is not possible to submit entries in a form with an Object that was inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to submit an entry with an invalid value on the Relationship field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Mandatory of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Name of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Type of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Object name after it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Object scope after it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update an Object without the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Searchable section after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is not displayed on Process Builder settings before Published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is not displayed on Workflow settings from Site Menu before Published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to view an Object without the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when adding a new Object the admin user is able to restrict users to only see entries from an account that they are part of',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to Publish a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to publish an Object with the Publish Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is possible to relate to many other entries on both objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that it is possible to restrict a previously created Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to scope the Object by Company',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to scope the Object by Site',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to search for a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to search for a field from a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to search for a field from a System Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to search for a System Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to set the block as Collapsible',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for a Field Label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for an Object Label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for an Object Plural Label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to set a field as Mandatory',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that is possible to submit entries in a form with an Object that was reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update a Custom Layout Created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Label of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Label of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Mandatory of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Name of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Searchable section before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Type of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object label after it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object label before it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object name before it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object panel category before it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object panel category key after it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object plural label after it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object plural label before it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object scope before it is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update an Object with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to update a Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view and edit its own Object with only the Add Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Entry with one column',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Entry with three columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Entry with two columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of a Field by clicking on the eye icon',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of a Field by clicking on its name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a BigDecimal type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Boolean type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Date type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Double type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of an Integer type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Long type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title is displayed on the Relationship tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title is displayed for Object entries on workflow pages',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Picklist type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a String type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of an Object by clicking on the eye icon',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of an Object by clicking on its name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view an Object with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is possible to view a Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted but not its relation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the parent Object and its relations to be deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when adding an entry that was already related to another it will keep related to both entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the columns Name and Type are displayed for the Fields table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the columns Name System and Status are displayed for the Objects table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that a completed entry is displayed with an Approved status',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted and its relation to be disassociated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the parent Object to be deleted and its relations to be disassociated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the empty state when searching for an Object returns nothing',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the empty state when searching for an Object field returns nothing',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the empty state message when there is no Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Field Name is autofilled when Label is filled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify it is not possible to add a Field without Choose an Option Field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that other fields are not deleted when a Relationship field is deleted after a Relationship is deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

// @ignore = "Test Stub" - FormCollectionProvidersDisplayPageDisplayOnlyItsInstanceObjects
test(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Forms Settings Collection Providers and Display Page Template of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Skipped - Original test was marked @ignore = "Test Stub"
	}
);

test(
	'LPD-78504 Verify that the options Keyword and Text appears under the Searchable section when updating the field type to String',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the options Keyword and Text disappears under the Searchable section when updating the field type from String to another type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the field with String type has the options Keyword and Text under the Searchable section',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the field with String type has the option Language when the Text option is selected under the Searchable section',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

// @ignore = "Test Stub" - ObjectAdminDisplaysOnlyItsInstanceObjects
test(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Object Admin of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Skipped - Original test was marked @ignore = "Test Stub"
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Collection Providers when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Form storage type when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Page Item Selector when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Page Template subtype when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Workflow Process Builder page when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Workflow Site Menu page when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object entries are not displayed on Page fragments from an Object that was inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries disappears from Workflow Metrics page when they are deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries disappears from Workflow pages when they are deleted',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries with workflow are not displayed on the workflow pages when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object entries are displayed again on Page fragments from an Object that was reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object entries with workflow are displayed again on the Workflow Metrics page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries with workflow are displayed again on the workflow pages when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object Name is displayed on the Relationship tab when a Relationship is created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object Name is autofilled when Label is filled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when Objects are not scoped by Site it should not be displayed on the Workflow settings from the Site Menu',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object portlet is no longer displayed on the Open Menu when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object portlet is no longer displayed on the Site Menu when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object portlet is displayed again on the Open Menu when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object portlet is displayed again on the Site Menu when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Page Template subtype when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Workflow Process Builder page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Workflow Site Menu page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when the Object is scoped by Site each site will have its own entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

// @ignore = "Test Stub" - PanelDisplaysOnlyItsInstanceObjects
test(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Panel of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Skipped - Original test was marked @ignore = "Test Stub"
	}
);

test(
	'LPD-78504 Verify that by default the Prevent deletion type of Relationship is selected',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Prevent deletion type of Relationship One to Many will allow the user to delete an entry with relation from the child Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify Prevent deletion type of Relationship One to Many will not allow the user to delete an entry with relation from the parent Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that previous filled data is not kept when cancelling the creation of an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Relationship is created on both objects for a Many to Many Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that relationship field is automatically created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship field will not be displayed on a Collection Display with List Style set as Table when the parent object is inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship field will not be displayed to be selected for a Page fragment when the parent object is inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship field is no longer displayed when the parent object is inactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the Relationship field is not created on Many to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship field is displayed again when the parent object is reactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship tab is no longer displayed when the other object is inactivated for Many to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship tab is no longer displayed when the child object is inactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship tab is displayed again when the other object is reactivated for Many to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify the Relationship tab is displayed again when the child object is reactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the columns Name System and Status displays the correct value on the Objects table when a Custom Object is created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that updated data is kept when clicking on the Publish button',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that when adding a new Object with Account Restriction the Account Restriction field turns into a mandatory field for the created Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that user can view custom objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that user can view system objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that a withdrawn pending entry is displayed with a Draft status',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry through Forms',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry through Custom Object portlet',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry when Object is scoped by Site and the workflow was assigned on the Workflow settings from the Site Menu',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Test implementation stub
	}
);
