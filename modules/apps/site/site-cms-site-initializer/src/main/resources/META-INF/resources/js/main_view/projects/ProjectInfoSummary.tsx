/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import classNames from 'classnames';
import React, {useState} from 'react';

import './ProjectInfoSummary.scss';

import {ClayButtonWithIcon} from '@clayui/button';

interface ProjectInfoSummaryProps {
	dueDate: string;
	initialState: string;
	manager: User;
	sponsor: User;
}

interface User {
	image?: string;
	name: string;
}

const Item = ({label, value}: {label: string; value: string | JSX.Element}) => (
	<div className="lfr-cmp__project-info-summary-content-item">
		<span className="lfr-cmp__project-info-summary-content-label">
			{label}{' '}
		</span>

		<span>{value}</span>
	</div>
);

const User = ({image, name}: User) => (
	<div className="lfr-cmp__project-info-summary-content-user-container">
		{image && (
			<img
				alt={name}
				className="lfr-cmp__project-info-summary-content-user-avatar"
				src={image}
			/>
		)}

		<span>{name}</span>
	</div>
);

export default function ProjectInfoSummary({
	dueDate,
	initialState,
	manager,
	sponsor,
}: ProjectInfoSummaryProps) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div>
			<div className="lfr-cmp__project-info-summary-header-container">
				<span className="lfr-cmp__project-info-summary-header-content">
					Info
				</span>

				<ClayButtonWithIcon
					displayType="unstyled"
					onClick={() => setIsOpen((prev) => !prev)}
					symbol={isOpen ? 'angle-down' : 'angle-right'}
				/>
			</div>

			<div
				className={classNames(
					'lfr-cmp__project-info-summary-content-container',
					{
						'lfr-cmp__project-info-summary-content-container--hidden':
							!isOpen,
					}
				)}
			>
				<Item label="State" value={initialState} />

				<Item label="Manager" value={<User {...manager} />} />

				<Item label="Sponsor" value={<User {...sponsor} />} />

				<Item label="Due Date" value={dueDate} />
			</div>
		</div>
	);
}
