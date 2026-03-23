/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectAction,
	ObjectActionAPI,
	ObjectDefinition,
} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';
import path from 'node:path';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {editObjectDefinitionPagesTest} from '../../../fixtures/editObjectDefinitionPagesTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
import {waitForAlert} from '../../../utils/waitForAlert';
import {mockedObjectFields} from './dependencies/objectMockedFields';
import {generateObjectFields} from './utils/generateObjectFields';

export const test = mergeTests(
	dataApiHelpersTest,
	editObjectDefinitionPagesTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

let createdObjectDefinition: ObjectDefinition;

test.beforeEach(async ({apiHelpers}) => {
	const newObjectDefinition =
		await apiHelpers.objectAdmin.postRandomObjectDefinition({
			status: {code: 0},
		});

	apiHelpers.data.push({
		id: newObjectDefinition.id,
		type: 'objectDefinition',
	});

	createdObjectDefinition = newObjectDefinition;
});

test(
	'can activate or deactivate an action',
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with an active action is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName = 'action' + getRandomInt();

			const {body: objectAction} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						label: {en_US: 'Custom Action'},
						name: actionName,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://localhost:8080',
						},
					}
				);

			apiHelpers.data.push({id: objectAction.id, type: 'objectAction'});
		});

		await test.step('When the action is verified as active', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await expect(
				page.getByRole('link', {name: 'Custom Action'})
			).toBeVisible();

			await expect(page.getByText('Yes')).toBeVisible();
		});

		await test.step('Then the action can be deactivated', async () => {
			await page.getByRole('link', {name: 'Custom Action'}).click();

			const iframe = page.frameLocator('iframe');

			await iframe.getByLabel('Active', {exact: true}).uncheck();

			await iframe.getByRole('button', {name: 'Save'}).click();

			await expect(
				page.getByText(
					'Success:The object action was updated successfully.'
				)
			).toBeVisible();

			await page.goBack();

			await viewObjectActionsPage.actionsTabItem.click();

			await expect(page.getByText('No')).toBeVisible();
		});
	}
);

test(
	'Can add account entry after creating account entry via action',
	async () => {

		// Migrated from: CanAddAccountEntryAfterCreatingAccountEntry
		// LPS-173537 - Verify creating an Account entry triggers an action to add a second Account entry

		test.fixme(
			true,
			'Test requires Account system object action configuration and Account API infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can add account entry after creating custom object entry via action',
	async () => {

		// Migrated from: CanAddAccountEntryAfterCreatingCustomObjectEntry
		// LPS-173537 - Verify creating a custom object entry triggers an action to add an Account entry

		test.fixme(
			true,
			'Test requires Account system object and "Add an Object Entry" action type with Account target, which requires infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can add account entry after deleting custom object entry via action',
	async () => {

		// Migrated from: CanAddAccountEntryAfterDeletingCustomObjectEntry
		// LPS-173537 - Verify deleting a custom object entry triggers an action to add an Account entry

		test.fixme(
			true,
			'Test requires Account system object and "Add an Object Entry" action type with Account target, which requires infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can add account entry after updating custom object entry via action',
	async () => {

		// Migrated from: CanAddAccountEntryAfterUpdatingCustomObjectEntry
		// LPS-173537 - Verify updating a custom object entry triggers an action to add an Account entry

		test.fixme(
			true,
			'Test requires Account system object and "Add an Object Entry" action type with Account target, which requires infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can add commerce product group entry after deleting commerce product entry via action',
	async () => {

		// Migrated from: CanAddCommerceProductGroupEntryAfterDeletingCommerceProductEntry
		// LPS-173537 - Verify deleting a Commerce Product entry triggers an action to add a Commerce Product Group entry

		test.fixme(
			true,
			'Test requires Minium site accelerator, Commerce Product and Commerce Product Group system objects not available in the Playwright framework'
		);
	}
);

test(
	'Can add user after creating commerce product entry via action',
	async () => {

		// Migrated from: CanAddUserAfterCreatingCommerceProductEntry
		// LPS-180070 - Verify creating a Commerce Product entry triggers an action to add a user

		test.fixme(
			true,
			'Test requires Commerce Product system object and User target action type not available in the Playwright framework'
		);
	}
);

test(
	'can add user notification actions to system objects that have a user notification handler only',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		let notificationTemplate;

		await test.step('Create an user notification template', async () => {
			notificationTemplate =
				await apiHelpers.notification.postNotificationTemplate({
					editorType: 'richText',
					name: 'Commerce Order Note Template',
					recipientType: 'term',
					recipients: [
						{
							term: '[%COMMERCEORDERNOTE_RECIPIENT_IDS%]',
						},
					],
					subject: {
						en_US: '[%COMMERCEORDERNOTE_ORDERID%]',
					},
					type: 'userNotification',
				});

			apiHelpers.data.push({
				id: notificationTemplate.id,
				type: 'notificationTemplate',
			});
		});

		await test.step('Verify that the notification template is shown for Commerce Order Note system object', async () => {
			await viewObjectActionsPage.goto('Commerce Order Note');
			await viewObjectActionsPage.openObjectActionSidePanel();

			await editObjectActionPage.openActionBuilderTab();
			await editObjectActionPage.chooseNotificationOption();
			await editObjectActionPage.clickInputNotificationsCombo();

			await expect(
				page.frameLocator('iframe').getByRole('option', {
					name: `${notificationTemplate?.name} User Notification`,
				})
			).toBeVisible();
		});

		await test.step('Verify that the notification template is not shown for Commerce Order system object', async () => {
			await viewObjectActionsPage.goto('Commerce Order');
			await viewObjectActionsPage.openObjectActionSidePanel();

			await editObjectActionPage.openActionBuilderTab();
			await editObjectActionPage.chooseNotificationOption();
			await editObjectActionPage.clickInputNotificationsCombo();

			await expect(
				page.frameLocator('iframe').getByRole('option', {
					name: `${notificationTemplate?.name} User Notification`,
				})
			).toHaveCount(0);
		});
	}
);

test(
	'can create a webhook action with expression builder condition',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with a field is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('When an action is created with a condition using the expression builder', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await viewObjectActionsPage.openObjectActionSidePanel();

			const iframe = page.frameLocator('iframe');

			await iframe
				.getByPlaceholder('Text to translate')
				.fill('Custom Action');

			await editObjectActionPage.openActionBuilderTab();

			await editObjectActionPage.inputWhenCombo.click();
			await iframe.getByRole('option', {name: 'On After Add'}).click();

			await editObjectActionPage.fillExpression(
				objectFields[0].name + " == 'Entry Test'"
			);

			await editObjectActionPage.inputThenCombo.click();
			await iframe.getByRole('option', {name: 'Webhook'}).click();

			await iframe.locator('input[name="url"]').fill('http://localhost:8080');

			await iframe.getByRole('button', {name: 'Save'}).click();

			await expect(
				page.getByText(
					'Success:The object action was created successfully.'
				)
			).toBeVisible();
		});

		await test.step('Then the action is listed as active', async () => {
			await page.goBack();

			await viewObjectActionsPage.actionsTabItem.click();

			await expect(
				page.getByRole('link', {name: 'Custom Action'})
			).toBeVisible();

			await expect(page.getByText('Yes')).toBeVisible();
		});
	}
);

test(
	'Can create an action with Groovy Script',
	async () => {

		// Migrated from: CanCreateActionWithGroovyScript
		// LPS-156569 - Verify that it's possible to create an Action with Groovy Script

		test.fixme(
			true,
			'Test requires Groovy Script action type and server-side script execution infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can create an object entry using actions',
	async () => {

		// Migrated from: CanCreateEntryWithActions
		// LPS-161904 - Verify that it's possible to create an object entry using Actions

		test.fixme(
			true,
			'Test requires "Add an Object Entry" action type that creates entries server-side, which requires action executor infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'can delete an action',
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with an action is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName = 'action' + getRandomInt();

			await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
				objectDefinition.externalReferenceCode!,
				{
					active: true,
					label: {en_US: 'Action Label'},
					name: actionName,
					objectActionExecutorKey: 'webhook',
					objectActionTriggerKey: 'onAfterAdd',
					parameters: {
						url: 'http://localhost:8080',
					},
				}
			);
		});

		await test.step('When the action is deleted', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await expect(
				page.getByRole('link', {name: 'Action Label'})
			).toBeVisible();

			await page
				.getByRole('row', {name: 'Action Label'})
				.getByRole('button', {name: 'Actions'})
				.click();

			await page.getByRole('menuitem', {name: 'Delete'}).click();
		});

		await test.step('Then the action is no longer visible', async () => {
			await expect(
				page.getByRole('link', {name: 'Action Label'})
			).toBeHidden();
		});
	}
);

test(
	'can edit an action name',
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with an action is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName = 'action' + getRandomInt();

			const {body: objectAction} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						label: {en_US: 'Custom Action'},
						name: actionName,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://www.liferay.com',
						},
					}
				);

			apiHelpers.data.push({id: objectAction.id, type: 'objectAction'});
		});

		await test.step('When the action name is edited and deactivated', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await page.getByRole('link', {name: 'Custom Action'}).click();

			const iframe = page.frameLocator('iframe');

			await iframe.getByPlaceholder('Text to translate').clear();
			await iframe
				.getByPlaceholder('Text to translate')
				.fill('New Action Update');

			await iframe.getByLabel('Active', {exact: true}).uncheck();

			await iframe.getByRole('button', {name: 'Save'}).click();

			await expect(
				page.getByText(
					'Success:The object action was updated successfully.'
				)
			).toBeVisible();
		});

		await test.step('Then the updated action name is displayed', async () => {
			await page.goBack();

			await viewObjectActionsPage.actionsTabItem.click();

			await expect(
				page.getByRole('link', {name: 'New Action Update'})
			).toBeVisible();

			await expect(page.getByText('No')).toBeVisible();
		});
	}
);

test(
	'Can edit an action with Groovy Script',
	async () => {

		// Migrated from: CanEditActionWithGroovyScript
		// LPS-156560 - Verify that it's possible to edit an Action with Groovy Script

		test.fixme(
			true,
			'Test requires Groovy Script action type and server-side script execution infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'can enable and disable condition on an action',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with an action with condition is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName = 'action' + getRandomInt();

			const {body: objectAction} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						conditionExpression:
							objectFields[0].name + " == 'Entry with condition'",
						label: {en_US: 'Custom Action'},
						name: actionName,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://localhost:8080',
						},
					}
				);

			apiHelpers.data.push({id: objectAction.id, type: 'objectAction'});
		});

		await test.step('When the condition is disabled', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await page.getByRole('link', {name: 'Custom Action'}).click();

			const iframe = page.frameLocator('iframe');

			await editObjectActionPage.openActionBuilderTab();

			await expect(iframe.getByLabel('Enable Condition')).toBeChecked();

			await iframe.getByLabel('Enable Condition').uncheck();

			await iframe.getByRole('button', {name: 'Save'}).click();

			await expect(
				page.getByText(
					'Success:The object action was updated successfully.'
				)
			).toBeVisible();
		});

		await test.step('Then the action remains active without condition', async () => {
			await page.goBack();

			await viewObjectActionsPage.actionsTabItem.click();

			await expect(
				page.getByRole('link', {name: 'Custom Action'})
			).toBeVisible();

			await expect(page.getByText('Yes')).toBeVisible();
		});
	}
);

test(
	'Can manage standalone permissions in roles',
	async () => {

		// Migrated from: CanManageStandalonePermissionsInRoles
		// LPS-169994 - Verify users are able to manage standalone action permissions on the role page

		test.fixme(
			true,
			'Test requires standalone action type, role management, and permissions infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'can search for an action',
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with two actions is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});

			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName1 = 'actionOne' + getRandomInt();
			const actionName2 = 'actionTwo' + getRandomInt();

			const {body: objectAction1} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						label: {en_US: 'Action Label 1'},
						name: actionName1,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://localhost:8080',
						},
					}
				);

			apiHelpers.data.push({id: objectAction1.id, type: 'objectAction'});

			const {body: objectAction2} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						label: {en_US: 'Action Label 2'},
						name: actionName2,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://localhost:8080',
						},
					}
				);

			apiHelpers.data.push({id: objectAction2.id, type: 'objectAction'});
		});

		await test.step('When searching for an action by name', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await expect(
				page.getByRole('link', {name: 'Action Label 1'})
			).toBeVisible();

			await expect(
				page.getByRole('link', {name: 'Action Label 2'})
			).toBeVisible();

			await page.getByPlaceholder('Search').fill('1');

			await page.keyboard.press('Enter');
		});

		await test.step('Then only the matching action is displayed', async () => {
			await expect(
				page.getByRole('link', {name: 'Action Label 1'})
			).toBeVisible();

			await expect(
				page.getByRole('link', {name: 'Action Label 2'})
			).toBeHidden();
		});
	}
);

test('can send notification email via download action', async ({
	apiHelpers,
	page,
	viewObjectEntriesPage,
}) => {

	// Create email notification template

	const senderEmail: string = 'test' + getRandomInt() + '@liferay.com';

	const notificationTemplate =
		await apiHelpers.notification.postRandomNotificationTemplate(
			'notification template test ' + getRandomInt(),
			senderEmail
		);

	apiHelpers.data.push({
		id: notificationTemplate.id,
		type: 'notificationTemplate',
	});

	// Create object definition with an attachment field

	const objectDefinition =
		await apiHelpers.objectAdmin.postRandomObjectDefinition({
			objectFields: [mockedObjectFields.attachmentFieldUserComputer],
			status: {code: 0},
		});

	apiHelpers.data.push({id: objectDefinition.id, type: 'objectDefinition'});

	// Create an action to send notification after attachment download

	const objectActionAPIClient =
		await apiHelpers.buildRestClient(ObjectActionAPI);

	await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
		objectDefinition.externalReferenceCode,
		{
			active: true,
			label: {
				en_US: 'downloadAttachmentArchive',
			},
			name: 'downloadAttachmentArchive',
			objectActionExecutorKey: 'notification',
			objectActionTriggerKey: 'onAfterAttachmentDownload',
			parameters: {
				notificationTemplateId: notificationTemplate.id,
				type: 'email',
			},
		}
	);

	// Create an object entry

	await viewObjectEntriesPage.goto(objectDefinition.className);

	await viewObjectEntriesPage.clickAddObjectEntry(objectDefinition.name);

	const fileChooserPromise = page.waitForEvent('filechooser');

	await viewObjectEntriesPage.selectFileButton.click();

	const fileChooser = await fileChooserPromise;

	await fileChooser.setFiles(
		path.join(__dirname, 'dependencies', 'sampleFile.txt')
	);

	await viewObjectEntriesPage.page
		.getByText('sampleFile.txt')
		.waitFor({state: 'visible'});

	await viewObjectEntriesPage.saveObjectEntryButton.click();

	await waitForAlert(page);

	// Download attachment from object entry

	await viewObjectEntriesPage.goto(objectDefinition.className);

	await page
		.getByRole('button', {name: 'Search'})
		.waitFor({state: 'visible'});

	await viewObjectEntriesPage.page.getByText('sampleFile.txt').click();

	// Verify if the email was sent

	const notificationQueueEntries =
		await apiHelpers.notification.getNotificationQueueEntriesPage(
			senderEmail
		);

	const notificationQueueEntriesId = notificationQueueEntries.items.map(
		(item: any) => item.id
	);

	for (const notificationQueueEntryId of notificationQueueEntriesId) {
		apiHelpers.data.push({
			id: notificationQueueEntryId,
			type: 'notificationQueueEntry',
		});
	}

	expect(notificationQueueEntries.items.length).toBeTruthy();
});

test(
	'Can trigger action after disabling expression condition',
	async () => {

		// Migrated from: CanTriggerActionAfterDisablingExpression
		// LPS-156343 - Verify that Action can be triggered after disabling the expression

		test.fixme(
			true,
			'Test requires "Add an Object Entry" action executor with expression condition toggling and server-side entry creation verification not available in the Playwright framework'
		);
	}
);

test(
	'Can trigger action with expression by adding an entry',
	async () => {

		// Migrated from: CanTriggerActionWithExpressionByAddingEntry
		// LPS-156320 - Assert an Action with an Expression can be triggered after adding an entry

		test.fixme(
			true,
			'Test requires "Add an Object Entry" action executor with expression condition and server-side entry creation verification not available in the Playwright framework'
		);
	}
);

test(
	'Can trigger action with expression by deleting an entry',
	async () => {

		// Migrated from: CanTriggerActionWithExpressionByDeletingEntry
		// LPS-173218 - Assert an Action with an Expression can be triggered after deleting an entry

		test.fixme(
			true,
			'Test requires "Add an Object Entry" action executor with expression condition on delete trigger and server-side entry creation verification not available in the Playwright framework'
		);
	}
);

test(
	'Can trigger action with expression by updating an entry',
	async () => {

		// Migrated from: CanTriggerActionWithExpressionByUpdatingEntry
		// LPS-173219 - Assert an Action with an Expression can be triggered after updating an entry

		test.fixme(
			true,
			'Test requires "Add an Object Entry" action executor with expression condition on update trigger and server-side entry creation verification not available in the Playwright framework'
		);
	}
);

test(
	'Can trigger standalone action for site scoped object',
	async () => {

		// Migrated from: CanTriggerStandaloneActionForSiteScopedObject
		// LPS-172918 - Verify the user can trigger a standalone action for a site scoped object

		test.fixme(
			true,
			'Test requires standalone action type with site-scoped object, object entry kebab menu interaction, and action trigger verification not available in the Playwright framework'
		);
	}
);

test(
	'Can trigger standalone action with permission',
	async () => {

		// Migrated from: CanTriggerStandaloneActionWithPermission
		// LPS-169994 - Verify that a permitted user can manually trigger a standalone action

		test.fixme(
			true,
			'Test requires standalone action type, role/permission management, user creation, and login switching infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can update account entry after creating account entry via action',
	async () => {

		// Migrated from: CanUpdateAccountEntryAfterCreatingAccountEntry
		// LPS-173537 - Verify creating an Account entry triggers an action to update the Account entry

		test.fixme(
			true,
			'Test requires Account system object and "Update an Object Entry" action type with Account target, which requires infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can update commerce product group entry after creating commerce product entry via action',
	async () => {

		// Migrated from: CanUpdateCommerceProductGroupEntryAfterCreatingCommerceProductEntry
		// LPS-173537 - Verify adding a Commerce Product entry triggers an action to update the Commerce Product Group entry

		test.fixme(
			true,
			'Test requires Commerce Product Group system object and Commerce Product entry creation infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'Can use expression with Groovy Script action',
	async () => {

		// Migrated from: CanUseExpressionWithGroovyScript
		// LPS-156346 - Verify that the expression works with Groovy Script

		test.fixme(
			true,
			'Test requires Groovy Script action type with expression condition and server-side script execution verification not available in the Playwright framework'
		);
	}
);

test(
	'can use expression with webhook action',
	async ({apiHelpers, page, viewObjectActionsPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with a field is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('When an action is created with an expression using webhooks', async () => {
			const objectActionAPIClient =
				await apiHelpers.buildRestClient(ObjectActionAPI);

			const actionName = 'action' + getRandomInt();

			const {body: objectAction} =
				await objectActionAPIClient.postObjectDefinitionByExternalReferenceCodeObjectAction(
					objectDefinition.externalReferenceCode!,
					{
						active: true,
						conditionExpression:
							objectFields[0].name + " == 'Entry Test'",
						label: {en_US: 'Action Label'},
						name: actionName,
						objectActionExecutorKey: 'webhook',
						objectActionTriggerKey: 'onAfterAdd',
						parameters: {
							url: 'http://localhost:8080',
						},
					}
				);

			apiHelpers.data.push({id: objectAction.id, type: 'objectAction'});
		});

		await test.step('Then the action will resolve when the condition is met', async () => {
			const applicationName =
				'c/' + objectDefinition.name!.toLowerCase() + 's';
			const fieldName = objectFields[0].name!;

			await apiHelpers.objectEntry.postObjectEntry(
				{[fieldName]: 'Entry Test'},
				applicationName
			);

			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await expect(
				page.getByRole('link', {name: 'Action Label'})
			).toBeVisible();

			await expect(page.getByText('Yes')).toBeVisible();

			await expect(page.getByText('Success')).toBeVisible();
		});
	}
);

test(
	'Can use formula field with user notification action',
	async () => {

		// Migrated from: CanFormulaFieldBeUsedWithUserNotification
		// Verify that the user can use Formula Field with User Notification

		test.fixme(
			true,
			'Test requires User Notification template, Formula field configuration, and user login switching infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'can verify condition card is hidden when using on subscription status update trigger',
	async ({editObjectActionPage, page, viewObjectActionsPage}) => {
		await test.step('Given the Commerce Order system object definition', async () => {
			await viewObjectActionsPage.goto('Commerce Order');
		});

		await test.step('When an action using the trigger On Subscription Status Update is created', async () => {
			await viewObjectActionsPage.openObjectActionSidePanel();

			const iframe = page.frameLocator('iframe');

			await iframe.getByPlaceholder('Text to translate').fill('Action Label');

			await editObjectActionPage.openActionBuilderTab();

			await editObjectActionPage.inputWhenCombo.click();

			await iframe
				.getByRole('option', {name: 'On Subscription Status Update'})
				.click();
		});

		await test.step('Then the condition card is not present', async () => {
			const iframe = page.frameLocator('iframe');

			await expect(
				iframe.getByRole('heading', {name: 'Condition'})
			).toBeHidden();
		});
	}
);

test(
	'Can verify unpublished object with standalone action does not show in permissions',
	async () => {

		// Migrated from: CheckStandaloneActionPermissionOfUnpublishedObject
		// LPS-173774 - Verify that an unpublished object with a standalone action does NOT show up in permissions

		test.fixme(
			true,
			'Test requires standalone action type on unpublished object, role permissions UI navigation, and permission verification infrastructure not available in the Playwright framework'
		);
	}
);

test(
	'cannot leave action name, when and then fields blank',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		let objectDefinition: ObjectDefinition;

		await test.step('Given an object definition is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('When saving an action without a name', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await viewObjectActionsPage.openObjectActionSidePanel();

			const iframe = page.frameLocator('iframe');

			await iframe.getByRole('button', {name: 'Save'}).click();
			await expect(iframe.getByText('Required').first()).toBeVisible();
		});

		await test.step('Then saving without when field shows required error', async () => {
			const iframe = page.frameLocator('iframe');

			await iframe.getByPlaceholder('Text to translate').fill('Action Label');

			await iframe.getByRole('button', {name: 'Save'}).click();

			await editObjectActionPage.openActionBuilderTab();

			await expect(iframe.getByText('Required').first()).toBeVisible();
		});

		await test.step('And saving without then field shows required error', async () => {
			const iframe = page.frameLocator('iframe');

			await editObjectActionPage.inputWhenCombo.click();

			await iframe.getByRole('option', {name: 'On After Add'}).click();

			await iframe.getByRole('button', {name: 'Save'}).click();

			await expect(iframe.getByText('Required')).toBeVisible();
		});
	}
);

test(
	'cannot leave URL blank when webhook is selected',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		let objectDefinition: ObjectDefinition;

		await test.step('Given an object definition is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('When a webhook action is configured without a URL', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await viewObjectActionsPage.openObjectActionSidePanel();

			const iframe = page.frameLocator('iframe');

			await iframe.getByPlaceholder('Text to translate').fill('Action Label');

			await editObjectActionPage.openActionBuilderTab();

			await editObjectActionPage.inputWhenCombo.click();
			await iframe.getByRole('option', {name: 'On After Add'}).click();

			await editObjectActionPage.inputThenCombo.click();
			await iframe.getByRole('option', {name: 'Webhook'}).click();

			await iframe.getByRole('button', {name: 'Save'}).click();
		});

		await test.step('Then a required error is shown for the URL field', async () => {
			const iframe = page.frameLocator('iframe');

			await expect(iframe.getByText('Required')).toBeVisible();
		});
	}
);

test(
	'cannot save action without expression builder value',
	async ({apiHelpers, editObjectActionPage, page, viewObjectActionsPage}) => {
		const objectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		let objectDefinition: ObjectDefinition;

		await test.step('Given an object with a field is created', async () => {
			objectDefinition =
				await apiHelpers.objectAdmin.postRandomObjectDefinition({
					objectFields,
					status: {code: 0},
				});

			apiHelpers.data.push({
				id: objectDefinition.id,
				type: 'objectDefinition',
			});
		});

		await test.step('When an action is configured with condition enabled but no expression', async () => {
			await viewObjectActionsPage.goto(objectDefinition.label['en_US']);

			await viewObjectActionsPage.openObjectActionSidePanel();

			const iframe = page.frameLocator('iframe');

			await iframe
				.getByPlaceholder('Text to translate')
				.fill('Custom Action');

			await editObjectActionPage.openActionBuilderTab();

			await editObjectActionPage.inputWhenCombo.click();
			await iframe.getByRole('option', {name: 'On After Add'}).click();

			await iframe.getByLabel('Enable Condition').check();

			await editObjectActionPage.inputThenCombo.click();
			await iframe.getByRole('option', {name: 'Webhook'}).click();

			await iframe.locator('input[name="url"]').fill('http://localhost:8080');

			await iframe.getByRole('button', {name: 'Save'}).click();
		});

		await test.step('Then a required error is shown and the action is not saved', async () => {
			const iframe = page.frameLocator('iframe');

			await expect(iframe.getByText('Required')).toBeVisible();

			await page.reload();

			await viewObjectActionsPage.actionsTabItem.click();

			await expect(page.getByText('No Results Found')).toBeVisible();
		});
	}
);

test(
	'Cannot see deactivated standalone action in dropdown menu',
	async () => {

		// Migrated from: CanNotSeeDeactivatedStandaloneAction
		// LPS-169994 - Verify a deactivated standalone action is not displayed in the dropdown menu

		test.fixme(
			true,
			'Test requires standalone action type, object entry kebab menu interaction, and action visibility verification not available in the Playwright framework'
		);
	}
);

test.describe('Manage object actions through object actions tab', () => {
	test('can create actions related to commerce order object', async ({
		apiHelpers,
		editObjectActionPage,
		page,
		viewObjectActionsPage,
	}) => {
		await viewObjectActionsPage.goto('Commerce Order');

		const objectActionsMock = [
			{
				objectAction: 'On Order Status Update',
			},
			{
				objectAction: 'On Payment Status Update',
			},
			{
				objectAction: 'On Subscription Status Update',
			},
		] as {objectAction: string}[];

		for (const {objectAction} of objectActionsMock) {
			await editObjectActionPage.addNewAction({
				thenOption: 'Split Order by Catalog',
				whenOption: objectAction,
			});
		}

		const objectActionAPIClient =
			await apiHelpers.buildRestClient(ObjectActionAPI);

		const {body: objectActions} =
			await objectActionAPIClient.getObjectDefinitionByExternalReferenceCodeObjectActionsPage(
				'L_COMMERCE_ORDER'
			);

		objectActions.items.forEach((objectAction: ObjectAction) =>
			apiHelpers.data.push({id: objectAction.id, type: 'objectAction'})
		);

		for (const {objectAction} of objectActionsMock) {
			await expect(
				page.getByRole('link', {name: objectAction})
			).toBeVisible();
		}
	});

	test('can create an email notification object action using user preferred language', async ({
		apiHelpers,
		editObjectActionPage,
		page,
		viewObjectActionsPage,
	}) => {
		const notificationTemplateName =
			'notification template test ' + getRandomInt();

		const notificationTemplate =
			await apiHelpers.notification.postRandomNotificationTemplate(
				notificationTemplateName,
				'test' + getRandomInt() + '@liferay.com'
			);

		apiHelpers.data.push({
			id: notificationTemplate.id,
			type: 'notificationTemplate',
		});

		await viewObjectActionsPage.goto(
			createdObjectDefinition.label['en_US']
		);

		await editObjectActionPage.addNewAction({
			notificationTemplateName,
			thenOption: 'Notification',
			whenOption: 'On After Add',
		});

		await page.waitForLoadState('networkidle');

		await viewObjectActionsPage.frontendDataSetItems
			.filter({
				hasText: 'On After Add',
			})
			.click();

		await editObjectActionPage.openActionBuilderTab();

		await expect(editObjectActionPage.userPreferredLanguage).toBeChecked();

		await editObjectActionPage.checkbox.uncheck();

		await editObjectActionPage.saveButton.click();

		await page.waitForLoadState('networkidle');

		await viewObjectActionsPage.frontendDataSetItems
			.filter({
				hasText: 'On After Add',
			})
			.click();

		await editObjectActionPage.openActionBuilderTab();

		await expect(
			editObjectActionPage.userPreferredLanguage
		).not.toBeChecked();
	});

	test('can create and update condition with expression builder', async ({
		apiHelpers,
		editObjectActionPage,
		page,
		viewObjectActionsPage,
	}) => {
		const notificationTemplateName =
			'notification template test ' + getRandomInt();

		const notificationTemplate =
			await apiHelpers.notification.postRandomNotificationTemplate(
				notificationTemplateName,
				'test' + getRandomInt() + '@liferay.com'
			);

		apiHelpers.data.push({
			id: notificationTemplate.id,
			type: 'notificationTemplate',
		});

		await viewObjectActionsPage.goto(
			createdObjectDefinition.label['en_US']
		);

		await editObjectActionPage.addNewAction({
			expressionBuilderValue: 'Expression',
			notificationTemplateName,
			thenOption: 'Notification',
			whenOption: 'On After Add',
		});

		await page.waitForLoadState('networkidle');

		await page.getByRole('link', {name: 'On After Add'}).click();

		await editObjectActionPage.openActionBuilderTab();

		await expect(editObjectActionPage.expressionInput).toHaveValue(
			'Expression'
		);

		await editObjectActionPage.fillExpression('newExpression');

		await editObjectActionPage.saveButton.click();

		await page.waitForLoadState('networkidle');

		await page.getByRole('link', {name: 'On After Add'}).click();

		await editObjectActionPage.openActionBuilderTab();

		await expect(editObjectActionPage.expressionInput).toHaveValue(
			'newExpression'
		);
	});

	test('notification action section must display all persisted notifications', async ({
		apiHelpers,
		editObjectActionPage,
		page,
		viewObjectActionsPage,
	}) => {
		const names: string[] = [];

		for (let index = 1; index <= 21; index++) {
			const notificationTemplate =
				await apiHelpers.notification.postRandomNotificationTemplate(
					'notification template test ' + getRandomInt()
				);

			apiHelpers.data.push({
				id: notificationTemplate.id,
				type: 'notificationTemplate',
			});

			names.push(
				notificationTemplate.name + ' ' + notificationTemplate.type
			);
		}

		await viewObjectActionsPage.goto(
			createdObjectDefinition.label['en_US']
		);

		await viewObjectActionsPage.openObjectActionSidePanel();

		await editObjectActionPage.openActionBuilderTab();

		await editObjectActionPage.chooseNotificationOption();

		await editObjectActionPage.clickInputNotificationsCombo();

		for (let index = 0; index < names.length; index++) {
			await expect(
				page
					.frameLocator('iframe')
					.getByRole('option', {name: names[index]})
			).toBeVisible();
		}
	});
});
