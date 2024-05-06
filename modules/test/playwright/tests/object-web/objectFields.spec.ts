/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {loginTest} from '../../fixtures/loginTest';
import {objectPagesTest} from '../../fixtures/objectPagesTest';
import {getRandomInt} from '../../utils/getRandomInt';

export const test = mergeTests(apiHelpersTest, loginTest(), objectPagesTest);

let objectDefinition: ObjectDefinition;

test.beforeEach(async ({apiHelpers}) => {
	const newObjectDefinition1 =
		await apiHelpers.objectAdmin.postRandomObjectDefinition({
			objectFolderExternalReferenceCode: 'default',
			status: {code: 0},
		});

	objectDefinition = newObjectDefinition1;
});

test.afterEach(async ({apiHelpers}) => {
	await apiHelpers.objectAdmin.deleteObjectDefinition(objectDefinition.id);
});

test.describe('Manage object fields through Model Builder', () => {
	test('can add picklist object field to object definition node', async ({
		apiHelpers,
		modelBuilderPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await page.goto('/');

		const ListTypeDefinition =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
			});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.openObjectFolder('default');

		await viewObjectDefinitionsPage.viewInModelBuilder();

		const objectFieldLabel = 'objectFieldLabel' + getRandomInt();

		await modelBuilderPage.createObjectField({
			listTypeDefinitionName: ListTypeDefinition.name,
			mandatory: false,
			objectDefinitionName: objectDefinition.name,
			objectFieldBusinessType: 'Picklist',
			objectFieldLabel,
		});

		await expect(
			modelBuilderPage.objectDefinitionNodes
				.filter({hasText: objectDefinition.label['en_US']})
				.getByText(objectFieldLabel)
		).toBeVisible();

		// Clean up

		await apiHelpers.listTypeAdmin.deleteListTypeDefinition(
			ListTypeDefinition.id
		);
	});

	test('cannot delete an objectField that belongs to a unique composite key validation through Model Builder', async ({
		apiHelpers,
		modelBuilderPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		const integerFieldName = 'integerField' + getRandomInt();

		await apiHelpers.objectAdmin.postObjectFieldByExternalReferenceCode(
			objectDefinition.externalReferenceCode,
			{
				DBType: 'Integer',
				businessType: 'Integer',
				externalReferenceCode: integerFieldName,
				indexed: true,
				indexedAsKeyword: false,
				indexedLanguageId: '',
				label: {en_US: integerFieldName},
				listTypeDefinitionId: 0,
				localized: false,
				name: integerFieldName,
				readOnly: 'false',
				required: false,
				state: false,
				system: false,
			}
		);

		const objectValidationName =
			'Unique Composite Key Object Validation' + getRandomInt();

		await apiHelpers.objectAdmin.postObjectValidation(
			objectDefinition.externalReferenceCode,
			{
				active: true,
				engine: 'compositeKey',
				engineLabel: 'Composite Key',
				errorLabel: {
					en_US: 'Unique composite key object validation error',
				},
				name: {
					en_US: objectValidationName,
				},
				objectValidationRuleSettings: [
					{
						name: 'compositeKeyObjectFieldExternalReferenceCode',
						value: 'textField',
					},
					{
						name: 'compositeKeyObjectFieldExternalReferenceCode',
						value: integerFieldName,
					},
				],
				outputType: 'fullValidation',
				script: '',
				system: false,
			}
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.openObjectFolder('default');

		await viewObjectDefinitionsPage.viewInModelBuilder();

		await modelBuilderPage.clickShowAllFieldsButton(objectDefinition.name);

		await page.getByText(integerFieldName).click();

		await modelBuilderPage.deleteButton.click();

		await expect(page.getByText('Deletion Not Allowed')).toBeVisible();
		await expect(
			page.getByText(
				`The object field "${integerFieldName}" cannot be deleted because it is used in a unique composite key validation. To remove this object field, you must first delete the associated unique composite key validation.`
			)
		).toBeVisible();
	});
});
