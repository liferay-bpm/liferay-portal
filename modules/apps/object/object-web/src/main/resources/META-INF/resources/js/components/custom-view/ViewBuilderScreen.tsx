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
import React, {useState} from 'react';

import Card from '../Card/Card';

import './ViewBuilderScreen.scss';
import Panel from '../Panel/Panel';

const ViewBuilderScreen = () => {
	const [visibleModal, setVisibleModal] = useState(false);
	const {observer, onClose} = useModal({
		onClose: () => setVisibleModal(false),
	});

	const columnList: Array<any> = [
		{
			label: 'Name',
		},
		{
			label: 'Age',
		},
		{
			label: 'Description',
		},
		{
			label: 'City',
		},
		{
			label: 'Email',
		},
	];

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

					{columnList.length > 0 ? (
						<ClayList>                           
							{columnList.map((element, index) => {                              
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
                                        <ClayList.Item flex>
                                            <ClayList.ItemField>
                                                <ClayButtonWithIcon
                                                    displayType={null}
                                                    symbol="drag"
                                                />
                                            </ClayList.ItemField>

                                            <ClayList.ItemField expand>
                                                <ClayList.ItemTitle>
                                                    {element.label}
                                                </ClayList.ItemTitle>
                                            </ClayList.ItemField>

                                            <ClayList.ItemField>
                                                <ClayList.QuickActionMenu>
                                                    <ClayList.QuickActionMenu.Item
                                                        onClick={() =>
                                                            alert(
                                                                'Clicked the trash!'
                                                            )
                                                        }
                                                        symbol="times"
                                                    />
                                                </ClayList.QuickActionMenu>
                                            </ClayList.ItemField>
                                        </ClayList.Item>
                                    </>
								);
							})}
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

			{/* {visibleModal && (
                    <ModalDeAlininha
                        observer={observer}
                        onClose={onClose}
                    />
                )}  */}
		</>
	);
};

export default ViewBuilderScreen;
