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

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayForm, {ClayToggle} from '@clayui/form';
import ClayModal, {ClayModalProvider, useModal} from '@clayui/modal';
import React, {useEffect, useState} from 'react';

import useForm from '../hooks/useForm';
import {ERRORS} from '../utils/errors';
import {toCamelCase} from '../utils/string';
import CustomSelect from './form/CustomSelect/CustomSelect';
import Input from './form/Input';
import Select from './form/Select';

const objectFieldTypes = [
	'BigDecimal',
	'Boolean',
	'Clob',
	'Date',
	'Double',
	'Integer',
	'Long',
	'Picklist',
	'String',
];

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const headers = new Headers({
	'Accept': 'application/json',
	'Content-Type': 'application/json',
});

const ModalAddObjectField: React.FC<IProps> = ({
	apiURL,
	ffObjectFieldBusinessTypeConfigurationEnabled,
	objectFieldBusinessTypes,
	observer,
	onClose,
}) => {
	const [error, setError] = useState<string>('');
	const [picklist, setPicklist] = useState<TPicklist[]>([]);
	const initialValues: TInitialValues = {
		businessType: '',
		dbType: '',
		label: '',
		listTypeDefinitionId: 0,
		name: undefined,
		required: false,
	};

	const getDBType = (businessType: string) => {
		const filteredObjectFieldType = objectFieldBusinessTypes.filter(
			(objectFieldType) => objectFieldType.businessType === businessType
		);

		return filteredObjectFieldType[0].dbType;
	};

	const onSubmit = async ({
		businessType,
		dbType,
		label,
		listTypeDefinitionId,
		name,
		required,
	}: TInitialValues) => {
		const response = await Liferay.Util.fetch(apiURL, {
			body: JSON.stringify({
				DBType: ffObjectFieldBusinessTypeConfigurationEnabled
					? getDBType(businessType)
					: dbType,
				businessType: ffObjectFieldBusinessTypeConfigurationEnabled
					? businessType
					: '',
				indexed: true,
				indexedAsKeyword: false,
				indexedLanguageId: null,
				label: {
					[defaultLanguageId]: label,
				},
				listTypeDefinitionId,
				name: name || toCamelCase(label),
				required,
			}),
			headers,
			method: 'POST',
		});

		if (response.status === 401) {
			window.location.reload();
		}
		else if (response.ok) {
			onClose();

			window.location.reload();
		}
		else {
			const {type} = await response.json();
			const isMapped = Object.prototype.hasOwnProperty.call(ERRORS, type);
			const errorMessage = isMapped
				? ERRORS[type]
				: Liferay.Language.get('an-error-occurred');

			setError(errorMessage);
		}
	};

	const validate = (values: TInitialValues) => {
		const errors: any = {};

		const type = ffObjectFieldBusinessTypeConfigurationEnabled
			? values.businessType
			: values.dbType;

		if (!values.label) {
			errors.label = Liferay.Language.get('required');
		}

		if (!(values.name ?? toCamelCase(values.label))) {
			errors.name = Liferay.Language.get('required');
		}

		if (!type) {
			errors.type = Liferay.Language.get('required');
		}

		if (type === 'Picklist' && !values.listTypeDefinitionId) {
			errors.listTypeDefinitionId = Liferay.Language.get('required');
		}

		return errors;
	};

	const {errors, handleChange, handleSubmit, values} = useForm({
		initialValues,
		onSubmit,
		validate,
	});

	return (
		<ClayModal observer={observer}>
			<ClayForm onSubmit={handleSubmit}>
				<ClayModal.Header>
					{Liferay.Language.get('new-field')}
				</ClayModal.Header>

				<ClayModal.Body>
					{error && (
						<ClayAlert displayType="danger">{error}</ClayAlert>
					)}

					<Input
						error={errors.label}
						id="objectFieldLabel"
						label={Liferay.Language.get('label')}
						name="label"
						onChange={handleChange}
						required
						value={values.label}
					/>

					<Input
						error={errors.name || errors.label}
						id="objectFieldName"
						label={Liferay.Language.get('field-name')}
						name="name"
						onChange={handleChange}
						required
						value={values.name ?? toCamelCase(values.label)}
					/>

					{ffObjectFieldBusinessTypeConfigurationEnabled ? (
						<CustomSelect
							error={errors.type}
							label={Liferay.Language.get('type')}
							onChange={async (type: any) => {
								const selectObjectFieldType = objectFieldBusinessTypes.filter(
									(objectFieldType) =>
										objectFieldType.businessType ===
										type.businessType
								);

								const selectedBusinessType =
									selectObjectFieldType[0].businessType;

								if (selectedBusinessType === 'Picklist') {
									const result = await Liferay.Util.fetch(
										'/o/headless-admin-list-type/v1.0/list-type-definitions',
										{
											headers,
											method: 'GET',
										}
									);

									const {items = []} = await result.json();

									setPicklist(
										items.map(({id, name}: TPicklist) => ({
											id,
											name,
										}))
									);
								}

								handleChange({
									target: {
										name: 'businessType',
										value: selectedBusinessType,
									},
								} as any);
							}}
							options={objectFieldBusinessTypes}
							required
							value={values.businessType}
						>
							{({description, label}) => (
								<>
									<div>{label}</div>
									<span className="text-small">
										{description}
									</span>
								</>
							)}
						</CustomSelect>
					) : (
						<Select
							error={errors.type}
							id="objectFieldType"
							label={Liferay.Language.get('type')}
							onChange={async ({target: {value}}: any) => {
								const selectedType =
									objectFieldTypes[Number(value) - 1];

								if (selectedType === 'Picklist') {
									const result = await Liferay.Util.fetch(
										'/o/headless-admin-list-type/v1.0/list-type-definitions',
										{
											headers,
											method: 'GET',
										}
									);

									const {items = []} = await result.json();

									setPicklist(
										items.map(({id, name}: TPicklist) => ({
											id,
											name,
										}))
									);
								}

								handleChange({
									target: {
										name: 'dbType',
										value: selectedType,
									},
								} as any);
							}}
							options={objectFieldTypes}
							required
						/>
					)}

					{values.businessType === 'Picklist' && (
						<Select
							error={errors.listTypeDefinitionId}
							label={Liferay.Language.get('picklist')}
							onChange={({target: {value}}: any) => {
								handleChange({
									target: {
										name: 'listTypeDefinitionId',
										value: picklist[Number(value) - 1].id,
									},
								} as any);
							}}
							options={picklist.map(({name}) => name)}
							required
						/>
					)}

					<ClayToggle
						label={Liferay.Language.get('mandatory')}
						onToggle={() => {
							handleChange({
								target: {
									name: 'required',
									value: !values.required,
								},
							} as any);
						}}
						toggled={values.required}
					/>
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
	);
};

interface IProps extends React.HTMLAttributes<HTMLElement> {
	apiURL: string;
	ffObjectFieldBusinessTypeConfigurationEnabled: boolean;
	objectFieldBusinessTypes: IObjectFieldBusinessType[];
	observer: any;
	onClose: () => void;
}

interface IObjectFieldBusinessType {
	businessType: string;
	dbType: string;
	description: string;
	label: string;
}

type TPicklist = {
	id: string;
	name: string;
};

type TInitialValues = {
	businessType: string;
	dbType: string;
	label: string;
	listTypeDefinitionId: number;
	name?: string;
	required: boolean;
};

const ModalWithProvider: React.FC<IProps> = ({
	apiURL,
	ffObjectFieldBusinessTypeConfigurationEnabled,
	objectFieldBusinessTypes,
}) => {
	const [visibleModal, setVisibleModal] = useState<boolean>(false);
	const {observer, onClose} = useModal({
		onClose: () => setVisibleModal(false),
	});

	useEffect(() => {
		Liferay.on('addObjectField', () => setVisibleModal(true));

		return () => {
			Liferay.detach('addObjectField');
		};
	}, []);

	return (
		<ClayModalProvider>
			{visibleModal && (
				<ModalAddObjectField
					apiURL={apiURL}
					ffObjectFieldBusinessTypeConfigurationEnabled={
						ffObjectFieldBusinessTypeConfigurationEnabled
					}
					objectFieldBusinessTypes={objectFieldBusinessTypes}
					observer={observer}
					onClose={onClose}
				/>
			)}
		</ClayModalProvider>
	);
};

export default ModalWithProvider;
