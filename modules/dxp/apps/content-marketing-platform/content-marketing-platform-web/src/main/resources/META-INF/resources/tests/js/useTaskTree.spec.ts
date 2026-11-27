/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {act, renderHook, waitFor} from '@testing-library/react';

import useTaskTree from '../../js/components/props_transformer/views/tree_table_view/hooks/useTaskTree';
import {ITask} from '../../js/utils/types';

const mockGetSubtasks = jest.fn();

jest.mock('../../js/utils/api', () => ({
	getSubtasks: (...args: any[]) => mockGetSubtasks(...args),
}));

const API_URL = '/o/search/v1.0/search?filter=(objectDefinitionId eq 1)';

function createTask(id: number, title = `Task ${id}`) {
	return {
		actions: {},
		embedded: {cmpTaskToCMPTasks: [], id, title},
	} as unknown as ITask;
}

function mockSubtasks(...subtasks: ITask[]) {
	mockGetSubtasks.mockResolvedValueOnce({
		data: {items: subtasks},
		error: null,
	});
}

function renderTaskTree({
	items,
	requestPage = jest.fn(),
	total = items.length,
	updateDataSetItems = jest.fn(),
}: {
	items: ITask[];
	requestPage?: jest.Mock;
	total?: number;
	updateDataSetItems?: jest.Mock;
}) {
	return renderHook(
		({items}: {items: ITask[]}) =>
			useTaskTree({
				apiURL: API_URL,
				items,
				requestPage,
				total,
				updateDataSetItems,
			}),
		{initialProps: {items}}
	);
}

describe('useTaskTree', () => {
	beforeEach(() => {
		mockGetSubtasks.mockReset();
	});

	it('appends the next page to the data set items', async () => {
		const task1 = createTask(1);
		const task2 = createTask(2);

		const requestPage = jest.fn().mockResolvedValue({
			items: [task2, createTask(3)],
			lastPage: 2,
			page: 2,
			stale: false,
			totalCount: 3,
		});
		const updateDataSetItems = jest.fn();

		const {result} = renderTaskTree({
			items: [task1, task2],
			requestPage,
			total: 3,
			updateDataSetItems,
		});

		expect(result.current.hasMore).toBe(true);

		await act(() => result.current.loadMore());

		expect(requestPage).toHaveBeenCalledWith(2);
		expect(
			updateDataSetItems.mock.calls[0][0].items.map(
				(task: ITask) => task.embedded.id
			)
		).toEqual([1, 2, 3]);
	});

	it('builds the tree with the subtasks loaded on expand', async () => {
		const task = createTask(1);

		mockSubtasks(createTask(2), createTask(3));

		const {result} = renderTaskTree({items: [task]});

		await act(() => result.current.loadSubtasks(task));

		expect(mockGetSubtasks).toHaveBeenCalledWith({
			apiURL: API_URL,
			parentTaskId: 1,
			sorts: undefined,
		});
		expect(result.current.treeTasks[0].children?.map(({id}) => id)).toEqual(
			[2, 3]
		);
	});

	it('discards the updates when the data set items change', async () => {
		const task = createTask(1, 'Old title');

		const {rerender, result} = renderTaskTree({items: [task]});

		act(() => {
			result.current.updateTask({
				actions: {},
				embedded: {id: 1, title: 'Updated title'},
			} as any);
		});

		expect(result.current.treeTasks[0].embedded.title).toBe(
			'Updated title'
		);

		rerender({items: [createTask(1, 'Reloaded title')]});

		await waitFor(() =>
			expect(result.current.treeTasks[0].embedded.title).toBe(
				'Reloaded title'
			)
		);
	});

	it('does not append a stale page', async () => {
		const requestPage = jest.fn().mockResolvedValue({
			items: [createTask(2)],
			lastPage: 2,
			page: 2,
			stale: true,
			totalCount: 2,
		});
		const updateDataSetItems = jest.fn();

		const {result} = renderTaskTree({
			items: [createTask(1)],
			requestPage,
			total: 2,
			updateDataSetItems,
		});

		await act(() => result.current.loadMore());

		expect(updateDataSetItems).not.toHaveBeenCalled();
	});

	it('does not reload the subtasks when the view appends a page', async () => {
		const task1 = createTask(1);

		mockSubtasks(createTask(10));

		const requestPage = jest.fn().mockResolvedValue({
			items: [createTask(2)],
			lastPage: 2,
			page: 2,
			stale: false,
			totalCount: 2,
		});
		const updateDataSetItems = jest.fn();

		const {rerender, result} = renderTaskTree({
			items: [task1],
			requestPage,
			total: 2,
			updateDataSetItems,
		});

		await act(() => result.current.loadSubtasks(task1));
		await act(() => result.current.loadMore());

		rerender({items: updateDataSetItems.mock.calls[0][0].items});

		expect(mockGetSubtasks).toHaveBeenCalledTimes(1);
		expect(result.current.treeTasks.map(({id}) => id)).toEqual([1, 2]);
		expect(result.current.treeTasks[0].children?.map(({id}) => id)).toEqual(
			[10]
		);
	});

	it('reloads the loaded subtasks when the data set items change', async () => {
		const task = createTask(1);

		mockSubtasks(createTask(2), createTask(3));

		const {rerender, result} = renderTaskTree({items: [task]});

		await act(() => result.current.loadSubtasks(task));

		mockSubtasks(createTask(3));

		rerender({items: [createTask(1)]});

		await waitFor(() =>
			expect(
				result.current.treeTasks[0].children?.map(({id}) => id)
			).toEqual([3])
		);

		expect(mockGetSubtasks).toHaveBeenCalledTimes(2);
	});

	it('throws when the subtasks cannot be loaded', async () => {
		mockGetSubtasks.mockResolvedValueOnce({data: null, error: 'Error'});

		const task = createTask(1);

		const {result} = renderTaskTree({items: [task]});

		await expect(result.current.loadSubtasks(task)).rejects.toThrow(
			'Error'
		);
	});
});
