/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export const DISPLAY_TYPES = [
	'info',
	'warning',
	'success',
	'secondary',
	'danger',
	'unstyled',
] as const;

export const mapLabelToLabelDisplayType: {
	[key: string]: (typeof DISPLAY_TYPES)[number];
} = {
	'Blocked': 'danger',
	'Done': 'success',
	'In Progress': 'info',
	'Not Started': 'secondary',
	'Overdue': 'warning',
};
