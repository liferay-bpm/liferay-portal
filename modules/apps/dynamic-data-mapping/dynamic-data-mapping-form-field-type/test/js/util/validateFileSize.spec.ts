/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom/extend-expect';

import {validateFileSize} from '../../../src/main/resources/META-INF/resources/js/util/validateFileSize';

describe('validateFileSize', () => {
	it('returns error if fileSize is bigger than overallMaximumUploadRequestSize or fileItemThresholdSize', () => {
		expect(validateFileSize(1048576, 10485760, 1048576)).toStrictEqual({
			displayErrors: true,
			errorMessage:
				'file-size-is-larger-than-the-allowed-overall-maximum-upload-request-size-x',
			valid: false,
		});
		expect(validateFileSize(1048576, 10485760, 104857600)).toStrictEqual({
			displayErrors: true,
			errorMessage:
				'please-enter-a-file-with-a-valid-file-size-no-larger-than-x',
			valid: false,
		});
	});

	it('returns undefined if fileSize is smaller than overallMaximumUploadRequestSize or fileItemThresholdSizes', () => {
		expect(validateFileSize(10485760, 1048576, 10485760)).toStrictEqual(
			undefined
		);
	});
});
