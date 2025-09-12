/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openModal} from 'frontend-js-components-web';
import {fetch, sub} from 'frontend-js-web';

import {displayErrorToast} from '../../../common/utils/toastUtil';
import {DEFAULT_HEADERS} from '../utils/constants';
import displayBulkDeletionSuccessToast from '../utils/displayBulkDeletionSuccessToast';

/**
 * Executes the bulk delete action and shows a success toast.
 */
async function executeBulkDeleteAction(
	loadData: () => void,
	selectedData: any,
	trashDisableCount: number,
	trashEnabledCount: number,
	trashStatus: {
		allTrashEnabled: boolean;
		noneTrashEnabled: boolean;
		someTrashEnabled: boolean;
	},
	processClose?: () => void
): Promise<void> {
	processClose?.();

	const bulkActionItems = selectedData.items.map((item: any) => ({
		classExternalReferenceCode: item.embedded.externalReferenceCode,
		className: item.entryClassName,
		classPK: item.embedded.id,
		name: item.embedded.title,
	}));
	try {
		await fetch('/o/headless-cms/v1.0/bulk-action', {
			body: JSON.stringify({
				bulkActionItems,
				selectAll: false,
				type: 'DeleteBulkAction',
			}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'x-csrf-token': Liferay.authToken,
			},
			method: 'POST',
		});

		processClose?.();
		displayBulkDeletionSuccessToast(
			trashStatus,
			trashDisableCount,
			trashEnabledCount
		);
		loadData();
	}
	catch {
		processClose?.();
		displayErrorToast();
	}
}

/**
 * Returns the confirmation message and title for bulk delete modal.
 */
function getBulkDeleteMessage(selectedData: any): {
	confirmationMessage: string;
	title: string;
} {
	if (selectedData.selectAll) {
		return {
			confirmationMessage: Liferay.Language.get(
				'delete-all-entries-confirmation'
			),
			title: Liferay.Language.get('delete-all-entries'),
		};
	}
	else if (selectedData.items.length > 1) {
		return {
			confirmationMessage: sub(
				Liferay.Language.get('delete-entries-confirmation'),
				[selectedData.items.length]
			),
			title: Liferay.Language.get('delete-entries'),
		};
	}

	return {
		confirmationMessage: Liferay.Language.get('delete-entry-confirmation'),
		title: Liferay.Language.get('delete-entry'),
	};
}

/**
 * Fetches asset library spaces for the given items.
 */
async function getEntriesSpaces(items: any[]): Promise<any[]> {
	const promises = items
		.filter((item) => item.embedded.scopeId)
		.map((item) =>
			fetch(
				`/o/headless-asset-library/v1.0/asset-libraries/${item.embedded.scopeId}`,
				{
					headers: {
						...DEFAULT_HEADERS,
						'Content-Type': 'application/json',
					},
					method: 'GET',
				}
			)
				.then((res) => res.json())
				.catch(() => null)
		);

	return (await Promise.all(promises)).filter(Boolean);
}

/**
 * Handles bulk deletion logic and modal display based on trash status of spaces.
 */
async function handleBulkDeletion(
	loadData: () => void,
	selectedData: any
): Promise<void> {
	const spaces = await getEntriesSpaces(selectedData.items);

	// Trash status checks

	const allTrashEnabled = spaces.every(
		(space) => space.settings.trashEnabled
	);
	const noneTrashEnabled = spaces.every(
		(space) => !space.settings.trashEnabled
	);
	const someTrashEnabled = spaces.some(
		(space) => space.settings.trashEnabled
	);

	// Count spaces by trash status

	const trashEnabledCount = spaces.filter(
		(space) => space.settings.trashEnabled
	).length;
	const trashDisabledCount = spaces.filter(
		(space) => !space.settings.trashEnabled
	).length;

	const {confirmationMessage, title} = getBulkDeleteMessage(selectedData);

	// Scenario 1: All spaces have trash disabled

	if (noneTrashEnabled) {
		showModal(
			confirmationMessage,
			title,
			loadData,
			selectedData,
			trashDisabledCount,
			trashEnabledCount,
			{allTrashEnabled, noneTrashEnabled, someTrashEnabled}
		);
	}

	// Scenario 2: Some spaces have trash enabled, but not all

	else if (someTrashEnabled && !allTrashEnabled) {
		showModal(
			Liferay.Language.get('bulk-delete-cms-entries-confirmation'),
			Liferay.Language.get('delete-entries'),
			loadData,
			selectedData,
			trashDisabledCount,
			trashEnabledCount,
			{allTrashEnabled, noneTrashEnabled, someTrashEnabled}
		);
	}

	// Scenario 3: All spaces have trash enabled

	else if (allTrashEnabled) {
		if (selectedData.items[0].embedded.status.label !== 'in-trash') {
			await executeBulkDeleteAction(
				loadData,
				selectedData,
				trashDisabledCount,
				trashEnabledCount,
				{allTrashEnabled, noneTrashEnabled, someTrashEnabled}
			);
			loadData();
		}
		else {
			showModal(
				confirmationMessage,
				title,
				loadData,
				selectedData,
				trashDisabledCount,
				trashEnabledCount,
				{allTrashEnabled, noneTrashEnabled, someTrashEnabled}
			);
		}
	}
}

/**
 * Shows the bulk delete confirmation modal.
 */
async function showModal(
	confirmationMessage: string,
	title: string,
	loadData: () => void,
	selectedData: any,
	trashDisableCount: number,
	trashEnabledCount: number,
	trashStatus: {
		allTrashEnabled: boolean;
		noneTrashEnabled: boolean;
		someTrashEnabled: boolean;
	}
): Promise<void> {
	openModal({
		bodyHTML: `
			<div>
				<p>
					${confirmationMessage}
				</p>
			</div>
		`,
		buttons: [
			{
				displayType: 'secondary',
				label: Liferay.Language.get('cancel'),
				onClick: ({processClose}: {processClose: () => void}) => {
					processClose();
				},
				type: 'cancel',
			},
			{
				displayType: 'danger',
				label: Liferay.Language.get('delete'),
				onClick: async ({processClose}: {processClose: () => void}) => {
					processClose();
					await executeBulkDeleteAction(
						loadData,
						selectedData,
						trashDisableCount,
						trashEnabledCount,
						trashStatus,
						processClose
					);
				},
			},
		],
		center: true,
		status: 'danger',
		title,
	});
}

/**
 * Entry point for bulk delete action.
 */
export default async function deleteAssetEntriesBulkAction({
	loadData,
	selectedData,
}: {
	loadData: () => void;
	selectedData: any;
}): Promise<void> {
	await handleBulkDeletion(loadData, selectedData);
}
