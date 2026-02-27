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
	'LPD-78504 Can create keyword while updating entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanCreateKeywordWhileUpdatingEntry

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
		const fieldValue = getRandomString();

		// Create an entry without keywords

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue},
			applicationName
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();
		expect(entry.keywords).toEqual([]);

		// Patch the entry to add keywords

		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		const updatedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{keywords: [keyword1, keyword2]},
			applicationName,
			entry.id
		);

		expect(updatedEntry.keywords).toBeDefined();
		expect(updatedEntry.keywords).toContain(keyword1);
		expect(updatedEntry.keywords).toContain(keyword2);
		expect(updatedEntry.keywords).toHaveLength(2);

		// Verify by fetching the entry again

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.keywords).toContain(keyword1);
		expect(fetchedEntry.keywords).toContain(keyword2);
	}
);

test(
	'LPD-78504 Can create site scoped keyword while updating site scoped object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers, site}) => {
		// Corresponds to Poshi test: CanCreateSiteScopedKeywordWhileUpdatingSiteScopedObjectEntry

		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

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
		const fieldValue = getRandomString();

		// Create a site-scoped entry without keywords

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue},
			applicationName,
			site.key
		);

		expect(entry).toBeDefined();
		expect(entry.id).toBeDefined();
		expect(entry.keywords).toEqual([]);

		// Patch the site-scoped entry to add keywords

		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		const updatedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{keywords: [keyword1, keyword2]},
			applicationName,
			entry.id,
			site.key
		);

		expect(updatedEntry.keywords).toBeDefined();
		expect(updatedEntry.keywords).toContain(keyword1);
		expect(updatedEntry.keywords).toContain(keyword2);
		expect(updatedEntry.keywords).toHaveLength(2);
	}
);

test(
	'LPD-78504 Can empty keywords of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanEmptyKeywordsOfObjectEntry

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
		const fieldValue = getRandomString();
		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		// Create an entry with keywords

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue, keywords: [keyword1, keyword2]},
			applicationName
		);

		expect(entry.keywords).toContain(keyword1);
		expect(entry.keywords).toContain(keyword2);

		// Patch the entry to empty keywords

		const updatedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{keywords: []},
			applicationName,
			entry.id
		);

		expect(updatedEntry.keywords).toEqual([]);

		// Verify by fetching the entry again

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.keywords).toEqual([]);
	}
);

test(
	'LPD-78504 Can filter entries by keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanFilterEntriesByKeyword

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
		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		// Create two entries with different keywords

		const entry1 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keyword1]},
			applicationName
		);

		const entry2 = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keyword2]},
			applicationName
		);

		// Filter entries by keyword1

		const searchParams = new URLSearchParams();

		searchParams.set('filter', `keywords/any(k:k eq '${keyword1}')`);

		const response =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName,
				searchParams
			);

		expect(response.totalCount).toBe(1);
		expect(response.items).toHaveLength(1);
		expect(response.items[0].id).toBe(entry1.id);
		expect(response.items[0].keywords).toContain(keyword1);

		// Filter entries by keyword2

		const searchParams2 = new URLSearchParams();

		searchParams2.set('filter', `keywords/any(k:k eq '${keyword2}')`);

		const response2 =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName,
				searchParams2
			);

		expect(response2.totalCount).toBe(1);
		expect(response2.items).toHaveLength(1);
		expect(response2.items[0].id).toBe(entry2.id);
		expect(response2.items[0].keywords).toContain(keyword2);
	}
);

test(
	'LPD-78504 Can get keywords of object entries collection',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetKeywordsOfObjectEntriesCollection

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
		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		// Create entries with keywords

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keyword1]},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keyword2]},
			applicationName
		);

		// Get the entries collection

		const response =
			await apiHelpers.objectEntry.getObjectDefinitionObjectEntries(
				applicationName
			);

		expect(response.totalCount).toBeGreaterThanOrEqual(2);

		const entryWithKeyword1 = response.items.find(
			(item: ObjectEntry) =>
				item.keywords && item.keywords.includes(keyword1)
		);
		const entryWithKeyword2 = response.items.find(
			(item: ObjectEntry) =>
				item.keywords && item.keywords.includes(keyword2)
		);

		expect(entryWithKeyword1).toBeDefined();
		expect(entryWithKeyword1.keywords).toContain(keyword1);

		expect(entryWithKeyword2).toBeDefined();
		expect(entryWithKeyword2.keywords).toContain(keyword2);
	}
);

test(
	'LPD-78504 Can get keywords of object entry',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanGetKeywordsOfObjectEntry

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
		const keyword1 = getRandomString();
		const keyword2 = getRandomString();

		// Create an entry with keywords

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keyword1, keyword2]},
			applicationName
		);

		expect(entry.keywords).toBeDefined();
		expect(entry.keywords).toContain(keyword1);
		expect(entry.keywords).toContain(keyword2);

		// Get the single entry and verify keywords

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.keywords).toBeDefined();
		expect(fetchedEntry.keywords).toContain(keyword1);
		expect(fetchedEntry.keywords).toContain(keyword2);
		expect(fetchedEntry.keywords).toHaveLength(2);
	}
);

test(
	'LPD-78504 Can update entry with existing keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithExistingKeyword

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
		const keywordA = getRandomString();
		const keywordB = getRandomString();

		// Create an entry with keywordA

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: getRandomString(), keywords: [keywordA]},
			applicationName
		);

		expect(entry.keywords).toContain(keywordA);

		// Update the entry to use keywordB instead

		const updatedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{keywords: [keywordB]},
			applicationName,
			entry.id
		);

		expect(updatedEntry.keywords).toContain(keywordB);
		expect(updatedEntry.keywords).not.toContain(keywordA);
		expect(updatedEntry.keywords).toHaveLength(1);

		// Verify by fetching the entry again

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.keywords).toContain(keywordB);
		expect(fetchedEntry.keywords).not.toContain(keywordA);
	}
);

test(
	'LPD-78504 Can update entry with unexisting keyword',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		// Corresponds to Poshi test: CanUpdateEntryWithUnexistingKeyword

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
		const fieldValue = getRandomString();

		// Create an entry without keywords

		const entry = await apiHelpers.objectEntry.postObjectEntry(
			{[fieldName]: fieldValue},
			applicationName
		);

		expect(entry.keywords).toEqual([]);

		// Patch the entry to add a completely new keyword that did not exist before

		const newKeyword = getRandomString();

		const updatedEntry = await apiHelpers.objectEntry.patchObjectEntry(
			{keywords: [newKeyword]},
			applicationName,
			entry.id
		);

		expect(updatedEntry.keywords).toBeDefined();
		expect(updatedEntry.keywords).toContain(newKeyword);
		expect(updatedEntry.keywords).toHaveLength(1);

		// Verify by fetching the entry again

		const fetchedEntry = await apiHelpers.objectEntry.getObjectEntryById(
			applicationName,
			entry.id.toString()
		);

		expect(fetchedEntry.keywords).toContain(newKeyword);
		expect(fetchedEntry.keywords).toHaveLength(1);
	}
);
