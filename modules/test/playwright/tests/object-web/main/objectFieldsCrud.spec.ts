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
	'LPD-78504 Can verify all fields from related object are displayed when filtering long integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: AllFieldsFromRelatedObjectAreDisplayedWhenFilteringLongIntegerFields
		// Verify that all fields from the related object are displayed when adding filters for the long integer fields to select data from the object
	}
);

test(
	'LPD-78504 Can add attachment from any folder when object is scoped by company',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddFromAnyFolderWhenScopedByCompany
		// LPS-146523 - Verify if the scope of the object is Virtual Instance (Company) I will be able to add from any folders I have access to
	}
);

test(
	'LPD-78504 Can add attachment from site asset libraries when object is scoped by site',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddFromSiteAssetLibrariesWhenScopedBySite
		// LPS-146523 - Verify if the scope of the object is Site, I will be able to add from the site I'm in or Asset Libraries connected to that site I have access to
	}
);

test(
	'LPD-78504 Can create action with custom field in system objects',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateActionWithCustomFieldInSystemObjects
		// LPS-159151 - Verify that it's possible to create an Action with a custom field in a System Object
	}
);

test(
	'LPD-78504 Can create a long text (Clob) field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateClobField
		// LPS-142659 - Verify it is possible to create a Clob field
	}
);

test(
	'LPD-78504 Can create an object entry with aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateEntryWithAggregationField
		// LPS-149625 - Verify that it's possible to create an object entry with aggregation field
	}
);

test(
	'LPD-78504 Can create a formula field on a custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateFormulaFieldOnCustomObject
		// Verify that the user is able to add formula fields when managing System Objects
	}
);

test(
	'LPD-78504 Can define maximum file size on show files option for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDefineMaximumFileSizeOnShowFilesOption
		// LPS-148112 - Verify that File Size and Format defined by admin are working correctly when using the Show Files option
	}
);

test(
	'LPD-78504 Can delete an aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteAggregationField
		// LPS-149625 - Verify that it's possible to delete an aggregation field
	}
);

test(
	'LPD-78504 Can delete an original custom field from an object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteOriginalFieldFromEntry
		// LPS-179803 - Verify the field in an object entry is removed when the user deletes a custom field that was added before the initial publication
	}
);

test(
	'LPD-78504 Can disable show files option on attachment field settings',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDisableShowFilesOptionOnFieldSettings
		// LPS-148112 - Verify if turn off the Show files option on field settings
	}
);

test(
	'LPD-78504 Can edit an aggregation field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditAggregationField
		// LPS-149625 - Verify that it's possible to edit an aggregation field
	}
);

test(
	'LPD-78504 Can edit a conditional read-only field when condition is false',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditConditionalReadOnlyFieldWhenConditionIsFalse
		// LPS-170122 - Verify the field value cannot be changed when the ready-only property condition is false
	}
);

test(
	'LPD-78504 Can edit a formula field on a custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditFormulaFieldOnCustomObject
		// Verify the Formula Field can be edited in a Custom Object
	}
);

test(
	'LPD-78504 Can edit storage folder path in published objects for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditPublishedObjectStorageFolder
		// LPS-148112 - Verify that admin can edit the Storage Folder path in Published objects
	}
);

test(
	'LPD-78504 Can use formula field with email notification action',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFormulaFieldBeUsedWithEmailNotification
		// Verify that the user can use Formula Field with Email Notification
	}
);

test(
	'LPD-78504 Can import and export metadata fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanImportAndExportMetadataFields
		// LPS-154872 - Verify that it's possible to import and export metadata fields
	}
);

test(
	'LPD-78504 Can manage formula field with custom action using Groovy Script',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithCustomAction
		// Verify that the user is able to add the Formula Field when managing Custom Action with Groovy Script
	}
);

test(
	'LPD-78504 Can manage formula field with custom layout',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithLayout
		// Verify that the user is able to add the Formula Field when managing Custom Layout
	}
);

test(
	'LPD-78504 Can manage formula field with custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanManageFormulaFieldWithView
		// Verify that the user is able to add the Formula Field when managing Custom View
	}
);

test(
	'LPD-78504 Can map formula field on page builder pages',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanMappedFormulaFieldOnPages
		// Verify that formula fields can be mapped on the page builder framework
	}
);

test(
	'LPD-78504 Cannot add more than 16 digits to a long integer field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanNotAddMoreThan16DigitsToLongIntField
		// LPS-165995 - Verify that a message is displayed when the user tries to add more than 16 digits to a long integer field
	}
);

test(
	'LPD-78504 Cannot create an empty object without adding a field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotCreateEmptyObject
		// LPS-161887 - Verify that it's not possible to create an Object without adding a field
	}
);

test(
	'LPD-78504 Cannot delete the sole custom field in an object definition',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotDeleteSoleCustomField
		// LPS-179803 - Verify the user cannot delete the only custom field in an object definition
	}
);

test(
	'LPD-78504 Cannot edit a conditional read-only field when condition is true',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotEditConditionalReadOnlyFieldWhenConditionIsTrue
		// LPS-170122 - Verify the field value cannot be changed when the ready-only property condition is true
	}
);

test(
	'LPD-78504 Cannot edit ERC field in object management',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotEditERCField
		// LPS-162174 - Verify that it is not possible to edit ERC fields in Objects management
	}
);

test(
	'LPD-78504 Cannot edit a read-only field when set to true via UI',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotEditReadOnlyFieldWhenTrue
		// LPS-170122 - Verify the field value cannot be changed when the ready-only property is set to true (via UI)
	}
);

test(
	'LPD-78504 Cannot filter with ERC field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotFilterWithERCField
		// LPS-162182 - Verify that it is not possible to edit ERC fields in Objects management
	}
);

test(
	'LPD-78504 Cannot insert an invalid date in an object field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotInsertInvalidDate
		// Verify that the user cannot insert an invalid date in an object field
	}
);

test(
	'LPD-78504 Cannot order by aggregation field column',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanNotOrderByAggregationFieldColumn
		// LPS-156704 - Verify that the user is not able to order the object entry table by the aggregation field column
	}
);

test(
	'LPD-78504 Cannot see ERC field on object entry table',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotSeeERCFieldOnObjectEntryTable
		// LPS-162175 - Verify that the ERC field is not displayed on the Objects entry table
	}
);

test(
	'LPD-78504 Cannot type value outside range when maximum characters is set',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotTypeValueOutsideRange
		// LPS-146889 - Verify that when turn on the Set the Maximum Number of Characters the user is not allowed to type any value outside the informed range on the help text
	}
);

test(
	'LPD-78504 Can save directly from users computer option with show files disabled',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSaveDirectlyFromUsersComputerOptionWithShowFilesDisable
		// LPS-148112 - Verify that attachment field is working fine to the selecting Request Files: Directly from Users Computer when Show files option is off
	}
);

test(
	'LPD-78504 Can see all operations in the formula builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeAllOperations
		// LPS-176828 - Verify that the Formula Builder has same structure as Expression Builder and contains only the principal math operations
	}
);

test(
	'LPD-78504 Can see ERC field on action sidebar expression builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeERCFieldOnActionSidebar
		// LPS-162177 - Verify the ERC element is included in Actions - Expression Builder
	}
);

test(
	'LPD-78504 Can see ERC field on object definition page',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeERCFieldOnObjectPage
		// LPS-162176 - Verify that the ERC is displayed on the object definition page
	}
);

test(
	'LPD-78504 Can see custom field label and system field label',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeFieldLabel
		// Verify that it's possible to see the custom field label and system field label
	}
);

test(
	'LPD-78504 Can set ERC field as title field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSetERCFieldAsTitleField
		// LPS-158821 - Verify that the user is able to set the ERC field as a Title Field
	}
);

test(
	'LPD-78504 Can store attachments in documents and media folder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanStoreAttachmentsinDocumentsAndMedia
		// LPS-148112 - Verify attachments uploaded from the users computer can be stored in a folder in Documents and Media when the object scope is by company
	}
);

test(
	'LPD-78504 Can use formula field on system object related with custom object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSystemAndCustomObjectRelatedWithFormulaField
		// Verify that is possible to use Formula Field on System Object related with Custom Object
	}
);

test(
	'LPD-78504 Can update layout in system object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateLayoutInSystemObject
		// LPS-162190 - Verify that it's possible to update the layout of a System Object
	}
);

test(
	'LPD-78504 Can update show files option before object is published',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateShowFilesOptionBeforePublished
		// LPS-148112 - Verify if on the side panel the Show files path can be edited
	}
);

test(
	'LPD-78504 Can use ERC field with custom view builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseERCFieldWithCustomView
		// LPS-158821 - Verify that the user is able to use the ERC field in View Builder, on the Custom Views tab
	}
);

test(
	'LPD-78504 Can use ERC field with expression builder on validations tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseERCFieldWithExpressionBuilder
		// LPS-158821 - Verify that the user is able to use the ERC field in Expression Builder, on the Validations tab
	}
);

test(
	'LPD-78504 Can use ERC field with Groovy Script on validations tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUseERCFieldWithGroovyScript
		// LPS-162178 - Verify that the user is able to use the ERC field in Groovy Scripts, on the Validations tab
	}
);

test(
	'LPD-78504 Can validate formula fields with a custom validation',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanValidateFormulaField
		// Verify the user can validate Formula Fields with a Custom Validation
	}
);

test(
	'LPD-78504 Can validate only paths defined on show files option for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanValidOnlyPathsDefinedOnShowFilesOption
		// LPS-148112 - Verify if on the side panel that only valid paths can be used on the Show files settings
	}
);

test(
	'LPD-78504 Can view more than 20 picklists in the picklist drop-down',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewMoreThan20Picklists
		// LPS-147944 - Verify it is possible to view more than 20 picklists for the picklist drop-down
	}
);

test(
	'LPD-78504 Can view options disabled when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOptionsDisableWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Verify if when selecting the option on Request Files: Directly from Users Computer the toggle is OFF by default
	}
);

test(
	'LPD-78504 Can view options when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOptionsWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Verify if when selecting the option on Request Files: Directly from Users Computer there is a Toggle
	}
);

test(
	'LPD-78504 Can view set maximum characters option for text and long text fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewSetMaximumCharactersOption
		// LPS-146889 - Verify that Set the Maximum Number of Characters toggle is available for Text and Long Text fields
	}
);

test(
	'LPD-78504 Can view side panel options for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewSidePanelOptions
		// LPS-143065 - Verify if a side panel containing the Field name, Type, Request Files, Accepted File Extensions, and Maximum File Size fields
	}
);

test(
	'LPD-78504 Can view storage folder when show files is enabled for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewStorageFolderWhenShowFilesIsEnable
		// LPS-148112 - Verify if after create an attachment field with option Request Files selected and when Show files is enabled there is a new configuration field called Storage Folder
	}
);

test(
	'LPD-78504 Can view tooltip when selecting directly from users computer option',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewTootipWhenSelectDirectlyFromUsersComputerOption
		// LPS-148112 - Verify if when selecting the option on Request Files: Directly from Users Computer there is a tooltip on the Toggle
	}
);

test(
	'LPD-78504 Can verify description for each field type',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DescriptionForEachFieldType
		// LPS-144902 - Verify there is a description of each Field Type
	}
);

test(
	'LPD-78504 Can verify field type names are displayed on the layout builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DisplayFieldTypesOnLayoutBuilder
		// LPS-145661 - Verify that the field type names are displayed on the Layout Builder when a field is added
	}
);

test(
	'LPD-78504 Can verify Documents and Media home folder is default when object is scoped by site',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DocumentsAndMediaHomeFolderIsDefaultWhenScopedBySite
		// LPS-146523 - Verify if the default folder will be the Documents and Media Home Folder of that specific site
	}
);

test(
	'LPD-78504 Can verify excludes operator is available for picklist fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: ExcludesIsAvailableForPicklistFields
		// LPS-156704 - Verify that the Excludes operator is available when adding filters for the picklist fields to select data from the object
	}
);

test(
	'LPD-78504 Can verify formula field is not searchable',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: FormulaFieldIsNotSearchable
		// Verify that the Formula Field is not searchable
	}
);

test(
	'LPD-78504 Can verify formula field is not mandatory',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: FormulaFieldsIsNotMandatory
		// Verify that Formula fields cannot be required
	}
);

test(
	'LPD-78504 Can verify global Documents and Media home folder is default when object is scoped by company',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: GlobalDocumentsAndMediaHomeFolderIsDefaultWhenScopedByCompany
		// LPS-146523 - Verify if the default folder will be the Global Documents and Media Home Folder
	}
);

test(
	'LPD-78504 Can verify includes operator is available for picklist fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: IncludesIsAvailableForPicklistFields
		// LPS-156704 - Verify that the Includes operator is available when adding filters for the picklist fields to select data from the object
	}
);

test(
	'LPD-78504 Can verify is equal to operator is available for integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: IsEqualToIsAvailableForIntegerFields
		// Verify that the Is Not Equals to operator is available when adding filters for the integer fields to select data from the object
	}
);

test(
	'LPD-78504 Can verify is not equal to operator is available for long integer fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: IsNotEqualToIsAvailableForLongIntegerFields
		// Verify that the Is Not Equals to operator is available when adding filters for the long integer fields to select data from the object
	}
);

test(
	'LPD-78504 Can verify maximum characters for long text field is up to 65000',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: MaximumCharactersLongTextField
		// LPS-146889 - Verify the user can Set the Maximum Number of Characters until 65000
	}
);

test(
	'LPD-78504 Can verify maximum file size is set by system configurations when zero',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: MaximumFileSizeIsSetBySystemConfigurationsWhenZero
		// LPS-143065 - Change the Maximum File Size to 0 (zero) and verify if the Maximum File Size is now set by the System configurations
	}
);

test(
	'LPD-78504 Can verify output field is required on formula field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: OutputFieldIsRequiredOnFormulaField
		// Verify that the Output Field on Formula Field is required
	}
);

test(
	'LPD-78504 Can verify range operator is available for date fields',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: RangeIsAvailableForDateFields
		// Verify that the Range - Start/End operator is available when adding filters for the date fields to select date from the object
	}
);

test(
	'LPD-78504 Can verify request files option is required for attachment field',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: RequestFilesIsRequired
		// LPS-143065 - Verify that the Request Files option is a required field
	}
);

test(
	'LPD-78504 Can verify storage folder field has a default value',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldHaveDefaultValue
		// LPS-148112 - Verify if field called Storage Folder have a default value
	}
);

test(
	'LPD-78504 Can verify storage folder field has help text',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldHaveHelpText
		// LPS-148112 - Verify if field called Storage Folder have help text
	}
);

test(
	'LPD-78504 Can verify storage folder field is required',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: StorageFolderFieldIsRequired
		// LPS-148112 - Verify if field called Storage Folder is required
	}
);
