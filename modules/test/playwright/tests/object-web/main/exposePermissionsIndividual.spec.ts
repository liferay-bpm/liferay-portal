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

test(
	'LPD-78504 Can change permissions assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanChangePermissionsAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'PermissionTestEntry'},
			applicationName
		);

		// Get current permissions for the entry

		const permissionsUrl = `${apiHelpers.baseUrl}${applicationName}/${entry.id}/permissions`;

		const initialPermissions = await apiHelpers.get(permissionsUrl);

		expect(initialPermissions.items).toBeDefined();
		expect(Array.isArray(initialPermissions.items)).toBe(true);

		// Find the Power User role permissions

		const powerUserPermission = initialPermissions.items.find(
			(item: {roleName: string}) => item.roleName === 'Power User'
		);

		// Change permissions for Power User to include VIEW and UPDATE

		const updatedPermissions = await apiHelpers.put(permissionsUrl, {
			data: {
				items: [
					{
						actionIds: ['VIEW', 'UPDATE'],
						roleName: 'Power User',
					},
				],
			},
		});

		// Verify the updated permissions were applied

		const fetchedPermissions = await apiHelpers.get(permissionsUrl);

		const updatedPowerUser = fetchedPermissions.items.find(
			(item: {roleName: string}) => item.roleName === 'Power User'
		);

		expect(updatedPowerUser).toBeDefined();
		expect(updatedPowerUser.actionIds).toContain('VIEW');
		expect(updatedPowerUser.actionIds).toContain('UPDATE');
	}
);

test(
	'LPD-78504 Can change permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanChangePermissionsOfNewRoleAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'RolePermissionEntry'},
			applicationName
		);

		const permissionsUrl = `${apiHelpers.baseUrl}${applicationName}/${entry.id}/permissions`;

		// Assign VIEW permission for the User role on the entry

		await apiHelpers.put(permissionsUrl, {
			data: {
				items: [
					{
						actionIds: ['VIEW'],
						roleName: 'User',
					},
				],
			},
		});

		// Verify the User role has VIEW permission

		const permissionsAfterAdd = await apiHelpers.get(permissionsUrl);

		const userRoleAfterAdd = permissionsAfterAdd.items.find(
			(item: {roleName: string}) => item.roleName === 'User'
		);

		expect(userRoleAfterAdd).toBeDefined();
		expect(userRoleAfterAdd.actionIds).toContain('VIEW');

		// Change the User role permissions to VIEW and DELETE

		await apiHelpers.put(permissionsUrl, {
			data: {
				items: [
					{
						actionIds: ['VIEW', 'DELETE'],
						roleName: 'User',
					},
				],
			},
		});

		// Verify the User role now has both VIEW and DELETE

		const permissionsAfterChange = await apiHelpers.get(permissionsUrl);

		const userRoleAfterChange = permissionsAfterChange.items.find(
			(item: {roleName: string}) => item.roleName === 'User'
		);

		expect(userRoleAfterChange).toBeDefined();
		expect(userRoleAfterChange.actionIds).toContain('VIEW');
		expect(userRoleAfterChange.actionIds).toContain('DELETE');
	}
);

test(
	'LPD-78504 Can empty permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanEmptyPermissionsOfNewRoleAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'EmptyPermissionEntry'},
			applicationName
		);

		const permissionsUrl = `${apiHelpers.baseUrl}${applicationName}/${entry.id}/permissions`;

		// First assign VIEW and DELETE permissions for the User role

		await apiHelpers.put(permissionsUrl, {
			data: {
				items: [
					{
						actionIds: ['VIEW', 'DELETE'],
						roleName: 'User',
					},
				],
			},
		});

		// Verify permissions were assigned

		const permissionsAfterAdd = await apiHelpers.get(permissionsUrl);

		const userRoleAfterAdd = permissionsAfterAdd.items.find(
			(item: {roleName: string}) => item.roleName === 'User'
		);

		expect(userRoleAfterAdd).toBeDefined();
		expect(userRoleAfterAdd.actionIds).toContain('VIEW');
		expect(userRoleAfterAdd.actionIds).toContain('DELETE');

		// Empty all permissions for the User role by sending an empty actionIds array

		await apiHelpers.put(permissionsUrl, {
			data: {
				items: [
					{
						actionIds: [],
						roleName: 'User',
					},
				],
			},
		});

		// Verify the User role no longer has any permissions

		const permissionsAfterEmpty = await apiHelpers.get(permissionsUrl);

		const userRoleAfterEmpty = permissionsAfterEmpty.items.find(
			(item: {roleName: string}) => item.roleName === 'User'
		);

		if (userRoleAfterEmpty) {
			expect(userRoleAfterEmpty.actionIds).toHaveLength(0);
		}
	}
);

test(
	'LPD-78504 Can get company permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetCompanyPermissionsOfNewRoleAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		// Get company-level permissions for the object definition

		const companyPermissionsUrl = `${apiHelpers.baseUrl}${applicationName}/permissions`;

		const companyPermissions = await apiHelpers.get(companyPermissionsUrl);

		expect(companyPermissions.items).toBeDefined();
		expect(Array.isArray(companyPermissions.items)).toBe(true);
		expect(companyPermissions.items.length).toBeGreaterThan(0);

		// Verify that built-in roles are present in company permissions

		const roleNames = companyPermissions.items.map(
			(item: {roleName: string}) => item.roleName
		);

		expect(roleNames).toContain('Owner');
	}
);

test(
	'LPD-78504 Can get permissions assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetPermissionsAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'GetPermissionEntry'},
			applicationName
		);

		// Get permissions for the entry

		const permissionsUrl = `${apiHelpers.baseUrl}${applicationName}/${entry.id}/permissions`;

		const permissions = await apiHelpers.get(permissionsUrl);

		expect(permissions.items).toBeDefined();
		expect(Array.isArray(permissions.items)).toBe(true);
		expect(permissions.items.length).toBeGreaterThan(0);

		// Verify that the Owner role is present with expected permissions

		const ownerPermission = permissions.items.find(
			(item: {roleName: string}) => item.roleName === 'Owner'
		);

		expect(ownerPermission).toBeDefined();
		expect(ownerPermission.actionIds).toBeDefined();
		expect(Array.isArray(ownerPermission.actionIds)).toBe(true);
		expect(ownerPermission.actionIds.length).toBeGreaterThan(0);

		// Owner should have at least DELETE, UPDATE, VIEW, and PERMISSIONS

		expect(ownerPermission.actionIds).toContain('DELETE');
		expect(ownerPermission.actionIds).toContain('UPDATE');
		expect(ownerPermission.actionIds).toContain('VIEW');
		expect(ownerPermission.actionIds).toContain('PERMISSIONS');
	}
);

test(
	'LPD-78504 Cannot empty company permissions of new role assigned to object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CannotEmptyCompanyPermissionsOfNewRoleAssignedToObjectEntry

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

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		const companyPermissionsUrl = `${apiHelpers.baseUrl}${applicationName}/permissions`;

		// Get the current company permissions

		const initialPermissions = await apiHelpers.get(companyPermissionsUrl);

		expect(initialPermissions.items).toBeDefined();
		expect(initialPermissions.items.length).toBeGreaterThan(0);

		// Attempt to empty permissions for a built-in role (e.g., Owner)

		const response = await apiHelpers.putResponse(companyPermissionsUrl, {
			data: {
				items: [
					{
						actionIds: [],
						roleName: 'Owner',
					},
				],
			},
		});

		// The request should either fail or the permissions should remain unchanged

		const statusCode = response.status();

		if (statusCode === 200) {
			// Even if status is 200, verify the Owner permissions were not emptied

			const permissionsAfter =
				await apiHelpers.get(companyPermissionsUrl);

			const ownerPermission = permissionsAfter.items.find(
				(item: {roleName: string}) => item.roleName === 'Owner'
			);

			expect(ownerPermission).toBeDefined();
			expect(ownerPermission.actionIds.length).toBeGreaterThan(0);
		}
		else {
			// Request was rejected, which is the expected behavior

			expect([400, 403, 422]).toContain(statusCode);
		}
	}
);
