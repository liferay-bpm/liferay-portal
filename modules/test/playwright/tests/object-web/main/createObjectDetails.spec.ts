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
import {getRandomInt} from '../../../utils/getRandomInt';
import {performUserSwitch, userData} from '../../../utils/performLogin';
import {waitForAlert} from '../../../utils/waitForAlert';
import {generateObjectFields} from './utils/generateObjectFields';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

test.describe('Details Tab', () => {
	test(
		'Verify it is possible to add an Object Entry Title Field',
		{tag: '@LPS-139803'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectFields = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Entry Display').first().click();
			await page
				.getByRole('option', {name: objectFields[0].label!['en_US']})
				.click();

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to scope the Object by Company',
		{tag: '@LPS-135551'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					scope: 'company',
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(page.getByText('Company', {exact: true})).toBeVisible();
		}
	);

	test(
		'Verify it is possible to scope the Object by Site',
		{tag: '@LPS-135551'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					scope: 'site',
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(page.getByText('Site', {exact: true})).toBeVisible();
		}
	);

	test(
		'Verify it is possible to set a different language value for an Object Label',
		{tag: '@LPS-135389'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByRole('button', {name: 'en-US'}).first().click();
			await page.getByRole('menuitem', {name: 'pt-BR'}).click();

			await page.getByLabel('Label').fill('Rótulo em Português');

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to set a different language value for an Object Plural Label',
		{tag: '@LPS-135389'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByRole('button', {name: 'en-US'}).nth(1).click();
			await page.getByRole('menuitem', {name: 'pt-BR'}).click();

			await page.getByLabel('Plural Label').fill('Rótulos em Português');

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object label after it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const newLabel = 'UpdatedLabel' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Label').fill(newLabel);

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object label before it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const newLabel = 'UpdatedLabel' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Label').fill(newLabel);

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object name before it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const newName = 'UpdatedName' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.locator('input[name="name"]').fill(newName);

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object panel category before it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Panel Link').first().click();
			await page
				.getByRole('option', {name: 'Control Panel > Object'})
				.click();

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object panel category key after it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Panel Link').first().click();
			await page
				.getByRole('option', {name: 'Control Panel > Object'})
				.click();

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object plural label after it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const newPluralLabel = 'UpdatedPluralLabel' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Plural Label').fill(newPluralLabel);

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object plural label before it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
				});

			const newPluralLabel = 'UpdatedPluralLabel' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Plural Label').fill(newPluralLabel);

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is possible to update the Object scope before it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					scope: 'company',
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Scope').first().click();
			await page.getByRole('option', {name: 'Site'}).click();

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);
		}
	);

	test(
		'Verify it is not possible to update the Object name after it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(page.locator('input[name="name"]')).toBeDisabled();
		}
	);

	test(
		'Verify it is not possible to update the Object scope after it is published',
		{tag: '@LPS-135635'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(page.getByLabel('Scope').first()).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		}
	);

	test.fixme(
		'Verify that when adding a new Object the admin user is able to restrict users to only see entries from an account that they are part of',
		{tag: '@LPS-151877'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					accountEntryRestricted: true,
					accountEntryRestrictedObjectFieldName:
						'r_accountEntryId_accountEntryId',
					status: {code: 0},
				} as any);

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(
				page.getByRole('switch', {name: 'Account Restriction'})
			).toBeChecked();
		}
	);

	test(
		'Verify that it is possible to restrict a previously created Object',
		{tag: '@LPS-155962'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await editObjectDetailsPage.accountRestrictionToggle.check();

			await editObjectDetailsPage.saveObjectDefinition();

			await waitForAlert(page);

			await page.reload();

			await editObjectDetailsPage.goToDetailsTab();

			await expect(
				editObjectDetailsPage.accountRestrictionToggle
			).toBeChecked();
		}
	);

	test(
		'Verify it is not possible to publish an Object without the Publish Object Definition permission',
		{tag: '@LPS-135390'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const company =
				await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
					'liferay.com'
				);

			const role = await apiHelpers.headlessAdminUser.postRole({
				name: 'ObjRole' + getRandomInt(),
				rolePermissions: [
					{
						actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
						primaryKey: String(company.companyId),
						resourceName:
							'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
						scope: 1,
					},
					{
						actionIds: ['VIEW'],
						primaryKey: String(company.companyId),
						resourceName: 'com.liferay.object.model.ObjectDefinition',
						scope: 1,
					},
					{
						actionIds: ['VIEW_CONTROL_PANEL'],
						primaryKey: String(company.companyId),
						resourceName: '90',
						scope: 1,
					},
				],
			});

			apiHelpers.data.push({id: role.id, type: 'role'});

			const user = await apiHelpers.headlessAdminUser.postUserAccount();

			apiHelpers.data.push({id: user.id, type: 'userAccount'});

			userData[user.alternateName] = {
				name: user.givenName,
				password: 'test',
				surname: user.familyName,
			};

			await apiHelpers.headlessAdminUser.assignUserToRole(
				role.externalReferenceCode,
				user.id
			);

			await performUserSwitch(page, user.alternateName);

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);

			await expect(editObjectDetailsPage.publishButton).toBeDisabled();
		}
	);

	test(
		'Verify it is possible to view and edit its own Object with only the Add Object Definition permission',
		{tag: '@LPS-140342'},
		async ({
			apiHelpers,
			editObjectDetailsPage,
			modalAddObjectDefinitionPage,
			page,
			viewObjectDefinitionsPage,
		}) => {
			const company =
				await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
					'liferay.com'
				);

			const role = await apiHelpers.headlessAdminUser.postRole({
				name: 'ObjRole' + getRandomInt(),
				rolePermissions: [
					{
						actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
						primaryKey: String(company.companyId),
						resourceName:
							'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
						scope: 1,
					},
					{
						actionIds: ['ADD_OBJECT_DEFINITION'],
						primaryKey: String(company.companyId),
						resourceName: 'com.liferay.object',
						scope: 1,
					},
					{
						actionIds: ['UPDATE', 'VIEW'],
						primaryKey: String(company.companyId),
						resourceName: 'com.liferay.object.model.ObjectDefinition',
						scope: 1,
					},
					{
						actionIds: ['VIEW_CONTROL_PANEL'],
						primaryKey: String(company.companyId),
						resourceName: '90',
						scope: 1,
					},
				],
			});

			apiHelpers.data.push({id: role.id, type: 'role'});

			const user = await apiHelpers.headlessAdminUser.postUserAccount();

			apiHelpers.data.push({id: user.id, type: 'userAccount'});

			userData[user.alternateName] = {
				name: user.givenName,
				password: 'test',
				surname: user.familyName,
			};

			await apiHelpers.headlessAdminUser.assignUserToRole(
				role.externalReferenceCode,
				user.id
			);

			await performUserSwitch(page, user.alternateName);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

			const objectLabel = 'CustomObject' + getRandomInt();

			const objectDefinitionResponse =
				await modalAddObjectDefinitionPage.createObjectDefinition(
					objectLabel
				);

			apiHelpers.data.push({
				id: objectDefinitionResponse.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goToDetailsTab();

			const newLabel = 'EditedObject' + getRandomInt();

			await page.locator('input[name="label"]').clear();
			await page.locator('input[name="label"]').fill(newLabel);

			await editObjectDetailsPage.saveButton.click();

			await waitForAlert(page);

			await expect(page.locator('input[name="label"]')).toHaveValue(newLabel);
		}
	);

	test(
		'Verify it is possible to Publish a Custom Object',
		{tag: '@LPS-135549'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);

			await editObjectDetailsPage.publishButton.click();

			await waitForAlert(page);
		}
	);

	test(
		'Verify that updated data is kept when clicking on the Publish button',
		{tag: '@LPS-138213'},
		async ({apiHelpers, editObjectDetailsPage, page}) => {
			const objectFields = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const newLabel = 'UpdatedLabel' + getRandomInt();

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await page.getByLabel('Label').fill(newLabel);

			await editObjectDetailsPage.publishButton.click();

			await waitForAlert(page);

			await page.reload();

			await editObjectDetailsPage.goToDetailsTab();

			await expect(page.getByLabel('Label')).toHaveValue(newLabel);
		}
	);
});
