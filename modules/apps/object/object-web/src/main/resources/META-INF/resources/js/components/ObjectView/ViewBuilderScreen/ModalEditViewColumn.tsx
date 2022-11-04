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
import {Input, InputLocalized} from '@liferay/object-js-components-web';
import React, {FormEvent, useEffect, useMemo, useState} from 'react';

import {TAction, TYPES} from '../objectViewContext';
import {TObjectViewColumn} from '../types';

interface IState {
	dispatch: React.Dispatch<TAction>;
	editingObjectFieldName: string;
	objectViewColumns?: TObjectViewColumn[];
	showModal: boolean;
}

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const INITIAL_STATE: IState = {
	dispatch: () => {},
	editingObjectFieldName: '',
	showModal: false,
};

function ModalEditViewColumn() {
	const [
		{dispatch, editingObjectFieldName, objectViewColumns, showModal},
		setState,
	] = useState<IState>(INITIAL_STATE);

	const resetModal = () => {
		setState(INITIAL_STATE);
	};

	const {observer} = useModal({
		onClose: resetModal,
	});

	useEffect(() => {
		const openModal = ({
			dispatch = () => {},
			editingObjectFieldName = '',
			showModal = true,
			...otherProps
		}: Partial<IState>) => {
			setState({
				dispatch,
				editingObjectFieldName,
				showModal,
				...otherProps,
			});
		};

		Liferay.on('openModalEditViewColumn', openModal);

		return () =>
			Liferay.detach('openModalEditViewColumn', openModal as () => void);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [translations, setTranslations] = useState<LocalizedValue<string>>(
		{}
	);

	const editingColumn = useMemo(() => {
		let newEditingColumn = null;

		if (objectViewColumns) {
			newEditingColumn = objectViewColumns.find(
				(viewColumn) =>
					viewColumn.objectFieldName === editingObjectFieldName
			);
		}

		return newEditingColumn;
	}, [objectViewColumns, editingObjectFieldName]);

	useEffect(() => {
		if (editingColumn) {
			setTranslations(editingColumn.label);
		}
	}, [editingColumn]);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();

		Object.entries(translations).forEach(([key, value]) => {
			if (value === '' && key !== defaultLanguageId) {
				delete translations[key as Locale];
			}
		});

		dispatch({
			payload: {editingObjectFieldName, translations},
			type: TYPES.EDIT_OBJECT_VIEW_COLUMN_LABEL,
		});

		resetModal();
	};

	return showModal ? (
		<ClayModal observer={observer}>
			<ClayForm onSubmit={(event) => onSubmit(event)}>
				<ClayModal.Header>
					{Liferay.Language.get('rename-column-label')}
				</ClayModal.Header>

				<ClayModal.Body>
					<Input
						disabled
						label={Liferay.Language.get('field-label')}
						name={editingObjectFieldName}
						value={editingColumn ? editingColumn.fieldLabel : ''}
					/>

					<InputLocalized
						id="locale"
						label={Liferay.Language.get('column-label')}
						onChange={setTranslations}
						required
						translations={translations}
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

							<ClayButton displayType="primary" type="submit">
								{Liferay.Language.get('edit')}
							</ClayButton>
						</ClayButton.Group>
					}
				/>
			</ClayForm>
		</ClayModal>
	) : null;
}

export default ModalEditViewColumn;
