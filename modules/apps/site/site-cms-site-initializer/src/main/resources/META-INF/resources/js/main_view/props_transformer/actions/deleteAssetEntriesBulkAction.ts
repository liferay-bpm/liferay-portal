/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openModal} from 'frontend-js-components-web';
import {fetch, sub} from 'frontend-js-web';

function getBulkDeleteMessage(selectedData: any) {
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

export default function deleteAssetEntriesBulkAction({
	loadData,
	selectedData,
}: {
	actionId: string;
	loadData?: () => {};
	selectedData: any;
}) {
	const {confirmationMessage, title} = getBulkDeleteMessage(selectedData);

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
				onClick: ({processClose}) => {
					processClose();
				},
				type: 'cancel',
			},
			{
				displayType: 'danger',
				label: Liferay.Language.get('delete'),
				onClick: async ({processClose}: any) => {
					processClose();

					const bulkActionItems = selectedData.items.map(
						(item: any) => ({
							classExternalReferenceCode:
								item.embedded.externalReferenceCode,
							className: item.entryClassName,
							classPK: item.embedded.id,
							name: item.embedded.title,
						})
					);

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

					loadData?.();
				},
			},
		],
		center: true,
		status: 'danger',
		title,
	});
}
