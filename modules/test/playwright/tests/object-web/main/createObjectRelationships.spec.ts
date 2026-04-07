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
import {PageEditorPage} from '../../../pages/layout-content-page-editor-web/PageEditorPage';
import {getRandomInt} from '../../../utils/getRandomInt';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';
import getFragmentDefinition from '../../layout-content-page-editor-web/main/utils/getFragmentDefinition';
import getPageDefinition from '../../layout-content-page-editor-web/main/utils/getPageDefinition';
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

	test(
		'Verify that other fields are not deleted when a Relationship field is deleted after a Relationship is deleted',
		{tag: '@LPS-140097'},
		async ({apiHelpers, objectFieldsPage, objectRelationshipsPage, page}) => {
			const objectFields = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			const relationshipLabel = 'Relationship' + getRandomInt();
			const relationshipName = 'relationship' + getRandomInt();

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

			await objectRelationshipsPage.goto(objectDefinition1.label['en_US']);

			await objectRelationshipsPage.actionsButton.click();
			await objectRelationshipsPage.deleteObjectRelationshipOption.click();

			await page
				.getByPlaceholder('Confirm relationship name', {exact: false})
				.fill(relationshipName);

			await page.getByRole('button', {name: 'Delete'}).click();

			await page.waitForTimeout(2000);

			await objectFieldsPage.fieldsTabItem.click();

			await expect(
				page
					.getByRole('row')
					.filter({hasText: objectFields[0].label!['en_US']})
			).toBeVisible();
		}
	);

	test(
		'Verify that the Relationship field is not created on Many to Many',
		{tag: '@LPS-135401'},
		async ({apiHelpers, objectFieldsPage, page}) => {
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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

			await objectFieldsPage.goto(objectDefinition2.label['en_US']);

			await expect(
				page.getByRole('row').filter({hasText: relationshipLabel})
			).toBeHidden();
		}
	);
});

test.describe('Object Entries Page', () => {
	test(
		'Verify it is possible to add a relation with an entry through the Relationship field',
		{tag: '@LPS-135400'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
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
			const parentEntry = await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();
			await page
				.getByRole('option', {name: parentEntry.id!.toString()})
				.first()
				.click();

			await viewObjectEntriesPage.saveObjectEntryButton.click();

			await expect(viewObjectEntriesPage.successMessage).toBeVisible();
		}
	);

	test(
		'Verify it is possible to add many relations through the Relationship tab',
		{tag: '@LPS-135400'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry1'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry2'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('tab', {name: relationshipLabel}).click();

			await page.getByRole('button', {name: 'Add'}).click();

			await page.getByRole('checkbox').first().check();
			await page.getByRole('checkbox').nth(1).check();

			await page.getByRole('button', {name: 'Add'}).click();

			await expect(page.getByText('ChildEntry1')).toBeVisible();
			await expect(page.getByText('ChildEntry2')).toBeVisible();
		}
	);

	test(
		'Verify it is not possible to submit an entry with an invalid value on the Relationship field',
		{tag: '@LPS-135400'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: [{businessType: 'Text', required: false}],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).fill('invalid_value');

			await viewObjectEntriesPage.saveObjectEntryButton.click();

			await expect(page.getByText('Error')).toBeVisible();
		}
	);

	test(
		'Verify that it is possible to relate to many other entries on both objects',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
					status: {code: 0},
					titleObjectFieldName: objectFields2[0].name,
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'manyToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'Entry1A'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'Entry1B'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'Entry2A'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'Entry2B'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.getByText('Entry1A').click();

			await page.getByRole('tab', {name: relationshipLabel}).click();

			await page.getByRole('button', {name: 'Add'}).click();

			await page.getByRole('checkbox').first().check();
			await page.getByRole('checkbox').nth(1).check();

			await page.getByRole('button', {name: 'Add'}).click();

			await expect(page.getByText('Entry2A')).toBeVisible();
			await expect(page.getByText('Entry2B')).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a BigDecimal type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['PrecisionDecimal'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 123.45},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option', {name: '123.45'})).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a Boolean type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Boolean'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: true},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option', {name: 'true'})).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a Date type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Date'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: '2024-01-15'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option').first()).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a Double type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Decimal'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 99.99},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option', {name: '99.99'})).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of an Integer type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Integer'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 42},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option', {name: '42'})).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a Long type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['LongInteger'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 999999},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option', {name: '999999'})).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title is displayed on the Relationship tab',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
					status: {code: 0},
					titleObjectFieldName: objectFields2[0].name,
				});

			apiHelpers.data.push({
				id: objectDefinition1.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinition2.id,
				type: 'objectDefinition',
			});

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentTitle'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildTitle'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.getByText('ParentTitle').click();

			await page.getByRole('tab', {name: relationshipLabel}).click();

			await page.getByRole('button', {name: 'Add'}).click();

			await page.getByRole('checkbox').first().check();

			await page.getByRole('button', {name: 'Add'}).click();

			await expect(page.getByText('ChildTitle')).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a Picklist type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const listTypeDefinition =
				await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

			apiHelpers.data.push({
				id: listTypeDefinition.id,
				type: 'listTypeDefinition',
			});

			const objectFields1 = generateObjectFields({
				listTypeDefinitionExternalReferenceCode:
					listTypeDefinition.externalReferenceCode,
				objectFieldBusinessTypes: ['Picklist'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{
					[objectFields1[0].name!]: {
						key: listTypeDefinition.listTypeEntries?.[0]?.key,
					},
				},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(page.getByRole('option').first()).toBeVisible();
		}
	);

	test(
		'Verify the Object Entry Title of a String type is displayed on the Relationship field when adding an entry',
		{tag: '@LPS-139803'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
					titleObjectFieldName: objectFields1[0].name,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);
			const relationshipLabel = 'Rel' + getRandomInt();

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					label: {en_US: relationshipLabel},
					name: 'rel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'StringTitle'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);
			await viewObjectEntriesPage.clickAddObjectEntry(
				objectDefinition2.label['en_US']
			);

			await page.getByLabel(relationshipLabel).click();

			await expect(
				page.getByRole('option', {name: 'StringTitle'})
			).toBeVisible();
		}
	);

	test(
		'Verify that when adding an entry that was already related to another it will keep related to both entries',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
					type: 'manyToMany',
				}
			);
			const _entry1 = await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'Entry1'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			const _entry2 = await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'Entry2'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			const _childEntry = await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.getByText('Entry1').click();

			await page.getByRole('tab', {name: relationshipLabel}).click();

			await page.getByRole('button', {name: 'Add'}).click();

			await page.getByRole('checkbox').first().check();

			await page.getByRole('button', {name: 'Add'}).click();

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.getByText('Entry2').click();

			await page.getByRole('tab', {name: relationshipLabel}).click();

			await page.getByRole('button', {name: 'Add'}).click();

			await page.getByRole('checkbox').first().check();

			await page.getByRole('button', {name: 'Add'}).click();

			await expect(page.getByText('ChildEntry')).toBeVisible();
		}
	);
});

test.describe('Relationship Lifecycle and Visibility', () => {
	test(
		'Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted but not its relation',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'cascade',
					label: {en_US: 'CascadeRel' + getRandomInt()},
					name: 'cascadeRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			const _parentEntry = await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await waitForAlert(page);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await expect(page.getByText('ParentEntry')).toBeVisible();
		}
	);

	test(
		'Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the parent Object and its relations to be deleted',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'cascade',
					label: {en_US: 'CascadeRel' + getRandomInt()},
					name: 'cascadeRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await waitForAlert(page);

			await expect(page.getByText('ParentEntry')).toBeHidden();

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await expect(page.getByText('ChildEntry')).toBeHidden();
		}
	);

	test(
		'Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted and its relation to be disassociated',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'disassociate',
					label: {en_US: 'DisassociateRel' + getRandomInt()},
					name: 'disassociateRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await waitForAlert(page);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await expect(page.getByText('ParentEntry')).toBeVisible();
		}
	);

	test(
		'Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the parent Object to be deleted and its relations to be disassociated',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'disassociate',
					label: {en_US: 'DisassociateRel' + getRandomInt()},
					name: 'disassociateRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await waitForAlert(page);

			await expect(page.getByText('ParentEntry')).toBeHidden();

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await expect(page.getByText('ChildEntry')).toBeVisible();
		}
	);

	test(
		'Verify Prevent deletion type of Relationship One to Many will allow the user to delete an entry with relation from the child Object',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'prevent',
					label: {en_US: 'PreventRel' + getRandomInt()},
					name: 'preventRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition2.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await waitForAlert(page);

			await expect(page.getByText('ChildEntry')).toBeHidden();
		}
	);

	test(
		'Verify Prevent deletion type of Relationship One to Many will not allow the user to delete an entry with relation from the parent Object',
		{tag: '@LPS-135401'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {
			const objectFields1 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition1 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields1,
					status: {code: 0},
				});

			const objectFields2 = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinition2 =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFields2,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinition1.externalReferenceCode!,
				{
					deletionType: 'prevent',
					label: {en_US: 'PreventRel' + getRandomInt()},
					name: 'preventRel' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinition2.externalReferenceCode,
					objectDefinitionId2: objectDefinition2.id,
					objectDefinitionName2: objectDefinition2.name,
					type: 'oneToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields1[0].name!]: 'ParentEntry'},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await apiHelpers.objectEntry.postObjectEntry(
				{[objectFields2[0].name!]: 'ChildEntry'},
				'c/' + objectDefinition2.name!.toLowerCase() + 's'
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await page.getByRole('button', {name: 'Actions'}).click();
			await page.getByRole('menuitem', {name: 'Delete'}).click();
			await page.getByRole('button', {name: 'Delete'}).click();

			await expect(
				page.getByText(
					'Object cannot be deleted because it is linked to one or more related entries'
				)
			).toBeVisible();
		}
	);

	test(
		'Verify the Relationship field will not be displayed on a Collection Display with List Style set as Table when the parent object is inactivated',
		{tag: '@LPS-139005'},
		async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
			const objectFieldsA = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectFieldsB = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinitionA =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFieldsA,
					status: {code: 0},
				});

			const objectDefinitionB =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFieldsB,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinitionA.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinitionB.id,
				type: 'objectDefinition',
			});

			// Create a one-to-many relationship from A to B

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinitionA.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: 'relationship' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinitionB.externalReferenceCode,
					objectDefinitionId2: objectDefinitionB.id,
					objectDefinitionName2: objectDefinitionB.name,
					type: 'oneToMany',
				}
			);

			// Inactivate object A (the parent)

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinitionA.name
			);

			// Create a content page and try to add Collection Display for object B

			const headingDefinition = getFragmentDefinition({
				id: getRandomString(),
				key: 'BASIC_COMPONENT-heading',
			});

			const layout = await apiHelpers.headlessDelivery.createSitePage({
				pageDefinition: getPageDefinition([headingDefinition]),
				siteId: site.id,
				title: getRandomString(),
			});

			const pageEditorPage = new PageEditorPage(page);

			await pageEditorPage.goto(layout, site.friendlyUrlPath);

			// Map heading to object B items

			await page.getByText('Heading Example', {exact: true}).dblclick();

			await page.getByLabel('Select Item').click();

			const selectFrame = page.frameLocator('iframe[title="Select"]');

			await selectFrame
				.getByRole('menuitem', {name: objectDefinitionB.name})
				.click();

			// Verify the relationship field from object A is not available in field mapping

			await expect(
				selectFrame.getByText(objectDefinitionA.label['en_US'])
			).toBeHidden();

			// Reactivate for cleanup

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinitionA.name
			);
		}
	);

	test(
		'Verify the Relationship field will not be displayed to be selected for a Page fragment when the parent object is inactivated',
		{tag: '@LPS-139005'},
		async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
			const objectFieldsA = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectFieldsB = generateObjectFields({
				objectFieldBusinessTypes: ['Text'],
			});

			const objectDefinitionA =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFieldsA,
					status: {code: 0},
				});

			const objectDefinitionB =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields: objectFieldsB,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinitionA.id,
				type: 'objectDefinition',
			});
			apiHelpers.data.push({
				id: objectDefinitionB.id,
				type: 'objectDefinition',
			});

			// Create a one-to-many relationship from A to B

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				objectDefinitionA.externalReferenceCode!,
				{
					label: {en_US: 'Relationship'},
					name: 'relationship' + getRandomInt(),
					objectDefinitionExternalReferenceCode2:
						objectDefinitionB.externalReferenceCode,
					objectDefinitionId2: objectDefinitionB.id,
					objectDefinitionName2: objectDefinitionB.name,
					type: 'oneToMany',
				}
			);

			// Add entry for object B

			const applicationNameB =
				'c/' + objectDefinitionB.name.toLowerCase() + 's';
			const fieldNameB = objectDefinitionB.objectFields![0].name;

			await apiHelpers.objectEntry.postObjectEntry(
				{[fieldNameB!]: 'Entry'},
				applicationNameB
			);

			// Inactivate object A (the parent)

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinitionA.name
			);

			// Create a content page with a Heading fragment

			const headingDefinition = getFragmentDefinition({
				id: getRandomString(),
				key: 'BASIC_COMPONENT-heading',
			});

			const layout = await apiHelpers.headlessDelivery.createSitePage({
				pageDefinition: getPageDefinition([headingDefinition]),
				siteId: site.id,
				title: getRandomString(),
			});

			const pageEditorPage = new PageEditorPage(page);

			await pageEditorPage.goto(layout, site.friendlyUrlPath);

			// Map heading to object B items

			await page.getByText('Heading Example', {exact: true}).dblclick();

			await page.getByLabel('Select Item').click();

			const selectFrame = page.frameLocator('iframe[title="Select"]');

			await selectFrame
				.getByRole('menuitem', {name: objectDefinitionB.name})
				.click();

			// Verify the relationship field from object A is not in the field name options

			await expect(
				selectFrame.getByText(objectDefinitionA.label['en_US'])
			).toBeHidden();

			// Reactivate for cleanup

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinitionA.name
			);
		}
	);

	test(
		'Verify the Relationship field is no longer displayed when the parent object is inactivated for One to Many',
		{tag: '@LPS-139005'},
		async ({apiHelpers, objectFieldsPage, page, viewObjectDefinitionsPage}) => {
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition1.name
			);

			await objectFieldsPage.goto(objectDefinition2.label['en_US']);

			await expect(
				page.getByRole('row').filter({hasText: relationshipLabel})
			).toBeHidden();
		}
	);

	test(
		'Verify the Relationship field is displayed again when the parent object is reactivated for One to Many',
		{tag: '@LPS-139005'},
		async ({apiHelpers, objectFieldsPage, page, viewObjectDefinitionsPage}) => {
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition1.name
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition1.name
			);

			await objectFieldsPage.goto(objectDefinition2.label['en_US']);

			await expect(
				page.getByRole('row').filter({hasText: relationshipLabel})
			).toBeVisible();
		}
	);

	test(
		'Verify the Relationship tab is no longer displayed when the other object is inactivated for Many to Many',
		{tag: '@LPS-139005'},
		async ({
			apiHelpers,
			page,
			viewObjectDefinitionsPage,
			viewObjectEntriesPage,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
					type: 'manyToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await expect(
				page.getByRole('tab', {name: relationshipLabel})
			).toBeHidden();
		}
	);

	test(
		'Verify the Relationship tab is no longer displayed when the child object is inactivated for One to Many',
		{tag: '@LPS-139005'},
		async ({
			apiHelpers,
			page,
			viewObjectDefinitionsPage,
			viewObjectEntriesPage,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
			await apiHelpers.objectEntry.postObjectEntry(
				{},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await expect(
				page.getByRole('tab', {name: relationshipLabel})
			).toBeHidden();
		}
	);

	test(
		'Verify the Relationship tab is displayed again when the other object is reactivated for Many to Many',
		{tag: '@LPS-139005'},
		async ({
			apiHelpers,
			page,
			viewObjectDefinitionsPage,
			viewObjectEntriesPage,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
					type: 'manyToMany',
				}
			);
			await apiHelpers.objectEntry.postObjectEntry(
				{},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await expect(
				page.getByRole('tab', {name: relationshipLabel})
			).toBeVisible();
		}
	);

	test(
		'Verify the Relationship tab is displayed again when the child object is reactivated for One to Many',
		{tag: '@LPS-139005'},
		async ({
			apiHelpers,
			page,
			viewObjectDefinitionsPage,
			viewObjectEntriesPage,
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

			const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
				ObjectRelationshipAPI
			);

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
			await apiHelpers.objectEntry.postObjectEntry(
				{},
				'c/' + objectDefinition1.name!.toLowerCase() + 's'
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectDefinitionsPage.goto();

			await viewObjectDefinitionsPage.changeObjectActivateStatus(
				objectDefinition2.name
			);

			await viewObjectEntriesPage.goto(objectDefinition1.className);

			await page.locator('.lfr-object-entry').first().click();

			await expect(
				page.getByRole('tab', {name: relationshipLabel})
			).toBeVisible();
		}
	);
});
