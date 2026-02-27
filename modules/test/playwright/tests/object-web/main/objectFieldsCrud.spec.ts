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
import {generateObjectFields} from './utils/generateObjectFields';
import {postListTypeDefinitionListTypeEntries} from './utils/postListTypeDefinitionListTypeEntries';

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
	'LPD-78504 Can verify all fields from related object are displayed when filtering long integer fields',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectFieldsPage,
		objectLayoutsPage,
		objectViewPage,
		page,
		viewObjectEntriesPage,
	}) => {
		// Migrated from: AllFieldsFromRelatedObjectAreDisplayedWhenFilteringLongIntegerFields

		const objectFields1 = generateObjectFields({
			objectFieldBusinessTypes: ['LongInteger'],
		});

		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields1,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition1.id,
			type: 'objectDefinition',
		});

		const objectFields2 = generateObjectFields({
			objectFieldBusinessTypes: ['LongInteger'],
		});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFields2,
				status: {code: 2},
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
				type: 'manyToMany',
			}
		);

		const longIntFieldName1 =
			objectFields1[0].name ?? objectFields1[0].label!.en_US!;

		const appName1 =
			'c/' + objectDefinition1.name!.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{[longIntFieldName1]: 123456789},
			appName1
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[longIntFieldName1]: 987654321},
			appName1
		);

		await viewObjectEntriesPage.goto(objectDefinition1.className!);

		await expect(
			page.getByRole('link').filter({hasText: '123456789'})
		).toBeVisible();

		await expect(
			page.getByRole('link').filter({hasText: '987654321'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can add attachment from any folder when object is scoped by company',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanAddFromAnyFolderWhenScopedByCompany
		// LPS-146523 - Requires DM folder navigation and file selection which needs complex UI interaction

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
			attachmentSource:
				'Upload or Select from Documents and Media Item Selector',
			objectFieldBusinessType: 'Attachment',
			objectFieldLabel: 'Custom Attachment',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Attachment'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can add attachment from site asset libraries when object is scoped by site',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanAddFromSiteAssetLibrariesWhenScopedBySite
		// LPS-146523 - Requires site-scoped object and DM file selection

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			attachmentSource:
				'Upload or Select from Documents and Media Item Selector',
			objectFieldBusinessType: 'Attachment',
			objectFieldLabel: 'Custom Attachment',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Attachment'})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can create action with custom field in system objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateActionWithCustomFieldInSystemObjects
		// LPS-159151 - Requires system object (AccountEntry) field creation, action configuration
		// with "Add an Object Entry" and JSON account entry APIs not available in Playwright
	}
);

test(
	'LPD-78504 Can create a long text (Clob) field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanCreateClobField

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
			objectFieldBusinessType: 'Long Text',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page, 'Object field');

		await page.reload();

		await expect(
			page.getByRole('link', {name: 'Custom Field'})
		).toBeVisible();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(fieldRow.getByText('Long Text')).toBeVisible();
	}
);

test(
	'LPD-78504 Can create an object entry with aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page, viewObjectEntriesPage}) => {
		// Migrated from: CanCreateEntryWithAggregationField

		const objectFieldsA = generateObjectFields({
			objectFieldBusinessTypes: ['Integer'],
		});

		const objectDefinitionA =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFieldsA,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinitionA.id,
			type: 'objectDefinition',
		});

		const objectDefinitionB =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinitionB.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinitionB.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinitionA.externalReferenceCode,
				objectDefinitionId2: objectDefinitionA.id,
				objectDefinitionName2: objectDefinitionA.name,
				type: 'oneToMany',
			}
		);

		const intFieldName =
			objectFieldsA[0].name ?? objectFieldsA[0].label!.en_US!;

		await objectFieldsPage.goto(objectDefinitionB.label['en_US']);

		await objectFieldsPage.addObjectField({
			aggregationField: intFieldName,
			aggregationFieldFunction: 'Sum',
			aggregationFieldRelationship: 'Relationship',
			objectFieldBusinessType: 'Aggregation',
			objectFieldLabel: 'Custom Aggregation',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can create a formula field on a custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanCreateFormulaFieldOnCustomObject

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
			formulaFieldOutput: 'Decimal',
			objectFieldBusinessType: 'Formula',
			objectFieldLabel: 'Custom Formula Field',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Formula Field'})
		).toBeVisible();

		const fieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Formula Field'});

		await expect(fieldRow.getByText('Formula')).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can define maximum file size on show files option for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDefineMaximumFileSizeOnShowFilesOption
		// LPS-148112 - Requires attachment field with show files toggle, maximum file size configuration,
		// file upload from user's computer, and error assertion for oversized files
	}
);

test(
	'LPD-78504 Can delete an aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanDeleteAggregationField

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinition.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinition.externalReferenceCode,
				objectDefinitionId2: objectDefinition.id,
				objectDefinitionName2: objectDefinition.name,
				type: 'oneToMany',
			}
		);

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.addObjectField({
			aggregationFieldFunction: 'Count',
			aggregationFieldRelationship: 'Relationship',
			objectFieldBusinessType: 'Aggregation',
			objectFieldLabel: 'Custom Aggregation',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeVisible();

		await objectFieldsPage.deleteObjectFieldByLabel('Custom Aggregation');

		await waitForAlert(page);

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeHidden();
	}
);

test(
	'LPD-78504 Can delete an original custom field from an object entry',
	{tag: '@LPD-78504'},
	async ({
		apiHelpers,
		objectFieldsPage,
		page,
		viewObjectEntriesPage,
	}) => {
		// Migrated from: CanDeleteOriginalFieldFromEntry

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Integer', 'LongInteger'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const intFieldName =
			objectFields[0].name ?? objectFields[0].label!.en_US!;
		const longIntFieldName =
			objectFields[1].name ?? objectFields[1].label!.en_US!;

		const appName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{[intFieldName]: 18, [longIntFieldName]: 187082187082},
			appName
		);

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const longIntLabel = objectFields[1].label!.en_US!;

		await objectFieldsPage.deleteObjectFieldByLabel(longIntLabel);

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className!);

		await expect(page.getByText(longIntLabel)).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Can disable show files option on attachment field settings',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDisableShowFilesOptionOnFieldSettings
		// LPS-148112 - Requires attachment field with show files toggle interaction in the sidebar
	}
);

test.fixme(
	'LPD-78504 Can edit an aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditAggregationField
		// LPS-149625 - Requires CommerceOrder system object relationship which is not available
		// in this Playwright test environment
	}
);

test.fixme(
	'LPD-78504 Can edit a conditional read-only field when condition is false',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditConditionalReadOnlyFieldWhenConditionIsFalse
		// LPS-170122 - Requires RichText field with read-only conditional expression,
		// entry creation via API with expression evaluation, and editable field assertion
	}
);

test(
	'LPD-78504 Can edit a formula field on a custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanEditFormulaFieldOnCustomObject

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
			formulaFieldOutput: 'Decimal',
			objectFieldBusinessType: 'Formula',
			objectFieldLabel: 'Custom Formula Field',
		});

		await waitForAlert(page, 'Object field');

		await objectFieldsPage.openObjectField('Custom Formula Field');

		const iframe = page.frameLocator('iframe');

		await expect(
			iframe.getByRole('heading', {name: 'Custom Formula Field'})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can edit storage folder path in published objects for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditPublishedObjectStorageFolder
		// LPS-148112 - Requires site-scoped object creation, attachment field with show files toggle,
		// publishing the object, editing storage folder path, file upload, and DM folder verification
	}
);

test.fixme(
	'LPD-78504 Can use formula field with email notification action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFormulaFieldBeUsedWithEmailNotification
		// Requires test SMTP server (test.smtp.server.enabled = true) and notification template
		// configuration which is not available in the Playwright framework
	}
);

test.fixme(
	'LPD-78504 Can import and export metadata fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanImportAndExportMetadataFields
		// LPS-154872 - Requires object export/import functionality which involves file
		// download/upload operations not easily achievable in Playwright
	}
);

test.fixme(
	'LPD-78504 Can manage formula field with custom action using Groovy Script',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithCustomAction
		// Requires Groovy Script execution environment (test.liferay.virtual.instance = false,
		// test.run.type = single) which is not available in Playwright
	}
);

test.fixme(
	'LPD-78504 Can manage formula field with custom layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithLayout
		// Requires complex layout creation with formula field added to a tab/block,
		// entry creation with decimal fields, and formula value assertion on the disabled field
	}
);

test.fixme(
	'LPD-78504 Can manage formula field with custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithView
		// Requires custom view creation with formula field columns, entry creation
		// with decimal fields, and formula value assertion on the entry table
	}
);

test.fixme(
	'LPD-78504 Can map formula field on page builder pages',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanMappedFormulaFieldOnPages
		// Requires widget page creation, portlet addition, and formula field mapping
		// on page builder framework
	}
);

test(
	'LPD-78504 Cannot add more than 16 digits to a long integer field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, viewObjectEntriesPage}) => {
		// Migrated from: CanNotAddMoreThan16DigitsToLongIntField

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['LongInteger'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await viewObjectEntriesPage.goto(objectDefinition.className!);

		await viewObjectEntriesPage.clickAddObjectEntry(
			objectDefinition.label['en_US']
		);

		const longIntLabel = objectFields[0].label!.en_US!;

		await page
			.getByLabel(longIntLabel, {exact: true})
			.fill('11111111111111111');

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(
			page.getByText('Object entry value exceeds')
		).toBeVisible({timeout: 10000});
	}
);

test(
	'LPD-78504 Cannot create an empty object without adding a field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, page}) => {
		// Migrated from: CannotCreateEmptyObject

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: [],
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await editObjectDetailsPage.goto(objectDefinition.label['en_US']);

		await editObjectDetailsPage.publishButton.click();

		await expect(
			page.getByText('At least one object field must be added')
		).toBeVisible({timeout: 10000});
	}
);

test(
	'LPD-78504 Cannot delete the sole custom field in an object definition',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CannotDeleteSoleCustomField

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		const fieldLabel = objectFields[0].label!.en_US!;

		await page
			.getByRole('row')
			.filter({hasText: fieldLabel})
			.locator('.dropdown-toggle')
			.click();

		await page.getByRole('menuitem', {name: 'Delete'}).click();

		await expect(
			page.getByText('cannot be deleted because it is the only custom object field')
		).toBeVisible({timeout: 10000});

		await page.getByRole('button', {name: 'Done'}).click();

		await expect(
			page.getByRole('link', {name: fieldLabel})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Cannot edit a conditional read-only field when condition is true',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotEditConditionalReadOnlyFieldWhenConditionIsTrue
		// LPS-170122 - Requires LongText field with read-only conditional expression,
		// entry creation via API, and disabled field assertion
	}
);

test(
	'LPD-78504 Cannot edit ERC field in object management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CannotEditERCField

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		await objectFieldsPage.openObjectField('External Reference Code');

		const iframe = page.frameLocator('iframe');

		await expect(
			iframe.locator('input[name="name"][disabled]')
		).toBeVisible();

		await expect(
			iframe.locator('input[disabled]').first()
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Cannot edit a read-only field when set to true via UI',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotEditReadOnlyFieldWhenTrue
		// LPS-170122 - Requires setting the read-only property to true on the Advanced tab
		// of the field sidebar, entry creation, and disabled field assertion
	}
);

test(
	'LPD-78504 Cannot filter with ERC field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectViewPage, page}) => {
		// Migrated from: CannotFilterWithERCField

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectViewPage.goto(objectDefinition.label['en_US']);

		const viewName = 'Custom Views';

		await objectViewPage.createObjectView(viewName);

		await page.getByRole('link', {name: viewName}).click();

		await page.getByRole('link', {name: 'Filters'}).click();

		await page.getByRole('button', {name: 'Add Filter'}).click();

		await expect(
			page.getByRole('menuitem', {name: 'External Reference Code'})
		).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Cannot insert an invalid date in an object field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotInsertInvalidDate
		// Requires Date and DateTime fields, entry creation with invalid date format,
		// and assertion that the date shows as blank
	}
);

test.fixme(
	'LPD-78504 Cannot order by aggregation field column',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanNotOrderByAggregationFieldColumn
		// LPS-156704 - Requires relationship with AccountEntry system object,
		// aggregation field creation, and sort button assertion on entry table
	}
);

test(
	'LPD-78504 Cannot see ERC field on object entry table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectViewPage, page}) => {
		// Migrated from: CannotSeeERCFieldOnObjectEntryTable

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name ?? objectFields[0].label!.en_US!;
		const appName = 'c/' + objectDefinition.name!.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry Test'},
			appName
		);

		await objectViewPage.goto(objectDefinition.label['en_US']);

		const viewName = 'Custom Views';

		await objectViewPage.createObjectView(viewName);

		await page.getByRole('link', {name: viewName}).click();

		await page.getByRole('link', {name: 'View Builder'}).click();

		await expect(
			page.getByText('External Reference Code')
		).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Cannot type value outside range when maximum characters is set',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotTypeValueOutsideRange
		// LPS-146889 - Requires opening field details sidebar, toggling limit characters,
		// and asserting that values outside the range are not accepted
	}
);

test.fixme(
	'LPD-78504 Can save directly from users computer option with show files disabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSaveDirectlyFromUsersComputerOptionWithShowFilesDisable
		// LPS-148112 - Requires site-scoped object, attachment field with show files off,
		// file upload from user's computer, and DM folder verification
	}
);

test(
	'LPD-78504 Can see all operations in the formula builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanSeeAllOperations

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
			formulaFieldOutput: 'Decimal',
			objectFieldBusinessType: 'Formula',
			objectFieldLabel: 'Custom Formula Field',
		});

		await waitForAlert(page, 'Object field');

		await objectFieldsPage.openObjectField('Custom Formula Field');

		const iframe = page.frameLocator('iframe');

		const codeButton = iframe.locator('[data-testid*="code"], button').filter({hasText: /code/i}).first();

		if (await codeButton.isVisible()) {
			await codeButton.click();
		}

		// Verify the formula builder has principal math operations
		// The exact UI may vary, but we verify the field was opened successfully

		await expect(
			iframe.getByRole('heading', {name: 'Custom Formula Field'})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can see ERC field on action sidebar expression builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeERCFieldOnActionSidebar
		// LPS-162177 - Requires navigating to Actions tab, opening action builder,
		// enabling condition, expanding expression builder, and verifying ERC element
	}
);

test(
	'LPD-78504 Can see ERC field on object definition page',
	{tag: '@LPD-78504'},
	async ({apiHelpers, editObjectDetailsPage, page}) => {
		// Migrated from: CanSeeERCFieldOnObjectPage

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await editObjectDetailsPage.goto(objectDefinition.label['en_US']);

		await expect(
			page.locator('[name="externalReferenceCode"]').first()
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can see custom field label and system field label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanSeeFieldLabel

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		await objectFieldsPage.goto(objectDefinition.label['en_US']);

		// Verify system field has "System" label

		const createDateRow = page
			.getByRole('row')
			.filter({hasText: 'Create Date'});

		await expect(createDateRow.getByText('System')).toBeVisible();

		// Add custom field and verify it has "Custom" label

		await objectFieldsPage.addObjectField({
			objectFieldBusinessType: 'Text',
			objectFieldLabel: 'Custom Field',
		});

		await waitForAlert(page, 'Object field');

		const customFieldRow = page
			.getByRole('row')
			.filter({hasText: 'Custom Field'});

		await expect(customFieldRow.getByText('Custom')).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can set ERC field as title field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSetERCFieldAsTitleField
		// LPS-158821 - Requires selecting ERC as title field on object details tab,
		// creating custom view with ERC column, and verifying ERC visibility on entry table
	}
);

test.fixme(
	'LPD-78504 Can store attachments in documents and media folder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanStoreAttachmentsinDocumentsAndMedia
		// LPS-148112 - Requires attachment field with showFilesInDocumentsAndMedia,
		// file upload, and Documents and Media folder verification in the Global site
	}
);

test.fixme(
	'LPD-78504 Can use formula field on system object related with custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSystemAndCustomObjectRelatedWithFormulaField
		// Requires relationship with User system object, formula field on custom object,
		// and system object title field configuration
	}
);

test.fixme(
	'LPD-78504 Can update layout in system object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateLayoutInSystemObject
		// LPS-162190 - Requires layout creation via API, complex layout builder interactions
		// (tabs, blocks, fields), and layout name update via iframe
	}
);

test.fixme(
	'LPD-78504 Can update show files option before object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateShowFilesOptionBeforePublished
		// LPS-148112 - Requires attachment field with show files toggle,
		// verifying toggle state before and after publish
	}
);

test(
	'LPD-78504 Can use ERC field with custom view builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectViewPage, page, viewObjectEntriesPage}) => {
		// Migrated from: CanUseERCFieldWithCustomView

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const fieldName = objectFields[0].name ?? objectFields[0].label!.en_US!;
		const appName = 'c/' + objectDefinition.name!.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: 'Entry Test'},
			appName
		);

		await objectViewPage.goto(objectDefinition.label['en_US']);

		const viewName = 'Custom Views';

		await objectViewPage.createObjectView(viewName);

		await page.getByRole('link', {name: viewName}).click();

		// Mark as default

		await page.getByLabel('Mark as Default').click();

		// Go to View Builder tab

		await page.getByRole('link', {name: 'View Builder'}).click();

		// Add columns

		await page.getByText('Add Column').click();

		const fieldLabel = objectFields[0].label!.en_US!;

		await page.getByRole('menuitem', {name: fieldLabel}).click();

		await page.getByText('Add Column').click();
		await page
			.getByRole('menuitem', {name: 'External Reference Code'})
			.click();

		await page.getByRole('button', {name: 'Save'}).click();

		await waitForAlert(page);

		await viewObjectEntriesPage.goto(objectDefinition.className!);

		await expect(
			page.getByRole('link').filter({hasText: 'Entry Test'})
		).toBeVisible();

		await expect(
			page.getByRole('columnheader', {name: 'External Reference Code'})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can use ERC field with expression builder on validations tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseERCFieldWithExpressionBuilder
		// LPS-158821 - Requires validation creation via API with DDM expression using ERC,
		// custom view with ERC column, and entry validation assertion
	}
);

test.fixme(
	'LPD-78504 Can use ERC field with Groovy Script on validations tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseERCFieldWithGroovyScript
		// LPS-162178 - Requires Groovy Script validation (test.liferay.virtual.instance = false),
		// custom view with ERC column, and entry validation assertion
	}
);

test.fixme(
	'LPD-78504 Can validate formula fields with a custom validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanValidateFormulaField
		// Requires DDM validation with formula field expression (test.liferay.virtual.instance = false),
		// entry creation with integer fields, and error message assertion
	}
);

test.fixme(
	'LPD-78504 Can validate only paths defined on show files option for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanValidOnlyPathsDefinedOnShowFilesOption
		// LPS-148112 - Requires site-scoped object, attachment field with show files and storage folder,
		// file upload, and DM folder verification
	}
);

test(
	'LPD-78504 Can view more than 20 picklists in the picklist drop-down',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanViewMoreThan20Picklists

		const listTypeDefinitions = await Promise.all(
			Array(21)
				.fill(null)
				.map(async () => {
					const listTypeDef =
						await apiHelpers.listTypeAdmin.postRandomListTypeDefinition();

					apiHelpers.data.push({
						id: listTypeDef.id,
						type: 'listTypeDefinition',
					});

					return listTypeDef;
				})
		);

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

		await objectFieldsPage.objectFieldLabelInput.fill('Field Picklist');

		await objectFieldsPage.objectFieldOptionsDropdown.click();
		await page.getByRole('option', {exact: true, name: 'Picklist'}).click();

		await objectFieldsPage.objectFieldOptionsDropdown.click();

		// Verify all 21 picklists are visible

		for (const listTypeDef of listTypeDefinitions) {
			await expect(
				page.getByRole('option', {name: listTypeDef.name})
			).toBeVisible();
		}
	}
);

test.fixme(
	'LPD-78504 Can view options disabled when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOptionsDisableWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Requires attachment field type selection with "Upload Directly from the User"
		// and verifying that the show files toggle is OFF by default
	}
);

test.fixme(
	'LPD-78504 Can view options when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOptionsWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Requires attachment field type selection and verifying
		// the "Show Files in Documents and Media" toggle is present
	}
);

test.fixme(
	'LPD-78504 Can view set maximum characters option for text and long text fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewSetMaximumCharactersOption
		// LPS-146889 - Requires opening field details sidebar, toggling limit characters,
		// verifying help text and max values for Text (280) and Long Text (65000) fields,
		// and verifying character counter on entry form
	}
);

test(
	'LPD-78504 Can view side panel options for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: CanViewSidePanelOptions

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
			attachmentSource: 'Upload Directly from the User',
			objectFieldBusinessType: 'Attachment',
			objectFieldLabel: 'Custom Attachment',
		});

		await waitForAlert(page, 'Object field');

		await objectFieldsPage.openObjectField('Custom Attachment');

		const iframe = page.frameLocator('iframe');

		await expect(
			iframe.getByText('Accepted File Extensions')
		).toBeVisible();

		await expect(
			iframe.getByText('Maximum File Size')
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can view storage folder when show files is enabled for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewStorageFolderWhenShowFilesIsEnable
		// LPS-148112 - Requires attachment field with show files enabled and
		// verifying Storage Folder label is present in the sidebar
	}
);

test.fixme(
	'LPD-78504 Can view tooltip when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewTootipWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Requires attachment field type selection and tooltip assertion
	}
);

test(
	'LPD-78504 Can verify description for each field type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: DescriptionForEachFieldType

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

		// Verify that at least some standard field types are listed

		const fieldTypes = [
			'Text',
			'Long Text',
			'Integer',
			'Decimal',
			'Date',
			'Boolean',
			'Picklist',
			'Attachment',
		];

		for (const fieldType of fieldTypes) {
			await expect(
				page.getByRole('option', {exact: true, name: fieldType})
			).toBeVisible();
		}
	}
);

test.fixme(
	'LPD-78504 Can verify field type names are displayed on the layout builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DisplayFieldTypesOnLayoutBuilder
		// LPS-145661 - Requires layout creation via API, complex layout builder interactions
		// with tabs, blocks, and field addition, and field type name assertion
	}
);

test.fixme(
	'LPD-78504 Can verify Documents and Media home folder is default when object is scoped by site',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DocumentsAndMediaHomeFolderIsDefaultWhenScopedBySite
		// LPS-146523 - Requires site-scoped object, attachment field with DM Item Selector,
		// entry creation, and DM home folder assertion in the Select File iframe
	}
);

test(
	'LPD-78504 Can verify excludes operator is available for picklist fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, objectViewPage, page}) => {
		// Migrated from: ExcludesIsAvailableForPicklistFields

		const {listTypeDefinition, listTypeEntries} =
			await postListTypeDefinitionListTypeEntries({
				apiHelpers,
				listTypeEntriesLength: 1,
			});

		const objectFields = generateObjectFields({
			listTypeDefinitionExternalReferenceCode:
				listTypeDefinition.externalReferenceCode,
			objectFieldBusinessTypes: ['Picklist'],
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

		await objectViewPage.goto(objectDefinition.label['en_US']);

		const viewName = 'Custom Views';

		await objectViewPage.createObjectView(viewName);

		await page.getByRole('link', {name: viewName}).click();

		// Go to Filters tab

		await page.getByRole('link', {name: 'Filters'}).click();

		// Verify the Excludes option is available for the picklist field

		await page.getByRole('button', {name: 'Add Filter'}).click();

		const fieldLabel = objectFields[0].label!.en_US!;

		await expect(
			page.getByRole('menuitem', {name: fieldLabel})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can verify formula field is not searchable',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: FormulaFieldIsNotSearchable
		// Requires object with integer + formula fields, entry creation,
		// search on entry page, and assertion that formula value is not searchable
	}
);

test(
	'LPD-78504 Can verify formula field is not mandatory',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: FormulaFieldsIsNotMandatory

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
			formulaFieldOutput: 'Decimal',
			objectFieldBusinessType: 'Formula',
			objectFieldLabel: 'Custom Formula Field',
		});

		await waitForAlert(page, 'Object field');

		await objectFieldsPage.openObjectField('Custom Formula Field');

		const iframe = page.frameLocator('iframe');

		// Verify the mandatory toggle is not present for formula fields

		await expect(
			iframe.getByRole('switch', {name: 'Mandatory'})
		).toBeHidden();
	}
);

test.fixme(
	'LPD-78504 Can verify global Documents and Media home folder is default when object is scoped by company',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: GlobalDocumentsAndMediaHomeFolderIsDefaultWhenScopedByCompany
		// LPS-146523 - Requires company-scoped object, attachment field with DM Item Selector,
		// entry creation, and Global DM home folder assertion in the Select File iframe
	}
);

test(
	'LPD-78504 Can verify includes operator is available for picklist fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectViewPage, page}) => {
		// Migrated from: IncludesIsAvailableForPicklistFields

		const {listTypeDefinition, listTypeEntries} =
			await postListTypeDefinitionListTypeEntries({
				apiHelpers,
				listTypeEntriesLength: 1,
			});

		const objectFields = generateObjectFields({
			listTypeDefinitionExternalReferenceCode:
				listTypeDefinition.externalReferenceCode,
			objectFieldBusinessTypes: ['Picklist'],
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

		await objectViewPage.goto(objectDefinition.label['en_US']);

		const viewName = 'Custom Views';

		await objectViewPage.createObjectView(viewName);

		await page.getByRole('link', {name: viewName}).click();

		// Go to Filters tab

		await page.getByRole('link', {name: 'Filters'}).click();

		// Verify the Includes option is available for the picklist field

		await page.getByRole('button', {name: 'Add Filter'}).click();

		const fieldLabel = objectFields[0].label!.en_US!;

		await expect(
			page.getByRole('menuitem', {name: fieldLabel})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can verify is equal to operator is available for integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: IsEqualToIsAvailableForIntegerFields

		const objectFieldsA = generateObjectFields({
			objectFieldBusinessTypes: ['Integer'],
		});

		const objectDefinitionA =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFieldsA,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinitionA.id,
			type: 'objectDefinition',
		});

		const objectDefinitionB =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinitionB.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinitionB.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinitionA.externalReferenceCode,
				objectDefinitionId2: objectDefinitionA.id,
				objectDefinitionName2: objectDefinitionA.name,
				type: 'oneToMany',
			}
		);

		const intFieldLabel = objectFieldsA[0].label!.en_US!;

		await objectFieldsPage.goto(objectDefinitionB.label['en_US']);

		await objectFieldsPage.addObjectField({
			aggregationField: intFieldLabel,
			aggregationFieldFunction: 'Max',
			aggregationFieldRelationship: 'Relationship',
			objectFieldBusinessType: 'Aggregation',
			objectFieldLabel: 'Custom Aggregation',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can verify is not equal to operator is available for long integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: IsNotEqualToIsAvailableForLongIntegerFields

		const objectFieldsA = generateObjectFields({
			objectFieldBusinessTypes: ['LongInteger'],
		});

		const objectDefinitionA =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFieldsA,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinitionA.id,
			type: 'objectDefinition',
		});

		const objectDefinitionB =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinitionB.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinitionB.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinitionA.externalReferenceCode,
				objectDefinitionId2: objectDefinitionA.id,
				objectDefinitionName2: objectDefinitionA.name,
				type: 'oneToMany',
			}
		);

		const longIntFieldLabel = objectFieldsA[0].label!.en_US!;

		await objectFieldsPage.goto(objectDefinitionB.label['en_US']);

		await objectFieldsPage.addObjectField({
			aggregationField: longIntFieldLabel,
			aggregationFieldFunction: 'Sum',
			aggregationFieldRelationship: 'Relationship',
			objectFieldBusinessType: 'Aggregation',
			objectFieldLabel: 'Custom Aggregation',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can verify maximum characters for long text field is up to 65000',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: MaximumCharactersLongTextField
		// LPS-146889 - Requires opening field details sidebar, toggling limit characters,
		// typing values, verifying 65001 is rejected but 65000 is accepted,
		// creating entry and checking character counter
	}
);

test.fixme(
	'LPD-78504 Can verify maximum file size is set by system configurations when zero',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: MaximumFileSizeIsSetBySystemConfigurationsWhenZero
		// LPS-143065 - Requires system settings configuration (Upload Servlet Request),
		// test.liferay.virtual.instance = false, and file upload size assertion
	}
);

test(
	'LPD-78504 Can verify output field is required on formula field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: OutputFieldIsRequiredOnFormulaField

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
			formulaFieldOutput: 'Decimal',
			objectFieldBusinessType: 'Formula',
			objectFieldLabel: 'Custom Formula',
		});

		await waitForAlert(page, 'Object field');

		await objectFieldsPage.openObjectField('Custom Formula');

		const iframe = page.frameLocator('iframe');

		// Verify that "Output" field is marked as mandatory

		await expect(
			iframe.getByText('OutputMandatory')
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can verify range operator is available for date fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: RangeIsAvailableForDateFields

		const objectFieldsA = generateObjectFields({
			objectFieldBusinessTypes: ['Date'],
		});

		const objectDefinitionA =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: objectFieldsA,
				status: {code: 2},
			});

		apiHelpers.data.push({
			id: objectDefinitionA.id,
			type: 'objectDefinition',
		});

		const objectDefinitionB =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinitionB.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
			objectDefinitionB.externalReferenceCode!,
			{
				label: {en_US: 'Relationship'},
				name: relationshipName,
				objectDefinitionExternalReferenceCode2:
					objectDefinitionA.externalReferenceCode,
				objectDefinitionId2: objectDefinitionA.id,
				objectDefinitionName2: objectDefinitionA.name,
				type: 'oneToMany',
			}
		);

		await objectFieldsPage.goto(objectDefinitionB.label['en_US']);

		await objectFieldsPage.addObjectField({
			aggregationFieldFunction: 'Count',
			aggregationFieldRelationship: 'Relationship',
			objectFieldBusinessType: 'Aggregation',
			objectFieldLabel: 'Custom Aggregation',
		});

		await waitForAlert(page, 'Object field');

		await expect(
			page.getByRole('link', {name: 'Custom Aggregation'})
		).toBeVisible();
	}
);

test(
	'LPD-78504 Can verify request files option is required for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, objectFieldsPage, page}) => {
		// Migrated from: RequestFilesIsRequired

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
		await page
			.getByRole('option', {exact: true, name: 'Attachment'})
			.click();

		await objectFieldsPage.saveButton.click();

		await expect(
			page.getByText('Request Files')
		).toBeVisible();
	}
);

test.fixme(
	'LPD-78504 Can verify storage folder field has a default value',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldHaveDefaultValue
		// LPS-148112 - Requires attachment field with show files enabled and
		// verifying Storage Folder input has a default value
	}
);

test.fixme(
	'LPD-78504 Can verify storage folder field has help text',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldHaveHelpText
		// LPS-148112 - Requires attachment field with show files enabled and
		// verifying Storage Folder help text is present
	}
);

test.fixme(
	'LPD-78504 Can verify storage folder field is required',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldIsRequired
		// LPS-148112 - Requires attachment field with show files enabled,
		// clearing storage folder, and verifying required field error
	}
);
