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
import {ClayButtonWithIcon} from '@clayui/button';
import ClayEmptyState from '@clayui/empty-state';
import {ClayInput} from '@clayui/form';
import ClayList from '@clayui/list';
import ClayManagementToolbar from '@clayui/management-toolbar';
import {useModal} from '@clayui/modal';
import React, {useContext, useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {normalizeLanguageId} from '../../utils/string';
import Card from '../Card/Card';
import ModalAddColumnsObjectCustomView from './ModalAddColumnsObjectCustomView';
import ViewBuilderListItem from './ViewBuilderListItem';
import ViewContext, {TObjectView, TYPES} from './context';

import './ViewBuilderScreen.scss';

const defaultLanguageId = normalizeLanguageId(
	Liferay.ThemeDisplay.getDefaultLanguageId()
);

const ViewBuilderScreen = () => {
	const [
		{isViewOnly, objectFields, objectView, objectViewId},
		dispatch,
	] = useContext(ViewContext);

	console.log(JSON.stringify(objectView));
	const [visibleModal, setVisibleModal] = useState(false);

	// const [currentObjectView, setCurrentObjectView] = useState<TObjectView>()

	const {observer, onClose} = useModal({
		onClose: () => setVisibleModal(false),
	});

	// console.log(currentObjectView);
	// console.log(currentObjectView?.objectViewColumn);
	// useEffect(() => {
	// 	setCurrentObjectView(objectView);
	// }, [])

	return (
		<>
			<Card>
				<Card.Header title="Columns" />

				<Card.Body>
					<ClayManagementToolbar>
						<ClayManagementToolbar.ItemList expand>
							<ClayManagementToolbar.Search>
								<ClayInput.Group>
									<ClayInput.GroupItem>
										<ClayInput
											aria-label="Search"
											className="form-control input-group-inset input-group-inset-after"
											defaultValue="Search"
											type="text"
										/>

										<ClayInput.GroupInsetItem
											after
											tag="span"
										>
											<ClayButtonWithIcon
												className="navbar-breakpoint-d-none"
												displayType="unstyled"
												onClick={() => {}}
												symbol="times"
											/>

											<ClayButtonWithIcon
												displayType="unstyled"
												symbol="search"
												type="submit"
											/>
										</ClayInput.GroupInsetItem>
									</ClayInput.GroupItem>
								</ClayInput.Group>
							</ClayManagementToolbar.Search>

							<ClayManagementToolbar.Item>
								<ClayButtonWithIcon
									className="nav-btn nav-btn-monospaced"
									onClick={() => setVisibleModal(true)}
									symbol="plus"
								/>
							</ClayManagementToolbar.Item>
						</ClayManagementToolbar.ItemList>
					</ClayManagementToolbar>

					{objectView?.objectViewColumn?.length > 0 ? (
						<ClayList>
							{objectView?.objectViewColumn.map(
								(viewColumn, index) => {
									return (
										<>
											{index === 0 && (
												<ClayList.Item flex>
													<ClayList.ItemField expand>
														<ClayList.ItemField>
															Name
														</ClayList.ItemField>
													</ClayList.ItemField>
												</ClayList.Item>
											)}

											<DndProvider backend={HTML5Backend}>
												<ViewBuilderListItem
													index={index}
													objectViewColumn={
														viewColumn
													}
												/>
											</DndProvider>
										</>
									);
								}
							)}
						</ClayList>
					) : (
						<div className="object-web__custom-view-view-builder--empty-space">
							<ClayEmptyState
								description="Add Columns to start creating a View"
								title="No coluns added yet."
							>
								<ClayButton
									displayType="secondary"
									onClick={() => setVisibleModal(true)}
								>
									Add Column
								</ClayButton>
							</ClayEmptyState>
						</div>
					)}
				</Card.Body>
			</Card>

			{visibleModal && (
				<ModalAddColumnsObjectCustomView
					observer={observer}
					onClose={onClose}
				/>
			)}
		</>
	);
};

export default ViewBuilderScreen;
