/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import Label from '@clayui/label';
import React from 'react';

import {mapStateKeyToDisplayType} from '../utils/constants';
import {IDisplayType} from '../utils/types';
interface StateLabelProps {
	displayType?: IDisplayType;
	key: string;
	name: string;
}

const StateLabel = ({displayType, key, name}: StateLabelProps) => (
	<Label displayType={displayType ?? mapStateKeyToDisplayType[key]}>
		{name}
	</Label>
);

export default StateLabel;
