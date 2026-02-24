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
	'LPD-78504 Can activate or deactivate an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanActivateOrDeactivateAction
		// LPS-145665 - Verify that it's possible to activate and deactivate an Action
	}
);

test(
	'LPD-78504 Can add account entry after creating account entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddAccountEntryAfterCreatingAccountEntry
		// LPS-173537 - Verify creating an Account entry triggers an action to add a second Account entry
	}
);

test(
	'LPD-78504 Can add account entry after creating custom object entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddAccountEntryAfterCreatingCustomObjectEntry
		// LPS-173537 - Verify creating a custom object entry triggers an action to add an Account entry
	}
);

test(
	'LPD-78504 Can add account entry after deleting custom object entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddAccountEntryAfterDeletingCustomObjectEntry
		// LPS-173537 - Verify deleting a custom object entry triggers an action to add an Account entry
	}
);

test(
	'LPD-78504 Can add account entry after updating custom object entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddAccountEntryAfterUpdatingCustomObjectEntry
		// LPS-173537 - Verify updating a custom object entry triggers an action to add an Account entry
	}
);

test(
	'LPD-78504 Can add commerce product group entry after deleting commerce product entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddCommerceProductGroupEntryAfterDeletingCommerceProductEntry
		// LPS-173537 - Verify deleting a Commerce Product entry triggers an action to add a Commerce Product Group entry
	}
);

test(
	'LPD-78504 Can add user after creating commerce product entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddUserAfterCreatingCommerceProductEntry
		// LPS-180070 - Verify creating a Commerce Product entry triggers an action to add a user
	}
);

test(
	'LPD-78504 Can cancel the creation of an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCancelAction
		// LPS-139008 - Verify it is possible to cancel the creation of an Action
	}
);

test(
	'LPD-78504 Can cancel the update of an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCancelActionUpdate
		// LPS-139008 - Verify it is possible to cancel the update of an Action
	}
);

test(
	'LPD-78504 Can create an action with webhook',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateAction
		// LPS-139008 - Verify it is possible to create an Action
	}
);

test(
	'LPD-78504 Can create an action to add object entry with on order status update trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateActionAddObjectEntryWithOnOrderStatusUpdate
		// LPS-145665 - Verify it's possible to add an object entry with the trigger On Order Status Update
	}
);

test(
	'LPD-78504 Can create an action with expression builder condition',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateActionWithExpressionBuilder
		// LPS-156312 - Assert an Action can be created with Expression Builder
	}
);

test(
	'LPD-78504 Can create an action with Groovy Script',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateActionWithGroovyScript
		// LPS-156569 - Verify that it's possible to create an Action with Groovy Script
	}
);

test(
	'LPD-78504 Can create an object entry using actions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateEntryWithActions
		// LPS-161904 - Verify that it's possible to create an object entry using Actions
	}
);

test(
	'LPD-78504 Can delete an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteAction
		// LPS-139008 - Verify it is possible to delete an Action
	}
);

test(
	'LPD-78504 Can edit an action name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditActionName
		// LPS-145665 - Verify that you can edit the Action name
	}
);

test(
	'LPD-78504 Can edit an action with Groovy Script',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditActionWithGroovyScript
		// LPS-156560 - Verify that it's possible to edit an Action with Groovy Script
	}
);

test(
	'LPD-78504 Can enable and disable condition on an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEnableAndDisableCondition
		// LPS-145665 - Verify that the admin user is able to enable and disable Condition
	}
);

test(
	'LPD-78504 Can use formula field with user notification action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFormulaFieldBeUsedWithUserNotification
		// Verify that the user can use Formula Field with User Notification
	}
);

test(
	'LPD-78504 Can inactivate an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanInactivateAction
		// LPS-139008 - Verify that it is possible to inactivate an Action
	}
);

test(
	'LPD-78504 Can manage standalone permissions in roles',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageStandalonePermissionsInRoles
		// LPS-169994 - Verify users are able to manage standalone action permissions on the role page
	}
);

test(
	'LPD-78504 Cannot leave action name blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotLeaveActionNameBlank
		// LPS-139008 - Verify it is not possible to leave the Action Name field blank
	}
);

test(
	'LPD-78504 Cannot leave action then field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotLeaveActionThenBlank
		// LPS-139008 - Verify it is not possible to leave the Action Then field blank
	}
);

test(
	'LPD-78504 Cannot leave action when field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotLeaveActionWhenBlank
		// LPS-139008 - Verify it is not possible to leave the Action When field blank
	}
);

test(
	'LPD-78504 Cannot leave URL blank when webhook is selected',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotLeaveURLBlank
		// LPS-139008 - Verify it is not possible to leave the URL field blank when Webhook is selected
	}
);

test(
	'LPD-78504 Cannot save action without expression builder value',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotSaveWithoutExpressionBuilder
		// LPS-156319 - Verify that the Expression Builder field is required
	}
);

test(
	'LPD-78504 Cannot see deactivated standalone action in dropdown menu',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanNotSeeDeactivatedStandaloneAction
		// LPS-169994 - Verify a deactivated standalone action is not displayed in the dropdown menu
	}
);

test(
	'LPD-78504 Can reactivate an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanReactivateAction
		// LPS-139008 - Verify that it is possible to reactivate an Action
	}
);

test(
	'LPD-78504 Can search for an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchAction
		// LPS-139008 - Verify it is possible to search for an Action
	}
);

test(
	'LPD-78504 Can trigger action after disabling expression condition',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerActionAfterDisablingExpression
		// LPS-156343 - Verify that Action can be triggered after disabling the expression
	}
);

test(
	'LPD-78504 Can trigger action with expression by adding an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerActionWithExpressionByAddingEntry
		// LPS-156320 - Assert an Action with an Expression can be triggered after adding an entry
	}
);

test(
	'LPD-78504 Can trigger action with expression by deleting an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerActionWithExpressionByDeletingEntry
		// LPS-173218 - Assert an Action with an Expression can be triggered after deleting an entry
	}
);

test(
	'LPD-78504 Can trigger action with expression by updating an entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerActionWithExpressionByUpdatingEntry
		// LPS-173219 - Assert an Action with an Expression can be triggered after updating an entry
	}
);

test(
	'LPD-78504 Can trigger standalone action for site scoped object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerStandaloneActionForSiteScopedObject
		// LPS-172918 - Verify the user can trigger a standalone action for a site scoped object
	}
);

test(
	'LPD-78504 Can trigger standalone action with permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanTriggerStandaloneActionWithPermission
		// LPS-169994 - Verify that a permitted user can manually trigger a standalone action
	}
);

test(
	'LPD-78504 Can update account entry after creating account entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateAccountEntryAfterCreatingAccountEntry
		// LPS-173537 - Verify creating an Account entry triggers an action to update the Account entry
	}
);

test(
	'LPD-78504 Can update an action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateAction
		// LPS-139008 - Verify it is possible to update an Action
	}
);

test(
	'LPD-78504 Can update commerce product group entry after creating commerce product entry via action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateCommerceProductGroupEntryAfterCreatingCommerceProductEntry
		// LPS-173537 - Verify adding a Commerce Product entry triggers an action to update the Commerce Product Group entry
	}
);

test(
	'LPD-78504 Can use expression with Groovy Script action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseExpressionWithGroovyScript
		// LPS-156346 - Verify that the expression works with Groovy Script
	}
);

test(
	'LPD-78504 Can use expression with webhook action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseExpressionWithWebhook
		// LPS-156347 - Verify that the expression works with Webhooks
	}
);

test(
	'LPD-78504 Can verify unpublished object with standalone action does not show in permissions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CheckStandaloneActionPermissionOfUnpublishedObject
		// LPS-173774 - Verify that an unpublished object with a standalone action does NOT show up in permissions
	}
);

test(
	'LPD-78504 Can verify action name is required',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: VerifyActionNameIsRequired
		// LPS-146871 - Verify that the Action name is required
	}
);

test(
	'LPD-78504 Can verify condition card is hidden when using on subscription status update trigger',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: VerifyTheConditionCardAreHidden
		// LPS-171802 - Verify if the Condition card is hidden when using the trigger On Subscription Status Update
	}
);
