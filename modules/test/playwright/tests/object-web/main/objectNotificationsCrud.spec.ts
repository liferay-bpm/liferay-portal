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
	'LPD-78504 Can add attachment to notification template',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to add attachments to the notification template
	}
);

test(
	'LPD-78504 Can add email notification to queue via API',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify an email notification can be added to the queue using the endpoint
	}
);

test(
	'LPD-78504 Can change notification template data source',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify the data source can be updated to use an attachment field from a different object
	}
);

test(
	'LPD-78504 Can delete attachment from notification template',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete attachments from the notification template
	}
);

test(
	'LPD-78504 Can delete email notification template',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete an e-mail notification template
	}
);

test(
	'LPD-78504 Can delete a notification',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a notification
	}
);

test(
	'LPD-78504 Can delete user notification template',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to delete a user notification template
	}
);

test(
	'LPD-78504 Can search for notifications',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to search for notifications
	}
);

test(
	'LPD-78504 Can send email via Action on Add',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to send an e-mail notification via an Action on Add
	}
);

test(
	'LPD-78504 Can send email via Action on Delete',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to send an e-mail notification via an Action on Delete
	}
);

test(
	'LPD-78504 Can send email via Standalone Action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify a standalone action can be triggered manually to send an email
	}
);

test(
	'LPD-78504 Can send email via Action on Update',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that it is possible to send an e-mail notification with Action on Update
	}
);

test(
	'LPD-78504 Can send email with terms from related Custom Objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify terms from 1:M related custom objects are replaced with the correct values in an email notification
	}
);

test(
	'LPD-78504 Can send email with terms from related System Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify terms from a 1:M related system object (parent) are replaced with the correct values in an email notification
	}
);

test(
	'LPD-78504 Can send user notification with terms from related Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify terms from a 1:M related custom object (child) are replaced with the correct values in a user notification
	}
);

test(
	'LPD-78504 Can use Object Author and Current User terms in email notification on Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that after updating a custom object entry, triggered email notifications using Object Author and Current User terms are filled correctly
	}
);

test(
	'LPD-78504 Can use Object Author and Current User terms in email notification on System Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that after updating a system object entry, triggered email notifications using Object Author and Current User terms are filled correctly
	}
);

test(
	'LPD-78504 Can use Object Author and Current User terms in user notification on Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Verify that after updating a custom object entry, triggered user notifications using Object Author and Current User terms are filled correctly
	}
);
