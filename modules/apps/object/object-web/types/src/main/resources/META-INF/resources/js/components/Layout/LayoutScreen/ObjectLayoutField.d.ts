/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

interface ObjectLayoutFieldProps {
	boxIndex: number;
	columnIndex: number;
	objectFieldName: string;
	rowIndex: number;
	tabIndex: number;
}
export declare function ObjectLayoutField({
	boxIndex,
	columnIndex,
	objectFieldName,
	rowIndex,
	tabIndex,
}: ObjectLayoutFieldProps): JSX.Element;
export {};
