/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {EVENT_TYPES} from '../../../../src/main/resources/META-INF/resources/js/core/actions/eventTypes.es';
import fieldChange from '../../../../src/main/resources/META-INF/resources/js/core/thunks/fieldChange.es';

const getPages = (localizable) => [
	{
		rows: [
			{
				columns: [
					{
						fields: [
							{
								fieldName: 'location',
								localizable,
								name: 'location_instance',
								value: '',
							},
						],
					},
				],
			},
		],
	},
];

const getUpdatedField = async (localizable) => {
	const dispatch = jest.fn();

	await fieldChange({
		defaultLanguageId: 'en_US',
		editingLanguageId: 'en_US',
		pages: getPages(localizable),
		properties: {
			fieldInstance: {
				evaluable: false,
				fieldName: 'location',
				name: 'location_instance',
			},
			key: 'value',
			value: 'new value',
		},
	})(dispatch);

	const [pageUpdate] = dispatch.mock.calls.find(
		([{type}]) => type === EVENT_TYPES.PAGE.UPDATE
	);

	return pageUpdate.payload[0].rows[0].columns[0].fields[0];
};

describe('fieldChange', () => {
	it('does not record a translation on a nonlocalizable field', async () => {
		const field = await getUpdatedField(false);

		expect(field.localizedValue).toBeUndefined();
		expect(field.localizedValueEdited).toBeUndefined();
		expect(field.value).toBe('new value');
	});

	it('records the value under the editing language on a localizable field', async () => {
		const field = await getUpdatedField(true);

		expect(field.localizedValue).toEqual({en_US: 'new value'});
		expect(field.localizedValueEdited).toEqual({en_US: true});
		expect(field.value).toBe('new value');
	});
});
