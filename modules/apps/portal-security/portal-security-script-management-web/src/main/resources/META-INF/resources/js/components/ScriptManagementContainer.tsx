/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import {Text} from '@clayui/core';
import {ClayCheckbox} from '@clayui/form';
import {createResourceURL, fetch, openToast} from 'frontend-js-web';
import React, {useState} from 'react';

import './ScriptManagementContainer.scss';

interface ScriptManagementContainerProps {
	allowScriptContentBeExecutedOrIncluded: boolean;
	baseResourceURL: string;
}

export default function ScriptManagementContainer({
	allowScriptContentBeExecutedOrIncluded,
	baseResourceURL,
}: ScriptManagementContainerProps) {
	const [allowScriptContent, setAllowScriptContent] = useState(
		allowScriptContentBeExecutedOrIncluded
	);

	const handleSaveSystemConfiguration = async () => {
		const response = await fetch(
			createResourceURL(baseResourceURL, {
				allowAdministratorsIncludeScriptContent: allowScriptContent,
				p_p_resource_id:
					'/system_settings/edit_script_management_configuration',
			}).toString()
		);

		openToast({
			message: response.ok
				? Liferay.Language.get('your-request-completed-successfully.')
				: Liferay.Language.get('an-error-occurred'),
			type: response.ok ? 'success' : 'danger',
		});
	};

	return (
		<div className="lfr__script-management-container">
			<Text as="span" size={7} weight="bolder">
				{Liferay.Language.get('script-management')}
			</Text>

			<ClayAlert displayType="info" title="Info:">
				{Liferay.Language.get(
					'this-configuration-is-not-saved-yet-the-values-shown-are-the-default'
				)}
			</ClayAlert>

			<div className="lfr__script-management-checkbox-container">
				<div className="lfr__script-management-checkbox-label-container">
					<ClayCheckbox
						aria-label="Option 1"
						checked={allowScriptContent}
						onChange={() =>
							setAllowScriptContent(!allowScriptContent)
						}
					/>

					<Text as="span" size={4} weight="semi-bold">
						{Liferay.Language.get(
							'allow-instance-admin-to-create-and-execute-code-in-liferay-dxp'
						)}
					</Text>
				</div>

				<Text as="span" color="secondary" size={4} weight="normal">
					{Liferay.Language.get(
						'administrators-can-create-and-execute-code-in-their-Liferay-instance'
					)}
				</Text>
			</div>

			<ClayButton.Group key={1} spaced>
				<ClayButton
					displayType="primary"
					onClick={() => handleSaveSystemConfiguration()}
					type="submit"
				>
					{Liferay.Language.get('save')}
				</ClayButton>

				<ClayButton
					displayType="secondary"
					onClick={() =>
						setAllowScriptContent(
							allowScriptContentBeExecutedOrIncluded
						)
					}
				>
					{Liferay.Language.get('cancel')}
				</ClayButton>
			</ClayButton.Group>
		</div>
	);
}
