/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import ClayIcon from '@clayui/icon';
import React from 'react';

import './Header.scss';

import {sub} from 'frontend-js-web';

interface Header {
	folderExternalReferenceCode: string;
	hasDraftObjectDefinitions: boolean;
}

export default function ({
	folderExternalReferenceCode,
	hasDraftObjectDefinitions,
}: Header) {
	return (
		<div className="lfr-objects__model-builder-header">
			<div className="lfr-objects__model-builder-header-container">
				<div className="lfr-objects__model-builder-header-erc">
					<div>
						<span className="lfr-objects__model-builder-header-erc-label">
							{Liferay.Language.get('erc')}:&nbsp;
						</span>

						<strong>{folderExternalReferenceCode}</strong>
					</div>

					<span
						role="tooltip"
						title={sub(
							Liferay.Language.get(
								'unique-key-for-referencing-the-x'
							),
							Liferay.Language.get(
								'object-folder'
							)
						)}
					>
						<ClayIcon symbol="question-circle" />
					</span>

					{folderExternalReferenceCode !== 'uncategorized' && (
						<ClayButtonWithIcon
							aria-label={sub(
								Liferay.Language.get('edit-x'),
								Liferay.Language.get('external-reference-code')
							)}
							displayType="unstyled"
							symbol="pencil"
						/>
					)}
				</div>

				<div className="lfr-objects__model-builder-header-buttons-container">
					<ClayButtonWithIcon
						aria-label={Liferay.Language.get('toggle-sidebars')}
						displayType="secondary"
						symbol="view"
						title={Liferay.Language.get('toggle-sidebars')}
					/>

					<ClayButton displayType="secondary">
						{sub(
							Liferay.Language.get('x-folder'),
							Liferay.Language.get('create-new')
						)}
					</ClayButton>

					<ClayButton displayType="secondary">
						{Liferay.Language.get('export')}
					</ClayButton>

					<ClayButton
						disabled={!hasDraftObjectDefinitions}
						displayType="primary"
					>
						{Liferay.Language.get('publish')}
					</ClayButton>
				</div>
			</div>
		</div>
	);
}
