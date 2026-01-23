/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Col} from '@clayui/layout';
import React from 'react';

import Task from './Task';

import './StatusColumn.scss';
import {ITask} from '../../../../../utils/types';
import StateLabel from '../../../../StateLabel';

interface IStatusColumnProps {
	key: string;
	name: string;
	tasks: ITask[];
}

export default function StatusColumn({key, name, tasks}: IStatusColumnProps) {
	return (
		<Col>
			<div className="kaban-view__status-column-header">
				<StateLabel key={key} name={name} />

				<span>{tasks.length}</span>
			</div>

			<div className="kaban-view__status-column-tasks">
				{tasks.map((task) => {
					return <Task key={task.embedded.id} {...task} />;
				})}
			</div>
		</Col>
	);
}
