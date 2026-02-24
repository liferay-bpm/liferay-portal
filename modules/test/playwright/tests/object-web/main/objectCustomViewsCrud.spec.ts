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
	'LPD-78504 Can add a column to the custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddColumn
		// LPS-135394 - Verify it is possible to add a column for the View
	}
);

test(
	'LPD-78504 Can add metadata columns to default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddMetadataColumnsToDefaultSort
		// LPS-144472 - Verify if the user can add metadata columns to Default Sort
	}
);

test(
	'LPD-78504 Can add translation to column label in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanAddTranslationToColumnLabel
		// LPS-147792 - Verify it is possible to add any translation for any Column Label
	}
);

test(
	'LPD-78504 Can cancel column addition in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCancelColumnAddition
		// LPS-135394 - Verify it is possible to cancel the addition of a column for the View
	}
);

test(
	'LPD-78504 Can cancel rename of a column label in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCancelRenameColumnLabel
		// LPS-147792 - Verify it is possible to cancel the rename of a Column Label
	}
);

test(
	'LPD-78504 Can cancel the creation of a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCancelViewCreation
		// LPS-135394 - Verify it is possible to cancel the creation of a View
	}
);

test(
	'LPD-78504 Can create a default sort with ascending or descending order',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateDefaultSort
		// LPS-144472 - Verify it is possible to create a Default Sort when there is column (Ascending or Descending)
	}
);

test(
	'LPD-78504 Can create a filter in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateFilter
		// LPS-144957 - Verify that it's possible to create the filter
	}
);

test(
	'LPD-78504 Can create a filter by relationship column from system object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateFilterByRelationshipColumnFromSystemObject
		// LPS-170529 - Verify if it is possible to create a filter by relationship columns made from the system objects to custom objects
	}
);

test(
	'LPD-78504 Can create a filter using the relationship field of the object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateFilterUsingRelationshipField
		// LPS-166585 - Verify that it's possible to create a filter using the relationship field of the object
	}
);

test(
	'LPD-78504 Can create a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanCreateView
		// LPS-135394 - Verify it is possible to create a View
	}
);

test(
	'LPD-78504 Can delete a column by unselecting it in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteColumnByUnselect
		// LPS-135394 - Verify it is possible to delete a column for the View by unselecting it
	}
);

test(
	'LPD-78504 Can delete a column through the delete button in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteColumnThroughDeleteButton
		// LPS-135394 - Verify it is possible to delete a column for the View through the delete button
	}
);

test(
	'LPD-78504 Can delete a column with relationship field filter in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteColumnWithRelationshipFieldFilter
		// LPS-166588 - Verify that it's possible to delete a default filter column with the relationship field in the custom view
	}
);

test(
	'LPD-78504 Can delete a filter in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteFilter
		// LPS-144957 - Verify that it's possible to delete the filter
	}
);

test(
	'LPD-78504 Can delete a filter with relationship field in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteFilterWithRelationshipField
		// LPS-166590 - Verify that it's possible to delete the configured filters from the object
	}
);

test(
	'LPD-78504 Can delete a pre-order column in default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeletePreOrderColumn
		// LPS-144472 - Verify it is possible the user to delete the pre-order column
	}
);

test(
	'LPD-78504 Can delete a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDeleteView
		// LPS-135394 - Verify it is possible to delete a View
	}
);

test(
	'LPD-78504 Can drag columns in custom view builder',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDragColumns
		// LPS-135394 - Verify it is possible to drag the columns
	}
);

test(
	'LPD-78504 Can duplicate an object view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanDuplicateObjectView
		// LPS-146028 - Verify that the user can duplicate a object View
	}
);

test(
	'LPD-78504 Can edit a filter in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditFilter
		// LPS-144957 - Verify that it's possible to edit the filter
	}
);

test(
	'LPD-78504 Can edit a filter with relationship field in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanEditFilterWithRelationshipField
		// LPS-166587 - Verify that it's possible to edit a default filter column with the relationship field in the custom view
	}
);

test(
	'LPD-78504 Can filter entries by create date in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFilterEntriesByCreateDate
		// LPS-169019 - Verify it's possible to filter by Create Date
	}
);

test(
	'LPD-78504 Can filter entries by modified date in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFilterEntriesByModifiedDate
		// LPS-169018 - Verify it's possible to filter by Modified Date
	}
);

test(
	'LPD-78504 Can filter entries by status in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFilterEntriesByStatus
		// LPS-169016 - Verify it's possible to filter by status
	}
);

test(
	'LPD-78504 Can filter entries using relationship field in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanFilterEntriesUsingRelationshipField
		// LPS-166586 - Verify that it's possible to filter entries using any relationship field of the object in the custom view
	}
);

test(
	'LPD-78504 Cannot leave name field empty when creating a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotLeaveNameFieldEmpty
		// LPS-135394 - Verify the Name is required when creating a View
	}
);

test(
	'LPD-78504 Cannot save another view as default when one is already set',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotSaveAnotherViewAsDefault
		// LPS-135394 - Verify that it is not possible to save another View as default
	}
);

test(
	'LPD-78504 Cannot save a view set as default when there are no columns selected',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CannotSaveNoColumnsView
		// LPS-135394 - Verify it is not possible to save a View set as default when there are no columns selected
	}
);

test(
	'LPD-78504 Can prioritize columns in default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanPrioritizeColumns
		// LPS-144472 - Verify it is possible to prioritize columns to Default Sort
	}
);

test(
	'LPD-78504 Can search for a column on the view builder tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchColumn
		// LPS-135394 - Verify it is possible to search for a column on the View Builder tab
	}
);

test(
	'LPD-78504 Can search for a column on the add columns modal',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchColumnAddColumnModal
		// LPS-135394 - Verify it is possible to search for a column on the Add Columns modal
	}
);

test(
	'LPD-78504 Can search columns in default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchColumns
		// LPS-144472 - Verify it is possible to search columns to Default Sort
	}
);

test(
	'LPD-78504 Can search for a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchView
		// LPS-135394 - Verify it is possible to search for a View
	}
);

test(
	'LPD-78504 Can search with enter key on default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSearchWithEnterKey
		// LPS-144472 - Verify it is possible to search when press enter key on Default Sort
	}
);

test(
	'LPD-78504 Can see entries with default return in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeEntriesWithDefaultReturn
		// LPS-144472 - Verify it is possible to see the entries with default return
	}
);

test(
	'LPD-78504 Can see entries with filter applied in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeEntriesWithFilterApplied
		// LPS-166589 - Verify that it's possible to view the object entries with the default filter applied
	}
);

test(
	'LPD-78504 Can see renamed column name on object view entries list',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeRenamedColumnNameOnObjectView
		// LPS-147792 - Verify that the new column name will be displayed on the entries list
	}
);

test(
	'LPD-78504 Can see renamed column label as alias on view builder column list',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSeeRenamedColumnOnViewBuilder
		// LPS-147792 - Verify it is possible to see the column label as the alias on the view builder column list
	}
);

test(
	'LPD-78504 Can sort column entries as ascending or descending',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanSortColumnEntries
		// LPS-144472 - Verify it is possible to sort the column entries as ascending or descending
	}
);

test(
	'LPD-78504 Can update a pre-order column in default sort',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdatePreOrderColumn
		// LPS-144472 - Verify it is possible the user update the pre-order column
	}
);

test(
	'LPD-78504 Can update a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanUpdateView
		// LPS-135394 - Verify it is possible to update a View
	}
);

test(
	'LPD-78504 Can view values of two or more relationship fields for the same object',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanView2RelationshipFieldValues
		// LPS-148955 - Verify it is possible to view the values of 2 or more relationship fields for a same object
	}
);

test(
	'LPD-78504 Can view entries from an object in a table view defined as default',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewEntries
		// LPS-144902 - Verify if the entries from an object in a table view defined as default are presented correctly
	}
);

test(
	'LPD-78504 Can view entries of object with default sort defined',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewEntriesWithDefaultSort
		// LPS-144472 - Verify it is possible the user see entries of object with default sort defined
	}
);

test(
	'LPD-78504 Can view metadata values correctly displayed on a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewMetadataValues
		// LPS-143190 - Verify that the metadata values are correctly displayed on a Custom View
	}
);

test(
	'LPD-78504 Can view only selected columns on custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: CanViewOnlySelectedColumns
		// LPS-144902 - Verify if selected Columns on custom view are presented correctly during visualization
	}
);

test(
	'LPD-78504 Can verify columns are ordered following the predefined order on custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: ColumnsAreOrdered
		// LPS-144902 - Verify if the Columns on the custom view are presented following the predefined order during visualization
	}
);

test(
	'LPD-78504 Can verify duplicated object view columns are correctly ordered',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DuplicatedObjectViewColumnsAreCorrectlyOrdered
		// LPS-146028 - Verify that the columns present at the View Builder are ordered correctly
	}
);

test(
	'LPD-78504 Can verify duplicated object view default sort fields are correctly ordered',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DuplicatedObjectViewFieldsAreCorrectlyOrdered
		// LPS-146028 - Verify that the fields present at the Default Sort are ordered correctly
	}
);

test(
	'LPD-78504 Can verify duplicated view has same original name with copy suffix',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DuplicatedViewHasSameOriginalName
		// LPS-146028 - Verify that the view name is the same of the original, adding a (Copy) on the right side
	}
);

test(
	'LPD-78504 Can verify duplicated view is not set as default',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: DuplicatedViewIsNotDefault
		// LPS-146028 - Verify that when the user duplicate a view, the Mark As Default option comes inactivated
	}
);

test(
	'LPD-78504 Can verify empty state for the view builder tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: EmptyStateViewBuilder
		// LPS-135394 - Verify the empty state for the View Builder tab
	}
);

test(
	'LPD-78504 Can verify empty state for the view tab',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: EmptyStateViewTab
		// LPS-135394 - Verify the empty state for the View tab
	}
);

test(
	'LPD-78504 Can verify metadata columns are displayed for selection in custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: MetadataColumnsDisplayed
		// LPS-135394 - Verify the Author, Create Date, Modified Date, Status, ID columns (Metadata columns) are displayed to be selected
	}
);

test(
	'LPD-78504 Can verify no result message when searching for a custom view',
	{tag: '@LPD-78504'},
	async ({apiHelpers, page, site}) => {
		// Migrated from: NoResultMessageView
		// LPS-135394 - Verify the no result message when searching for a view
	}
);
