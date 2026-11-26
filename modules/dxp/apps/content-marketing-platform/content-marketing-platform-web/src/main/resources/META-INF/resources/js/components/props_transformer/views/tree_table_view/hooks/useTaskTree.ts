/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	IDataSetData,
	IDataSetPageData,
	TSort,
} from '@liferay/frontend-data-set-web';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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

function getTaskIdsKey(tasks: ITask[]) {
	return tasks.map((task) => task.embedded.id).join();
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
 * Builds the tree from the top-level tasks (the data set items, which grow
 * with the pages this hook requests), the subtasks loaded on expand, and the
 * tasks updated by row actions.
 */
export default function useTaskTree({
	apiURL,
	items,
	requestPage,
	sorts,
	total,
	updateDataSetItems,
}: {
	apiURL: string;
	items: ITask[];
	requestPage?: (page: number) => Promise<IDataSetPageData>;
	sorts?: TSort[];
	total: number;
	updateDataSetItems?: (dataSetData: IDataSetData) => void;
}) {
	const [subtasksByTaskId, setSubtasksByTaskId] = useState(
		new Map<number, ITask[]>()
	);
	const [updatesByTaskId, setUpdatesByTaskId] = useState(
		new Map<number, ITaskItemsActionsTask>()
	);

	const itemsRef = useRef(items);
	const loadedTaskIdsRef = useRef(new Set<number>());
	const ownTaskIdsKeyRef = useRef<string | null>(null);
	const pageRef = useRef(1);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	const fetchSubtasks = useCallback(
		async (parentTaskId: number) => {
			const {data} = await getSubtasks({apiURL, parentTaskId, sorts});

			return data?.items;
		},
		[apiURL, sorts]
	);

	// The data set items change on a reload, a sort or a filter, and also when
	// this hook appends a page. Only the first case makes the loaded subtasks
	// and the updates stale, so reload the subtasks of the expanded tasks.

	useEffect(() => {
		if (getTaskIdsKey(items) === ownTaskIdsKeyRef.current) {
			return;
		}

		ownTaskIdsKeyRef.current = null;
		pageRef.current = 1;

		setUpdatesByTaskId(new Map());

		const taskIds = [...loadedTaskIdsRef.current];

		if (!taskIds.length) {
			return;
		}

		let ignore = false;

		Promise.all(taskIds.map(fetchSubtasks)).then((subtasksList) => {
			if (ignore) {
				return;
			}

			const newSubtasksByTaskId = new Map<number, ITask[]>();

			subtasksList.forEach((subtasks, index) => {
				if (subtasks) {
					newSubtasksByTaskId.set(taskIds[index], subtasks);
				}
			});

			setSubtasksByTaskId(newSubtasksByTaskId);
		});

		return () => {
			ignore = true;
		};
	}, [fetchSubtasks, items]);

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

		return buildTreeTasks(items);
	}, [items, subtasksByTaskId, updatesByTaskId]);

	const hasMore =
		!!requestPage && !!updateDataSetItems && items.length < total;

	// The next pages go into the data set items, so the data set knows every
	// row this view shows (for example, to select them all).

	const loadMore = useCallback(async () => {
		const requestedItems = items;

		const data = await requestPage!(pageRef.current + 1);

		if (data.stale || itemsRef.current !== requestedItems) {
			return;
		}

		const taskIds = new Set(requestedItems.map((task) => task.embedded.id));

		const newItems = [
			...requestedItems,
			...(data.items as ITask[]).filter(
				(task) => !taskIds.has(task.embedded.id)
			),
		];

		ownTaskIdsKeyRef.current = getTaskIdsKey(newItems);
		pageRef.current = data.page;

		updateDataSetItems!({...data, items: newItems});
	}, [items, requestPage, updateDataSetItems]);

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

			loadedTaskIdsRef.current.add(task.embedded.id);

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
