/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import {ClayTooltipProvider} from '@clayui/tooltip';
import React from 'react';

import {isSubtask} from '../utils/subtaskWatchActions';

import './TaskTypeIcon.scss';

/**
 * Tells a task from a subtask in the task lists. With a tooltip, the icon
 * shows it on hover.
 */
export default function TaskTypeIcon({
	task,
	tooltip,
}: {
	task?: {r_cmpTaskToCMPTasks_c_cmpTaskId?: number};
	tooltip?: string;
}) {
	const subtask = isSubtask(task);

	const icon = (
		<span
			aria-label={
				subtask
					? Liferay.Language.get('subtask')
					: Liferay.Language.get('task')
			}
			className="lfr__cmp-task-type-icon"
			role="img"
		>
			<ClayIcon symbol={subtask ? 'indent-more' : 'check-square'} />
		</span>
	);

	if (!tooltip) {
		return icon;
	}

	return (
		<ClayTooltipProvider>
			<span
				className="lfr__cmp-task-type-icon-tooltip"
				data-tooltip-align="top"
				title={tooltip}
			>
				{icon}
			</span>
		</ClayTooltipProvider>
	);
}
