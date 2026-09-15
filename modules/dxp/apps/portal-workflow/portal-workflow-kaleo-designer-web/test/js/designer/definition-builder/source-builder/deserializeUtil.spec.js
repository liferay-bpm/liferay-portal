/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import fs from 'fs';
import path from 'path';

import DeserializeUtil from '../../../../../src/main/resources/META-INF/resources/designer/js/definition-builder/source-builder/deserializeUtil';

const getReviewTaskData = (fileName) => {
	const xmlFilePath = path.join(
		__dirname,
		`../../../../dependencies/${fileName}`
	);

	const xmlFileContent = fs.readFileSync(xmlFilePath, 'utf8');

	const deserializeUtil = new DeserializeUtil(xmlFileContent);

	const elements = deserializeUtil.getElements();

	const task = elements.find((element) => element.id === 'Review');

	return task.data;
};

describe('Deserializing a notification whose recipients omit optional elements', () => {
	it('Reads a role recipient that omits auto-create', () => {
		const data = getReviewTaskData(
			'no-auto-create-role-recipient-workflow-definition.xml'
		);

		expect(data.notifications.recipients[0][0]).toEqual({
			assignmentType: ['roleType'],
			roleName: ['Portal Content Reviewer'],
			roleType: ['regular'],
		});
	});

	it('Reads an empty recipients element', () => {
		const data = getReviewTaskData(
			'empty-recipients-workflow-definition.xml'
		);

		expect(data.notifications.name).toEqual(['Review Notification']);
	});
});

describe('Deserializing a task whose assignments omit optional elements', () => {
	it('Reads an empty assignments element', () => {
		const data = getReviewTaskData(
			'empty-assignments-workflow-definition.xml'
		);

		expect(data.assignments).toEqual({});
	});

	it('Reads assignments that declare an empty roles element', () => {
		const data = getReviewTaskData(
			'empty-roles-assignments-workflow-definition.xml'
		);

		expect(data.assignments).toEqual({});
	});
});

describe('Deserializing transitions that share a name', () => {
	it('Renames a transition only when its source node already uses the name', () => {
		const xmlFilePath = path.join(
			__dirname,
			'../../../../dependencies/same-name-transitions-workflow-definition.xml'
		);
		const xmlFileContent = fs.readFileSync(xmlFilePath, 'utf8');

		const deserializeUtil = new DeserializeUtil(xmlFileContent);

		const elements = deserializeUtil.getElements();

		const TransitionFromStartToParentTask = elements.find(
			(element) =>
				element.data.label.en_US ===
				'Transition From Start to Parent Task'
		);

		expect(TransitionFromStartToParentTask.data.name).toBe(
			'transitionName'
		);

		const TransitionFromParentTaskToChildTask1 = elements.find(
			(element) =>
				element.data.label.en_US ===
				'Transition From Parent Task to Child Task 1'
		);

		expect(TransitionFromParentTaskToChildTask1.data.name).toBe(
			'transitionName'
		);

		// The transition from Parent Task to Child Task 2 should be renamed
		// from transitionName to 'Parent Task_transitionName_Child Task 2'

		const TransitionFromParentTaskToChildTask2 = elements.find(
			(element) =>
				element.data.label.en_US ===
				'Transition From Parent Task to Child Task 2'
		);

		expect(TransitionFromParentTaskToChildTask2.data.name).toBe(
			'Parent Task_transitionName_Child Task 2'
		);

		const TransitionFromChildTask1ToEnd = elements.find(
			(element) =>
				element.data.label.en_US ===
				'Transition From Child Task 1 to End'
		);

		expect(TransitionFromChildTask1ToEnd.data.name).toBe('transitionName');

		const TransitionFromChildTask2ToEnd = elements.find(
			(element) =>
				element.data.label.en_US ===
				'Transition From Child Task 2 to End'
		);

		expect(TransitionFromChildTask2ToEnd.data.name).toBe('transitionName');
	});
});
