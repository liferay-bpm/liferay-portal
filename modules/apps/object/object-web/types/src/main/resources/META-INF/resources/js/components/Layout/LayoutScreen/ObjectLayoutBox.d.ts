/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
interface ObjectLayoutBoxProps extends React.HTMLAttributes<HTMLElement> {
	boxIndex: number;
	collapsable: boolean;
	label: string;
	objectLayoutRows?: ObjectLayoutRow[];
	tabIndex: number;
	type: ObjectLayoutBoxType;
}
export declare function ObjectLayoutBox({
	boxIndex,
	collapsable,
	label,
	objectLayoutRows,
	tabIndex,
	type,
}: ObjectLayoutBoxProps): JSX.Element;
export {};
