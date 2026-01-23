/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useCallback, useState} from 'react';

import {IColumn, ITask} from '../../../../utils/types';
import Board from './components/Board';
import {KanbanViewContext} from './context';

interface KanbanViewProps {
	[k: string]: ITask[];
}

function mapByStateCode(items: ITask[]) {
	return items.reduce((column: {[name: string]: IColumn}, item: ITask) => {
		const {
			state: {key, name},
		} = item.embedded;

		if (!column[key]?.tasks?.length) {
			column[key] = {
				key,
				name,
				tasks: [],
			};
		}

		column[key].tasks.push(item);

		return {...column};
	}, {});
}

function KanbanView(props: KanbanViewProps) {
	const [boardData] = useState(mapByStateCode(props.items));

	const changeTaskStatus = useCallback(() => {}, []);

	return (
		<KanbanViewContext.Provider
			value={{
				boardData,
				changeTaskStatus,
			}}
		>
			<Board />
		</KanbanViewContext.Provider>
	);
}

export default KanbanView;
