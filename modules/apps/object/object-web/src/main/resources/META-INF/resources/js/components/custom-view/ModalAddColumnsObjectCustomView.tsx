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
import ClayForm, {ClayCheckbox, ClayInput} from '@clayui/form';
import ClayList from '@clayui/list';
import ClayManagementToolbar from '@clayui/management-toolbar';
import ClayModal from '@clayui/modal';
import React, {useContext, useEffect, useState} from 'react';

import {normalizeLanguageId} from '../../utils/string';
import ViewContext from './context';

import './ModalAddColumnsObjectCustomView.scss';
import {TYPES} from './context';

interface IProps extends React.HTMLAttributes<HTMLElement> {
	observer: any;
	onClose: () => void;
}

type TInitialValues = {
	label: string;
	listTypeDefinitionId: number;
	name?: string;
	required: boolean;
	type: string;
};

type TName = {
	[key: string]: string;
};

interface TObjectViewColumn {
	label: TName;
	checked: boolean;
	filtered: boolean;
}

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const ModalAddColumnsObjectCustomView: React.FC<IProps> = ({
	observer,
	onClose,
}) => {

	// let initialValues: TInitialValues[] = [
	// 	{
	// 		label: '',
	// 		listTypeDefinitionId: 0,
	// 		name: undefined,
	// 		required: false,
	// 		type: '',
	// 	},
	// ];

	// Author, Creation Date, Modified Date, Workflow Status, ID

	const metadatas = [
		{
			label: 'Author',
			checked: false,
			filtered: true,
			id: 1,
			indexed: true,
			indexedAsKeyword: true,
			indexedLanguageId: '',
			inLayout: true, // eslint-disable-line @typescript-eslint/member-ordering
			listTypeDefinitionId: true,
			name: 'author',
			required: false,
			type: 'metadata',
		},
		{
			label: 'Creation Date',
			checked: false,
			filtered: true,
			id: 2,
			indexed: true,
			indexedAsKeyword: true,
			indexedLanguageId: '',
			inLayout: true, // eslint-disable-line @typescript-eslint/member-ordering
			listTypeDefinitionId: true,
			name: 'creationDate',
			required: false,
			type: 'metadata',
		},
		{
			label: 'Modified Date',
			checked: false,
			filtered: true,

			id: 3,
			indexed: true,
			indexedAsKeyword: true,
			indexedLanguageId: '',
			inLayout: true, // eslint-disable-line @typescript-eslint/member-ordering
			listTypeDefinitionId: true,
			name: 'odifiedDate',
			required: false,
			type: 'metadata',
		},
		{
			label: 'Workflow Status',
			checked: false,
			filtered: true,
			id: 4,
			indexed: true,
			indexedAsKeyword: true,
			indexedLanguageId: '',
			inLayout: true, // eslint-disable-line @typescript-eslint/member-ordering
			listTypeDefinitionId: true,
			name: 'author',
			required: false,
			type: 'metadata',
		},
		{
			label: 'ID',
			checked: false,
			filtered: true,
			id: 5,
			indexed: true,
			indexedAsKeyword: true,
			indexedLanguageId: '',
			inLayout: true, // eslint-disable-line @typescript-eslint/member-ordering
			listTypeDefinitionId: true,
			name: 'author',
			required: false,
			type: 'metadata',
		},
	];

	// const newValue = initialValues.map((value) => {
	// 	return {
	// 		...value,
	// 		checked: false,
	// 		filtered: true,
	// 	};
	// });

	const [
		{isViewOnly, objectFields, objectView, objectViewId},
		dispatch,
	] = useContext(ViewContext);

	const [filteredItems, setFilteredItems] = useState(objectFields);
	const [fieldsChecked, setFieldsChecked] = useState(false);
	const [query, setQuery] = useState('');

	
	useEffect(() => {
		const objectFieldsWithCheck = objectFields.map((field) => {
			return {
				...field,
				checked: false,
				filtered: true,
			};
		});
		setFilteredItems(objectFieldsWithCheck);
	}, []);

	console.log(filteredItems);


	// console.log(filteredItems);

	// useEffect(() => {
	// 	if (filteredItems.find((item) => item.checked === true)) {
	// 		setFieldsChecked(true);
	// 	}
	// 	else {
	// 		setFieldsChecked(false);
	// 	}
	// }, [filteredItems]);

	// useEffect(() => {
	// 	if (query) {
	// 		setFilteredItems(
	// 			filteredItems.map((field) => {
	// 				if (
	// 					!field.label.toLowerCase().includes(query.toLowerCase())
	// 				) {
	// 					return {
	// 						...field,
	// 						filtered: false,
	// 					};
	// 				}

	// 				return field;
	// 			})
	// 		);
	// 	}
	// 	else {
	// 		setFilteredItems(
	// 			filteredItems.map((field) => {
	// 				return {
	// 					...field,
	// 					filtered: true,
	// 				};
	// 			})
	// 		);
	// 	}
	// }, [filteredItems, query]);

	const handleAllFieldsChecked = () => {
		setFilteredItems(
			filteredItems.map((field) => {
				return {
					...field,
					checked: !fieldsChecked,
				};
			})
		);
		setFieldsChecked(!fieldsChecked);
	};

	const handleFieldChecked = (name: String) => {
		const newfiltredItems = filteredItems.map((field) => {
			if (field.name === name) {
				return {
					...field,
					checked: !field.checked,
				};
			}

			return field;
		});

		setFilteredItems(newfiltredItems);
	};

	const onSubmit = () => {
		dispatch({
			payload: {
				filteredItems,
			},
			type: TYPES.ADD_OBJECT_VIEW_COLUMN,
		});

		onClose();
	};

	return (
		<>
			<ClayModal
				className="object-web__modal-add-columns"
				observer={observer}
			>
				<ClayForm onSubmit={onSubmit}>
					<ClayModal.Header>
						{Liferay.Language.get('add-columns')}
					</ClayModal.Header>

					<ClayModal.Body>
						<div className="object-web__modal-add-columns--selection-title">
							Select the columns
						</div>

						<ClayManagementToolbar>
							<ClayManagementToolbar.ItemList>
								<ClayManagementToolbar.Item>
									<ClayCheckbox
										checked={fieldsChecked}
										indeterminate={fieldsChecked}
										onChange={handleAllFieldsChecked}
									/>
								</ClayManagementToolbar.Item>
							</ClayManagementToolbar.ItemList>

							<ClayManagementToolbar.Search>
								<ClayInput.Group>
									<ClayInput.GroupItem>
										<ClayInput
											aria-label="Search"
											className="form-control input-group-inset input-group-inset-after"
											defaultValue=""
											onChange={({target}) =>
												setQuery(target.value)
											}
											placeholder="Search"
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
						</ClayManagementToolbar>

						<div>
							<ClayList className="object-web__modal-add-columns--list">
								{filteredItems?.map((field, index) => (
									<ClayList.Item
										className={
											field?.filtered ? '' : 'hide'
										}
										flex
										key={`list-item-${index}`}
									>
										<ClayCheckbox

											// @ts-ignore

											checked={field.checked}
											label={
												field.label[defaultLanguageId]
											}
											onChange={() => {
												handleFieldChecked(field.name);
											}}
										/>
									</ClayList.Item>
								))}
							</ClayList>
						</div>
					</ClayModal.Body>

					<ClayModal.Footer
						last={
							<ClayButton.Group key={1} spaced>
								<ClayButton
									displayType="secondary"
									onClick={onClose}
								>
									{Liferay.Language.get('cancel')}
								</ClayButton>

								<ClayButton displayType="primary" type="submit">
									{Liferay.Language.get('save')}
								</ClayButton>
							</ClayButton.Group>
						}
					/>
				</ClayForm>
			</ClayModal>
		</>
	);
};

export default ModalAddColumnsObjectCustomView;
