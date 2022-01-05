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
import ClayTabs from '@clayui/tabs';
import React, {useState} from 'react';

import SidePanelContent from '../SidePanelContent';
import BasicInfoScreen from './BasicInfoScreen';
import ViewBuilderScreen from './ViewBuilderScreen';

const TABS = [
	{
		Component: BasicInfoScreen,
		label: Liferay.Language.get('basic-info'),
	},
	{
		Component: ViewBuilderScreen,
		label: Liferay.Language.get('view-builder'),
	},
];

const CustomView: React.FC<React.HTMLAttributes<HTMLElement>> = () => {
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);

	const onCloseSidePanel = () => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('close-side-panel');
	};

	return (
		<>
			<ClayTabs className="side-panel-iframe__tabs">
				{TABS.map(({label}, index) => (
					<ClayTabs.Item
						active={activeIndex === index}
						key={index}
						onClick={() => setActiveIndex(index)}
					>
						{label}
					</ClayTabs.Item>
				))}
			</ClayTabs>

			<SidePanelContent className="side-panel-content--custom-view">
				<SidePanelContent.Body>
					<ClayTabs.Content activeIndex={activeIndex} fade>
						{TABS.map(({Component}, index) => (
							<ClayTabs.TabPane key={index}>
								{!loading && <Component />}
							</ClayTabs.TabPane>
						))}
					</ClayTabs.Content>
				</SidePanelContent.Body>

				{!loading && (
					<SidePanelContent.Footer>
						<ClayButton.Group spaced>
							<ClayButton
								displayType="secondary"
								onClick={onCloseSidePanel}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton

								// disabled={isViewOnly}

								onClick={() => {}}
							>
								{Liferay.Language.get('save')}
							</ClayButton>
						</ClayButton.Group>
					</SidePanelContent.Footer>
				)}
			</SidePanelContent>
		</>
	);
};

export default CustomView;
