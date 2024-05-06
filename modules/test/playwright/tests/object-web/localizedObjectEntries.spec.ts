/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {localizationPageTests} from '../../fixtures/localizationPagesTests';
import {loginTest} from '../../fixtures/loginTest';
import {objectPagesTest} from '../../fixtures/objectPagesTest';
import {getRandomInt} from '../../utils/getRandomInt';

export const test = mergeTests(
	apiHelpersTest,
	loginTest(),
	localizationPageTests,
	objectPagesTest
);

let createObjectDefinitionId;

test.afterEach(async ({apiHelpers, localizationInstanceSettingsPage, page}) => {
	if (createObjectDefinitionId) {
		await apiHelpers.objectAdmin.deleteObjectDefinition(
			createObjectDefinitionId
		);
	}

	await page.goto('/');

	await page.getByLabel('Abrir menu de aplicativosCtrl+Alt+A').click();

	await page.getByRole('tab', {name: 'Painel de Controle'}).click();

	await page
		.getByRole('menuitem', {name: 'Configurações da Instância'})
		.click();

	await page.getByRole('link', {name: 'Localização'}).click();

	await localizationInstanceSettingsPage.moveLanguageToCurrent(
		'Disponível',
		'en_US'
	);

	await page.getByLabel('Idioma padrão').selectOption('en_US');

	await page.getByRole('button', {name: 'Salvar'}).click();
});

test.describe('can be added while the portal default language is different from us_EN', () => {
	test('Object entries can be added while the portal default language is different from us_EN', async ({
		apiHelpers,
		localizationInstanceSettingsPage,
		page,
	}) => {
		await localizationInstanceSettingsPage.goto();

		await localizationInstanceSettingsPage.setDefaultLanguage(
			'Default Language',
			'pt_BR'
		);

		await localizationInstanceSettingsPage.moveLanguageToAvailable(
			'Current',
			'en_US'
		);

		const objectDefinitionExternalReferenceCode =
			'ObjectDefinition' + getRandomInt();

		const requestBody = {
			active: true,
			externalReferenceCode: objectDefinitionExternalReferenceCode,
			label: {
				pt_BR: objectDefinitionExternalReferenceCode,
			},
			name: objectDefinitionExternalReferenceCode,
			objectFields: [
				{
					DBType: 'String',
					businessType: 'Text',
					externalReferenceCode: 'textField',
					indexed: true,
					indexedAsKeyword: false,
					indexedLanguageId: '',
					label: {pt_BR: 'textField'},
					listTypeDefinitionId: 0,
					name: 'textField',
					required: false,
					system: false,
					type: 'String',
				},
			],
			objectFolderExternalReferenceCode: 'default',
			panelCategoryKey: 'control_panel.object',
			pluralLabel: {
				pt_BR: objectDefinitionExternalReferenceCode,
			},
			scope: 'company',
			status: {code: 0},
		};

		const objectDefinition =
			await apiHelpers.objectAdmin.postObjectDefinition(requestBody);

		createObjectDefinitionId = objectDefinition.id;

		const randomText = 'test' + getRandomInt();

		await page.getByLabel('Abrir menu de aplicativosCtrl+Alt+A').click();
		await page
			.getByRole('menuitem', {
				name: objectDefinitionExternalReferenceCode,
			})
			.click();
		await page
			.getByText('Adicionar ' + objectDefinitionExternalReferenceCode)
			.click();

		await page.getByLabel('textField').fill(randomText);

		await page.getByRole('button', {name: 'Salvar'}).click();

		expect(
			page.getByText('Solicitação concluída com sucesso.')
		).toBeVisible();

		await page.waitForSelector(
			'span.loading-animation.loading-animation-secondary.loading-animation-sm',
			{state: 'hidden'}
		);

		await page.getByRole('link', {name: 'Voltar'}).click();

		await page
			.getByText(randomText, {exact: true})
			.waitFor({state: 'visible'});

		expect(page.getByText(randomText, {exact: true})).toBeVisible();
	});
});
