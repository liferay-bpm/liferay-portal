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
import {ListTypeDefinitionsPage} from '../../../pages/object-web/list-type/ListTypeDefinitionsPage';
import {getRandomInt} from '../../../utils/getRandomInt';
import {
	performLogout,
	performUserSwitch,
	userData,
} from '../../../utils/performLogin';
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

const PICKLIST_PORTLET =
	'com_liferay_object_web_internal_list_type_portlet_portlet_ListTypeDefinitionsPortlet';
const PICKLIST_MODEL = 'com.liferay.list.type.model.ListTypeDefinition';
const PICKLIST_PARENT = 'com.liferay.list.type';
const OBJECT_PORTLET =
	'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet';
const OBJECT_MODEL = 'com.liferay.object.model.ObjectDefinition';
const OBJECT_PARENT = 'com.liferay.object';

async function createRoleAndUser(apiHelpers, page, rolePermissions) {
	const company =
		await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
			'liferay.com'
		);

	const role = await apiHelpers.headlessAdminUser.postRole({
		name: 'ObjPermRole' + getRandomInt(),
		rolePermissions: rolePermissions.map((p) => ({
			...p,
			primaryKey: String(company.companyId),
			scope: 1,
		})),
	});

	const user = await apiHelpers.headlessAdminUser.postUserAccount();

	userData[user.alternateName] = {
		name: user.givenName,
		password: 'test',
		surname: user.familyName,
	};

	await apiHelpers.headlessAdminUser.assignUserToRole(
		role.externalReferenceCode,
		user.id
	);

	return {company, role, user};
}

// Migrated from ObjectPermission.testcase

test(
	'LPD-78504 Can access Picklist portlet with Access in Control Panel permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await expect(page.getByText('Picklists')).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can add a Picklist with the Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklistName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can define single Picklist permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		// Grant PERMISSIONS and VIEW on the specific picklist to the role

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator(`#regular-role_ACTION_PERMISSIONS`)
			.check();

		await permissionIframe.locator(`#regular-role_ACTION_VIEW`).check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await listTypeDefinitionsPage.goto();

		// User should see the picklist

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeVisible();

		// User can open permissions and remove VIEW

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe2 = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe2.locator(`#regular-role_ACTION_VIEW`).uncheck();

		await permissionIframe2.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe2);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Picklist should no longer be visible

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete a Picklist with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['DELETE', 'VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Delete'}).click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete a single Object Entry with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Grant DELETE and VIEW on the specific entry via permissions iframe

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_DELETE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await expect(page.getByText('Entry Test')).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete a single Object with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Grant DELETE and VIEW on the specific object via permissions iframe

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_DELETE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await viewObjectDefinitionsPage.deleteObjectDefinitionOption.click();

		await page
			.getByPlaceholder('Confirm Object Definition Name', {
				exact: false,
			})
			.fill(objectDefinition.name);

		await page
			.getByRole('button', {exact: true, name: 'Delete'})
			.click();

		await waitForAlert(page);

		await expect(
			page.getByText(objectDefinition.label['en_US'])
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete a single Picklist with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		// Grant DELETE and VIEW on the specific picklist

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_DELETE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Delete'}).click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can edit its own entry with only Add Object Entry permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

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

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		// Add an entry

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		// Navigate back and verify entry is visible

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry Test')).toBeVisible();

		// Edit the entry

		await page.getByRole('link', {name: 'Entry Test'}).click();

		await page.getByLabel(fieldLabel, {exact: true}).fill('Update Entry');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		// Verify updated entry

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Update Entry')).toBeVisible();
	}
);

test(
	'LPD-78504 Cannot add a Picklist without the Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await expect(
			listTypeDefinitionsPage.addPicklistButton
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot define single Picklist permissions without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await page.reload();

		// Switch to admin to remove Owner PERMISSIONS

		await performUserSwitch(page, 'test');

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_PERMISSIONS').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch back to limited user

		await performUserSwitch(page, user.alternateName);

		await listTypeDefinitionsPage.goto();

		// Verify Permissions menu item is not present

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await expect(
			page.getByRole('menuitem', {name: 'Permissions'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot delete own single Object Entry without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Switch to limited user and create an entry

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		// Remove Owner DELETE permission on the entry

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_DELETE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Verify Delete is not in kebab menu

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await expect(
			viewObjectEntriesPage.frontendDatasetDeleteAction
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot delete a Picklist without the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await expect(
			page.getByRole('menuitem', {name: 'Delete'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot delete a single Object without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['ADD_OBJECT_DEFINITION'],
				resourceName: OBJECT_PARENT,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create an object

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		const objectLabel = 'CustomObj' + getRandomInt();

		await page.getByLabel('Label').fill(objectLabel);

		await page.getByLabel('Plural Label').fill(objectLabel + 's');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Switch to admin to remove Owner DELETE

		await performUserSwitch(page, 'test');

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_DELETE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch back to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await expect(
			page.getByRole('menuitem', {name: 'Delete'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot delete a single Picklist without Delete Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['PERMISSIONS'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create a picklist

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await page.reload();

		// Remove Owner DELETE permission on the picklist

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_DELETE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Verify Delete is not in kebab menu

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await expect(
			page.getByRole('menuitem', {name: 'Delete'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot update own single Object Entry without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Switch to limited user and create an entry

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		// Remove Owner PERMISSIONS permission on the entry

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#owner_ACTION_PERMISSIONS')
			.uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Verify Permissions is not in kebab menu

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await expect(
			viewObjectEntriesPage.frontendDatasetPermissionsAction
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot update own single Object Entry without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Switch to limited user and create an entry

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		// Remove Owner UPDATE permission on the entry

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_UPDATE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// View entry details - field should be disabled and no Save button

		await page.getByRole('link', {name: 'Entry Test'}).click();

		await expect(
			page.getByLabel(fieldLabel, {exact: true})
		).toBeDisabled();

		await expect(
			viewObjectEntriesPage.saveObjectEntryButton
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot update a Picklist without the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		// Click View to open the picklist

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		// Verify the name field and save button are disabled

		await expect(
			listTypeDefinitionsPage.sidebarNameInput
		).toBeDisabled();

		await expect(
			listTypeDefinitionsPage.sidebarSaveButton
		).toBeDisabled();
	}
);

test(
	'LPD-78504 Cannot update single Object permission without Permissions Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['ADD_OBJECT_DEFINITION'],
				resourceName: OBJECT_PARENT,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create an object

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		const objectLabel = 'CustomObj' + getRandomInt();

		await page.getByLabel('Label').fill(objectLabel);

		await page.getByLabel('Plural Label').fill(objectLabel + 's');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Switch to admin to remove Owner PERMISSIONS

		await performUserSwitch(page, 'test');

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#owner_ACTION_PERMISSIONS')
			.uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch back to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await expect(
			page.getByRole('menuitem', {name: 'Permissions'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot update a single Object without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['ADD_OBJECT_DEFINITION'],
				resourceName: OBJECT_PARENT,
			},
			{
				actionIds: ['PERMISSIONS'],
				resourceName: OBJECT_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create an object

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		const objectLabel = 'CustomObj' + getRandomInt();

		await page.getByLabel('Label').fill(objectLabel);

		await page.getByLabel('Plural Label').fill(objectLabel + 's');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await page.reload();

		// Remove Owner UPDATE permission

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_UPDATE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Navigate to the object - fields should be disabled

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			objectLabel
		);

		await expect(page.getByLabel('Label')).toBeDisabled();

		await expect(
			page.getByRole('button', {name: 'Publish'})
		).toBeDisabled();
	}
);

test(
	'LPD-78504 Cannot update a single Picklist without Update Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['PERMISSIONS'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create a picklist

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await page.reload();

		// Remove Owner UPDATE permission

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_UPDATE').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// View picklist - name and save should be disabled

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'View'}).click();

		await expect(
			listTypeDefinitionsPage.sidebarNameInput
		).toBeDisabled();

		await expect(
			listTypeDefinitionsPage.sidebarSaveButton
		).toBeDisabled();
	}
);

test(
	'LPD-78504 Cannot view own single Object Entry without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Switch to limited user and create an entry

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		// Remove Owner VIEW permission on the entry

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_VIEW').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Entry should not be visible

		await expect(page.getByText('Entry Test')).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot view a Picklist without the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		// Picklist should not be visible (no VIEW on the model)

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot view a single Object without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['ADD_OBJECT_DEFINITION'],
				resourceName: OBJECT_PARENT,
			},
			{
				actionIds: ['PERMISSIONS'],
				resourceName: OBJECT_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create an object

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		const objectLabel = 'CustomObj' + getRandomInt();

		await page.getByLabel('Label').fill(objectLabel);

		await page.getByLabel('Plural Label').fill(objectLabel + 's');

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await page.reload();

		// Remove Owner VIEW permission

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectLabel
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_VIEW').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Object should not be visible

		await expect(page.getByText(objectLabel)).toBeHidden();
	}
);

test(
	'LPD-78504 Cannot view a single Picklist without View Owner permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['PERMISSIONS'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		// Switch to limited user and create a picklist

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await page.reload();

		// Remove Owner VIEW permission

		await page
			.getByRole('row', {name: picklistName})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe.locator('#owner_ACTION_VIEW').uncheck();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Picklist should not be visible

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklistName)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can update a Picklist with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['UPDATE', 'VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await listTypeDefinitionsPage
			.getPicklistLinkLocator(picklist.name)
			.click();

		const updatedName = 'Updated' + getRandomInt();

		await listTypeDefinitionsPage.sidebarNameInput.fill(updatedName);

		await listTypeDefinitionsPage.sidebarSaveButton.click();

		await page.reload();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(updatedName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can update single Object Entry permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Grant PERMISSIONS and VIEW on the specific entry to the role

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_PERMISSIONS')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		// User can open permissions and remove VIEW

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe2 = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe2
			.locator('#regular-role_ACTION_VIEW')
			.uncheck();

		await permissionIframe2.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe2);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Entry should no longer be visible

		await expect(page.getByText('Entry Test')).toBeHidden();
	}
);

test(
	'LPD-78504 Can update a single Object Entry with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Grant UPDATE and VIEW on the specific entry

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_UPDATE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		// Edit the entry

		await page.getByRole('link', {name: 'Entry Test'}).click();

		await page.getByLabel(fieldLabel, {exact: true}).fill('Test Entry');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry Test')).toBeHidden();

		await expect(page.getByText('Test Entry')).toBeVisible();
	}
);

test(
	'LPD-78504 Can update single Object permissions with Permissions permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Grant PERMISSIONS and VIEW on the specific object to the role

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_PERMISSIONS')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		// User can open permissions and remove VIEW

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe2 = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe2
			.locator('#regular-role_ACTION_VIEW')
			.uncheck();

		await permissionIframe2.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe2);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		await page.reload();

		// Object should no longer be visible

		await expect(
			page.getByText(objectDefinition.label['en_US'])
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can update a single Object with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Grant UPDATE and VIEW on the specific object to the role

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_UPDATE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			objectDefinition.label['en_US']
		);

		const updatedLabel = 'UpdatedObj' + getRandomInt();

		await page.getByLabel('Label').fill(updatedLabel);

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await viewObjectDefinitionsPage.goto();

		await expect(page.getByText(updatedLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Can update a single Picklist with the Update permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		// Grant UPDATE and VIEW on the specific picklist

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_UPDATE')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user

		await performUserSwitch(page, user.alternateName);

		await listTypeDefinitionsPage.goto();

		await listTypeDefinitionsPage
			.getPicklistLinkLocator(picklist.name)
			.click();

		const updatedName = 'UpdatedPicklist' + getRandomInt();

		await listTypeDefinitionsPage.sidebarNameInput.fill(updatedName);

		await listTypeDefinitionsPage.sidebarSaveButton.click();

		await listTypeDefinitionsPage.goto();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(updatedName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can view and edit Picklist with Add Picklist permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['ADD_LIST_TYPE_DEFINITION'],
				resourceName: PICKLIST_PARENT,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		const picklistName = 'Picklist' + getRandomInt();

		await listTypeDefinitionsPage.createPicklist(picklistName);

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklistName)
		).toBeVisible();

		// Edit the picklist

		await listTypeDefinitionsPage
			.getPicklistLinkLocator(picklistName)
			.click();

		const updatedName = 'UpdatedPicklist' + getRandomInt();

		await listTypeDefinitionsPage.sidebarNameInput.fill(updatedName);

		await listTypeDefinitionsPage.sidebarSaveButton.click();

		await page.reload();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(updatedName)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can view its own entry with only Add Object Entry permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
					scope: 1,
				},
				{
					actionIds: ['ADD_OBJECT_ENTRY'],
					primaryKey: String(company.companyId),
					resourceName: `com.liferay.object#${objectDefinition.id}`,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

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

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const fieldLabel = objectFields[0].label!['en_US'];

		// Add an entry

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: fieldLabel,
			objectFieldValue: 'Entry Test',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		// Navigate back and verify entry is visible

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry Test')).toBeVisible();
	}
);

test(
	'LPD-78504 Can view a Picklist with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const {user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL', 'VIEW'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW'],
				resourceName: PICKLIST_MODEL,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		await performUserSwitch(page, user.alternateName);

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		await listTypeDefinitionsPage.goto();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can view a single Object Entry with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
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

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const objectPortletId = `com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_${objectDefinition.className.split('#')[1]}`;

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'ObjPermRole' + getRandomInt(),
			rolePermissions: [
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName: objectPortletId,
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

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		userData[user.alternateName] = {
			name: user.givenName,
			password: 'test',
			surname: user.familyName,
		};

		await apiHelpers.headlessAdminUser.assignUserToRole(
			role.externalReferenceCode,
			user.id
		);

		// Grant PERMISSIONS and VIEW on the specific entry

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.click();

		await viewObjectEntriesPage.frontendDatasetPermissionsAction.click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_PERMISSIONS')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user and verify entry is visible

		await performUserSwitch(page, user.alternateName);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry Test')).toBeVisible();
	}
);

test(
	'LPD-78504 Can view a single Object with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: OBJECT_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		// Grant PERMISSIONS and VIEW on the specific object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickObjectDefinitionActionButton(
			objectDefinition.label['en_US']
		);

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_PERMISSIONS')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user and verify object is visible

		await performUserSwitch(page, user.alternateName);

		await viewObjectDefinitionsPage.goto();

		await expect(
			page.getByText(objectDefinition.label['en_US'])
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can view a single Picklist with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const {role, user} = await createRoleAndUser(apiHelpers, page, [
			{
				actionIds: ['ACCESS_IN_CONTROL_PANEL'],
				resourceName: PICKLIST_PORTLET,
			},
			{
				actionIds: ['VIEW_CONTROL_PANEL'],
				resourceName: '90',
			},
		]);

		const picklist =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: picklist.id,
			type: 'listTypeDefinition',
		});

		const listTypeDefinitionsPage = new ListTypeDefinitionsPage(page);

		// Grant PERMISSIONS and VIEW on the specific picklist

		await listTypeDefinitionsPage.goto();

		await page
			.getByRole('row', {name: picklist.name})
			.getByRole('button')
			.click();

		await page.getByRole('menuitem', {name: 'Permissions'}).click();

		const permissionIframe = page.frameLocator(
			'iframe[title="Permissions"]'
		);

		await permissionIframe
			.locator('#regular-role_ACTION_PERMISSIONS')
			.check();

		await permissionIframe
			.locator('#regular-role_ACTION_VIEW')
			.check();

		await permissionIframe.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(permissionIframe);

		await page.locator('.modal').getByLabel('Close', {exact: true}).click();

		// Switch to limited user and verify picklist is visible

		await performUserSwitch(page, user.alternateName);

		await listTypeDefinitionsPage.goto();

		await expect(
			listTypeDefinitionsPage.getPicklistLinkLocator(picklist.name)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Guest can add Object Entries with Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		// Enable widget page visibility for the object

		await page.goto(
			`/group/guest/-/object-definitions/${objectDefinition.externalReferenceCode}`
		);

		const widgetToggle = page.getByRole('switch', {
			name: 'Show Widget',
		});

		if (!(await widgetToggle.isChecked())) {
			await widgetToggle.click();

			await page.getByRole('button', {name: 'Save'}).click();

			await waitForAlert(page);
		}

		// Create a widget page and add the object portlet

		await page.goto(
			`/group${site.friendlyUrlPath}/-/site-builder/pages`
		);

		await page.getByLabel('New Page').click();

		await page.getByText('Widget Page', {exact: true}).click();

		await page.getByLabel('Name').fill('Object Page');

		await page.getByRole('button', {name: 'Add'}).click();

		await page.waitForLoadState('networkidle');

		// Grant Guest ADD_OBJECT_ENTRY and VIEW permissions

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const guestRole =
			await apiHelpers.headlessAdminUser.getRoleByName('Guest');

		await apiHelpers.jsonWebServicesResourcePermissionApiHelper.addResourcePermission(
			'ADD_OBJECT_ENTRY',
			String(company.companyId),
			String(site.id),
			`com.liferay.object#${objectDefinition.id}`,
			String(site.id),
			String(guestRole.id),
			'4'
		);

		await apiHelpers.jsonWebServicesResourcePermissionApiHelper.addResourcePermission(
			'VIEW',
			String(company.companyId),
			String(site.id),
			objectDefinition.className,
			String(site.id),
			String(guestRole.id),
			'4'
		);

		// Logout and verify guest can see entries and add button

		await performLogout(page);

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await expect(page.getByText('Entry Test')).toBeVisible();
	}
);

test(
	'LPD-78504 Guest cannot add Object Entries without Add permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		// Enable widget page visibility

		await page.goto(
			`/group/guest/-/object-definitions/${objectDefinition.externalReferenceCode}`
		);

		const widgetToggle = page.getByRole('switch', {
			name: 'Show Widget',
		});

		if (!(await widgetToggle.isChecked())) {
			await widgetToggle.click();

			await page.getByRole('button', {name: 'Save'}).click();

			await waitForAlert(page);
		}

		// Logout and verify guest cannot add entries

		await performLogout(page);

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await expect(
			page.getByLabel('Add ' + objectDefinition.label['en_US'])
		).toBeHidden();
	}
);

test(
	'LPD-78504 Guest cannot view Object Entries without View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		// Enable widget page visibility

		await page.goto(
			`/group/guest/-/object-definitions/${objectDefinition.externalReferenceCode}`
		);

		const widgetToggle = page.getByRole('switch', {
			name: 'Show Widget',
		});

		if (!(await widgetToggle.isChecked())) {
			await widgetToggle.click();

			await page.getByRole('button', {name: 'Save'}).click();

			await waitForAlert(page);
		}

		// Logout and navigate - guest should not see entries

		await performLogout(page);

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await expect(page.getByText('Entry Test')).toBeHidden();
	}
);

test(
	'LPD-78504 Guest can view Object Entries with View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			'c/' + objectDefinition.name.toLowerCase() + 's'
		);

		// Enable widget page visibility

		await page.goto(
			`/group/guest/-/object-definitions/${objectDefinition.externalReferenceCode}`
		);

		const widgetToggle = page.getByRole('switch', {
			name: 'Show Widget',
		});

		if (!(await widgetToggle.isChecked())) {
			await widgetToggle.click();

			await page.getByRole('button', {name: 'Save'}).click();

			await waitForAlert(page);
		}

		// Grant Guest VIEW permission on object entries

		const company =
			await apiHelpers.jsonWebServicesCompany.getCompanyByWebId(
				'liferay.com'
			);

		const guestRole =
			await apiHelpers.headlessAdminUser.getRoleByName('Guest');

		await apiHelpers.jsonWebServicesResourcePermissionApiHelper.addResourcePermission(
			'VIEW',
			String(company.companyId),
			String(site.id),
			objectDefinition.className,
			String(site.id),
			String(guestRole.id),
			'4'
		);

		// Logout and verify guest can see entries

		await performLogout(page);

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await expect(page.getByText('Entry Test')).toBeVisible();
	}
);
