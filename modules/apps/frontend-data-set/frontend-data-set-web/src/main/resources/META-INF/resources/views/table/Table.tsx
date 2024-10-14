/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useContext} from 'react';

import {IItemsActions} from '../..';
import FrontendDataSetContext from '../../FrontendDataSetContext';
import ViewsContext from '../ViewsContext';
import {ClayTable} from './ClayTable';

// @ts-ignore

import DndTable from './dnd_table/index';

interface IField {
	fieldName: string | [];
	label: string;
	mapData: Function;
}
interface ISchema {
	fields: Array<IField>;
}

const getVisibleFields = ({
	fields,
	visibleFieldNames,
}: {
	fields: Array<any>;
	visibleFieldNames: Array<string>;
}) => {
	const visibleFields = fields.filter(
		({fieldName}) => visibleFieldNames[fieldName]
	);

	return visibleFields.length ? visibleFields : fields;
};

const Table = ({
	items = [],
	itemsActions,
	schema,
}: {
	items: Array<any>;
	itemsActions: Array<IItemsActions>;
	schema: ISchema;
}) => {
	const {
		inlineAddingSettings,
		itemsChanges,
		nestedItemsReferenceKey,
		selectItems,
		selectable,
		selectedItemsKey = 'id',
		selectedItemsValue,
		selectionType,
	} = useContext(FrontendDataSetContext);
	const [{visibleFieldNames}] = useContext(ViewsContext);

	const visibleFields = getVisibleFields({
		fields: schema.fields,
		visibleFieldNames,
	});

	const columnNames = [];

	if (selectable) {
		columnNames.push('item-selector');
	}

	columnNames.push(
		...visibleFields.map((field) => String(field.fieldName)),
		'item-actions'
	);

	return (
		<DndTable.TableContextProvider
			columnNames={visibleFields.map((field) => String(field.fieldName))}
		>
			<ClayTable
				fields={schema.fields as any}
				inlineAddingSettings={inlineAddingSettings}
				itemInlineChanges={itemsChanges}
				items={items}
				itemsActions={itemsActions}
				nestedItemsReferenceKey={nestedItemsReferenceKey}
				selectItems={selectItems}
				selectable={selectable}
				selectedItemsKey={selectedItemsKey}
				selectedItemsValue={selectedItemsValue}
				selectionType={selectionType}
			/>
		</DndTable.TableContextProvider>
	);
};

export default Table;
