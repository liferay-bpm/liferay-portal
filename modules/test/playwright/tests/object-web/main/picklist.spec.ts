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
	'LPD-78504 Can cancel the creation of a picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCancelCreatePicklist
	}
);

test(
	'LPD-78504 Can cancel the creation of a picklist item',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCancelCreatePicklistItem
	}
);

test(
	'LPD-78504 Can cancel the update of a picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCancelUpdatePicklist
	}
);

test(
	'LPD-78504 Can create object entry with picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateObjectEntryWithPicklist
	}
);

test(
	'LPD-78504 Can create object with state added to picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreateObjectWithState
	}
);

test(
	'LPD-78504 Can create picklist item',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanCreatePicklistItem
	}
);

test(
	'LPD-78504 Can delete a picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanDeletePicklist
	}
);

test(
	'LPD-78504 Can edit object with state added to picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanEditObjectWithState
	}
);

test(
	'LPD-78504 Cannot add special character for picklist item key field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotAddSpecialCharacterForPicklistItemKeyField
	}
);

test(
	'LPD-78504 Cannot leave picklist item key field empty',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotLeavePicklistItemKeyFieldEmpty
	}
);

test(
	'LPD-78504 Cannot leave picklist item name field empty',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotLeavePicklistItemNameFieldEmpty
	}
);

test(
	'LPD-78504 Cannot leave picklist name field empty',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotLeavePicklistNameFieldEmpty
	}
);

test(
	'LPD-78504 Cannot update picklist item key',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CannotUpdatePicklistItemKey
	}
);

test(
	'LPD-78504 Can search for a picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSearchPicklist
	}
);

test(
	'LPD-78504 Can search for a picklist item',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSearchPicklistItem
	}
);

test(
	'LPD-78504 Can set different picklist item name language',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSetDifferentPicklistItemNameLanguage
	}
);

test(
	'LPD-78504 Can set different picklist item name language when updating',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSetDifferentPicklistItemNameLanguageWhenUpdating
	}
);

test(
	'LPD-78504 Can set different picklist name language',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanSetDifferentPicklistNameLanguage
	}
);

test(
	'LPD-78504 Can update picklist item name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdatePicklistItemName
	}
);

test(
	'LPD-78504 Can update picklist name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanUpdatePicklistName
	}
);

test(
	'LPD-78504 Can view a picklist',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewPicklist
	}
);

test(
	'LPD-78504 Can view a picklist item',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: CanViewPicklistItem
	}
);

test(
	'LPD-78504 Empty state message displayed when no picklist exists',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: EmptyStateMessageDisplayedWhenNoPicklist
	}
);

test(
	'LPD-78504 Empty state message displayed when no picklist item exists',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: EmptyStateMessageDisplayedWhenNoPicklistItem
	}
);

test(
	'LPD-78504 Key field is autofilled when name field is filled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: KeyFieldIsAutofilled
	}
);

test(
	'LPD-78504 Translated picklist item name displayed on object view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewTranslatedPicklistItemNameOnObjectView
	}
);

test(
	'LPD-78504 Updated picklist item name displayed on object portlet',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: ViewUpdatedPicklistItemNameOnObjectPortlet
	}
);

test(
	'LPD-78504 Warn message displayed on picklist item screen for updating or deleting',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Corresponds to Poshi test: WarnMessageDisplayedOnPickListItemScreen
	}
);
