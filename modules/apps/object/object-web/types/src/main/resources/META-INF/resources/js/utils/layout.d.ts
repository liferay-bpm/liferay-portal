/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	ObjectLayoutField,
	ObjectLayoutRelationship,
} from '../components/Layout/types';
export declare function findObjectLayoutRowIndex(
	objectLayoutRows: ObjectLayoutRow[],
	fieldSize: number
): number;
export declare function findObjectFieldIndexById(
	objectFields: ObjectLayoutField[] | ObjectLayoutRelationship[],
	objectFieldId: number
): number;
export declare function findObjectFieldIndexByName(
	objectFields: ObjectLayoutField[] | ObjectLayoutRelationship[],
	objectFieldName: string
): number;
