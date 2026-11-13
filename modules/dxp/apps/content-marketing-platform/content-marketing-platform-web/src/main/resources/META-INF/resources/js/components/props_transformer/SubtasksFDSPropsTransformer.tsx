/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ProjectTasksFDSPropsTransformer from './ProjectTasksFDSPropsTransformer';

export default function SubtasksFDSPropsTransformer(
	props: Parameters<typeof ProjectTasksFDSPropsTransformer>[0]
) {
	return {
		...ProjectTasksFDSPropsTransformer(props),
		views: props.views,
	};
}
