/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom/extend-expect';

import {getSelectedTriggerKey} from '../../components/ObjectAction/tabs/ActionBuilder';

const objectActionTriggers = [
	{label: 'On After Add', value: 'onAfterAdd'},
	{label: 'On After Delete', value: 'onAfterDelete'},
];

const objectActionTriggersWithRoot = [
	{label: 'On After Add', value: 'onAfterAdd'},
	{label: 'On After Root Update', value: 'onAfterRootUpdate'},
];

describe('The getSelectedTriggerKey function should', () => {
	it('check if the trigger key exists inside the objectActionTriggers array and return the corresponding value', () => {

		// return the same trigger key if it exists on the triggers array

		expect(
			getSelectedTriggerKey('onAfterAdd', objectActionTriggersWithRoot)
		).toBe('onAfterAdd');
		expect(
			getSelectedTriggerKey(
				'onAfterRootUpdate',
				objectActionTriggersWithRoot
			)
		).toBe('onAfterRootUpdate');

		// return undefined if the key doesn't exist on the triggers array

		expect(
			getSelectedTriggerKey('onAfterRootUpdate', objectActionTriggers)
		).toBe(undefined);
	});
});
