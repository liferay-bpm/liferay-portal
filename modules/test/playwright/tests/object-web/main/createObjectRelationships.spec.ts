/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectRelationshipAPI} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
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

// Migrated from CreateObject.testcase

test.describe('Relationships Tab', () => {
	test(
		'Verify it is possible to create a Many to Many Relationship',
		{tag: '@LPS-135401'},
		async ({
			addNewObjectRelationshipModalPage,
			apiHelpers,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			const relationshipLabel = 'Relationship' + getRandomInt();

			const objectRelationship =
				await addNewObjectRelationshipModalPage.handleForm({
					manyRecordsOf: objectDefinition2.label['en_US'],
					objectRelationshipLabel: relationshipLabel,
					type: 'Many to Many',
				});

			apiHelpers.data.push({
				id: objectRelationship.id,
				type: 'objectRelationship',
			});

			await waitForAlert(
				page,
				'Success:Relationship was created successfully'
			);

			await expect(
				page.getByRole('link', {name: relationshipLabel})
			).toBeVisible();
		}
	);

	test(
		'Verify it is possible to create a One to Many Relationship',
		{tag: '@LPS-135400'},
		async ({
			addNewObjectRelationshipModalPage,
			apiHelpers,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			const relationshipLabel = 'Relationship' + getRandomInt();

			const objectRelationship =
				await addNewObjectRelationshipModalPage.handleForm({
					manyRecordsOf: objectDefinition2.label['en_US'],
					objectRelationshipLabel: relationshipLabel,
					type: 'One to Many',
				});

			apiHelpers.data.push({
				id: objectRelationship.id,
				type: 'objectRelationship',
			});

			await waitForAlert(
				page,
				'Success:Relationship was created successfully'
			);

			await expect(
				page.getByRole('link', {name: relationshipLabel})
			).toBeVisible();
		}
	);

	test(
		'Verify it is possible to cancel the creation of a Relationship',
		{tag: '@LPS-135400'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await objectRelationshipFormPage.labelInput.fill(
				'Custom Relationship'
			);

			await objectRelationshipFormPage.selectType('One to Many');

			await objectRelationshipFormPage.selectManyRecordsOf(
				objectDefinition.label['en_US']
			);

			await objectRelationshipsPage.cancelButton.click();

			await expect(page.getByText('No Results Found')).toBeVisible();
		}
	);

	test(
		'Verify it is possible to delete a Relationship',
		{tag: '@LPS-135400'},
		async ({apiHelpers, objectRelationshipsPage, page}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipLabel = 'Relationship' + getRandomInt();
			const relationshipName = 'relationship' + getRandomInt();

			const {body: _objectRelationship} =
				await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
					objectDefinition1.externalReferenceCode!,
					{
						label: {en_US: relationshipLabel},
						name: relationshipName,
						objectDefinitionExternalReferenceCode2:
							objectDefinition2.externalReferenceCode,
						objectDefinitionId2: objectDefinition2.id,
						objectDefinitionName2: objectDefinition2.name,
						type: 'oneToMany',
					}
				);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.actionsButton.click();

			await objectRelationshipsPage.deleteObjectRelationshipOption.click();

			await page
				.getByPlaceholder('Confirm relationship name', {exact: false})
				.fill(relationshipName);

			await page.getByRole('button', {name: 'Delete'}).click();

			await expect(page.getByText('No Results Found')).toBeVisible({
				timeout: 15000,
			});
		}
	);

	test(
		'Verify it is not possible to create duplicated Relationship name',
		{tag: '@LPS-135400'},
		async ({
			addNewObjectRelationshipModalPage,
			apiHelpers,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipName = 'relationship' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await addNewObjectRelationshipModalPage.objectRelationshipFormPage.labelInput.fill(
				'Relationship'
			);

			await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectType(
				'One to Many'
			);

			await addNewObjectRelationshipModalPage.objectRelationshipFormPage.selectManyRecordsOf(
				objectDefinition2.label['en_US']
			);

			await addNewObjectRelationshipModalPage.objectRelationshipFormPage.saveButton.click();

			await expect(
				page.getByText('This name is already in use. Try another.')
			).toBeVisible();
		}
	);

	test(
		'Verify it is not possible to leave the Relationship Name blank',
		{tag: '@LPS-135400'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await objectRelationshipFormPage.selectType('One to Many');

			await objectRelationshipFormPage.selectManyRecordsOf(
				objectDefinition.label['en_US']
			);

			await objectRelationshipFormPage.saveButton.click();

			await expect(page.getByText('Required')).toBeVisible();
		}
	);

	test(
		'Verify it is not possible to leave the Relationship Object blank',
		{tag: '@LPS-135400'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await objectRelationshipFormPage.labelInput.fill(
				'Test Relationship'
			);

			await objectRelationshipFormPage.selectType('One to Many');

			await objectRelationshipFormPage.saveButton.click();

			await expect(page.getByText('Required')).toBeVisible();
		}
	);

	test(
		'Verify it is not possible to leave the Relationship Type blank',
		{tag: '@LPS-135400'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await objectRelationshipFormPage.labelInput.fill(
				'Test Relationship'
			);

			await objectRelationshipFormPage.saveButton.click();

			await expect(page.getByText('Required')).toBeVisible();
		}
	);

	test(
		'Verify it is possible to view a Relationship',
		{tag: '@LPS-135400'},
		async ({apiHelpers, objectRelationshipsPage, page}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipLabel = 'ViewRelationship' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'viewRelationship' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await expect(page.getByText(relationshipLabel)).toBeVisible();
		}
	);

	test(
		'Verify it is possible to update a Relationship',
		{tag: '@LPS-135400'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipLabel = 'Relationship' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'relationship' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await page.getByText(relationshipLabel).click();

			const newLabel = 'UpdatedRelationship' + getRandomInt();

			await objectRelationshipFormPage.labelInput.fill(newLabel);

			await objectRelationshipFormPage.saveButton.click();

			await waitForAlert(page);

			await expect(page.getByText(newLabel)).toBeVisible();
		}
	);

	test(
		'Verify the empty state message when there is no Relationship',
		{tag: '@LPS-135400'},
		async ({apiHelpers, objectRelationshipsPage, page}) => {
			const objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await expect(page.getByText('No Results Found')).toBeVisible();
		}
	);

	test(
		'Verify that the Object Name is displayed on the Relationship tab when a Relationship is created',
		{tag: '@LPS-139603'},
		async ({apiHelpers, objectRelationshipsPage, page}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipLabel = 'Relationship' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'relationship' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			const relationshipRow = page
				.getByRole('row')
				.filter({hasText: relationshipLabel});

			await expect(
				relationshipRow.getByText(objectDefinition2.label['en_US'])
			).toBeVisible();
		}
	);

	test(
		'Verify that by default the Prevent deletion type of Relationship is selected',
		{tag: '@LPS-135401'},
		async ({
			apiHelpers,
			objectRelationshipFormPage,
			objectRelationshipsPage,
			page,
		}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await objectRelationshipsPage.addObjectRelationshipButton.click();

			await objectRelationshipFormPage.selectType('One to Many');

			await expect(
				page.getByText('Prevent', {exact: true})
			).toBeVisible();
		}
	);

	test(
		'Verify that the Relationship is created on both objects for a Many to Many Relationship',
		{tag: '@LPS-135401'},
		async ({apiHelpers, objectRelationshipsPage, page}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient =
				await apiHelpers.buildRestClient(ObjectRelationshipAPI);

			const relationshipLabel = 'ManyToMany' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'manytomany' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'manyToMany',
				}
			);

			await objectRelationshipsPage.goto(
				objectDefinition1.label['en_US']
			);

			await expect(page.getByText(relationshipLabel)).toBeVisible();

			await objectRelationshipsPage.goto(
				objectDefinition2.label['en_US']
			);

			await expect(page.getByText(relationshipLabel)).toBeVisible();
		}
	);

	test.fixme(
		'Verify that when the admin user deletes the relationship between Account and the Object the Account Restriction is disabled',
		{tag: '@LPS-151877'},
		async ({
			apiHelpers,
			editObjectDetailsPage,
			objectRelationshipsPage,
			page,
		}) => {
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

			await objectRelationshipsPage.goto(objectDefinition.label['en_US']);

			await objectRelationshipsPage.actionsButton.click();
			await objectRelationshipsPage.deleteObjectRelationshipOption.click();

			await page
				.getByPlaceholder('Confirm relationship name', {exact: false})
				.fill('accountEntryId');

			await page.getByRole('button', {name: 'Delete'}).click();

			await page.waitForTimeout(2000);

			await editObjectDetailsPage.goto(objectDefinition.label['en_US']);
			await editObjectDetailsPage.goToDetailsTab();

			await expect(
				page.getByRole('switch', {name: 'Account Restriction'})
			).not.toBeChecked();
		}
	);
});
