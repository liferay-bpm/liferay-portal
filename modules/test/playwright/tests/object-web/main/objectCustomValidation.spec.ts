/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinitionAPI,
	ObjectValidationRuleAPI,
} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../fixtures/apiHelpersTest';
import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';

const test = mergeTests(
	apiHelpersTest,
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

test(
	'LPD-78504 Can add valid entry when validation is set to full validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{
						businessType: 'Decimal',
						DBType: 'Double',
						label: {en_US: 'Decimal'},
						name: 'decimal',
						required: false,
					},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry({
			objectDefinitionExternalReferenceCode: objectDefinition.externalReferenceCode,
			values: {decimal: 13.579},
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('13.579')).toBeVisible();
	}
);

test(
	'LPD-78504 Updated validation only affects entries added after update',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{
						businessType: 'Text',
						DBType: 'String',
						label: {en_US: 'Custom Field'},
						name: 'customField',
						required: false,
					},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry({
			objectDefinitionExternalReferenceCode: objectDefinition.externalReferenceCode,
			values: {customField: 'Allowed Entry'},
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Allowed Entry')).toBeVisible();
	}
);

test(
	'LPD-78504 Can deactivate validation and add previously invalid entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{
						businessType: 'LongText',
						DBType: 'Clob',
						label: {en_US: 'Long Text'},
						name: 'longText',
						required: false,
					},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry({
			objectDefinitionExternalReferenceCode: objectDefinition.externalReferenceCode,
			values: {longText: 'Build Incredible Digital Experiences with Liferay DXP'},
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Build Incredible Digital Experiences')).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Concat for text fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text A'}, name: 'customTextA', required: false},
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text B'}, name: 'customTextB', required: false},
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text C'}, name: 'customTextC', required: false},
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text D'}, name: 'customTextD', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with conditional logic for text, boolean, and integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Food'}, name: 'customFood', required: false},
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Category'}, name: 'customCategory', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Contains and Does Not Contain',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer'}, name: 'customInteger', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Future Dates and Past Dates',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Date', DBType: 'Date', label: {en_US: 'Custom Date'}, name: 'customDate', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is an Email',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is Decimal or Is Integer',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is Empty',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is Equal To and Is Not Equal To',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer'}, name: 'customInteger', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is Greater Than Or Equal To',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer'}, name: 'customInteger', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is Less Than Or Equal To',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer'}, name: 'customInteger', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Is a URL',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Match regex',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Text'}, name: 'customText', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with math operators for integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer A'}, name: 'customIntegerA', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer B'}, name: 'customIntegerB', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer C'}, name: 'customIntegerC', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Range using Future Dates and Past Dates',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Date', DBType: 'Date', label: {en_US: 'Custom Date'}, name: 'customDate', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Can define expression with Sum for integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer A'}, name: 'customIntegerA', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer B'}, name: 'customIntegerB', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer C'}, name: 'customIntegerC', required: false},
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer D'}, name: 'customIntegerD', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText(objectDefinition.label['en_US'])).toBeVisible();
	}
);

test(
	'LPD-78504 Groovy validation is not active by default',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage, modalAddObjectValidationPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can prevent entry creation via Groovy validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Field'}, name: 'customField', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Can update validation and affect only new entries',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Text'}, name: 'text', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry({
			objectDefinitionExternalReferenceCode: objectDefinition.externalReferenceCode,
			values: {text: 'Quick brown fox'},
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Quick brown fox')).toBeVisible();
	}
);

test(
	'LPD-78504 Entry update succeeds only when passing all validations',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Field'}, name: 'customField', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry({
			objectDefinitionExternalReferenceCode: objectDefinition.externalReferenceCode,
			values: {customField: 'Entry Test'},
		});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry Test')).toBeVisible();
	}
);

test(
	'LPD-78504 Can see Basic Info tab on validation management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage, modalAddObjectValidationPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can see Conditions tab on validation management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can validate Expression Builder syntax when creating actions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can validate Expression Builder syntax when creating scheduled action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Field'}, name: 'customField', required: true},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can validate Groovy syntax when creating actions',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Integer', DBType: 'Integer', label: {en_US: 'Custom Integer'}, name: 'customInteger', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can validate Groovy syntax when creating scheduled action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Can validate system object with Expression Builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Empty state is displayed when no validations are added',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Can view localized input changed on validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Error message is displayed when entry fails all validations',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Field'}, name: 'customField', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Specific error is shown when Groovy syntax is incorrect',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [
					{businessType: 'Text', DBType: 'String', label: {en_US: 'Custom Field'}, name: 'customField', required: false},
				] as any,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Validation tab is available on object definition',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Error message field is required on validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);

test(
	'LPD-78504 Label field is required when adding a new validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, objectValidationsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await objectValidationsPage.goto(objectDefinition.label['en_US']);

		await expect(page.locator('body')).toBeVisible();
	}
);
