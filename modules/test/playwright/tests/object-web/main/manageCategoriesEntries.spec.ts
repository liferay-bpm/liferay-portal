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
	'LPD-78504 Can empty taxonomy category briefs of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanEmptyTaxonomyCategoryBriefsOfObjectEntry

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

		// Create a vocabulary and category

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: site.id,
			});

		const category =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: getRandomString(),
					vocabularyId: vocabulary.id,
				}
			);

		// Create an entry with the taxonomy category

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: getRandomString(),
				taxonomyCategoryIds: [category.id],
			},
			applicationName
		);

		// Verify the category is set

		const createdEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(createdEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(createdEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId).toBe(
			category.id
		);

		// Patch the entry to remove all taxonomy categories

		await apiHelpers.objectEntry.patchObjectEntry(
			{taxonomyCategoryIds: []},
			applicationName,
			entry.id
		);

		// Verify the taxonomy category briefs are now empty

		const updatedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(updatedEntry.taxonomyCategoryBriefs).toHaveLength(0);
	}
);

test(
	'LPD-78504 Can filter entries by taxonomy category',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanFilterEntriesByTaxonomyCategory

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

		// Create a vocabulary and category

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: site.id,
			});

		const category =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: getRandomString(),
					vocabularyId: vocabulary.id,
				}
			);

		// Create two entries: one with the category, one without

		const fieldValueWithCategory = getRandomString();
		const fieldValueWithoutCategory = getRandomString();

		const entryWithCategory =
			await apiHelpers.objectEntry.postObjectEntry(
				{
					[fieldName]: fieldValueWithCategory,
					taxonomyCategoryIds: [category.id],
				},
				applicationName
			);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValueWithoutCategory},
			applicationName
		);

		// Filter entries by the taxonomy category

		const searchParams = new URLSearchParams();
		searchParams.append(
			'filter',
			`taxonomyCategoryIds/any(t:t eq ${category.id})`
		);

		const {items, totalCount} =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName,
				searchParams
			);

		// Verify only the entry with the category is returned

		expect(totalCount).toBe(1);
		expect(items).toHaveLength(1);
		expect(items[0].id).toBe(entryWithCategory.id);
		expect(items[0][fieldName]).toBe(fieldValueWithCategory);
	}
);

test(
	'LPD-78504 Can get taxonomy category briefs of entries collection',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanGetTaxonomyCategoryBriefsOfEntriesCollection

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

		// Create a vocabulary and two categories

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: site.id,
			});

		const categoryA =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: getRandomString(),
					vocabularyId: vocabulary.id,
				}
			);

		const categoryB =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: getRandomString(),
					vocabularyId: vocabulary.id,
				}
			);

		// Create entries with different categories

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: getRandomString(),
				taxonomyCategoryIds: [categoryA.id],
			},
			applicationName
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: getRandomString(),
				taxonomyCategoryIds: [categoryB.id],
			},
			applicationName
		);

		// Get the entries collection

		const response =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName
			);

		expect(response.totalCount).toBeGreaterThanOrEqual(2);

		// Verify each entry has its taxonomy category briefs

		const fetchedEntry1 = response.items.find(
			(item: ObjectEntry) => item.id === entry1.id
		);

		expect(fetchedEntry1).toBeDefined();
		expect(fetchedEntry1.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			fetchedEntry1.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(categoryA.id);

		const fetchedEntry2 = response.items.find(
			(item: ObjectEntry) => item.id === entry2.id
		);

		expect(fetchedEntry2).toBeDefined();
		expect(fetchedEntry2.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			fetchedEntry2.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(categoryB.id);
	}
);

test(
	'LPD-78504 Can get taxonomy category briefs of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanGetTaxonomyCategoryBriefsOfObjectEntry

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

		// Create a vocabulary and category

		const vocabularyName = getRandomString();
		const categoryName = getRandomString();

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: vocabularyName,
				siteId: site.id,
			});

		const category =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: categoryName,
					vocabularyId: vocabulary.id,
				}
			);

		// Create an entry with the taxonomy category

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: getRandomString(),
				taxonomyCategoryIds: [category.id],
			},
			applicationName
		);

		// Get the entry by ID and verify taxonomy category briefs

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			fetchedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(category.id);
		expect(
			fetchedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryName
		).toBe(categoryName);
	}
);

test(
	'LPD-78504 Can update entry with existing taxonomy category',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithExistingTaxonomyCategory

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

		// Create a vocabulary with two categories

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: site.id,
			});

		const categoryAName = getRandomString();
		const categoryBName = getRandomString();

		const categoryA =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: categoryAName,
					vocabularyId: vocabulary.id,
				}
			);

		const categoryB =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: categoryBName,
					vocabularyId: vocabulary.id,
				}
			);

		// Create an entry with category A

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{
				[fieldName]: getRandomString(),
				taxonomyCategoryIds: [categoryA.id],
			},
			applicationName
		);

		// Verify category A is set

		const createdEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(createdEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			createdEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(categoryA.id);

		// Update the entry with category B

		await apiHelpers.objectEntry.patchObjectEntry(
			{taxonomyCategoryIds: [categoryB.id]},
			applicationName,
			entry.id
		);

		// Verify the entry now has category B

		const updatedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(updatedEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(categoryB.id);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryName
		).toBe(categoryBName);
	}
);

test(
	'LPD-78504 Can update site scoped object entry with taxonomy category of different site scope',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanUpdateSiteScopedObjectEntryWithTaxonomyCategoryOfDifferentSiteScope

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		// Create a site-scoped object definition

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		// Create a vocabulary and category on a DIFFERENT site scope (default site / company level)

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: '0',
			});

		const categoryName = getRandomString();

		const category =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: categoryName,
					vocabularyId: vocabulary.id,
				}
			);

		// Create an entry on the isolated site

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString()},
			applicationName,
			site.key
		);

		// Update the entry with the category from a different site scope

		await apiHelpers.objectEntry.patchObjectEntry(
			{taxonomyCategoryIds: [category.id]},
			applicationName,
			entry.id,
			site.key
		);

		// Verify the category is set on the entry

		const updatedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(updatedEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(category.id);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryName
		).toBe(categoryName);
	}
);

test(
	'LPD-78504 Can update site scoped object entry with taxonomy category within same scope',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanUpdateSiteScopedObjectEntryWithTaxonomyCategoryWithinSameScope

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		// Create a site-scoped object definition

		const objectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields,
				scope: 'site',
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: objectDefinition.id,
			type: 'objectDefinition',
		});

		const applicationName =
			'c/' + objectDefinition.name!.toLowerCase() + 's';
		const fieldName = objectFields[0].name!;

		// Create a vocabulary and category on the SAME site

		const vocabulary =
			await apiHelpers.headlessAdminTaxonomy.postSiteTaxonomyVocabulary({
				name: getRandomString(),
				siteId: site.id,
			});

		const categoryName = getRandomString();

		const category =
			await apiHelpers.headlessAdminTaxonomy.postTaxonomyVocabularyTaxonomyCategory(
				{
					name: categoryName,
					vocabularyId: vocabulary.id,
				}
			);

		// Create an entry on the same site

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString()},
			applicationName,
			site.key
		);

		// Update the entry with the category from the same site scope

		await apiHelpers.objectEntry.patchObjectEntry(
			{taxonomyCategoryIds: [category.id]},
			applicationName,
			entry.id,
			site.key
		);

		// Verify the category is set on the entry

		const updatedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(updatedEntry.taxonomyCategoryBriefs).toHaveLength(1);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryId
		).toBe(category.id);
		expect(
			updatedEntry.taxonomyCategoryBriefs[0].taxonomyCategoryName
		).toBe(categoryName);
	}
);
