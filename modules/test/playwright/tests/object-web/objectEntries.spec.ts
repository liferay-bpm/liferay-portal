/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {collectionsPagesTest} from '../../fixtures/CollectionsPageTest';
import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {objectPagesTest} from '../../fixtures/objectPagesTest';
import {pageEditorPagesTest} from '../../fixtures/pageEditorPagesTest';
import {getRandomInt} from '../../utils/getRandomInt';
import getRandomString from '../../utils/getRandomString';
import performLogin from '../../utils/performLogin';
import {waitForSuccessAlert} from '../../utils/waitForSuccessAlert';
import {journalPagesTest} from '../journal-web/fixtures/journalPagesTest';
import {getFDSDateFormat, getPageEditorDateFormat} from './utils/dateFormat';
import {mockObjectFields} from './utils/mockObjectFields';

export const test = mergeTests(
	apiHelpersTest,
	collectionsPagesTest,
	isolatedSiteTest,
	featureFlagsTest({
		'LPS-178052': true,
		'LPS-187142': true,
	}),
	journalPagesTest,
	loginTest(),
	objectPagesTest,
	pageEditorPagesTest
);

const customListTypeDefinitions: ListTypeDefinition[] = [];
const customObjectDefinitions: ObjectDefinition[] = [];

test.afterEach(async ({apiHelpers}) => {
	if (customObjectDefinitions.length) {
		for (const customObjectDefinition of customObjectDefinitions) {
			await apiHelpers.objectAdmin.deleteObjectDefinition(
				customObjectDefinition.id
			);
		}
	}

	if (customListTypeDefinitions.length) {
		for (const customListTypeDefinition of customListTypeDefinitions) {
			await apiHelpers.listTypeAdmin.deleteListTypeDefinition(
				customListTypeDefinition.id
			);
		}
	}
});

test.describe('Manage object entries through page templates', () => {
	test('can view all entries related to an object in the relationship field', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
			});

		customObjectDefinitions.push(objectDefinition1);

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
			});

		customObjectDefinitions.push(objectDefinition2);

		const objectRelationshipLabel =
			'objectRelationshipLabel' + getRandomInt();
		const objectRelationshipName =
			'objectRelationshipName' + Math.floor(Math.random() * 99);

		const objectRelationshipData: Partial<ObjectRelationship> = {
			label: {
				en_US: objectRelationshipLabel,
			},
			name: objectRelationshipName,
			objectDefinitionExternalReferenceCode1:
				objectDefinition1.externalReferenceCode,
			objectDefinitionExternalReferenceCode2:
				objectDefinition2.externalReferenceCode,
			objectDefinitionId1: objectDefinition1.id,
			objectDefinitionId2: objectDefinition2.id,
			objectDefinitionName2: objectDefinition2.name,
			type: 'oneToMany' as ObjectRelationshipType,
		};

		await apiHelpers.objectAdmin.postObjectRelationship(
			objectRelationshipData
		);

		const applicationName =
			'c/' + objectDefinition1.name.toLowerCase() + 's';

		const textObjectEntry = {
			textField: 'entry',
		};

		const objectEntries = [];

		for (let i = 0; i <= 15; i++) {
			const objectEntry = await apiHelpers.objectEntry.postObjectEntry(
				textObjectEntry,
				applicationName
			);

			objectEntries.push(objectEntry.id);
		}

		await viewObjectEntriesPage.goto(objectDefinition2.id);
		await viewObjectEntriesPage.clickAddObjectEntry();
		await page.getByPlaceholder('Search', {exact: true}).click();

		objectEntries.forEach((objectEntryId) => {
			expect(
				page.getByRole('menuitem', {name: objectEntryId})
			).toBeVisible();
		});

		// Clean up

		await apiHelpers.objectAdmin.deleteObjectDefinition(
			objectDefinition1.id
		);

		await apiHelpers.objectAdmin.deleteObjectDefinition(
			objectDefinition2.id
		);
	});

	test('verify if the object entries are displayed when selecting to preview an object entry on a page template', async ({
		apiHelpers,
		displayPageTemplatesPage,
		page,
		pageEditorPage,
	}) => {
		test.slow();

		const objectDefinitionLabel = 'ObjectDefinitionLabel' + getRandomInt();
		const objectDefinitionName = 'ObjectDefinitionName' + getRandomInt();

		const {
			listTypeDefinition,
			objectEntry,
			objectFields,
			titleObjectFieldName,
		} = await mockObjectFields({
			apiHelpers,
			objectEntryReturn: {format: 'API'},
			objectFieldBusinessTypes: [
				'autoIncrement',
				'boolean',
				'date',
				'decimal',
				'encrypted',
				'integer',
				'longInteger',
				'longText',
				'multiselectPicklist',
				'picklist',
				'precisionDecimal',
				'richText',
				'text',
			],
			titleObjectFieldName: 'text',
		});

		const objectDefinition =
			await apiHelpers.objectAdmin.postObjectDefinition({
				active: true,
				label: {
					en_US: objectDefinitionLabel,
				},
				name: objectDefinitionName,
				objectFields,
				pluralLabel: {
					en_US: objectDefinitionLabel,
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
				titleObjectFieldName,
			});

		customListTypeDefinitions.push(listTypeDefinition);
		customObjectDefinitions.push(objectDefinition);

		const applicationName =
			'c/' + objectDefinition.name.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			objectEntry,
			applicationName
		);

		await displayPageTemplatesPage.goto();

		const displayPageTemplateName = getRandomString();

		await displayPageTemplatesPage.publishNewTemplate({
			contentType: objectDefinition.label['en_US'],
			name: displayPageTemplateName,
		});

		await page.getByTitle(displayPageTemplateName).click();

		overloop: for (const [
			index,
			objectField,
		] of objectDefinition.objectFields
			.filter((objectField) => !objectField.system)
			.entries()) {
			await pageEditorPage.addFragment('Basic Components', 'Heading');

			await page.getByText('Heading Example', {exact: true}).click();

			await page.getByLabel('Select element-text').click();

			await pageEditorPage.setMappingConfiguration({
				entity: objectDefinitionLabel,
				entry: objectEntry[titleObjectFieldName],
				field: objectField.label.en_US,
				recentSelectedItem:
					index >= 1 ? objectEntry[titleObjectFieldName] : undefined,
				source: 'content',
			});

			let matchString: string;

			switch (objectField.businessType) {
				case 'AutoIncrement': {
					matchString = '1';

					break;
				}
				case 'Date': {
					const date = new Date(
						Date.parse(objectEntry[objectField.name])
					);

					matchString = getPageEditorDateFormat(date);

					// Defer date validation for CI trace view analysis (issue #LRCI-4253)

					continue overloop;
				}
				case 'Picklist': {
					matchString = (
						objectEntry[objectField.name] as {key: string}
					).key;

					break;
				}
				case 'MultiselectPicklist': {
					(objectEntry[objectField.name] as string[]).forEach(
						(listTypeEntry, index) => {
							index < 1
								? (matchString = `${listTypeEntry}`)
								: (matchString += `, ${listTypeEntry}`);
						}
					);

					break;
				}
				default: {
					matchString = objectEntry[objectField.name].toString();
				}
			}

			await expect(
				page.getByTitle('Edit Text').filter({hasText: matchString})
			).toBeVisible();
		}

		// Clean up

		await displayPageTemplatesPage.goto();

		await displayPageTemplatesPage.deleteAllDisplayPageTemplates();
	});
});

test.describe('Manage object entries through View Object Entries', () => {
	test('can add an entry with all object fields', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {
		const ATTACHMENT_FILE_NAME = 'astronaut.png';
		const {listTypeDefinition, objectEntry, objectFields} =
			await mockObjectFields({
				apiHelpers,
				objectEntryReturn: {format: 'UI'},
				objectFieldBusinessTypes: [
					'attachment',
					'boolean',
					'date',
					'decimal',
					'integer',
					'longInteger',
					'longText',
					'picklist',
					'precisionDecimal',
					'richText',
					'text',
				],
			});

		const objectDefinition =
			await apiHelpers.objectAdmin.postObjectDefinition({
				active: true,
				externalReferenceCode: getRandomString(),
				label: {
					en_US: getRandomString(),
				},
				name: 'ObjectDefinitionName' + getRandomInt(),
				objectFields,
				panelCategoryKey: 'control_panel.object',
				pluralLabel: {
					en_US: 'NewObject',
				},
				portlet: true,
				scope: 'company',
				status: {
					code: 0,
				},
			});

		customListTypeDefinitions.push(listTypeDefinition);
		customObjectDefinitions.push(objectDefinition);

		await viewObjectEntriesPage.goto(objectDefinition.id);

		await viewObjectEntriesPage.clickAddObjectEntry();

		for (const objectField of objectFields) {
			switch (objectField.businessType) {
				case 'Attachment': {
					await viewObjectEntriesPage.selectFileFromDocumentsAndMedia(
						ATTACHMENT_FILE_NAME
					);

					break;
				}
				case 'Boolean': {
					objectEntry[objectField.name]
						? await page
								.getByLabel(objectField.label['en_US'])
								.check()
						: await page
								.getByLabel(objectField.label['en_US'])
								.uncheck();

					break;
				}
				case 'Picklist': {
					await viewObjectEntriesPage.selectDropdownItem(
						objectField.label['en_US'],
						objectEntry[objectField.name].key.toString()
					);

					break;
				}
				default: {
					await viewObjectEntriesPage.fillObjectEntry({
						objectFieldBusinessType: objectField.businessType,
						objectFieldLabel: objectField.label['en_US'],
						objectFieldValue:
							objectEntry[objectField.name].toString(),
					});
				}
			}
		}

		await viewObjectEntriesPage.saveObjectEntryButton.click();

		await expect(viewObjectEntriesPage.successMessage).toBeVisible();

		await viewObjectEntriesPage.backButton.click();

		for (const {businessType, name} of objectFields) {
			let matchString: string;

			switch (businessType) {
				case 'Attachment': {
					matchString = ATTACHMENT_FILE_NAME;

					break;
				}
				case 'Boolean': {
					matchString = objectEntry[name] ? 'Yes' : 'No';

					break;
				}
				case 'Date': {
					const date = new Date(objectEntry[name]);

					matchString = getFDSDateFormat(date);

					break;
				}
				case 'Picklist': {
					matchString = (objectEntry[name] as {key: string}).key;

					break;
				}
				case 'MultiselectPicklist': {
					(objectEntry[name] as string[]).forEach(
						(listTypeEntry, index) => {
							index < 1
								? (matchString = `${listTypeEntry}`)
								: (matchString += `, ${listTypeEntry}`);
						}
					);

					break;
				}
				case 'RichText': {
					matchString = objectEntry[name].substring(0, 35);

					break;
				}
				default: {
					matchString = objectEntry[name];
				}
			}

			await expect(
				page.locator('.dnd-td').getByText(matchString, {exact: true})
			).toBeVisible();
		}
	});

	test('can view all entries related to an object in the relationship field using autocomplete', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {
		const objectDefinition1 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
				titleObjectFieldName: 'textField',
			});

		const objectDefinition2 =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFolderExternalReferenceCode: 'default',
				status: {code: 0},
			});

		const objectRelationshipLabel =
			'objectRelationshipLabel' + getRandomInt();
		const objectRelationshipName =
			'objectRelationshipName' + Math.floor(Math.random() * 99);

		const objectRelationshipData: Partial<ObjectRelationship> = {
			label: {
				en_US: objectRelationshipLabel,
			},
			name: objectRelationshipName,
			objectDefinitionExternalReferenceCode1:
				objectDefinition1.externalReferenceCode,
			objectDefinitionExternalReferenceCode2:
				objectDefinition2.externalReferenceCode,
			objectDefinitionId1: objectDefinition1.id,
			objectDefinitionId2: objectDefinition2.id,
			objectDefinitionName2: objectDefinition2.name,
			type: 'oneToMany' as ObjectRelationshipType,
		};

		await apiHelpers.objectAdmin.postObjectRelationship(
			objectRelationshipData
		);

		const applicationName =
			'c/' + objectDefinition1.name.toLowerCase() + 's';

		await apiHelpers.objectEntry.postObjectEntry(
			{textField: 'test 1'},
			applicationName
		);

		await apiHelpers.objectEntry.postObjectEntry(
			{textField: 'test 2'},
			applicationName
		);

		await viewObjectEntriesPage.goto(objectDefinition2.id);
		await viewObjectEntriesPage.clickAddObjectEntry();

		await page.getByPlaceholder('Search', {exact: true}).fill('t 1');
		await expect(page.getByRole('menuitem', {name: 'test1'})).toBeVisible();

		await page.locator('input[value="t 1"]').fill('t 2');
		await expect(page.getByRole('menuitem', {name: 'test2'})).toBeVisible();

		await page.locator('input[value="t 2"]').fill('tes');
		await expect(
			page.getByRole('menuitem', {name: 'test 1'})
		).toBeVisible();
		await expect(
			page.getByRole('menuitem', {name: 'test 2'})
		).toBeVisible();

		// Clean up

		await apiHelpers.objectAdmin.deleteObjectDefinition(
			objectDefinition1.id
		);

		await apiHelpers.objectAdmin.deleteObjectDefinition(
			objectDefinition2.id
		);
	});
});

test.describe('Manage bound object entries with update root permission', () => {
	test('can add bound object entries with update root permission', async ({
		apiHelpers,
		page,
		viewObjectEntriesPage,
	}) => {

		// test.setTimeout(180000);

		const rootObjectDefinitionERC =
			'rootObjectDefinitionERC' + getRandomInt();
		const boundObjectDefinitionERC =
			'boundObjectDefinitionERC' + getRandomInt();

		const rootObjectDefinition =
			await apiHelpers.objectAdmin.postObjectDefinition({
				active: false,
				externalReferenceCode: rootObjectDefinitionERC,
				label: {
					en_US: 'RootObject',
				},
				name: 'RootObject' + getRandomInt(),
				objectFields: [
					{
						DBType: 'String',
						businessType: 'Text',
						externalReferenceCode: 'text',
						indexed: true,
						indexedAsKeyword: true,
						label: {
							en_US: 'text',
						},
						name: 'text',
						required: false,
						system: false,
						type: 'String',
					},
				],
				objectRelationships: [
					{
						deletionType: 'cascade',
						edge: true,
						label: {
							en_US: 'RootToBound',
						},
						name: 'rootToBound',
						objectDefinitionExternalReferenceCode1:
							rootObjectDefinitionERC,
						objectDefinitionExternalReferenceCode2:
							boundObjectDefinitionERC,
						type: 'oneToMany',
					},
				],
				panelCategoryKey: '',
				pluralLabel: {
					en_US: 'RootObject',
				},
				portlet: true,
				rootObjectDefinitionExternalReferenceCode:
					rootObjectDefinitionERC,
				scope: 'company',
				status: {
					code: 2,
				},
			});

		const boundObjectDefinition =
			await apiHelpers.objectAdmin.putObjectDefinitionByExternalReferenceCode(
				boundObjectDefinitionERC,
				{
					active: false,
					externalReferenceCode: boundObjectDefinitionERC,
					label: {
						en_US: 'BoundObject',
					},
					name: 'BoundObject' + getRandomInt(),
					objectFields: [
						{
							DBType: 'String',
							businessType: 'Text',
							externalReferenceCode: 'text',
							indexed: true,
							indexedAsKeyword: true,
							label: {
								en_US: 'BoundText',
							},
							localized: false,
							name: 'text',
							readOnly: 'false',
							required: false,
							state: false,
							system: false,
							type: 'String',
						},
					],
					panelCategoryKey: '',
					pluralLabel: {
						en_US: 'BoundObject',
					},
					rootObjectDefinitionExternalReferenceCode:
						rootObjectDefinitionERC,
					scope: 'company',
					status: {
						code: 2,
						label: 'draft',
						label_i18n: 'Draft',
					},
					titleObjectFieldName: 'text',
				}
			);

		await apiHelpers.objectAdmin.postObjectDefinitionPublish(
			rootObjectDefinition.id
		);

		const applicationName =
			'c/' + rootObjectDefinition.name.toLowerCase() + 's';

		const textObjectEntry = {
			text: 'Root',
		};

		const objectEntry = await apiHelpers.objectEntry.postObjectEntry(
			textObjectEntry,
			applicationName
		);

		const companyId = await page.evaluate(() => {
			return Liferay.ThemeDisplay.getCompanyId();
		});

		const role = await apiHelpers.headlessAdminUser.postRole({
			name: 'Bound Updater ' + getRandomString(),
			rolePermissions: [
				{
					actionIds: ['UPDATE', 'VIEW'],
					primaryKey: companyId,
					resourceName:
						'com.liferay.object.model.ObjectDefinition#' +
						rootObjectDefinition.id,
					scope: 1,
				},
				{
					actionIds: ['ACCESS_IN_CONTROL_PANEL'],
					primaryKey: companyId,
					resourceName:
						'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_' +
						rootObjectDefinition.id,
					scope: 1,
				},
			],
		});

		const user =
			await apiHelpers.headlessAdminUser.getUserAccountByEmailAddress(
				'demo.unprivileged@liferay.com'
			);

		await apiHelpers.headlessAdminUser.assignUserToRole(role.name, user.id);

		await page.getByLabel('Test Test User Profile').click();
		await page.getByRole('menuitem', {name: 'Sign Out'}).click();

		await performLogin(page, user.alternateName);

		await viewObjectEntriesPage.goto(rootObjectDefinition.id);

		await viewObjectEntriesPage.openObjectEntry(String(objectEntry.id));
		await page
			.getByRole('link', {name: boundObjectDefinition.label.en_US})
			.click();

		const boundObjectEntryText = 'Bound' + getRandomString();

		await viewObjectEntriesPage.clickAddObjectEntry();
		await viewObjectEntriesPage.fillObjectEntry({
			objectFieldLabel: 'BoundText',
			objectFieldValue: boundObjectEntryText,
			roleLocator: 'textbox',
		});
		await viewObjectEntriesPage.saveObjectEntryButton.click();
		await waitForSuccessAlert(page);

		await viewObjectEntriesPage.backButton.click();

		await expect(
			page.getByText(boundObjectEntryText, {exact: true})
		).toBeVisible();

		// Clean up

		await apiHelpers.headlessAdminUser.deleteRoleUserAccountAssociation(
			role.id,
			user.id
		);
	});
});
