/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {OpenToastProps, openToast} from 'frontend-js-components-web';
import {sub} from 'frontend-js-web';

export default function displayBulkDeletionSuccessToast(
	trashStatus: {
		allTrashEnabled: boolean;
		noneTrashEnabled: boolean;
		someTrashEnabled: boolean;
	},
	entriesWithTrashDisabled?: number,
	entriesWithTrashEnabled?: number
) {
	let message = '';
	if (trashStatus.noneTrashEnabled) {
		message = sub(
			Liferay.Language.get('x-were-deleted-successfully'),
			entriesWithTrashDisabled
		);
	}
	else if (trashStatus.someTrashEnabled && !trashStatus.allTrashEnabled) {
		message = sub(
			Liferay.Language.get(
				'x-items-were-moved-to-the-recycle-bin-and-x-items-were-permanently-deleted'
			),
			[entriesWithTrashEnabled, entriesWithTrashDisabled]
		);
	}
	else if (trashStatus.allTrashEnabled) {
		message = sub(
			Liferay.Language.get('x-items-were-moved-to-the-recycle-bin'),
			entriesWithTrashEnabled
		);
	}

	const openToastSuccessProps: OpenToastProps = {
		message,
		type: 'success',
	};

	openToast(openToastSuccessProps);
}
