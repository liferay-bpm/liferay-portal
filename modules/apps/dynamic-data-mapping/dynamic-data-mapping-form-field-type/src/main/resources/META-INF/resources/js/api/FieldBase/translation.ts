/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {PagesVisitor} from 'data-engine-js-components-web';

import {LocalizedValue} from './ReactFieldBase';

interface Column {
	fields: WebContentField[];
	size: number;
}

type WebContentFieldType =
	| 'checkbox_multiple'
	| 'captcha'
	| 'checkbox'
	| 'color'
	| 'date'
	| 'document_library'
	| 'fieldset'
	| 'grid'
	| 'image'
	| 'localizable_text'
	| 'numeric'
	| 'options'
	| 'paragraph'
	| 'radio'
	| 'rich_text'
	| 'separator'
	| 'select'
	| 'text';

export interface WebContentField<T = unknown> {
	disabled?: boolean;
	fieldName: string;
	hidden?: boolean;
	localizable?: boolean;
	localizedValueEdited?: LocalizedValue<any>;
	name: string;
	nestedFields?: WebContentField[];
	settingsContext: {pages: unknown[]};
	type: WebContentFieldType;
	value?: T;
	visible?: boolean;
}

interface PageVisitor extends PagesVisitor {
	mapColumns: (mapper: (column: Column) => void) => void;
}

/**
 * Returns an array with all the occurences of the string 'Fieldset' followed by digits.
 * Used to find all fieldsets that are ancestors of a nested field.
 */

export function getAllFieldsetsFromName(name: string) {
	const pattern = /Fieldset\d+/g;

	return name.match(pattern) || [];
}

/**
 * Add a fieldset fieldname in the provided set if it appears on the nested field name.
 * Used to track if the fieldset should be shown in the chosen filter section.
 */

export function addVisibleFieldsets({
	name,
	visibleFieldsets,
}: {
	name: string;
	visibleFieldsets: Set<string>;
}) {
	const parsedName = getAllFieldsetsFromName(name);

	if (parsedName) {
		parsedName.forEach((fieldset: string) =>
			visibleFieldsets.add(fieldset)
		);
	}
}

/**
 * Returns a boolean to determine if a field should be shown or not.
 * If the field is not localizable it will never appear.
 * If the filter is translated, the field should have a translation for the editingLanguageId to appear.
 * If the filter is untranslated, the field shouldn't have a translation for the editingLanguageId to appear.
 */

export function isFieldVisible({
	editingLanguageId,
	field,
	filter,
}: {
	editingLanguageId: Liferay.Language.Locale;
	field: WebContentField;
	filter: string;
}) {
	const hasValueInEditingLanguage =
		!!field.localizedValueEdited?.[editingLanguageId];

	if (!field.localizable) {
		return false;
	}

	if (hasValueInEditingLanguage && filter === 'translated') {
		return true;
	}

	if (!hasValueInEditingLanguage && filter === 'untranslated') {
		return true;
	}

	return false;
}

/**
 * Returns an array of fields with updated props depending on the filter chosen.
 * Considers fieldsets and uses recursion to update the nested fields when necessary.
 */

export function showFilteredFields({
	editingLanguageId,
	fields,
	filter,
	visibleFieldsets,
}: {
	editingLanguageId: Liferay.Language.Locale;
	fields: WebContentField[];
	filter: string;
	visibleFieldsets: Set<string>;
}) {
	const newFields = [...fields];

	return newFields.map((field: WebContentField) => {
		if (field.nestedFields) {
			const newNestedFields: WebContentField[] = showFilteredFields({
				editingLanguageId,
				fields: field.nestedFields,
				filter,
				visibleFieldsets,
			});

			const visible = visibleFieldsets.has(field.fieldName);

			return {
				...field,
				disabled: !visible,
				hidden: !visible,
				nestedFields: newNestedFields,
				visible,
			};
		}

		if (isFieldVisible({editingLanguageId, field, filter})) {
			addVisibleFieldsets({name: field.name, visibleFieldsets});

			return {
				...field,
				disabled: false,
				hidden: false,
				visible: true,
			};
		}
		else {
			return {
				...field,
				disabled: true,
				hidden: true,
				visible: false,
			};
		}
	});
}

/**
 * Returns the updated page depending on the filter chosen.
 */

export function getFilteredPage({
	editingLanguageId,
	filter,
	pagesVisitor,
}: {
	editingLanguageId: Liferay.Language.Locale;
	filter: string;
	pagesVisitor: PageVisitor;
}) {
	return pagesVisitor.mapColumns((column: Column) => {
		const visibleFieldsets = new Set<string>();

		return {
			...column,
			fields: showFilteredFields({
				editingLanguageId,
				fields: column.fields,
				filter,
				visibleFieldsets,
			}),
		};
	});
}
