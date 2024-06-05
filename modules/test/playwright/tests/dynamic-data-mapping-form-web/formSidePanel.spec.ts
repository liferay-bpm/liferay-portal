/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {formsPagesTest} from '../../fixtures/formsPagesTest';
import {loginTest} from '../../fixtures/loginTest';
import {getRandomInt} from '../../utils/getRandomInt';

export const test = mergeTests(apiHelpersTest, loginTest(), formsPagesTest);

let createdObjectDefinition: ObjectDefinition;

test.afterEach(async ({apiHelpers}) => {
	if (createdObjectDefinition) {
		await apiHelpers.objectAdmin.deleteObjectDefinition(
			createdObjectDefinition.id
		);
	}
});

test.describe('Manage form configurations through sidepanel', () => {
	test('multiple select, create list and add options sections are not present on the sidepanel when storing entries via objects', async ({
		apiHelpers,
		formBuilderPage,
		formBuilderSidePanelPage,
		formSettingsModalPage,
	}) => {
		const listTypeDefinition =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		const objectDefinition =
			await apiHelpers.objectAdmin.postObjectDefinition({
				active: true,
				externalReferenceCode: 'customObjectERC',
				label: {
					en_US: 'Custom object',
				},
				name: 'CustomObject',
				objectFields: [
					{
						DBType: 'String',
						businessType: 'MultiselectPicklist',
						externalReferenceCode: 'customMultiselectPicklist',
						indexed: true,
						indexedAsKeyword: false,
						indexedLanguageId: '',
						label: {en_US: 'Multiselect Picklist'},
						listTypeDefinitionId: listTypeDefinition.id,
						name: 'customMultiselectPicklist',
						required: false,
						system: false,
						type: 'String',
					},
				],
				pluralLabel: {
					en_US: 'Custom Objects',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
			});

		createdObjectDefinition = objectDefinition;

		await formBuilderPage.goToNew();

		await expect(formBuilderPage.newFormHeading).toBeVisible();

		await formBuilderPage.fillFormTitle('Form' + getRandomInt());

		await formBuilderPage.formSettingsButton.click();

		await formSettingsModalPage.selectStorageType('Object');

		await formSettingsModalPage.selectObject(
			objectDefinition.label['en_US']
		);

		await formSettingsModalPage.clickDoneButton();

		await formBuilderSidePanelPage.addFieldByDoubleClick(
			'Select from List'
		);

		await formBuilderSidePanelPage.clickAdvancedTab();

		await formBuilderSidePanelPage.selectObjectField(
			'Multiselect Picklist'
		);

		await expect(formBuilderSidePanelPage.objectFieldSelect).toBeVisible();

		await expect(
			formBuilderSidePanelPage.predefinedValueSelect
		).not.toBeVisible();

		await formBuilderSidePanelPage.clickBasicTab();

		await expect(
			formBuilderSidePanelPage.createListSelect
		).not.toBeVisible();

		await expect(
			formBuilderSidePanelPage.addSelectOptionButton
		).not.toBeVisible();
	});
});
