/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {IDataSetData, TSort} from '@liferay/frontend-data-set-web';
import {useCallback, useMemo, useState} from 'react';

import {getSubtasks} from '../../../../../utils/api';
import {ITask, ITaskItemsActionsTask} from '../../../../../utils/types';

export type TreeTask = ITask & {children?: TreeTask[]; id: number};

function applyTaskUpdate(
	treeTask: TreeTask,
	update: ITaskItemsActionsTask
): TreeTask {

	// The object entry API returns the task without the nested fields of the
	// search API, so keep the parent and the subtasks.

	return {
		...treeTask,
		actions: update.actions ?? treeTask.actions,
		embedded: {
			...(update.embedded as unknown as ITask['embedded']),
			cmpTaskToCMPTasks: treeTask.embedded.cmpTaskToCMPTasks,
			r_cmpProjectToCMPTasks_c_cmpProject:
				treeTask.embedded.r_cmpProjectToCMPTasks_c_cmpProject,
			r_cmpTaskToCMPTasks_c_cmpTask:
				treeTask.embedded.r_cmpTaskToCMPTasks_c_cmpTask,
		},
	};
}

function toTreeTask(task: ITask): TreeTask {

	// Rows loaded outside the data set keep their permissions under
	// "embedded", so copy them where the renderers and actions read them.

	return {
		...task,
		actions: task.actions ?? task.embedded.actions,
		id: task.embedded.id,
	};
}

/**
 * Builds the tree from the top-level tasks (the data set items plus the
 * pages this hook requested), the subtasks loaded on expand, and the tasks
 * updated by row actions.
 */
export default function useTaskTree({
	apiURL,
	items,
	requestPage,
	sorts,
	total,
}: {
	apiURL: string;
	items: ITask[];
	requestPage?: (page: number) => Promise<IDataSetData>;
	sorts?: TSort[];
	total: number;
}) {

	// The pages requested after the one the data set shows belong to the
	// items they follow, so a new set of items drops them.

	const [nextPages, setNextPages] = useState<{
		items: ITask[];
		loadedItems: ITask[];
		page: number;
	}>({items, loadedItems: [], page: 1});

	if (nextPages.items !== items) {
		setNextPages({items, loadedItems: [], page: 1});
	}

	const [subtasksByTaskId, setSubtasksByTaskId] = useState(
		new Map<number, ITask[]>()
	);
	const [updatesByTaskId, setUpdatesByTaskId] = useState(
		new Map<number, ITaskItemsActionsTask>()
	);

	const treeTasks = useMemo(() => {
		const buildTreeTasks = (tasks: ITask[]): TreeTask[] =>
			tasks.map((task) => {
				const subtasks = subtasksByTaskId.get(task.embedded.id);
				const update = updatesByTaskId.get(task.embedded.id);

				const treeTask = update
					? applyTaskUpdate(toTreeTask(task), update)
					: toTreeTask(task);

				return subtasks
					? {...treeTask, children: buildTreeTasks(subtasks)}
					: treeTask;
			});

		return buildTreeTasks([...items, ...nextPages.loadedItems]);
	}, [items, nextPages.loadedItems, subtasksByTaskId, updatesByTaskId]);

	const hasMore =
		!!requestPage && items.length + nextPages.loadedItems.length < total;

	const loadMore = useCallback(async () => {
		const data = await requestPage!(nextPages.page + 1);

		setNextPages((nextPages) => {
			if (nextPages.items !== items) {
				return nextPages;
			}

			const taskIds = new Set(
				[...items, ...nextPages.loadedItems].map(
					(task) => task.embedded.id
				)
			);

			return {
				...nextPages,
				loadedItems: [
					...nextPages.loadedItems,
					...(data.items as ITask[]).filter(
						(task) => !taskIds.has(task.embedded.id)
					),
				],
				page: data.page,
			};
		});
	}, [items, nextPages.page, requestPage]);

	const loadSubtasks = useCallback(
		async (task: ITask) => {
			const {data, error} = await getSubtasks({
				apiURL,
				parentTaskId: task.embedded.id,
				sorts,
			});

			if (!data) {
				throw new Error(error);
			}

			setSubtasksByTaskId((subtasksByTaskId) =>
				new Map(subtasksByTaskId).set(task.embedded.id, data.items)
			);

			return data.items.map(toTreeTask);
		},
		[apiURL, sorts]
	);

	const updateTask = useCallback(
		(update: ITaskItemsActionsTask) =>
			setUpdatesByTaskId((updatesByTaskId) =>
				new Map(updatesByTaskId).set(update.embedded.id, update)
			),
		[]
	);

	return {hasMore, loadMore, loadSubtasks, treeTasks, updateTask};
}
