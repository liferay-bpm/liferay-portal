/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import {ClayCheckbox} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import {
	DateRenderer,
	FrontendDataSetContext,
	IItemsActions,
} from '@liferay/frontend-data-set-web';
import {
	SimpleActionLinkRenderer,
	StateLabel,
} from '@liferay/site-cms-site-initializer';
import {sub} from 'frontend-js-web';
import React, {useContext} from 'react';

import getTaskItemsActions from '../../../../../utils/getTaskItemsActions';
import {isSubtask} from '../../../../../utils/subtaskWatchActions';
import {ITaskItemsActionsTask} from '../../../../../utils/types';
import AssigneeRenderer from '../../../cell_renderers/AssigneeRenderer';
import {TreeTask} from '../hooks/useTaskTree';

export type ColumnKey =
	| 'actions'
	| 'assignee'
	| 'dueDate'
	| 'parent'
	| 'select'
	| 'state'
	| 'title';

export default function TaskTreeTableCell({
	columnKey,
	itemsActions,
	onSelectionChange,
	onTaskChange,
	treeTask,
}: {
	columnKey: ColumnKey;
	itemsActions: IItemsActions[];
	onSelectionChange: (treeTask: TreeTask) => void;
	onTaskChange: (task: ITaskItemsActionsTask) => void;
	treeTask: TreeTask;
}) {
	const {allItemsSelectedActive, loadData, selectedItemsValue} = useContext(
		FrontendDataSetContext
	);

	const {
		assignTo,
		dueDate,
		r_cmpTaskToCMPTasks_c_cmpTask: parentTask,
		state,
		title,
	} = treeTask.embedded;

	const subtask = isSubtask(treeTask.embedded);

	switch (columnKey) {
		case 'actions':
			return (
				<ClayDropDownWithItems
					items={getTaskItemsActions(
						itemsActions,
						loadData,
						treeTask,
						onTaskChange
					)}
					trigger={
						<ClayButton
							aria-label={sub(
								Liferay.Language.get('x-actions'),
								title
							)}
							displayType="unstyled"
							monospaced
							size="sm"
						>
							<ClayIcon symbol="ellipsis-v" />
						</ClayButton>
					}
				/>
			);
		case 'assignee':
			return (
				<AssigneeRenderer
					image={assignTo?.portrait}
					name={assignTo?.name}
				/>
			);
		case 'dueDate':
			return <>{DateRenderer({value: dueDate})}</>;
		case 'parent':
			return <>{parentTask?.title}</>;
		case 'select':
			return (
				<ClayCheckbox
					aria-label={sub(Liferay.Language.get('select-x'), title)}
					checked={
						allItemsSelectedActive ||
						!!selectedItemsValue?.includes(treeTask.id)
					}
					onChange={() => onSelectionChange(treeTask)}
				/>
			);
		case 'state':
			return <StateLabel dueDate={dueDate} state={state} />;
		case 'title':
			return (
				<span className="task-tree-table-view-title">
					<ClayIcon
						aria-label={
							subtask
								? Liferay.Language.get('subtask')
								: Liferay.Language.get('task')
						}
						className="task-tree-table-view-type-icon"
						role="img"
						symbol={subtask ? 'indent-more' : 'check-square'}
					/>

					<SimpleActionLinkRenderer
						actions={itemsActions as any}
						itemData={treeTask}
						options={{actionId: 'actionLink'}}
						value={title}
					/>
				</span>
			);
		default:
			return null;
	}
}
