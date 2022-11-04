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
import ClayForm from '@clayui/form';
import ClayModal, {useModal} from '@clayui/modal';
import {
	AutoComplete,
	SingleSelect,
	filterArrayByQuery,
} from '@liferay/object-js-components-web';
import React, {FormEvent, useEffect, useMemo, useState} from 'react';

import {TAction, TYPES} from '../objectViewContext';
import {TObjectViewColumn, TObjectViewSortColumn} from '../types';

interface IState extends React.HTMLAttributes<HTMLElement> {
	availableViewColumns: TObjectViewColumn[];
	dispatch: React.Dispatch<TAction>;
	editingObjectFieldName: string;
	header?: string;
	modalType: string;
	objectFields: ObjectField[];
	objectViewColumns?: TObjectViewColumn[];
	objectViewSortColumns?: TObjectViewSortColumn[];
	selectedObjectSort: LabelValueObject;
	selectedObjectSortColumn?: TObjectViewSortColumn;
	showModal: boolean;
}
const SORT_OPTIONS: LabelValueObject[] = [
	{
		label: Liferay.Language.get('ascending'),
		value: 'asc',
	},
	{
		label: Liferay.Language.get('descending'),
		value: 'desc',
	},
];

const INITIAL_STATE: IState = {
	availableViewColumns: [],
	dispatch: () => {},
	editingObjectFieldName: '',
	modalType: 'add',
	objectFields: [],
	selectedObjectSort: SORT_OPTIONS[0],
	showModal: false,
};

function ModalAddDefaultSortColumn() {
	const [
		{
			availableViewColumns,
			dispatch,
			editingObjectFieldName,
			header,
			modalType,
			objectFields,
			objectViewColumns,
			objectViewSortColumns,
			selectedObjectSort,
			selectedObjectSortColumn,
			showModal,
		},
		setState,
	] = useState<IState>(INITIAL_STATE);

	const [query, setQuery] = useState<string>('');

	const resetModal = () => {
		setState(INITIAL_STATE);

		setQuery('');
	};

	const {observer} = useModal({
		onClose: resetModal,
	});

	useEffect(() => {
		const openModal = ({
			availableViewColumns = [],
			dispatch = () => {},
			editingObjectFieldName = '',
			modalType = 'add',
			objectFields = [],
			selectedObjectSort = SORT_OPTIONS[0],
			showModal = true,
			...otherProps
		}: Partial<IState>) => {
			setState({
				availableViewColumns,
				dispatch,
				editingObjectFieldName,
				modalType,
				objectFields,
				selectedObjectSort,
				showModal,
				...otherProps,
			});

			setQuery('');
		};

		Liferay.on('openModalDefaultSortColumn', openModal);

		return () =>
			Liferay.detach(
				'openModalDefaultSortColumn',
				openModal as () => void
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (objectViewColumns) {
			const newAvailableViewColumns = objectViewColumns.filter(
				(objectViewColumn) =>
					!objectViewColumn.defaultSort &&
					objectViewColumn.objectFieldBusinessType !==
						'Aggregation' &&
					objectViewColumn.objectFieldBusinessType !== 'Formula' &&
					objectViewColumn.objectFieldBusinessType !== 'Relationship'
			);

			setState((state) => ({
				...state,
				availableViewColumns: newAvailableViewColumns,
			}));
		}
	}, [objectViewColumns]);

	const filteredObjectSortColumn = useMemo(() => {
		return filterArrayByQuery(availableViewColumns, 'fieldLabel', query);
	}, [availableViewColumns, query]);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();

		let objectFieldName = selectedObjectSortColumn?.objectFieldName;

		if (!objectFieldName && !!filteredObjectSortColumn.length) {
			objectFieldName = filteredObjectSortColumn[0].objectFieldName;
		}

		if (modalType === 'edit') {
			dispatch({
				payload: {
					editingObjectFieldName,
					selectedObjectSort: selectedObjectSort.value,
				},
				type: TYPES.EDIT_OBJECT_VIEW_SORT_COLUMN_SORT_ORDER,
			});
		}
		else if (objectFieldName) {
			dispatch({
				payload: {
					objectFieldName,
					objectFields,
					objectViewSortColumns,
					selectedObjectSort,
				},
				type: TYPES.ADD_OBJECT_VIEW_SORT_COLUMN,
			});
		}

		resetModal();
	};

	return showModal ? (
		<ClayModal observer={observer}>
			<ClayForm onSubmit={onSubmit}>
				<ClayModal.Header>{header}</ClayModal.Header>

				<ClayModal.Body>
					{modalType !== 'edit' && (
						<AutoComplete
							emptyStateMessage={Liferay.Language.get(
								'there-are-no-columns-added-in-this-view-yet'
							)}
							items={filteredObjectSortColumn}
							label={Liferay.Language.get('columns')}
							onChangeQuery={setQuery}
							onSelectItem={(item) => {
								setState((state) => ({
									...state,
									selectedObjectSortColumn: item,
								}));
							}}
							query={query}
							required
							value={selectedObjectSortColumn?.fieldLabel}
						>
							{({fieldLabel}) => (
								<div className="d-flex justify-content-between">
									<div>{fieldLabel}</div>
								</div>
							)}
						</AutoComplete>
					)}

					<SingleSelect
						label={Liferay.Language.get('sorting')}
						onChange={(item: LabelValueObject) => {
							setState((state) => ({
								...state,
								selectedObjectSort: item,
							}));
						}}
						options={SORT_OPTIONS}
						value={selectedObjectSort.label}
					/>
				</ClayModal.Body>

				<ClayModal.Footer
					last={
						<ClayButton.Group key={1} spaced>
							<ClayButton
								displayType="secondary"
								onClick={resetModal}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton
								disabled={
									modalType === 'edit'
										? false
										: !selectedObjectSortColumn
								}
								displayType="primary"
								type="submit"
							>
								{Liferay.Language.get('save')}
							</ClayButton>
						</ClayButton.Group>
					}
				/>
			</ClayForm>
		</ClayModal>
	) : null;
}

export default ModalAddDefaultSortColumn;
