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

import {RefAttributes} from 'react';
import './Toggle.scss';
interface ToggleProps extends RefAttributes<HTMLLabelElement> {
	disabled?: boolean;
	label: string;
	name?: string;
	onToggle?: (val: boolean) => void;
	toggled?: boolean;
	tooltip?: string;
	tooltipAlign?: 'bottom' | 'left' | 'right' | 'top';
}
export declare function Toggle({
	disabled,
	label,
	name,
	onToggle,
	toggled,
	tooltip,
	tooltipAlign,
	...otherProps
}: ToggleProps): JSX.Element;
export {};
