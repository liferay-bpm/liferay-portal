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
import {Text, TreeView} from '@clayui/core';
import Icon from '@clayui/icon';
import {
	CustomVerticalBar,
	ManagementToolbarSearch,
} from '@liferay/object-js-components-web';
import React, {useState} from 'react';

import './LeftSidebar.scss';

type TreeViewItemType = {
	children?: TreeViewItemType[];
	name: string;
	type: 'objectDefinition' | 'objectFolder';
};

const TYPES_TO_SYMBOLS = {
	objectDefinition: 'catalog',
	objectFolder: 'diagram',
};

export default function LeftSidebar() {
	const [query, setQuery] = useState('');

	const treeViewItems: TreeViewItemType[] = [
		{
			children: [{name: 'Object Definition', type: 'objectDefinition'}],
			name: Liferay.Language.get('uncategorized'),
			type: 'objectFolder',
		},
	];

	return (
		<CustomVerticalBar
			defaultActive="objectsModelBuilderLeftSidebar"
			panelWidth={280}
			panelWidthMax={280}
			panelWidthMin={280}
			position="left"
			resize={false}
			triggerSideBarAnimation={true}
			verticalBarItems={[
				{
					title: 'objectsModelBuilderLeftSidebar',
				},
			]}
		>
			<div className="lfr-objects__model-builder-left-sidebar">
				<div className="lfr-objects__model-builder-left-sidebar-header">
					<Text weight="semi-bold">
						{Liferay.Language.get('objects-model-builder')}
					</Text>
				</div>

				<div className="lfr-objects__model-builder-left-sidebar-body">
					<ManagementToolbarSearch
						query={query}
						setQuery={(searchTerm) => setQuery(searchTerm)}
					/>

					<ClayButton className="lfr-objects__model-builder-left-sidebar-body-create-new-object-button">
						{Liferay.Language.get('create-new-object')}
					</ClayButton>

					<TreeView
						defaultItems={treeViewItems}
						nestedKey="children"
						showExpanderOnHover={false}
					>
						{(item) => (
							<TreeView.Item>
								<TreeView.ItemStack>
									<Icon
										symbol={TYPES_TO_SYMBOLS[item.type]}
									/>

									<Text weight="semi-bold">{item.name}</Text>
								</TreeView.ItemStack>

								<TreeView.Group items={item.children}>
									{({name, type}) => (
										<TreeView.Item>
											<Icon
												symbol={TYPES_TO_SYMBOLS[type]}
											/>

											{name}
										</TreeView.Item>
									)}
								</TreeView.Group>
							</TreeView.Item>
						)}
					</TreeView>
				</div>
			</div>
		</CustomVerticalBar>
	);
}
