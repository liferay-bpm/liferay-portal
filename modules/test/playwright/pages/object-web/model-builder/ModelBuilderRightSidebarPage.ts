/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

import {ModelBuilderLeftSidebarPage} from './ModelBuilderLeftSidebarPage';

export class ModelBuilderRightSidebarPage {
	readonly deleteButton: Locator;
	readonly deleteObjectRelationshipButton: Locator;
	readonly deleteTrashButton: Locator;
	readonly modelBuilderLeftSidebarPage: ModelBuilderLeftSidebarPage;
	readonly modalDeleteObjectRelationshipTextField: Locator;
	readonly rightSidebar: Locator;
	readonly objectDefinitionActivateObject: Locator;
	readonly objectDefinitionEntryTitleField: Locator;
	readonly objectDefinitionLabel: Locator;
	readonly objectDefinitionLabelLocalizationButton: Locator;
	readonly objectDefinitionPanelLink: Locator;
	readonly objectDefinitionPluralLabel: Locator;
	readonly objectDefinitionPluralLabelLocalizationButton: Locator;
	readonly objectDefinitionScope: Locator;

	constructor(page: Page) {
		this.deleteButton = page.getByRole('button', {
			exact: true,
			name: 'Delete',
		});
		this.deleteObjectRelationshipButton = page.getByLabel(
			'Delete Relationship'
		);
		this.deleteTrashButton = page
			.getByRole('tabpanel')
			.getByTitle('Delete');
		this.modelBuilderLeftSidebarPage = new ModelBuilderLeftSidebarPage(
			page
		);
		this.modalDeleteObjectRelationshipTextField = page.getByPlaceholder(
			'Confirm Relationship Name'
		);
		this.rightSidebar = page.getByRole('tabpanel').filter({
			hasNot: this.modelBuilderLeftSidebarPage
				.createNewObjectDefinitionButton,
		});
		this.objectDefinitionActivateObject =
			page.getByLabel('Activate Object');
		this.objectDefinitionEntryTitleField =
			page.getByLabel('Entry Title Field');
		this.objectDefinitionLabel = page.getByLabel('LabelMandatory', {
			exact: true,
		});
		this.objectDefinitionLabelLocalizationButton = page
			.getByTitle('Open Localizations')
			.first();
		this.objectDefinitionPanelLink = page.getByLabel('Panel Link');
		this.objectDefinitionPluralLabel = page.getByLabel('Plural Label');
		this.objectDefinitionPluralLabelLocalizationButton = page
			.getByTitle('Open Localizations')
			.last();
		this.objectDefinitionScope = page.getByLabel('Scope');
	}

	async deleteObjectRelationship(objectRelationshipName: string) {
		await this.deleteObjectRelationshipButton.click();
		await this.modalDeleteObjectRelationshipTextField.click();
		await this.modalDeleteObjectRelationshipTextField.fill(
			objectRelationshipName
		);
		await this.deleteButton.click();
	}
}
