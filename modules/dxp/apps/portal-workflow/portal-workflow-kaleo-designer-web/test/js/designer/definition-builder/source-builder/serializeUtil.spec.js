/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {serializeDefinition} from '../../../../../src/main/resources/META-INF/resources/designer/js/definition-builder/source-builder/serializeUtil';

const METADATA = {description: '', name: 'definition', version: 1};

const XML_NAMESPACE = {
	'xmlns': 'urn:liferay.com:liferay-workflow_7.4.0',
	'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
};

describe('Serializing a task whose assignments were not recognized', () => {
	it('Writes the task when the assignments are empty', () => {
		const xmlDefinition = serializeDefinition(
			XML_NAMESPACE,
			METADATA,
			[
				{
					data: {assignments: {}, label: {en_US: 'Review'}},
					id: 'Review',
					position: {x: 0, y: 0},
					type: 'task',
				},
			],
			[]
		);

		expect(xmlDefinition).toContain('<name>Review</name>');
	});
});
