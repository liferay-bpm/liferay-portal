/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {TSort} from '@liferay/frontend-data-set-web';
import {ApiHelper} from '@liferay/site-cms-site-initializer';

import {SUBTASKS_NESTED_FIELDS} from './constants';
import {ChangeTransition, ITask, ITaskObjectEntry} from './types';

type WorkflowTaskAssignee = {
	assignableUsers: Array<{id: number; name: string}>;
	workflowTaskId: number;
};

export async function bulkAssignWorkflowTasks(
	assignments: Array<{assigneeId: number; workflowTaskId: number}>
) {
	return ApiHelper.patch(
		assignments,
		'/o/headless-admin-workflow/v1.0/workflow-tasks/assign-to-user'
	);
}

export async function bulkChangeWorkflowTaskTransitions(
	changeTransitions: ChangeTransition[]
) {
	return ApiHelper.patch(
		changeTransitions,
		'/o/headless-admin-workflow/v1.0/workflow-tasks/change-transition'
	);
}

export async function bulkUpdateWorkflowTaskDueDate(
	updates: Array<{dueDate: string; workflowTaskId: number}>
) {
	return ApiHelper.patch(
		updates,
		'/o/headless-admin-workflow/v1.0/workflow-tasks/update-due-date'
	);
}

export async function deleteTaskById({taskId}: {taskId: string}) {
	return await ApiHelper.delete(`/o/cmp/tasks/${taskId}`);
}

export async function getAllProjects(cmpProjectObjectDefinitionId: number) {
	return await ApiHelper.get(
		`/o/search/v1.0/search?emptySearch=true&filter=objectDefinitionId eq ${cmpProjectObjectDefinitionId}&nestedFields=embedded`
	);
}

export async function getAllStates() {
	return await ApiHelper.get(
		'/o/headless-admin-list-type/v1.0/list-type-definitions/by-external-reference-code/L_CMP_STATES/list-type-entries'
	);
}

export async function getAssignableUsersForWorkflowTasks(
	workflowTaskIds: number[]
) {
	return ApiHelper.post<{
		workflowTaskAssignableUsers: WorkflowTaskAssignee[];
	}>('/o/headless-admin-workflow/v1.0/workflow-tasks/assignable-users', {
		workflowTaskIds,
	});
}

/**
 * Reuses the search URL of the tasks data set, so the subtasks come back in
 * the same shape as the data set items.
 */
export async function getSubtasks({
	apiURL,
	parentTaskId,
	sorts = [],
}: {
	apiURL: string;
	parentTaskId: number;
	sorts?: TSort[];
}) {
	const url = new URL(
		Liferay.ThemeDisplay.getPortalURL() +
			Liferay.ThemeDisplay.getPathContext() +
			apiURL
	);

	url.searchParams.set(
		'filter',
		`${url.searchParams.get('filter')} and cmpParentTaskId eq ${parentTaskId}`
	);
	url.searchParams.set(
		'nestedFields',
		`${url.searchParams.get('nestedFields')},${SUBTASKS_NESTED_FIELDS}`
	);
	url.searchParams.set('pageSize', '200');

	const sortParameter = sorts
		.filter((sort) => sort.active !== false)
		.map((sort) => `${sort.key}:${sort.direction}`)
		.join(',');

	if (sortParameter) {
		url.searchParams.set('sort', sortParameter);
	}

	return await ApiHelper.get<{items: ITask[]}>(url.toString());
}

export async function getTaskById({taskId}: {taskId: string}) {
	return await ApiHelper.get<ITaskObjectEntry>(`/o/cmp/tasks/${taskId}`);
}

export async function getUserAccount(id: string) {
	return ApiHelper.get(`/o/headless-admin-user/v1.0/user-accounts/${id}`)
		.then((response) => {
			return response.data;
		})
		.catch(() => {
			throw new Error('Failed to fetch user data.');
		});
}

export async function getVocabularyByExternalReferenceCode({
	siteGroupId,
	vocabularyERC,
}: {
	siteGroupId: number | string;
	vocabularyERC: string;
}) {
	return await ApiHelper.get<{id: number}>(
		`/o/headless-admin-taxonomy/v1.0/sites/${siteGroupId}/taxonomy-vocabularies/by-external-reference-code/${vocabularyERC}`
	);
}

export async function patchProjectById({
	body,
	projectId,
}: {
	body: {[key: string]: any};
	projectId: string;
}) {
	return await ApiHelper.patch(body, `/o/cmp/projects/${projectId}`);
}

export async function patchTaskById({
	body,
	taskId,
}: {
	body: {[key: string]: any};
	taskId: string;
}) {
	return await ApiHelper.patch<ITaskObjectEntry>(
		body,
		`/o/cmp/tasks/${taskId}`
	);
}

export async function postSubscribeTaskByExternalReferenceCode({
	externalReferenceCode,
	scopeKey,
}: {
	externalReferenceCode: string;
	scopeKey: string;
}) {
	return await ApiHelper.post(
		`/o/cmp/tasks/scopes/${scopeKey}/by-external-reference-code/${externalReferenceCode}/subscribe`
	);
}

export async function postUnsubscribeTaskByExternalReferenceCode({
	externalReferenceCode,
	scopeKey,
}: {
	externalReferenceCode: string;
	scopeKey: string;
}) {
	return await ApiHelper.post(
		`/o/cmp/tasks/scopes/${scopeKey}/by-external-reference-code/${externalReferenceCode}/unsubscribe`
	);
}

export async function postTaskByScope({
	body,
	scopeKey,
}: {
	body: {[key: string]: any};
	scopeKey: string;
}) {
	return await ApiHelper.post(`/o/cmp/tasks/scopes/${scopeKey}`, body);
}
