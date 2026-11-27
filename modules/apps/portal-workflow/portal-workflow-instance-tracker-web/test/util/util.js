/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {isVisited} from '../../src/main/resources/META-INF/resources/js/util/util';

const transitionElements = [
	{name: 'fork', sourceNodeName: 'start', targetNodeName: 'fork'},
	{name: 'task1', sourceNodeName: 'fork', targetNodeName: 'task1'},
	{name: 'task2', sourceNodeName: 'fork', targetNodeName: 'task2'},
	{name: 'task3', sourceNodeName: 'fork', targetNodeName: 'task3'},
	{name: 'join', sourceNodeName: 'task1', targetNodeName: 'join'},
	{name: 'join', sourceNodeName: 'task2', targetNodeName: 'join'},
	{name: 'join', sourceNodeName: 'task3', targetNodeName: 'join'},
];

const join = {name: 'join', type: 'JOIN'};

describe('The isVisited function should', () => {
	it('Mark the fork and a task of a parallel branch as visited', () => {
		const visitedNodes = ['start', 'fork', 'task1', 'task2', 'task3'];

		expect(
			isVisited(visitedNodes, transitionElements, {
				name: 'fork',
				type: 'FORK',
			})
		).toBe(true);
		expect(
			isVisited(visitedNodes, transitionElements, {
				name: 'task1',
				type: 'TASK',
			})
		).toBe(true);
	});

	it('Not mark a node that was never entered as visited', () => {
		expect(
			isVisited(['start', 'fork'], transitionElements, {
				name: 'task1',
				type: 'TASK',
			})
		).toBe(false);
	});

	it('Not mark a join as visited until every incoming transition was taken', () => {
		expect(isVisited(['join'], transitionElements, join)).toBe(false);
		expect(isVisited(['join', 'join'], transitionElements, join)).toBe(
			false
		);
	});

	it('Mark a join as visited once every incoming transition was taken', () => {
		expect(
			isVisited(['join', 'join', 'join'], transitionElements, join)
		).toBe(true);
	});
});
