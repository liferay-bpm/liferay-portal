/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	canCreateInObjectFolder,
	getDefaultObjectFolder,
	getObjectDefinitionsFilter,
} from '../../components/ViewObjectDefinitions/objectDefinitionUtil';

const objectFolder = (externalReferenceCode: string, name: string) =>
	({externalReferenceCode, name}) as ObjectFolder;

describe('canCreateInObjectFolder', () => {
	it('returns false when no folder is selected', () => {
		expect(canCreateInObjectFolder(undefined)).toBe(false);
	});

	it('returns true for a regular object folder', () => {
		expect(canCreateInObjectFolder({externalReferenceCode: 'TST123'})).toBe(
			true
		);
	});

	it('returns false for the CMS Content Structures folder', () => {
		expect(
			canCreateInObjectFolder({
				externalReferenceCode: 'L_CMS_CONTENT_STRUCTURES',
			})
		).toBe(false);
	});
});

describe('getDefaultObjectFolder', () => {
	it('returns the first folder when none has the default external reference code', () => {
		expect(
			getDefaultObjectFolder([
				objectFolder(
					'L_CMS_CONTENT_STRUCTURES',
					'CMSContentStructures'
				),
				objectFolder('L_CMS_FILE_TYPES', 'CMSFileTypes'),
			])
		).toEqual(
			objectFolder('L_CMS_CONTENT_STRUCTURES', 'CMSContentStructures')
		);
	});

	it('returns the folder with the default external reference code even when renamed', () => {
		expect(
			getDefaultObjectFolder([
				objectFolder(
					'L_CMS_CONTENT_STRUCTURES',
					'CMSContentStructures'
				),
				objectFolder('default', 'My Objects'),
			])
		).toEqual(objectFolder('default', 'My Objects'));
	});

	it('returns undefined when there are no folders', () => {
		expect(getDefaultObjectFolder([])).toBeUndefined();
	});
});

describe('getObjectDefinitionsFilter', () => {
	it('includes hidden eq false filter when showHiddenObjects is false', () => {
		expect(getObjectDefinitionsFilter('DEFAULT', false)).toBe(
			"hidden eq false and objectFolderExternalReferenceCode eq 'DEFAULT'"
		);
	});

	it('omits hidden eq false filter when showHiddenObjects is true', () => {
		expect(getObjectDefinitionsFilter('DEFAULT', true)).toBe(
			"objectFolderExternalReferenceCode eq 'DEFAULT'"
		);
	});
});
