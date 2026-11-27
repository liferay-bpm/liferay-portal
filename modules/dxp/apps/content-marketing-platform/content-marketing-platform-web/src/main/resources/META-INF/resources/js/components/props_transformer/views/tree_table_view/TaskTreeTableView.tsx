/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	Body as ClayTableBody,
	Cell as ClayTableCell,
	Head as ClayTableHead,
	Row as ClayTableRow,
	Table as ClayTable,
} from '@clayui/core';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {
	FrontendDataSetContext,
	IItemsActions,
} from '@liferay/frontend-data-set-web';
import React, {useContext, useMemo} from 'react';

import {ITask} from '../../../../utils/types';
import TaskTreeTableCell, {ColumnKey} from './components/TaskTreeTableCell';
import useInfiniteScroll from './hooks/useInfiniteScroll';
import useTaskTree, {TreeTask} from './hooks/useTaskTree';

import './TaskTreeTableView.scss';

interface IColumn {
	hiddenLabel?: boolean;
	key: ColumnKey;
	label: string;
	width?: string;
}

const COLUMNS: IColumn[] = [
	{
		hiddenLabel: true,
		key: 'select',
		label: Liferay.Language.get('item-selection'),
		width: '51px',
	},
	{key: 'title', label: Liferay.Language.get('title')},
	{key: 'parent', label: Liferay.Language.get('parent')},
	{key: 'assignee', label: Liferay.Language.get('assign-to')},
	{key: 'dueDate', label: Liferay.Language.get('due-date')},
	{key: 'state', label: Liferay.Language.get('state')},
	{
		hiddenLabel: true,
		key: 'actions',
		label: Liferay.Language.get('actions'),
		width: '56px',
	},
];

const TABLE_MESSAGES = {
	columnsVisibility: '',
	columnsVisibilityClearSearch: '',
	columnsVisibilityDescription: '',
	columnsVisibilityHeader: '',
	columnsVisibilityNoResults: '',
	columnsVisibilitySearch: '',
	expandable: Liferay.Language.get('expand'),
	sortColumn: '',
	sortDescription: '',
	sorting: '',
};

interface TaskTreeTableViewProps {
	items: ITask[];
	itemsActions: IItemsActions[];
	onItemSelectionChange: (item: ITask) => void;
}

/**
 * Lists the tasks of a project as a tree. The data set items are the
 * top-level tasks, and the view requests the next ones on scroll. Subtasks
 * load when their task is expanded. With a search or a filter, the list is
 * flat and shows the parent of each task.
 */
export default function TaskTreeTableView({
	items,
	itemsActions,
	onItemSelectionChange,
}: TaskTreeTableViewProps) {
	const {
		apiURL,
		globalFDSState,
		requestPage,
		selectable,
		sorts,
		total,
		updateDataSetItems,
	} = useContext(FrontendDataSetContext);

	const flat =
		!!globalFDSState?.search?.query ||
		!!globalFDSState?.filters?.some(
			(filter: {active?: boolean}) => filter.active
		);

	const {hasMore, loadMore, loadSubtasks, treeTasks, updateTask} =
		useTaskTree({
			apiURL: apiURL!,
			items,
			requestPage,
			sorts,
			total: total ?? 0,
			updateDataSetItems,
		});

	const {loading, sentinelRef} = useInfiniteScroll({
		hasMore,
		items,
		onLoadMore: loadMore,
	});

	const columns = useMemo(
		() =>
			COLUMNS.filter(({key}) => {
				if (key === 'parent') {
					return flat;
				}

				if (key === 'select') {
					return !!selectable;
				}

				return true;
			}),
		[flat, selectable]
	);

	return (
		<div className="task-tree-table-view">
			<ClayTable
				expanderColumnKey="title"
				messages={TABLE_MESSAGES}
				nestedKey={flat ? undefined : 'children'}
				onLoadMore={(item: unknown) => loadSubtasks(item as TreeTask)}
			>
				<ClayTableHead items={columns}>
					{(column: IColumn) => (
						<ClayTableCell key={column.key} width={column.width}>
							{column.hiddenLabel ? (
								<span className="sr-only">{column.label}</span>
							) : (
								column.label
							)}
						</ClayTableCell>
					)}
				</ClayTableHead>

				{/* The tree is derived from the data set items and the loaded
				subtasks, so the copy Clay keeps of the rows is not needed */}

				<ClayTableBody items={treeTasks} onItemsChange={() => {}}>
					{(treeTask: TreeTask) => (
						<ClayTableRow
							items={columns}
							lazy={
								!flat &&
								!!treeTask.embedded.cmpTaskToCMPTasks?.length
							}
						>
							{(column: IColumn) => (
								<ClayTableCell
									className={
										column.key === 'select'
											? 'cell-select-item'
											: undefined
									}
									key={column.key}
								>
									<TaskTreeTableCell
										columnKey={column.key}
										itemsActions={itemsActions}
										onSelectionChange={
											onItemSelectionChange
										}
										onTaskChange={updateTask}
										treeTask={treeTask}
									/>
								</ClayTableCell>
							)}
						</ClayTableRow>
					)}
				</ClayTableBody>
			</ClayTable>

			<div
				aria-busy={loading}
				className="task-tree-table-view-loader"
				ref={sentinelRef}
			>
				{loading && (
					<ClayLoadingIndicator
						aria-label={Liferay.Language.get('loading-more-items')}
						displayType="secondary"
						size="sm"
					/>
				)}
			</div>

			<div aria-live="polite" className="sr-only">
				{loading ? Liferay.Language.get('loading-more-items') : ''}
			</div>
		</div>
	);
}
