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

import {VerticalBar} from '@clayui/core';
import React, {ReactNode} from 'react';

import './CustomVerticalBar.scss';

interface CustomVerticalBarProps {
	children: ReactNode;
	defaultActive: string;
	panelWidth?: number;
	panelWidthMax?: number;
	panelWidthMin?: number;
	position: 'left' | 'right';
	resize?: boolean;
	triggerSideBarAnimation: boolean;
	verticalBarItems: {
		title: string;
	}[];
}

export function CustomVerticalBar({
	children,
	defaultActive,
	panelWidth = 1000,
	panelWidthMax = 1200,
	panelWidthMin = 400,
	position,
	resize = true,
	triggerSideBarAnimation,
	verticalBarItems,
}: CustomVerticalBarProps) {
	return (
		<VerticalBar
			className={
				triggerSideBarAnimation
					? `lfr__objects-custom-vertical-bar--${position}-open`
					: `lfr__objects-custom-vertical-bar--${position}-closed`
			}
			defaultActive={defaultActive}
			defaultPanelWidth={panelWidth}
			panelWidthMax={panelWidthMax}
			panelWidthMin={panelWidthMin}
			position={position}
			resize={resize}
		>
			<div className="lfr__objects-custom-vertical-bar-content">
				<VerticalBar.Content items={verticalBarItems}>
					{(item) => (
						<VerticalBar.Panel key={item.title}>
							{children}
						</VerticalBar.Panel>
					)}
				</VerticalBar.Content>
			</div>
		</VerticalBar>
	);
}
