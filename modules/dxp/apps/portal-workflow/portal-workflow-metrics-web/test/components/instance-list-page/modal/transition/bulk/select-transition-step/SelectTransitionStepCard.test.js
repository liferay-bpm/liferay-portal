/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {ModalContext} from '../../../../../../../src/main/resources/META-INF/resources/js/components/instance-list-page/modal/ModalProvider.es';
import SelectTransitionStepCard from '../../../../../../../src/main/resources/META-INF/resources/js/components/instance-list-page/modal/transition/bulk/select-transition-step/SelectTransitionStepCard.es';

import '@testing-library/jest-dom';

const getTasks = (count) =>
	Array.from({length: count}, (_, index) => ({
		assetTitle: `Blogs Entry Title ${index + 1}`,
		assetType: 'Blogs Entry',
		id: index + 1,
		instanceId: index + 1,
	}));

const renderSelectTransitionStepCard = (tasks) =>
	render(
		<ModalContext.Provider
			value={{
				bulkTransition: {
					transition: {errors: {}, onGoing: false},
					transitionTasks: [],
				},
				setBulkTransition: jest.fn(),
			}}
		>
			<SelectTransitionStepCard cardIndex={0} tasks={tasks} />
		</ModalContext.Provider>
	);

describe('SelectTransitionStepCard', () => {
	afterEach(cleanup);

	it('does not offer show all for 10 tasks', () => {
		renderSelectTransitionStepCard(getTasks(10));

		expect(
			screen.getByText('Blogs Entry: Blogs Entry Title 10')
		).toBeInTheDocument();
		expect(screen.queryByText('show-all')).not.toBeInTheDocument();
	});

	it('toggles between show all and show less for more than 10 tasks', async () => {
		const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});

		renderSelectTransitionStepCard(getTasks(11));

		for (let index = 1; index <= 11; index++) {
			expect(
				screen.getByText(`Blogs Entry: Blogs Entry Title ${index}`)
			).toBeInTheDocument();
		}

		const taskList = screen
			.getByText('Blogs Entry: Blogs Entry Title 11')
			.closest('.table-visualization');

		expect(taskList).not.toHaveClass('table-visualization-show-all');

		await user.click(screen.getByText('show-all'));

		expect(taskList).toHaveClass('table-visualization-show-all');
		expect(screen.getByText('show-less')).toBeInTheDocument();

		await user.click(screen.getByText('show-less'));

		expect(taskList).not.toHaveClass('table-visualization-show-all');
		expect(screen.getByText('show-all')).toBeInTheDocument();
	});
});
