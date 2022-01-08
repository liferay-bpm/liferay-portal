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
import React, {useEffect, useState} from 'react';

import './ModalAddColumnsObjectCustomView.scss';

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

const ModalAddColumnsObjectCustomView: React.FC<IProps> = ({
	observer,
	onClose,
}) => {
	let initialValues: TInitialValues[] = [
		{
			label: '',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
	];

	initialValues = [
		{
			label: 'Author',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
		{
			label: 'Delivery Date',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
		{
			label: 'Name',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
		{
			label: 'Price',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
		{
			label: 'Quantity',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
		{
			label: 'SKU',
			listTypeDefinitionId: 0,
			name: undefined,
			required: false,
			type: '',
		},
	];

	const newValue = initialValues.map((value) => {
		return {
			...value,
			checked: false,
			filtered: true,
		};
	});

	const [filteredItems, setFilteredItems] = useState(newValue);
	const [fieldsChecked, setFieldsChecked] = useState(false);
	const [query, setQuery] = useState('');

	useEffect(() => {
		if (filteredItems.find((item) => item.checked === true)) {
			setFieldsChecked(true);
		}
		else {
			setFieldsChecked(false);
		}
	}, [filteredItems]);

	useEffect(() => {
		if (query) {
			setFilteredItems(
				filteredItems.map((field) => {
					if (
						!field.label.toLowerCase().includes(query.toLowerCase())
					) {
						return {
							...field,
							filtered: false,
						};
					}

					return field;
				})
			);
		}
		else {
			setFilteredItems(
				filteredItems.map((field) => {
					return {
						...field,
						filtered: true,
					};
				})
			);
		}
	}, [filteredItems, query]);

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

	const handleFieldChecked = (label: String) => {
		setFilteredItems(
			filteredItems.map((field) => {
				if (field.label === label) {
					return {
						...field,
						checked: !field.checked,
					};
				}

				return field;
			})
		);
	};

	return (
		<>
			<ClayModal
				className="object-web__modal-add-columns"
				observer={observer}
			>
				<ClayForm>
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
								{filteredItems.map((field, index) => (
									<ClayList.Item
										className={
											field?.filtered ? '' : 'hide'
										}
										flex
										key={`list-item-${index}`}
									>
										<ClayCheckbox
											checked={field.checked}
											label={field.label}
											onChange={() => {
												handleFieldChecked(field.label);
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
									onClick={() => onClose()}
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
