/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ProjectTasksFDSPropsTransformer from './ProjectTasksFDSPropsTransformer';

/**
 * Reuses the same props as the project tasks, but overrides the views with
 * just the Subtasks table view, so it excludes the Kanban and Calendar views.
 * It also leaves out the parameters of the tree table view, which ask for the
 * top-level tasks only.
 */
export default function SubtasksFDSPropsTransformer(
	props: Parameters<typeof ProjectTasksFDSPropsTransformer>[0]
) {
	const {
		additionalAPIURLParameters: _additionalAPIURLParameters,
		additionalAPIURLParametersTransformer:
			_additionalAPIURLParametersTransformer,
		showSelectAll: _showSelectAll,
		...projectTasksProps
	} = ProjectTasksFDSPropsTransformer(props) as Record<string, unknown>;

	return {
		...projectTasksProps,
		views: props.views,
	};
}
