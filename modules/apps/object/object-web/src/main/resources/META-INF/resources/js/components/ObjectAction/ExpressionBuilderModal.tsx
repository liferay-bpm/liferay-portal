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

import {
	ExpressionBuilderModal as Modal,
	SidebarCategory,
	SidebarElement,
} from '@liferay/object-js-components-web';
import React, {useEffect, useState} from 'react';

export default function ExpressionBuilderModal({sidebarElements}: IProps) {
	const [filteredSidebarElements, setFilteredSidebarElements] = useState<
		SidebarCategory[]
	>(sidebarElements);

	useEffect(() => {
		const sidebarFields = sidebarElements.find(
			(sidebarElement) => sidebarElement.label === 'Fields'
		);

		if (sidebarFields) {
			const filteredFields: SidebarElement[] = sidebarFields?.items.filter(
				(sidebarField) => sidebarField.businessType !== 'Aggregation'
			);

			const newSidebarElements: SidebarCategory[] = [
				{
					items: filteredFields,
					label: 'Fields',
				},
				...sidebarElements.filter(
					(sidebarElement) => sidebarElement.label !== 'Fields'
				),
			];

			setFilteredSidebarElements(newSidebarElements);
		}
	}, [sidebarElements]);

	return <Modal sidebarElements={filteredSidebarElements} />;
}

interface IProps {
	sidebarElements: SidebarCategory[];
}
