/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectDefinition,
	ObjectRelationshipAPI,
} from '@liferay/object-admin-rest-client-js/v1_0';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {waitForAlert} from '../../../utils/waitForAlert';
import {generateObjectFields} from '../utils/generateObjectFields';
import {getFreshObjectRelationshipName} from '../utils/getFreshObjectRelationshipName';

export const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPD-108620': {enabled: true},
	}),
	loginTest(),
	objectPagesTest
);

test.beforeEach(({page}) => {
	page.setViewportSize({height: 1080, width: 1920});
});

async function postObjectDefinition(
	apiHelpers: any,
	titleObjectFieldName: string
): Promise<ObjectDefinition> {
	const objectDefinition =
		await apiHelpers.objectAdmin.postRandomObjectDefinition({
			objectFields: generateObjectFields({
				objectFieldBusinessTypes: [
					{
						businessType: 'Text',
						label: {en_US: titleObjectFieldName},
						name: titleObjectFieldName,
					},
				],
			}),
			panelCategoryKey: 'control_panel.object',
			status: {code: 0},
			titleObjectFieldName,
		});

	apiHelpers.data.push({
		id: objectDefinition.id,
		type: 'objectDefinition',
	});

	return objectDefinition;
}

async function postOneToOneRelationship(
	apiHelpers: any,
	childObjectDefinition: ObjectDefinition,
	parentObjectDefinition: ObjectDefinition
) {
	const objectRelationshipAPIClient = await apiHelpers.buildRestClient(
		ObjectRelationshipAPI
	);

	const {body: objectRelationship} =
		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			parentObjectDefinition.externalReferenceCode,
			{
				deletionType: 'disassociate',
				label: {en_US: 'One to One'},
				name: await getFreshObjectRelationshipName(apiHelpers, [
					parentObjectDefinition.externalReferenceCode!,
					childObjectDefinition.externalReferenceCode!,
				]),
				objectDefinitionExternalReferenceCode1:
					parentObjectDefinition.externalReferenceCode,
				objectDefinitionExternalReferenceCode2:
					childObjectDefinition.externalReferenceCode,
				objectDefinitionId1: parentObjectDefinition.id,
				objectDefinitionId2: childObjectDefinition.id,
				type: 'oneToOne',
			}
		);

	apiHelpers.data.push({
		id: objectRelationship.id,
		type: 'objectRelationship',
	});

	return objectRelationship;
}

test.describe('Manage the One to One child from the parent entry', () => {
	test(
		'shows the relationship tab without a custom layout and links an existing child',
		{tag: '@LPD-116023'},
		async ({apiHelpers, page, viewObjectEntriesPage}) => {

			// Create the parent and child objects with a One to One relationship

			const parentObjectDefinition = await postObjectDefinition(
				apiHelpers,
				'parentName'
			);
			const childObjectDefinition = await postObjectDefinition(
				apiHelpers,
				'childName'
			);

			await postOneToOneRelationship(
				apiHelpers,
				childObjectDefinition,
				parentObjectDefinition
			);

			const parentObjectEntry =
				await apiHelpers.objectEntry.postObjectEntry(
					{parentName: 'Parent A'},
					'c/' + parentObjectDefinition.name.toLowerCase() + 's'
				);

			await apiHelpers.objectEntry.postObjectEntry(
				{childName: 'Child A'},
				'c/' + childObjectDefinition.name.toLowerCase() + 's'
			);

			// Open the relationship tab shown automatically on the parent

			await viewObjectEntriesPage.goto(parentObjectDefinition.className);

			await page
				.getByRole('link', {name: parentObjectEntry.id.toString()})
				.click();

			await page
				.getByRole('link', {name: childObjectDefinition.label['en_US']})
				.click();

			// Select the existing child

			await page.getByRole('button', {name: 'New'}).first().click();

			await expect(
				page.getByRole('menuitem', {name: 'Create New'})
			).toBeVisible();
			await expect(
				page.getByRole('menuitem', {name: 'Select Existing One'})
			).toBeVisible();

			await page
				.getByRole('menuitem', {name: 'Select Existing One'})
				.click();

			await expect(viewObjectEntriesPage.searchButton).toBeEnabled();

			await viewObjectEntriesPage.frameSelect
				.getByText('Child A')
				.click();

			await expect(
				page.getByRole('cell', {name: 'Child A'})
			).toBeVisible();

			// Check that no more children can be added

			await expect(page.getByRole('button', {name: 'New'})).toHaveCount(
				0
			);
		}
	);

	test(
		'creates the child from the relationship tab of a custom layout',
		{tag: '@LPD-116023'},
		async ({
			apiHelpers,
			objectLayoutsPage,
			page,
			viewObjectEntriesPage,
		}) => {

			// Create the parent and child objects with a One to One relationship

			const parentObjectDefinition = await postObjectDefinition(
				apiHelpers,
				'parentName'
			);
			const childObjectDefinition = await postObjectDefinition(
				apiHelpers,
				'childName'
			);

			await postOneToOneRelationship(
				apiHelpers,
				childObjectDefinition,
				parentObjectDefinition
			);

			const parentObjectEntry =
				await apiHelpers.objectEntry.postObjectEntry(
					{parentName: 'Parent A'},
					'c/' + parentObjectDefinition.name.toLowerCase() + 's'
				);

			// Add the relationship tab to a custom layout

			const objectLayoutName = 'Layout Name';

			await objectLayoutsPage.goto(parentObjectDefinition.name);

			await objectLayoutsPage.createObjectLayout(objectLayoutName);

			await page.getByRole('link', {name: objectLayoutName}).click();

			await objectLayoutsPage.markAsDefaultButton.check();

			await objectLayoutsPage.createObjectLayoutContent({
				objectFieldNames: ['parentName'],
				objectLayoutName,
				objectLayoutRegularBlockName: 'Block 1',
				objectLayoutTabName: 'Field Tab',
			});

			const {reload} =
				await objectLayoutsPage.createObjectRelationshipTab(
					objectLayoutName,
					'Relationship Tab',
					'One to One'
				);

			await reload;

			// Create the child from the tab

			await viewObjectEntriesPage.goto(parentObjectDefinition.className);

			await page
				.getByRole('link', {name: parentObjectEntry.id.toString()})
				.click();

			await page.getByRole('link', {name: 'Relationship Tab'}).click();

			await page.getByRole('button', {name: 'New'}).first().click();

			await page.getByRole('menuitem', {name: 'Create New'}).click();

			await page.getByLabel('childName').fill('Child B');

			await viewObjectEntriesPage.saveObjectEntryButton.click();

			await waitForAlert(page);

			// Check that the child is linked and no more can be added

			await viewObjectEntriesPage.goto(parentObjectDefinition.className);

			await page
				.getByRole('link', {name: parentObjectEntry.id.toString()})
				.click();

			await page.getByRole('link', {name: 'Relationship Tab'}).click();

			await expect(
				page.getByRole('cell', {name: 'Child B'})
			).toBeVisible();

			await expect(page.getByRole('button', {name: 'New'})).toHaveCount(
				0
			);
		}
	);
});
