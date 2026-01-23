/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ContainerFluid} from '@clayui/layout';
import React, {useContext} from 'react';

import {KanbanViewContext} from '../context';
import StatusColumn from './StatusColumn';

export default function Board() {
	const {boardData} = useContext(KanbanViewContext);

	return (
		<ContainerFluid>
			<div className="d-flex">
				{Object.keys(boardData)
					.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
					.map((state) => {
						return (
							<StatusColumn
								key={state}
								name={boardData[state].name}
								tasks={boardData[state].tasks}
							/>
						);
					})}
			</div>
		</ContainerFluid>
	);
}
