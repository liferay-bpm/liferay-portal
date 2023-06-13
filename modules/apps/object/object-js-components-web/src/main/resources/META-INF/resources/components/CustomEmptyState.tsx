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

import ClayButton from '@clayui/button';
import React from 'react';

import './CustomEmptyState.scss';

interface CustomEmptyStateProps {
	actionButtonLabel?: string;
	customImgSrc?: string;
	description: string;
	handleActionButton?: () => void;
	hasImage?: boolean;
	title: string;
}

export function CustomEmptyState({
	actionButtonLabel,
	customImgSrc,
	description,
	handleActionButton,
	hasImage = false,
	title,
}: CustomEmptyStateProps) {
	return (
		<div className="lfr-objects__custom-empty-state">
			{hasImage && (
				<img
					alt={Liferay.Language.get('empty-state-image')}
					className="lfr-objects__custom-empty-state-image"
					src={
						customImgSrc ??
						`${Liferay.ThemeDisplay.getPathThemeImages()}/states/empty_state.gif`
					}
				/>
			)}

			<div className="lfr-objects__custom-empty-state-title">{title}</div>

			<div className="lfr-objects__custom-empty-state-description">
				{description}
			</div>

			{actionButtonLabel && handleActionButton && (
				<div className="lfr-objects__custom-empty-state-action">
					<ClayButton
						displayType="secondary"
						onClick={handleActionButton}
					>
						{actionButtonLabel}
					</ClayButton>
				</div>
			)}
		</div>
	);
}
