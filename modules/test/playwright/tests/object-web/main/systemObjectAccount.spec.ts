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
	'LPD-78504 Can associate any type of account',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanAssociateAnyTypeOfAccount
	}
);

test(
	'LPD-78504 Can create action on system account',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateActionOnSystemAccount
	}
);

test(
	'LPD-78504 Can create relationship related with custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateRelationshipRelatedWithCustomObject
	}
);

test(
	'LPD-78504 Can delete relationship when deletion type is cascade',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanDeleteRelationshipWhenDeletionTypeIsCascade
	}
);

test(
	'LPD-78504 Cannot delete default fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotDeleteDefaultFields
	}
);

test(
	'LPD-78504 Cannot delete entry when deletion type is prevent',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotDeleteEntryWhenDeletionTypeIsPrevent
	}
);

test(
	'LPD-78504 Cannot delete relationship when deletion type is disassociate',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotDeleteRelationshipWhenDeletionTypeIsDisassociate
	}
);

test(
	'LPD-78504 Cannot edit default fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotEditDefaultFields
	}
);

test(
	'LPD-78504 Can user view system account when allowed',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUserViewSystemAccountWhenAllowed
	}
);

test(
	'LPD-78504 Can view description on field entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewDescriptionOnFieldEntry
	}
);

test(
	'LPD-78504 Can view fields label by default',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewFieldsLabelByDefault
	}
);

test(
	'LPD-78504 Can view name and type as mandatory fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewNameAndTypeAsMandatoryFields
	}
);

test(
	'LPD-78504 Can view name on field entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewNameOnFieldEntry
	}
);

test(
	'LPD-78504 Can view relationship on custom object entries with custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewRelationshipOnCustomObjectEntriesWithCustomView
	}
);

test(
	'LPD-78504 Can view type on field entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewTypeOnFieldEntry
	}
);

test(
	'LPD-78504 Edit title field on system account',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: EditTitleFieldOnSystemAccount
	}
);

test(
	'LPD-78504 Widget button disabled by default',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: WidgetButtonDisabledByDefault
	}
);
