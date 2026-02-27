/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectFieldAPI, ObjectRelationshipAPI} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {FormBuilderPage} from '../../../pages/dynamic-data-mapping-form-web/FormBuilderPage';
import {FormBuilderSidePanelPage} from '../../../pages/dynamic-data-mapping-form-web/FormBuilderSidePanelPage';
import {FormSettingsModalPage} from '../../../pages/dynamic-data-mapping-form-web/FormSettingsModalPage';
import {PageEditorPage} from '../../../pages/layout-content-page-editor-web/PageEditorPage';
import {ConfigurationTabPage} from '../../../pages/portal-workflow-kaleo-designer-web/ConfigurationTabPage';
import {MetricsPage} from '../../../pages/portal-workflow-metrics-web/MetricsPage';
import {WorkflowTasksPage} from '../../../pages/portal-workflow-task-web/WorkflowTasksPage';
import {getRandomInt} from '../../../utils/getRandomInt';
import getRandomString from '../../../utils/getRandomString';
import {performUserSwitch, userData} from '../../../utils/performLogin';
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

// Migrated from CreateObject.testcase

test(
	'LPD-78504 Verify it is possible to view and access the Object Admin portlet with the Access in Control Panel permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(page.getByText('User')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a Block',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block Name',
		});

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Block Name')
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Verify it is possible to add Entries with Custom Layout Created',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectLayoutsPage,
		page,
		viewObjectEntriesPage,
	}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block',
		});

		await objectLayoutsPage.openObjectLayoutObjectField();

		await objectLayoutsPage.addObjectLayoutObjectField(
			objectFields[0].label!['en_US']
		);

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await expect(page.getByText('Block')).toBeVisible();

		await expect(
			page.getByLabel(objectFields[0].label!['en_US'])
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a field after the Object is published and submit entries to it',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage: _objectFieldsPage, page, viewObjectEntriesPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				panelCategoryKey: 'control_panel.object',
				scope: 'company',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const newField = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectFieldAPIClient = await apiHelpers.buildRestClient(ObjectFieldAPI);

		await objectFieldAPIClient.postObjectDefinitionObjectField(
			objectDefinition.id!,
			newField[0]
		);

		await viewObjectEntriesPage.goto(
			objectDefinition.name!
		);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldValue: 'String Entry',
		});

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with one column',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block Name',
			objectLayoutTabName: 'Field Tab',
		});

		await expect(
			objectLayoutsPage.iframeLocator.getByText(
				objectFields[0].label!['en_US']
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with three columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block Name',
			objectLayoutTabName: 'Field Tab',
		});

		await expect(
			objectLayoutsPage.iframeLocator.getByText(
				objectFields[0].label!['en_US']
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a Field for the Block with two columns',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block Name',
			objectLayoutTabName: 'Field Tab',
		});

		await expect(
			objectLayoutsPage.iframeLocator.getByText(
				objectFields[0].label!['en_US']
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a Tab with Fields Type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await expect(
			objectLayoutsPage.iframeLocator.getByText('Field Tab')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add an Object Entry Title Field',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to add an Object with the Add Object Definition permission',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
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
					actionIds: ['VIEW'],
					primaryKey: String(company.companyId),
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await viewObjectDefinitionsPage.goto();

		await expect(page.getByText(objectLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to add a relation with an entry through the Relationship field',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to add many relations through the Relationship tab',
	{tag: '@LPD-78504'},
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
		const _parentEntry = await apiHelpers.objectEntry.postObjectEntry(
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
	'LPD-78504 Verify it is possible to cancel the creation of a Custom Object',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		const objectDefinitionLabel = 'CancelObject' + getRandomInt();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			objectDefinitionLabel
		);
		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			objectDefinitionLabel + 's'
		);

		await page.getByRole('button', {name: 'Cancel'}).click();

		await expect(page.getByText(objectDefinitionLabel)).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to cancel the creation of a Field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Cancel Field');

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await page.getByRole('button', {name: 'Cancel'}).click();

		await expect(page.getByText('Cancel Field')).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to cancel the creation of a Relationship',
	{tag: '@LPD-78504'},
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

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
	'LPD-78504 Verify it is possible to Cancel the update of a Layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.iframeLocator
			.getByLabel('Name')
			.fill('Layout Updated');

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Cancel'})
			.click();

		await page.reload();

		await expect(page.getByText(layoutName)).toBeVisible();
		await expect(page.getByText('Layout Updated')).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to collapse and expand a block of fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.toggleCollapsible('Block 1');

		await expect(
			objectLayoutsPage.iframeLocator.getByRole('switch', {
				name: 'Collapsible',
			})
		).toBeChecked();
	}
);

test(
	'LPD-78504 Verify it is possible to create a BigDecimal field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Precision Decimal',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Precision Decimal')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Boolean field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Boolean',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Boolean')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Custom Object',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		const objectDefinitionLabel = 'CustomObject' + getRandomInt();

		viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		const objectDefinition =
			await modalAddObjectDefinitionPage.createObjectDefinition(
				objectDefinitionLabel
			);

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await waitForAlert(
			page,
			`Success:${objectDefinitionLabel} was created successfully.`
		);

		await expect(page.getByText(objectDefinitionLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Date field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Date',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Date')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Double field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Decimal',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Decimal')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create an Integer field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Integer',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Integer')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Layout for an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await expect(page.getByText(layoutName)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Long field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Long Integer',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Long Integer')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Many to Many Relationship',
	{tag: '@LPD-78504'},
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

		await waitForAlert(page);

		await expect(page.getByText(relationshipLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a One to Many Relationship',
	{tag: '@LPD-78504'},
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

		await waitForAlert(page);

		await expect(page.getByText(relationshipLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const listTypeDefinition =
			await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

		apiHelpers.data.push({
			id: listTypeDefinition.id,
			type: 'listTypeDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			listTypeDefinitionName: listTypeDefinition.name,
			objectFieldBusinessType: 'Picklist',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Picklist')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to create a String field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page);
		await page.reload();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Text')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to delete a Custom Object field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: objectFields[0].label!['en_US']});

		await expect(
			fieldRow.locator('.dropdown-toggle')
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Custom Object field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.deleteObjectFieldByLabel(
			objectFields[0].label!['en_US']
		);

		await waitForAlert(page);

		await expect(
			page.getByText(objectFields[0].label!['en_US'])
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Field on Layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.iframeLocator
			.getByText(objectFields[0].label!['en_US'])
			.hover();

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Delete'})
			.first()
			.click();

		await expect(
			objectLayoutsPage.iframeLocator.getByText(
				objectFields[0].label!['en_US']
			)
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify the user can delete an inactive custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

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

		await page.getByRole('button', {name: 'Delete'}).click();

		apiHelpers.data.splice(
			apiHelpers.data.findIndex(
				(object) =>
					object.id === objectDefinition.id &&
					object.type === 'objectDefinition'
			),
			1
		);

		await page.waitForTimeout(2000);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Layout for an Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'LayoutToDelete' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await page
			.getByRole('row')
			.filter({hasText: layoutName})
			.locator('.dropdown-toggle')
			.click();

		await page.getByRole('menuitem', {name: 'Delete'}).click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await waitForAlert(page);

		await expect(page.getByText(layoutName)).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Verify it is possible to delete an Object with the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					actionIds: ['DELETE', 'VIEW'],
					primaryKey: String(company.companyId),
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is possible to delete a Relationship',
	{tag: '@LPD-78504'},
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

		await expect(
			page.getByText('No Results Found')
		).toBeVisible({timeout: 15000});
	}
);

test.fixme(
	'LPD-78504 Verify that when the admin user deletes the relationship between Account and the Object the Account Restriction is disabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, objectRelationshipsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				accountEntryRestricted: true,
				accountEntryRestrictedObjectFieldName: 'r_accountEntryId_accountEntryId',
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
	'LPD-78504 Verify it is not possible to add an Object without the Add Object Definition permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(
			viewObjectDefinitionsPage.createObjectDefinitionButton
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is not possible to add a Tab with Relationship Type in an Object without Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.addTab.click();

		await expect(
			objectLayoutsPage.iframeLocator.getByRole('menuitem', {
				name: 'Relationship Tab',
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Relationship tab cannot be added first',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: 'Relationship' + getRandomInt()},
				name: 'relationship' + getRandomInt(),
				objectDefinitionExternalReferenceCode2:
					objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		await objectLayoutsPage.goto(objectDefinition1.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.addTab.click();

		await expect(
			objectLayoutsPage.iframeLocator.getByRole('menuitem', {
				name: 'Relationship Tab',
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that it is not possible to create a Field with a duplicated Field Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: objectFields[0].label!['en_US'],
		});

		await expect(
			page.getByText('This name is already in use. Try another.')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that it is not possible to create an Object with a duplicated Object Name',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			objectDefinition.label['en_US']
		);
		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			objectDefinition.pluralLabel['en_US']
		);

		await modalAddObjectDefinitionPage.objectDefinitionSaveButton.click();

		await expect(
			page.getByText('This name is already in use. Try another.')
		).toBeVisible();

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify it is not possible to create duplicated Relationship name',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is not possible to delete an Object without the Delete permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();

		await expect(
			page
				.getByRole('row', {
					name: objectDefinition.label['en_US'],
				})
				.getByRole('button')
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Field Name field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await objectFieldsPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Label field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await objectFieldsPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Object Label field blank',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			'Plural Label'
		);

		await modalAddObjectDefinitionPage.objectDefinitionSaveButton.click();

		await expect(page.getByText('Required')).toBeVisible();

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Object Name field blank',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			'Plural Label'
		);

		await modalAddObjectDefinitionPage.objectDefinitionSaveButton.click();

		await expect(page.getByText('Required')).toBeVisible();

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Picklist field empty when creating an Object Picklist field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Picklist Field');

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page
			.getByRole('option', {exact: true, name: 'Picklist'})
			.click();

		await objectFieldsPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Relationship Name blank',
	{tag: '@LPD-78504'},
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

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
	'LPD-78504 Verify it is not possible to leave the Relationship Object blank',
	{tag: '@LPD-78504'},
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		await objectRelationshipFormPage.labelInput.fill('Test Relationship');

		await objectRelationshipFormPage.selectType('One to Many');

		await objectRelationshipFormPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Relationship Type blank',
	{tag: '@LPD-78504'},
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

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await objectRelationshipsPage.addObjectRelationshipButton.click();

		await objectRelationshipFormPage.labelInput.fill('Test Relationship');

		await objectRelationshipFormPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to leave the Type field blank',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Test Field');

		await objectFieldsPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to publish an Object without the Publish Object Definition permission',
	{tag: '@LPD-78504'},
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await editObjectDetailsPage.goto(
			objectDefinition.label['en_US']
		);

		await expect(editObjectDetailsPage.publishButton).toBeDisabled();
	}
);

test(
	'LPD-78504 Verify it is not possible to save with the first character of the Object Name in lower case',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			'lowercase object'
		);
		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			'lowercase objects'
		);

		await modalAddObjectDefinitionPage.objectDefinitionSaveButton.click();

		await expect(
			page.getByText(
				'The object name must begin with an upper case letter and contain only alphanumeric characters.'
			)
		).toBeVisible();

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify it is not possible to save with special characters for the Field Name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Field@Special!');

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await objectFieldsPage.saveButton.click();

		await expect(
			page.getByText(
				'The field name must begin with a lower case letter and contain only alphanumeric characters.'
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to save with the first character of the Field Name in upper case',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('UpperCaseField');

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await objectFieldsPage.saveButton.click();

		await expect(
			page.getByText(
				'The field name must begin with a lower case letter and contain only alphanumeric characters.'
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to save with special characters for the Object Name',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			'Object@Special!'
		);
		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			'Objects Special'
		);

		await modalAddObjectDefinitionPage.objectDefinitionSaveButton.click();

		await expect(
			page.getByText(
				'The object name must begin with an upper case letter and contain only alphanumeric characters.'
			)
		).toBeVisible();

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify it is not possible to set a layout as default without all the required fields on the first tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: [
				{businessType: 'Text', required: true},
			],
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block',
		});

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await page.goBack();

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await expect(
			page.getByText(
				'All mandatory fields must be on the first tab.'
			)
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that is not possible to submit entries in a form with an Object that was inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		// Create a form with Object storage type

		const formBuilderPage = new FormBuilderPage(page);
		const formSettingsModalPage = new FormSettingsModalPage(page);
		const formBuilderSidePanelPage = new FormBuilderSidePanelPage(page);

		await formBuilderPage.goToNew();

		const formName = 'Form' + getRandomInt();

		await formBuilderPage.fillFormTitle(formName);

		await formBuilderPage.formSettingsButton.click();

		await formSettingsModalPage.selectStorageType('Object');

		await formSettingsModalPage.selectObject(
			objectDefinition.label['en_US']
		);

		await formSettingsModalPage.clickDoneButton();

		// Add text field and map to object field

		await formBuilderSidePanelPage.addTextButton.dblclick();

		await formBuilderSidePanelPage.selectObjectField(
			objectFields[0].label!['en_US']
		);

		await formBuilderSidePanelPage.clickBackButton();

		await formBuilderPage.clickSaveButton();

		await waitForAlert(page);

		await formBuilderPage.clickPublishFormButton();

		// Inactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Navigate to Forms list and verify warning icon on the form

		await page.goto(
			'/group/guest/~/control_panel/manage/-/dynamic_data_mapping_form'
		);

		await expect(
			page.locator('.lexicon-icon-exclamation-full').first()
		).toBeVisible();

		// Reactivate for cleanup

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);
	}
);

test(
	'LPD-78504 Verify it is not possible to submit an entry with an invalid value on the Relationship field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: [
				{businessType: 'Text', required: false},
			],
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 0},
			});

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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

		await expect(
			page.getByText('Error')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Mandatory of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await expect(
			page.frameLocator('iframe').getByRole('switch', {name: 'Mandatory'})
		).toBeDisabled();
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Name of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await expect(page.locator('input[name="name"]')).toBeDisabled();
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Type of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await expect(
			page.getByText('Select an Option').first()
		).toHaveAttribute('aria-disabled', 'true');
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Object name after it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is not possible to update the Object scope after it is published',
	{tag: '@LPD-78504'},
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

		await expect(
			page.getByLabel('Scope').first()
		).toHaveAttribute('aria-disabled', 'true');
	}
);

test(
	'LPD-78504 Verify it is not possible to update an Object without the Update permission',
	{tag: '@LPD-78504'},
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await editObjectDetailsPage.goto(
			objectDefinition.label['en_US']
		);

		await expect(editObjectDetailsPage.saveButton).toBeDisabled();
	}
);

test(
	'LPD-78504 Verify it is not possible to update the Searchable section after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await objectFieldsPage.advancedTab.click();

		await expect(
			page
				.frameLocator('iframe')
				.getByRole('switch', {name: 'Searchable'})
		).toBeDisabled();
	}
);

test(
	'LPD-78504 Verify that the Object is not displayed on Process Builder settings before Published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await page.goto(
			'/group/guest/~/control_panel/manage/-/workflow_configuration'
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is not displayed on Workflow settings from Site Menu before Published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await page.goto(
			`/group${site.friendlyUrlPath}/~/control_panel/manage/-/workflow_configuration`
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify it is not possible to view an Object without the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: String(company.companyId),
					resourceName:
						'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Verify that when adding a new Object the admin user is able to restrict users to only see entries from an account that they are part of',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				accountEntryRestricted: true,
				accountEntryRestrictedObjectFieldName: 'r_accountEntryId_accountEntryId',
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
	'LPD-78504 Verify it is possible to Publish a Custom Object',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to publish an Object with the Publish Object Definition permission',
	{tag: '@LPD-78504'},
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
					actionIds: [
						'PUBLISH_OBJECT_DEFINITIONS',
						'VIEW',
					],
					primaryKey: String(company.companyId),
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await editObjectDetailsPage.goto(
			objectDefinition.label['en_US']
		);

		await editObjectDetailsPage.publishButton.click();

		await page
			.getByRole('button', {exact: true, name: 'Publish'})
			.click();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify that it is possible to relate to many other entries on both objects',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
	'LPD-78504 Verify that it is possible to restrict a previously created Object',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to scope the Object by Company',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to scope the Object by Site',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to search for a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await page
			.getByPlaceholder('Search')
			.fill(objectDefinition.label['en_US']);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to search for a field from a Custom Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const fieldLabel = objectFields[0].label!['en_US'];

		await page.getByPlaceholder('Search').fill(fieldLabel);

		await expect(page.getByText(fieldLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to search for a field from a System Object',
	{tag: '@LPD-78504'},
	async ({objectFieldsPage, page}) => {
		await objectFieldsPage.goto('User');

		await page.getByPlaceholder('Search').fill('Email Address');

		await expect(page.getByText('Email Address')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to search for a System Object',
	{tag: '@LPD-78504'},
	async ({page, viewObjectDefinitionsPage}) => {
		await viewObjectDefinitionsPage.goto();

		await page.getByPlaceholder('Search').fill('User');

		await expect(page.getByText('User')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to set the block as Collapsible',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page: _page}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutContent({
			objectFieldNames: [objectFields[0].label!['en_US']],
			objectLayoutName: layoutName,
			objectLayoutRegularBlockName: 'Block 1',
			objectLayoutTabName: 'Field Tab',
		});

		await objectLayoutsPage.toggleCollapsible('Block 1');

		await expect(
			objectLayoutsPage.iframeLocator.getByRole('switch', {
				name: 'Collapsible',
			})
		).toBeChecked();
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for a Field Label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const iframeLocator = page.frameLocator('iframe');

		await iframeLocator
			.getByRole('button', {name: 'en-US'})
			.first()
			.click();
		await iframeLocator.getByRole('menuitem', {name: 'pt-BR'}).click();

		await iframeLocator.getByLabel('Label').fill('Rótulo em Português');

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for an Object Label',
	{tag: '@LPD-78504'},
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

		await page
			.getByRole('button', {name: 'en-US'})
			.first()
			.click();
		await page.getByRole('menuitem', {name: 'pt-BR'}).click();

		await page.getByLabel('Label').fill('Rótulo em Português');

		await editObjectDetailsPage.saveObjectDefinition();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify it is possible to set a different language value for an Object Plural Label',
	{tag: '@LPD-78504'},
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

		await page
			.getByRole('button', {name: 'en-US'})
			.nth(1)
			.click();
		await page.getByRole('menuitem', {name: 'pt-BR'}).click();

		await page.getByLabel('Plural Label').fill('Rótulos em Português');

		await editObjectDetailsPage.saveObjectDefinition();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify it is possible to set a field as Mandatory',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const mandatorySwitch = page
			.frameLocator('iframe')
			.getByRole('switch', {name: 'Mandatory'});

		await mandatorySwitch.check();

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await expect(mandatorySwitch).toBeChecked();
	}
);

test(
	'LPD-78504 Verify that is possible to submit entries in a form with an Object that was reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage, viewObjectEntriesPage}) => {
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

		// Create a form with Object storage type

		const formBuilderPage = new FormBuilderPage(page);
		const formSettingsModalPage = new FormSettingsModalPage(page);
		const formBuilderSidePanelPage = new FormBuilderSidePanelPage(page);

		await formBuilderPage.goToNew();

		const formName = 'Form' + getRandomInt();

		await formBuilderPage.fillFormTitle(formName);

		await formBuilderPage.formSettingsButton.click();

		await formSettingsModalPage.selectStorageType('Object');

		await formSettingsModalPage.selectObject(
			objectDefinition.label['en_US']
		);

		await formSettingsModalPage.clickDoneButton();

		// Add text field and map to object field

		await formBuilderSidePanelPage.addTextButton.dblclick();

		await formBuilderSidePanelPage.selectObjectField(
			objectFields[0].label!['en_US']
		);

		await formBuilderSidePanelPage.clickBackButton();

		await formBuilderPage.clickSaveButton();

		await waitForAlert(page);

		await formBuilderPage.clickPublishFormButton();

		const formSubmissionURL =
			await formBuilderPage.getFormSubmissionURL();

		// Inactivate then reactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Navigate to Forms list and verify no warning icon

		await page.goto(
			'/group/guest/~/control_panel/manage/-/dynamic_data_mapping_form'
		);

		await expect(
			page.locator('.lexicon-icon-exclamation-full')
		).toBeHidden();

		// Submit an entry through the form

		await page.goto(formSubmissionURL);

		await page
			.getByLabel(objectFields[0].label!['en_US'])
			.fill('Entry 1');

		await page.getByRole('button', {name: 'Submit'}).click();

		await expect(
			page.getByText('Your information was successfully received')
		).toBeVisible();

		// Verify entry appears in object entries

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(page.getByText('Entry 1')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to update a Custom Layout Created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectLayoutsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		const newLayoutName = 'UpdatedLayout' + getRandomInt();

		await objectLayoutsPage.iframeLocator
			.getByLabel('Name')
			.fill(newLayoutName);

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await page.goBack();

		await expect(page.getByText(newLayoutName)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to update the Label of a Field after the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const newLabel = 'UpdatedLabel' + getRandomInt();

		await page
			.frameLocator('iframe')
			.getByLabel('Label')
			.fill(newLabel);

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Label of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const newLabel = 'UpdatedLabel' + getRandomInt();

		await page
			.frameLocator('iframe')
			.getByLabel('Label')
			.fill(newLabel);

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Mandatory of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const mandatorySwitch = page
			.frameLocator('iframe')
			.getByRole('switch', {name: 'Mandatory'});

		await mandatorySwitch.check();

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Name of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		const newName = 'updatedName' + getRandomInt();

		await page.locator('input[name="name"]').fill(newName);

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Searchable section before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await objectFieldsPage.advancedTab.click();

		const searchableToggle = page
			.frameLocator('iframe')
			.getByRole('switch', {name: 'Searchable'});

		await searchableToggle.uncheck();

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Type of a Field before the Object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await page.getByText('Select an Option').first().click();
		await page.getByRole('option', {exact: true, name: 'Integer'}).click();

		await objectFieldsPage.editFieldSaveButton.click();

		await waitForAlert(
			page,
			'The object field was updated successfully'
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object label after it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update the Object label before it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update the Object name before it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update the Object panel category before it is published',
	{tag: '@LPD-78504'},
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
		await page.getByRole('option', {name: 'Control Panel > Object'}).click();

		await editObjectDetailsPage.saveObjectDefinition();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object panel category key after it is published',
	{tag: '@LPD-78504'},
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
		await page.getByRole('option', {name: 'Control Panel > Object'}).click();

		await editObjectDetailsPage.saveObjectDefinition();

		await waitForAlert(page);
	}
);

test(
	'LPD-78504 Verify it is possible to update the Object plural label after it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update the Object plural label before it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update the Object scope before it is published',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to update an Object with the Update permission',
	{tag: '@LPD-78504'},
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
					actionIds: ['UPDATE', 'VIEW'],
					primaryKey: String(company.companyId),
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await editObjectDetailsPage.goto(
			objectDefinition.label['en_US']
		);

		const newLabel = 'UpdatedObject' + getRandomInt();

		await page.locator('input[name="label"]').clear();
		await page.locator('input[name="label"]').fill(newLabel);

		await editObjectDetailsPage.saveButton.click();

		await waitForAlert(page);

		await expect(page.locator('input[name="label"]')).toHaveValue(
			newLabel
		);
	}
);

test(
	'LPD-78504 Verify it is possible to update a Relationship',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify it is possible to view and edit its own Object with only the Add Object Definition permission',
	{tag: '@LPD-78504'},
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(page.locator('input[name="label"]')).toHaveValue(
			newLabel
		);
	}
);

test.fixme(
	'LPD-78504 Verify it is possible to view the Entry with one column',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectLayoutsPage,
		page,
		viewObjectEntriesPage,
	}) => {
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block',
		});

		await objectLayoutsPage.openObjectLayoutObjectField();

		await objectLayoutsPage.addObjectLayoutObjectField(
			objectFields[0].label!['en_US']
		);

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await expect(
			page.getByLabel(objectFields[0].label!['en_US'])
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Verify it is possible to view the Entry with three columns',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectLayoutsPage,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text', 'Integer', 'Boolean'],
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block',
		});

		for (const field of objectFields) {
			await objectLayoutsPage.openObjectLayoutObjectField();

			await objectLayoutsPage.addObjectLayoutObjectField(
				field.label!['en_US']
			);
		}

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		for (const field of objectFields) {
			await expect(
				page.getByLabel(field.label!['en_US'])
			).toBeVisible();
		}
	}
);

test.fixme(
	'LPD-78504 Verify it is possible to view the Entry with two columns',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectLayoutsPage,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text', 'Integer'],
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

		await objectLayoutsPage.goto(objectDefinition.label['en_US']);

		const layoutName = 'Layout' + getRandomInt();

		await objectLayoutsPage.createObjectLayout(layoutName);

		await objectLayoutsPage.openObjectLayoutConfiguration(layoutName);

		await objectLayoutsPage.layoutTab.click();

		await objectLayoutsPage.createObjectLayoutTab('Field Tab');

		await objectLayoutsPage.createObjectLayoutBlock({
			objectLayoutRegularBlockName: 'Block',
		});

		for (const field of objectFields) {
			await objectLayoutsPage.openObjectLayoutObjectField();

			await objectLayoutsPage.addObjectLayoutObjectField(
				field.label!['en_US']
			);
		}

		await objectLayoutsPage.iframeLocator
			.getByRole('button', {name: 'Save'})
			.first()
			.click();

		await waitForAlert(page);

		await objectLayoutsPage.setObjectLayoutAsDefault();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		for (const field of objectFields) {
			await expect(
				page.getByLabel(field.label!['en_US'])
			).toBeVisible();
		}
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of a Field by clicking on the eye icon',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await page
			.getByRole('row')
			.filter({hasText: objectFields[0].label!['en_US']})
			.getByRole('link')
			.first()
			.click();

		await expect(
			page.getByText(objectFields[0].label!['en_US'])
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of a Field by clicking on its name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await expect(
			page.getByText(objectFields[0].label!['en_US'])
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a BigDecimal type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: '123.45'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Boolean type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: 'true'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Date type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option').first()).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Double type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: '99.99'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of an Integer type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: '42'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Long type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: '999999'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title is displayed on the Relationship tab',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
	'LPD-78504 Verify the Object Entry Title is displayed for Object entries on workflow pages',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 0},
				titleObjectFieldName: objectFields[0].name,
			});

		apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

		await apiHelpers.objectEntry.postObjectEntry(
			{[objectFields[0].name!]: 'WorkflowEntryTitle'},
			'c/' + objectDefinition.name!.toLowerCase() + 's'
		);

		await page.goto('/group/guest/~/control_panel/manage/-/my_workflow_tasks');

		await expect(
			page.getByText('WorkflowEntryTitle')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a Picklist type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
				objectDefinitionId2: objectDefinition2.id,
				objectDefinitionName2: objectDefinition2.name,
				type: 'oneToMany',
			}
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[objectFields1[0].name!]: {key: listTypeDefinition.listTypeEntries?.[0]?.key}},
			'c/' + objectDefinition1.name!.toLowerCase() + 's'
		);

		await viewObjectEntriesPage.goto(objectDefinition2.className);
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option').first()).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Object Entry Title of a String type is displayed on the Relationship field when adding an entry',
	{tag: '@LPD-78504'},
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

		apiHelpers.data.push({id: objectDefinition1.id, type: 'objectDefinition'});
		apiHelpers.data.push({id: objectDefinition2.id, type: 'objectDefinition'});

		const objectRelationshipAPIClient = await apiHelpers.buildRestClient(ObjectRelationshipAPI);
		const relationshipLabel = 'Rel' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition1.externalReferenceCode!,
			{
				label: {en_US: relationshipLabel},
				name: 'rel' + getRandomInt(),
				objectDefinitionExternalReferenceCode2: objectDefinition2.externalReferenceCode,
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
		await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition2.label['en_US']);

		await page.getByLabel(relationshipLabel).click();

		await expect(page.getByRole('option', {name: 'StringTitle'})).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of an Object by clicking on the eye icon',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await page
			.getByRole('row')
			.filter({hasText: objectDefinition.label['en_US']})
			.getByRole('link')
			.first()
			.click();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to view the Details of an Object by clicking on its name',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.clickEditObjectDefinitionLink(
			objectDefinition.label['en_US']
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to view an Object with the View permission',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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
					resourceName:
						'com.liferay.object.model.ObjectDefinition',
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

		const user =
			await apiHelpers.headlessAdminUser.postUserAccount();

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

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify it is possible to view a Relationship',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted but not its relation',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify Cascade deletion type of Relationship One to Many will allow the entry with relation from the parent Object and its relations to be deleted',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify that when adding an entry that was already related to another it will keep related to both entries',
	{tag: '@LPD-78504'},
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

test(
	'LPD-78504 Verify that the columns Name and Type are displayed for the Fields table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: objectFields[0].label!['en_US']});

		await expect(fieldRow).toBeVisible();
		await expect(fieldRow.getByText('Text')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the columns Name System and Status are displayed for the Objects table',
	{tag: '@LPD-78504'},
	async ({page, viewObjectDefinitionsPage}) => {
		await viewObjectDefinitionsPage.goto();

		await expect(
			page.getByRole('columnheader', {name: 'Name'})
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', {name: 'System'})
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', {name: 'Status'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that a completed entry is displayed with an Approved status',
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

		await apiHelpers.objectEntry.postObjectEntry(
			{[objectFields[0].name!]: 'ApprovedEntry'},
			'c/' + objectDefinition.name!.toLowerCase() + 's'
		);

		await viewObjectEntriesPage.goto(objectDefinition.className);

		const entryRow = page
			.getByRole('row')
			.filter({hasText: 'ApprovedEntry'});

		await expect(entryRow.getByText('Approved')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the child Object to be deleted and its relation to be disassociated',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify Disassociate deletion type of Relationship One to Many will allow the entry with relation from the parent Object to be deleted and its relations to be disassociated',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify the empty state when searching for an Object returns nothing',
	{tag: '@LPD-78504'},
	async ({page, viewObjectDefinitionsPage}) => {
		await viewObjectDefinitionsPage.goto();

		await page
			.getByPlaceholder('Search')
			.fill('NonExistentObject' + getRandomInt());

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the empty state when searching for an Object field returns nothing',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await page
			.getByPlaceholder('Search')
			.fill('NonExistentField' + getRandomInt());

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the empty state message when there is no Relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectRelationshipsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectRelationshipsPage.goto(
			objectDefinition.label['en_US']
		);

		await expect(page.getByText('No Results Found')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Field Name is autofilled when Label is filled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Test Field Label');

		await expect(page.locator('input[name="name"]')).toHaveValue(
			'testFieldLabel'
		);
	}
);

test(
	'LPD-78504 Verify it is not possible to add a Field without Choose an Option Field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectFieldButton.click();

		await objectFieldsPage.objectFieldLabelInput.fill('Test Field');

		await objectFieldsPage.saveButton.click();

		await expect(page.getByText('Required')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that other fields are not deleted when a Relationship field is deleted after a Relationship is deleted',
	{tag: '@LPD-78504'},
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

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

		await objectRelationshipsPage.goto(
			objectDefinition1.label['en_US']
		);

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

// @ignore = "Test Stub" - FormCollectionProvidersDisplayPageDisplayOnlyItsInstanceObjects

test.skip(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Forms Settings Collection Providers and Display Page Template of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async () => {
		// This test was originally marked @ignore = "Test Stub" in Poshi and
		// was never implemented. It requires Virtual Instance infrastructure.
		//
		// Intended flow based on Poshi test stub:
		// 1. Create a Virtual Instance
		// 2. On the Main Instance, create a custom object and publish it
		// 3. On the Virtual Instance, create a different custom object and publish it
		// 4. On the Main Instance, navigate to Forms Settings > Collection Providers
		//    and verify that only the Main Instance object appears
		// 5. Navigate to Display Page Templates and verify that only the
		//    Main Instance object is available as a content type
		// 6. On the Virtual Instance, repeat the same checks and verify that only
		//    the Virtual Instance object appears in Collection Providers and
		//    Display Page Templates
		// 7. Clean up by deleting the Virtual Instance
	}
);

test(
	'LPD-78504 Verify that the options Keyword and Text appears under the Searchable section when updating the field type to String',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Integer'],
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await page.getByText('Select an Option').first().click();
		await page.getByRole('option', {exact: true, name: 'Text'}).click();

		await objectFieldsPage.advancedTab.click();

		const iframeLocator = page.frameLocator('iframe');

		await expect(
			iframeLocator.getByRole('radio', {name: 'Keyword'})
		).toBeVisible();
		await expect(
			iframeLocator.getByRole('radio', {name: 'Text'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the options Keyword and Text disappears under the Searchable section when updating the field type from String to another type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await page.getByText('Select an Option').first().click();
		await page
			.getByRole('option', {exact: true, name: 'Integer'})
			.click();

		await objectFieldsPage.advancedTab.click();

		const iframeLocator = page.frameLocator('iframe');

		await expect(
			iframeLocator.getByRole('radio', {name: 'Keyword'})
		).toBeHidden();
		await expect(
			iframeLocator.getByRole('radio', {name: 'Text'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the field with String type has the options Keyword and Text under the Searchable section',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await objectFieldsPage.advancedTab.click();

		const iframeLocator = page.frameLocator('iframe');

		await expect(
			iframeLocator.getByRole('radio', {name: 'Keyword'})
		).toBeVisible();
		await expect(
			iframeLocator.getByRole('radio', {name: 'Text'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the field with String type has the option Language when the Text option is selected under the Searchable section',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
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

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField(
			objectFields[0].label!['en_US']
		);

		await objectFieldsPage.advancedTab.click();

		const iframeLocator = page.frameLocator('iframe');

		await iframeLocator.getByRole('radio', {name: 'Text'}).check();

		await expect(
			iframeLocator.getByText('Language')
		).toBeVisible();
	}
);

// @ignore = "Test Stub" - ObjectAdminDisplaysOnlyItsInstanceObjects

test.skip(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Object Admin of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async () => {
		// This test was originally marked @ignore = "Test Stub" in Poshi and
		// was never implemented. It requires Virtual Instance infrastructure.
		//
		// Intended flow based on Poshi test stub:
		// 1. Create a Virtual Instance
		// 2. On the Main Instance, create a custom object (e.g., "Main Object")
		//    and publish it
		// 3. On the Virtual Instance, create a different custom object
		//    (e.g., "Virtual Object") and publish it
		// 4. On the Main Instance, navigate to Object Admin and verify that
		//    "Main Object" is listed but "Virtual Object" is NOT listed
		// 5. On the Virtual Instance, navigate to Object Admin and verify that
		//    "Virtual Object" is listed but "Main Object" is NOT listed
		// 6. Clean up by deleting the Virtual Instance
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Collection Providers when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/display_page_templates'
		);

		await page.getByRole('button', {name: 'New'}).click();

		await expect(
			page.getByRole('menuitem', {
				name: objectDefinition.label['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Form storage type when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/dynamic_data_mapping_form'
		);

		await page.getByRole('button', {name: 'New Form'}).click();

		await page.getByLabel('Storage Type').click();

		await expect(
			page.getByRole('option', {
				name: objectDefinition.label['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Page Item Selector when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/display_page_templates'
		);

		await page.getByRole('button', {name: 'New'}).click();

		await expect(
			page.getByRole('menuitem', {
				name: objectDefinition.label['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Page Template subtype when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/display_page_templates'
		);

		await page.getByRole('button', {name: 'New'}).click();

		await expect(
			page.getByRole('menuitem', {
				name: objectDefinition.label['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Workflow Process Builder page when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/workflow_configuration'
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object is no longer displayed on the Workflow Site Menu page when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			`/group${site.friendlyUrlPath}/~/control_panel/manage/-/workflow_configuration`
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object entries are not displayed on Page fragments from an Object that was inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
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

		// Add an entry via API

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			applicationName
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

		// Map the heading to the object's item

		await page.getByText('Heading Example', {exact: true}).dblclick();

		await page.getByLabel('Select Item').click();

		const selectFrame = page.frameLocator('iframe[title="Select"]');

		await selectFrame
			.getByRole('menuitem', {name: objectDefinition.name})
			.click();

		await selectFrame.getByText('Entry Test').click();

		await pageEditorPage.publishPage();

		// Verify entry is visible on the page

		await page.goto(
			`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`
		);

		await expect(page.getByText('Entry Test')).toBeVisible();

		// Inactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Verify entry is no longer visible on the page

		await page.goto(
			`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`
		);

		await expect(page.getByText('Entry Test')).toBeHidden();

		// Reactivate for cleanup

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries disappears from Workflow Metrics page when they are deleted',
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

		// Configure Single Approver workflow for the object

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add an entry via API (will be in pending workflow state)

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			applicationName
		);

		// Delete the entry via UI

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.first().click();
		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await waitForAlert(page);

		// Navigate to Workflow Metrics and verify 0 pending items

		const metricsPage = new MetricsPage(page);

		await metricsPage.goTo();

		await metricsPage.chooseProcess('Single Approver');

		await expect(
			page.getByText('0', {exact: true}).first()
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries disappears from Workflow pages when they are deleted',
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

		// Configure Single Approver workflow for the object

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add an entry via API (will be in pending workflow state)

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			applicationName
		);

		// Delete the entry via UI

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.frontendDatasetActions.first().click();
		await viewObjectEntriesPage.frontendDatasetDeleteAction.click();

		await page.getByRole('button', {name: 'Delete'}).click();

		await waitForAlert(page);

		// Navigate to My Workflow Tasks and verify no entries

		const workflowTasksPage = new WorkflowTasksPage(page);

		await workflowTasksPage.goToAssignedToMyRoles();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries with workflow are not displayed on the workflow pages when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add entries via API (will be in pending workflow state)

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Test'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Test 2'},
			applicationName
		);

		// Approve one entry via My Workflow Tasks

		const workflowTasksPage = new WorkflowTasksPage(page);

		await workflowTasksPage.goToAssignedToMyRoles();

		await workflowTasksPage.assignToMe(
			objectDefinition.label['en_US']
		);

		await workflowTasksPage.approve(
			objectDefinition.label['en_US']
		);

		// Inactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Verify no entries on My Workflow Tasks

		await workflowTasksPage.goto();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();

		await workflowTasksPage.assignedToMyRolesLink.click();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();

		// Reactivate for cleanup

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that the Object entries are displayed again on Page fragments from an Object that was reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
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

		// Add an entry via API

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Test 1'},
			applicationName
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

		// Map the heading to the object's item

		await page.getByText('Heading Example', {exact: true}).dblclick();

		await page.getByLabel('Select Item').click();

		const selectFrame = page.frameLocator('iframe[title="Select"]');

		await selectFrame
			.getByRole('menuitem', {name: objectDefinition.name})
			.click();

		await selectFrame.getByText('Test 1').click();

		await pageEditorPage.publishPage();

		// Inactivate then reactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Verify entry is displayed again on the page

		await page.goto(
			`/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`
		);

		await expect(page.getByText('Test 1')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Object entries with workflow are displayed again on the Workflow Metrics page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add entries via API

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry A'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry B'},
			applicationName
		);

		// Approve one entry

		const workflowTasksPage = new WorkflowTasksPage(page);

		await workflowTasksPage.goToAssignedToMyRoles();

		await workflowTasksPage.assignToMe(
			objectDefinition.label['en_US']
		);

		await workflowTasksPage.approve(
			objectDefinition.label['en_US']
		);

		// Inactivate then reactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Verify Workflow Metrics show the pending entry

		const metricsPage = new MetricsPage(page);

		await metricsPage.goTo();

		await metricsPage.chooseProcess('Single Approver');

		await expect(
			page.getByText('1', {exact: true}).first()
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that pending and completed Object entries with workflow are displayed again on the workflow pages when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add entries via API

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Test'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Test 2'},
			applicationName
		);

		// Approve one entry

		const workflowTasksPage = new WorkflowTasksPage(page);

		await workflowTasksPage.goToAssignedToMyRoles();

		await workflowTasksPage.assignToMe(
			objectDefinition.label['en_US']
		);

		await workflowTasksPage.approve(
			objectDefinition.label['en_US']
		);

		// Inactivate then reactivate the object

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		// Verify entries reappear on My Workflow Tasks

		await workflowTasksPage.goto();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();

		await workflowTasksPage.assignedToMyRolesLink.click();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that the Object Name is displayed on the Relationship tab when a Relationship is created',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify that the Object Name is autofilled when Label is filled',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			'Test Object Label'
		);

		await expect(page.locator('input[name="name"]')).toHaveValue(
			'TestObjectLabel'
		);

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify that when Objects are not scoped by Site it should not be displayed on the Workflow settings from the Site Menu',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await page.goto(
			`/group${site.friendlyUrlPath}/~/control_panel/manage/-/workflow_configuration`
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object portlet is no longer displayed on the Open Menu when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto('/');

		await page.getByRole('button', {name: 'Open Menu'}).click();

		await expect(
			page.getByRole('link', {
				name: objectDefinition.pluralLabel['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object portlet is no longer displayed on the Site Menu when inactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto('/');

		await page.getByRole('button', {name: 'Product Menu'}).click();

		await expect(
			page.getByRole('link', {
				name: objectDefinition.pluralLabel['en_US'],
			})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Object portlet is displayed again on the Open Menu when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto('/');

		await page.getByRole('button', {name: 'Open Menu'}).click();

		await expect(
			page.getByRole('link', {
				name: objectDefinition.pluralLabel['en_US'],
			})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Object portlet is displayed again on the Site Menu when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto('/');

		await page.getByRole('button', {name: 'Product Menu'}).click();

		await expect(
			page.getByRole('link', {
				name: objectDefinition.pluralLabel['en_US'],
			})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Page Template subtype when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/display_page_templates'
		);

		await page.getByRole('button', {name: 'New'}).click();

		await expect(
			page.getByRole('menuitem', {
				name: objectDefinition.label['en_US'],
			})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Workflow Process Builder page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			'/group/guest/~/control_panel/manage/-/workflow_configuration'
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that the Object is displayed again on the Workflow Site Menu page when reactivated',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				panelCategoryKey: 'site_administration.content',
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition.name
		);

		await page.goto(
			`/group${site.friendlyUrlPath}/~/control_panel/manage/-/workflow_configuration`
		);

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that when the Object is scoped by Site each site will have its own entries',
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

		await apiHelpers.objectEntry.postObjectEntry(
			{[objectFields[0].name!]: 'Site1Entry'},
			'c/' + objectDefinition.name!.toLowerCase() + 's',
			String(site.id)
		);

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await expect(page.getByText('Site1Entry')).toBeVisible();
	}
);

// @ignore = "Test Stub" - PanelDisplaysOnlyItsInstanceObjects

test.skip(
	'LPD-78504 Verify that Objects created on a Virtual Instance are not displayed on the Panel of the Main Instance and vice versa',
	{tag: '@LPD-78504'},
	async () => {
		// This test was originally marked @ignore = "Test Stub" in Poshi and
		// was never implemented. It requires Virtual Instance infrastructure.
		//
		// Intended flow based on Poshi test stub:
		// 1. Create a Virtual Instance
		// 2. On the Main Instance, create a custom object with
		//    panelCategoryKey = "control_panel.object" and publish it
		// 3. On the Virtual Instance, create a different custom object with
		//    panelCategoryKey = "control_panel.object" and publish it
		// 4. On the Main Instance, open the Applications Menu / Control Panel
		//    and verify that only the Main Instance object appears in the panel
		// 5. On the Virtual Instance, open the Applications Menu / Control Panel
		//    and verify that only the Virtual Instance object appears in the panel
		// 6. Clean up by deleting the Virtual Instance
	}
);

test(
	'LPD-78504 Verify that by default the Prevent deletion type of Relationship is selected',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify Prevent deletion type of Relationship One to Many will allow the user to delete an entry with relation from the child Object',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify Prevent deletion type of Relationship One to Many will not allow the user to delete an entry with relation from the parent Object',
	{tag: '@LPD-78504'},
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
	'LPD-78504 Verify that previous filled data is not kept when cancelling the creation of an Object',
	{tag: '@LPD-78504'},
	async ({
		modalAddObjectDefinitionPage,
		page,
		viewObjectDefinitionsPage,
	}) => {
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await modalAddObjectDefinitionPage.objectLabelInput.fill(
			'Cancelled Object'
		);
		await modalAddObjectDefinitionPage.objectPluralLabelInput.fill(
			'Cancelled Objects'
		);

		await page.getByRole('button', {name: 'Cancel'}).click();

		await viewObjectDefinitionsPage.createObjectDefinitionButton.click();

		await expect(
			modalAddObjectDefinitionPage.objectLabelInput
		).toHaveValue('');
		await expect(
			modalAddObjectDefinitionPage.objectPluralLabelInput
		).toHaveValue('');

		await page.getByRole('button', {name: 'Cancel'}).click();
	}
);

test(
	'LPD-78504 Verify that the Relationship is created on both objects for a Many to Many Relationship',
	{tag: '@LPD-78504'},
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

test(
	'LPD-78504 Verify that relationship field is automatically created',
	{tag: '@LPD-78504'},
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

		await objectFieldsPage.goto(objectDefinition2.label['en_US']);

		await expect(page.getByText(relationshipLabel)).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Relationship field will not be displayed on a Collection Display with List Style set as Table when the parent object is inactivated',
	{tag: '@LPD-78504'},
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

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
	'LPD-78504 Verify the Relationship field will not be displayed to be selected for a Page fragment when the parent object is inactivated',
	{tag: '@LPD-78504'},
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

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

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
	'LPD-78504 Verify the Relationship field is no longer displayed when the parent object is inactivated for One to Many',
	{tag: '@LPD-78504'},
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
		await viewObjectDefinitionsPage.goto();

		await viewObjectDefinitionsPage.changeObjectActivateStatus(
			objectDefinition1.name
		);

		await objectFieldsPage.goto(objectDefinition2.label['en_US']);

		await expect(
			page
				.getByRole('row')
				.filter({hasText: relationshipLabel})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify that the Relationship field is not created on Many to Many',
	{tag: '@LPD-78504'},
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

		await objectFieldsPage.goto(objectDefinition2.label['en_US']);

		await expect(
			page
				.getByRole('row')
				.filter({hasText: relationshipLabel})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Verify the Relationship field is displayed again when the parent object is reactivated for One to Many',
	{tag: '@LPD-78504'},
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
			page
				.getByRole('row')
				.filter({hasText: relationshipLabel})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify the Relationship tab is no longer displayed when the other object is inactivated for Many to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage, viewObjectEntriesPage}) => {
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
	'LPD-78504 Verify the Relationship tab is no longer displayed when the child object is inactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage, viewObjectEntriesPage}) => {
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
	'LPD-78504 Verify the Relationship tab is displayed again when the other object is reactivated for Many to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage, viewObjectEntriesPage}) => {
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
	'LPD-78504 Verify the Relationship tab is displayed again when the child object is reactivated for One to Many',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage, viewObjectEntriesPage}) => {
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
	'LPD-78504 Verify that the columns Name System and Status displays the correct value on the Objects table when a Custom Object is created',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		const objectRow = page
			.getByRole('row')
			.filter({hasText: objectDefinition.label['en_US']});

		await expect(objectRow).toBeVisible();
		await expect(objectRow.getByText('No')).toBeVisible();
		await expect(objectRow.getByText('Draft')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that updated data is kept when clicking on the Publish button',
	{tag: '@LPD-78504'},
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

test.fixme(
	'LPD-78504 Verify that when adding a new Object with Account Restriction the Account Restriction field turns into a mandatory field for the created Object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				accountEntryRestricted: true,
				accountEntryRestrictedObjectFieldName: 'r_accountEntryId_accountEntryId',
				status: {code: 0},
			} as any);

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const accountFieldRow = page
			.getByRole('row')
			.filter({hasText: 'Account'});

		await expect(accountFieldRow).toBeVisible();

		await accountFieldRow.getByRole('link').first().click();

		await expect(
			page
				.frameLocator('iframe')
				.getByRole('switch', {name: 'Mandatory'})
		).toBeChecked();
	}
);

test(
	'LPD-78504 Verify that user can view custom objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectDefinitionsPage}) => {
		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectDefinitionsPage.goto();

		await expect(
			page.getByRole('heading', {name: objectDefinition.label['en_US']})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that user can view system objects',
	{tag: '@LPD-78504'},
	async ({page, viewObjectDefinitionsPage}) => {
		await viewObjectDefinitionsPage.goto();

		await expect(page.getByText('User')).toBeVisible();
		await expect(page.getByText('Commerce Order')).toBeVisible();
	}
);

test(
	'LPD-78504 Verify that a withdrawn pending entry is displayed with a Draft status',
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add an entry via API (will be in pending workflow state)

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName!]: 'Entry Test'},
			applicationName
		);

		// Navigate to My Submissions and withdraw the entry

		await page.goto(
			'/group/guest/~/control_panel/manage/-/my_workflow_instances'
		);

		const entryRow = page
			.getByRole('row')
			.filter({hasText: objectDefinition.label['en_US']});

		await entryRow.locator('.dropdown-toggle').click();

		await page.getByRole('menuitem', {name: 'Withdraw'}).click();

		await page.getByRole('button', {name: 'OK'}).click();

		await waitForAlert(page);

		// Navigate to object entries and verify Draft status

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(
			page
				.getByRole('row')
				.filter({hasText: 'Entry Test'})
				.getByText('Draft')
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry through Forms',
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Create a form with Object storage type

		const formBuilderPage = new FormBuilderPage(page);
		const formSettingsModalPage = new FormSettingsModalPage(page);
		const formBuilderSidePanelPage = new FormBuilderSidePanelPage(page);

		await formBuilderPage.goToNew();

		await formBuilderPage.fillFormTitle('Form Object');

		await formBuilderPage.formSettingsButton.click();

		await formSettingsModalPage.selectStorageType('Object');

		await formSettingsModalPage.selectObject(
			objectDefinition.label['en_US']
		);

		await formSettingsModalPage.clickDoneButton();

		// Add text field and map to object field

		await formBuilderSidePanelPage.addTextButton.dblclick();

		await formBuilderSidePanelPage.selectObjectField(
			objectFields[0].label!['en_US']
		);

		await formBuilderSidePanelPage.clickBackButton();

		await formBuilderPage.clickSaveButton();

		await waitForAlert(page);

		await formBuilderPage.clickPublishFormButton();

		// Submit an entry through the form's publish URL

		const formSubmissionURL =
			await formBuilderPage.getFormSubmissionURL();

		await page.goto(formSubmissionURL);

		await page
			.getByLabel(objectFields[0].label!['en_US'])
			.fill('Entry Test');

		await page.getByRole('button', {name: 'Submit'}).click();

		await expect(
			page.getByText('Your information was successfully received')
		).toBeVisible();

		// Navigate to object entries and verify Pending status

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await expect(
			page
				.getByRole('row')
				.filter({hasText: 'Entry Test'})
				.getByText('Pending')
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry through Custom Object portlet',
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

		// Configure Single Approver workflow

		const configurationTabPage = new ConfigurationTabPage(page);

		await configurationTabPage.goTo();

		await configurationTabPage.assignWorkflowToAssetType(
			'Single Approver',
			objectDefinition.label['en_US']
		);

		// Add an entry through the object portlet

		await viewObjectEntriesPage.goto(objectDefinition.className);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await page
			.getByLabel(objectFields[0].label!['en_US'])
			.fill('Entry Test');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await page.goBack();

		// Verify entry has Pending status

		await expect(
			page
				.getByRole('row')
				.filter({hasText: 'Entry Test'})
				.getByText('Pending')
		).toBeVisible();

		// Unassign workflow for cleanup

		await configurationTabPage.goTo();

		await configurationTabPage.unassignWorkflowFromAssetType(
			objectDefinition.label['en_US']
		);
	}
);

test(
	'LPD-78504 Verify that the workflow is triggered when submitting an entry when Object is scoped by Site and the workflow was assigned on the Workflow settings from the Site Menu',
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

		// Configure Single Approver workflow via site workflow settings

		await page.goto(
			`/group${site.friendlyUrlPath}/~/control_panel/manage/-/workflow_configuration`
		);

		const assetTypeRow = page
			.getByRole('row')
			.filter({hasText: objectDefinition.label['en_US']});

		await assetTypeRow.getByRole('button', {name: 'Edit'}).click();

		await assetTypeRow
			.getByRole('combobox')
			.selectOption({label: 'Single Approver'});

		await assetTypeRow.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		// Add an entry through the object portlet

		await viewObjectEntriesPage.goto(
			objectDefinition.className,
			'en',
			site.friendlyUrlPath
		);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		await page
			.getByLabel(objectFields[0].label!['en_US'])
			.fill('Entry Test');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await waitForAlert(page);

		await page.goBack();

		// Verify entry has Pending status

		await expect(
			page
				.getByRole('row')
				.filter({hasText: 'Entry Test'})
				.getByText('Pending')
		).toBeVisible();
	}
);
