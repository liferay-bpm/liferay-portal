/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinition,
	ObjectFieldAPI,
} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
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
	'LPD-78504 Can create user and set value of property added to system object',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const {items} =
			await apiHelpers.objectAdmin.getAllObjectDefinitions();

		const userObjectDefinition = items.find(
			(item: ObjectDefinition) =>
				item.externalReferenceCode === 'L_USER'
		);

		expect(userObjectDefinition).toBeDefined();

		const customFieldName = 'customfield' + getRandomInt();

		const objectFieldAPIClient =
			await apiHelpers.buildRestClient(ObjectFieldAPI);

		const {body: createdField} =
			await objectFieldAPIClient.postObjectDefinitionObjectField(
				userObjectDefinition.id,
				{
					DBType: 'String',
					businessType: 'Text',
					label: {en_US: customFieldName},
					name: customFieldName,
					required: false,
				}
			);

		apiHelpers.data.push({
			id: createdField.id + '_' + userObjectDefinition.id,
			type: 'objectField',
		});

		const randomNumber = getRandomInt();

		const customFieldValue = 'CustomValue' + randomNumber;

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount({
				[customFieldName]: customFieldValue,
			} as any);

		const fetchedUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${userAccount.id}`
		);

		expect(fetchedUser[customFieldName]).toBe(customFieldValue);

		await objectFieldAPIClient.deleteObjectField(createdField.id);
	}
);

test(
	'LPD-78504 Can update value of property added to system object with patch request',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const {items} =
			await apiHelpers.objectAdmin.getAllObjectDefinitions();

		const userObjectDefinition = items.find(
			(item: ObjectDefinition) =>
				item.externalReferenceCode === 'L_USER'
		);

		expect(userObjectDefinition).toBeDefined();

		const customFieldName = 'customfield' + getRandomInt();

		const objectFieldAPIClient =
			await apiHelpers.buildRestClient(ObjectFieldAPI);

		const {body: createdField} =
			await objectFieldAPIClient.postObjectDefinitionObjectField(
				userObjectDefinition.id,
				{
					DBType: 'String',
					businessType: 'Text',
					label: {en_US: customFieldName},
					name: customFieldName,
					required: false,
				}
			);

		apiHelpers.data.push({
			id: createdField.id + '_' + userObjectDefinition.id,
			type: 'objectField',
		});

		const initialValue = 'InitialValue' + getRandomInt();

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount({
				[customFieldName]: initialValue,
			} as any);

		const updatedValue = 'UpdatedValue' + getRandomInt();

		await apiHelpers.patch(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${userAccount.id}`,
			{[customFieldName]: updatedValue}
		);

		const fetchedUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${userAccount.id}`
		);

		expect(fetchedUser[customFieldName]).toBe(updatedValue);

		await objectFieldAPIClient.deleteObjectField(createdField.id);
	}
);

test(
	'LPD-78504 Can update value of property added to system object with put request',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const {items} =
			await apiHelpers.objectAdmin.getAllObjectDefinitions();

		const userObjectDefinition = items.find(
			(item: ObjectDefinition) =>
				item.externalReferenceCode === 'L_USER'
		);

		expect(userObjectDefinition).toBeDefined();

		const customFieldName = 'customfield' + getRandomInt();

		const objectFieldAPIClient =
			await apiHelpers.buildRestClient(ObjectFieldAPI);

		const {body: createdField} =
			await objectFieldAPIClient.postObjectDefinitionObjectField(
				userObjectDefinition.id,
				{
					DBType: 'String',
					businessType: 'Text',
					label: {en_US: customFieldName},
					name: customFieldName,
					required: false,
				}
			);

		apiHelpers.data.push({
			id: createdField.id + '_' + userObjectDefinition.id,
			type: 'objectField',
		});

		const initialValue = 'InitialValue' + getRandomInt();

		const userAccount =
			await apiHelpers.headlessAdminUser.postUserAccount({
				[customFieldName]: initialValue,
			} as any);

		const updatedValue = 'PutUpdatedValue' + getRandomInt();

		await apiHelpers.put(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${userAccount.id}`,
			{
				data: {
					alternateName: userAccount.alternateName,
					emailAddress: userAccount.emailAddress,
					familyName: userAccount.familyName,
					givenName: userAccount.givenName,
					[customFieldName]: updatedValue,
				},
			}
		);

		const fetchedUser = await apiHelpers.get(
			`${apiHelpers.baseUrl}headless-admin-user/v1.0/user-accounts/${userAccount.id}`
		);

		expect(fetchedUser[customFieldName]).toBe(updatedValue);

		await objectFieldAPIClient.deleteObjectField(createdField.id);
	}
);
