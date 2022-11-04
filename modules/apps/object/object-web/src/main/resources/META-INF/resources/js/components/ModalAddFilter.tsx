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
import ClayModal, {useModal} from '@clayui/modal';
import {
	API,
	AutoComplete,
	DatePicker,
	Input,
	MultipleSelect,
	SingleSelect,
	filterArrayByQuery,
} from '@liferay/object-js-components-web';
import React, {
	FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

import {
	getCheckedPickListItems,
	getCheckedRelationshipItems,
	getCheckedWorkflowStatusItems,
	getSystemFieldLabelFromEntry,
} from '../utils/filter';

import './ModalAddFilter.scss';

interface IState {
	currentFilters: CurrentFilter[];
	disableDateValues?: boolean;
	editingObjectFieldName: string;
	filterEndDate: string;
	filterOperators: TFilterOperators;
	filterStartDate: string;
	filterTypeRequired?: boolean;
	header?: string;
	modalType: string;
	objectFields: ObjectField[];
	onSave?: (
		objectFieldName: string,
		filterBy?: string,
		fieldLabel?: LocalizedValue<string>,
		objectFieldBusinessType?: ObjectFieldBusinessType | undefined,
		filterType?: string,
		valueList?: IItem[],
		value?: string
	) => void;
	selectedFilterBy?: ObjectField | null;
	selectedFilterType?: LabelValueObject | null;
	showModal: boolean;
	validate?: ({
		checkedItems,
		disableDateValues,
		items,
		selectedFilterBy,
		selectedFilterType,
		setErrors,
		value,
	}: FilterValidation) => FilterErrors;
	value?: string;
	workflowStatusJSONArray: LabelValueObject[];
}

interface IItem extends LabelValueObject {
	checked?: boolean;
}

export type FilterErrors = {
	endDate?: string;
	items?: string;
	selectedFilterBy?: string;
	selectedFilterType?: string;
	startDate?: string;
	value?: string;
};

export type FilterValidation = {
	checkedItems: IItem[];
	disableDateValues?: boolean;
	items: IItem[];
	selectedFilterBy?: ObjectField | null;
	selectedFilterType?: LabelValueObject | null;
	setErrors: (value: FilterErrors) => void;
	value?: string;
};

type CurrentFilter = {
	definition: {
		[key: string]: string[] | number[];
	} | null;
	fieldLabel?: string;
	filterBy?: string;
	filterType: string | null;
	label: LocalizedValue<string>;
	objectFieldBusinessType?: string;
	objectFieldName?: string;
	value?: string;
	valueList?: LabelValueObject[];
};

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const defaultFilterOperations: TFilterOperators = {
	dateOperators: [],
	numericOperators: [],
	picklistOperators: [],
};

const INITIAL_STATE: IState = {
	currentFilters: [],
	editingObjectFieldName: '',
	filterEndDate: '',
	filterOperators: defaultFilterOperations,
	filterStartDate: '',
	modalType: 'add',
	objectFields: [],
	showModal: false,
	workflowStatusJSONArray: [],
};

function ModalAddFilter() {
	const [
		{
			currentFilters,
			disableDateValues,
			editingObjectFieldName,
			filterEndDate,
			filterOperators,
			filterStartDate,
			filterTypeRequired,
			header,
			modalType,
			objectFields,
			onSave,
			selectedFilterBy,
			selectedFilterType,
			showModal,
			validate,
			value,
			workflowStatusJSONArray,
		},
		setState,
	] = useState<IState>(INITIAL_STATE);

	const resetModal = () => {
		setState({...INITIAL_STATE, selectedFilterBy: null});
	};

	const {observer} = useModal({
		onClose: resetModal,
	});

	useEffect(() => {
		const openModal = ({
			currentFilters = [],
			editingObjectFieldName = '',
			filterEndDate = '',
			filterOperators = defaultFilterOperations,
			filterStartDate = '',
			modalType = 'add',
			objectFields = [],
			showModal = true,
			workflowStatusJSONArray = [],
			...otherProps
		}: Partial<IState>) => {
			setState({
				currentFilters,
				editingObjectFieldName,
				filterEndDate,
				filterOperators,
				filterStartDate,
				modalType,
				objectFields,
				showModal,
				workflowStatusJSONArray,
				...otherProps,
			});
		};

		Liferay.on('openModalAddFilter', openModal);

		return () =>
			Liferay.detach('openModalAddFilter', openModal as () => void);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [errors, setErrors] = useState<FilterErrors>({});

	const [items, setItems] = useState<IItem[]>([]);

	const [query, setQuery] = useState<string>('');

	const filteredAvailableFields = useMemo(() => {
		return filterArrayByQuery(objectFields, 'label', query);
	}, [objectFields, query]);

	const setEditingFilterType = () => {
		const currentFilterColumn = currentFilters.find((filterColumn) => {
			if (filterColumn.objectFieldName === editingObjectFieldName) {
				return filterColumn;
			}
		});

		const definition = currentFilterColumn?.definition;
		const filterType = currentFilterColumn?.filterType;

		const valuesArray =
			definition && filterType ? definition[filterType] : null;

		const editingFilterType = filterOperators.picklistOperators.find(
			(filterType) => filterType.value === currentFilterColumn?.filterType
		);

		if (editingFilterType) {
			setState((state) => ({
				...state,
				selectedFilterType: {
					label: editingFilterType.label,
					value: editingFilterType.value,
				},
			}));
		}

		return valuesArray;
	};

	const setFieldValues = useCallback(
		(objectField: ObjectField) => {
			if (showModal) {
				if (
					objectField.businessType === 'MultiselectPicklist' ||
					objectField?.businessType === 'Picklist'
				) {
					const makeFetch = async () => {
						if (objectField.listTypeDefinitionId) {
							const items = await API.getPickListItems(
								objectField.listTypeDefinitionId
							);

							if (modalType === 'edit') {
								setItems(
									getCheckedPickListItems(
										items,
										setEditingFilterType
									)
								);
							}
							else {
								setItems(
									items.map((item) => {
										return {
											label: item.name,
											value: item.key,
										};
									})
								);
							}
						}
					};

					makeFetch();
				}
				else if (objectField.name === 'status') {
					let newItems: IItem[] = [];

					if (modalType === 'edit') {
						newItems = getCheckedWorkflowStatusItems(
							workflowStatusJSONArray,
							setEditingFilterType
						);
					}
					else {
						newItems = workflowStatusJSONArray.map(
							(workflowStatus) => {
								return {
									label: workflowStatus.label,
									value: workflowStatus.value,
								};
							}
						);
					}

					setItems(newItems);
				}
				else if (objectField.businessType === 'Relationship') {
					const makeFetch = async () => {
						const {objectFieldSettings} = objectField;

						const [
							{value},
						] = objectFieldSettings as NameValueObject[];

						const [
							{
								objectFields,
								restContextPath,
								system,
								titleObjectFieldName,
							},
						] = await API.getObjectDefinitions(
							`filter=name eq '${value}'`
						);

						const titleField = objectFields.find(
							(objectField) =>
								objectField.name === titleObjectFieldName
						) as ObjectField;

						const relatedEntries = await API.getList<ObjectEntry>(
							`${restContextPath}`
						);

						if (modalType === 'edit') {
							setItems(
								getCheckedRelationshipItems(
									relatedEntries,
									titleField.name,
									titleField.system as boolean,
									system,
									setEditingFilterType
								)
							);
						}
						else {
							const newItems = relatedEntries.map((entry) => {
								const newItemsObject = {
									value: system
										? String(entry.id)
										: entry.externalReferenceCode,
								} as LabelValueObject;

								if (titleField.system) {
									return getSystemFieldLabelFromEntry(
										titleField.name,
										entry,
										newItemsObject
									) as LabelValueObject;
								}

								return {
									...newItemsObject,
									label: entry[titleField?.name] as string,
								};
							});

							setItems(newItems);
						}
					};

					makeFetch();
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[showModal]
	);

	useEffect(() => {
		if (!selectedFilterBy && !editingObjectFieldName) {
			setItems([]);
		}
		else {
			if (selectedFilterBy) {
				setFieldValues(
					(selectedFilterBy as unknown) as ObjectFieldView
				);
			}
			else {
				const objectField = objectFields.find(
					({name}) => name === editingObjectFieldName
				);

				objectField && setFieldValues(objectField);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalType, setFieldValues, selectedFilterBy, workflowStatusJSONArray]);

	useEffect(() => {
		if (modalType === 'edit') {
			const editingObjectFieldFilter = objectFields.find(
				(objectField) => objectField.name === editingObjectFieldName
			);

			setState((state) => ({
				...state,
				selectedFilterBy: editingObjectFieldFilter,
			}));
		}
	}, [modalType, editingObjectFieldName, objectFields]);

	const handleSaveFilter = (event: FormEvent) => {
		event.preventDefault();

		const checkedItems = items.filter((item) => item.checked);

		let currentErrors: FilterErrors = {};

		if (validate) {
			currentErrors = validate({
				checkedItems,
				disableDateValues,
				items,
				selectedFilterBy,
				selectedFilterType,
				setErrors,
				value,
			});
		}

		if (Object.keys(currentErrors).length) {
			return;
		}

		if (modalType === 'edit') {
			onSave?.(
				editingObjectFieldName,
				selectedFilterBy?.name,
				selectedFilterBy?.label,
				selectedFilterBy?.businessType,
				selectedFilterType?.value,
				selectedFilterBy?.name === 'status' ||
					selectedFilterBy?.businessType === 'MultiselectPicklist' ||
					selectedFilterBy?.businessType === 'Picklist' ||
					selectedFilterBy?.businessType === 'Relationship'
					? checkedItems
					: undefined,
				value ?? undefined
			);
		}
		else {
			onSave?.(
				selectedFilterBy?.name!,
				selectedFilterBy?.name,
				selectedFilterBy?.label,
				selectedFilterBy?.businessType,
				selectedFilterType?.value,
				selectedFilterBy?.name === 'status' ||
					selectedFilterBy?.businessType === 'MultiselectPicklist' ||
					selectedFilterBy?.businessType === 'Picklist' ||
					selectedFilterBy?.businessType === 'Relationship'
					? checkedItems
					: selectedFilterBy?.businessType === 'Date'
					? items
					: undefined,
				value ?? undefined
			);
		}

		resetModal();
	};

	return showModal ? (
		<ClayModal observer={observer}>
			<ClayModal.Header>{header}</ClayModal.Header>

			<ClayModal.Body>
				{modalType !== 'edit' && (
					<AutoComplete
						emptyStateMessage={Liferay.Language.get(
							'there-are-no-columns-available'
						)}
						error={errors.selectedFilterBy}
						items={filteredAvailableFields}
						label={Liferay.Language.get('filter-by')}
						onChangeQuery={setQuery}
						onSelectItem={(item) => {
							setState((state) => ({
								...state,
								selectedFilterBy: item,
								selectedFilterType: null,
								value: '',
							}));
						}}
						query={query}
						required
						value={selectedFilterBy?.label[defaultLanguageId]}
					>
						{({label}) => (
							<div className="d-flex justify-content-between">
								<div>{label[defaultLanguageId]}</div>
							</div>
						)}
					</AutoComplete>
				)}

				{selectedFilterBy && selectedFilterBy?.businessType !== 'Date' && (
					<SingleSelect
						error={errors.selectedFilterType}
						label={Liferay.Language.get('filter-type')}
						onChange={(target: LabelValueObject) =>
							setState((state) => ({
								...state,
								selectedFilterType: target,
							}))
						}
						options={
							selectedFilterBy?.businessType === 'Integer' ||
							selectedFilterBy?.businessType === 'LongInteger'
								? filterOperators.numericOperators
								: filterOperators.picklistOperators
						}
						required={filterTypeRequired}
						value={selectedFilterType?.label ?? ''}
					/>
				)}

				{selectedFilterBy &&
					selectedFilterBy?.businessType === 'Date' &&
					!disableDateValues && (
						<SingleSelect
							error={errors.selectedFilterType}
							label={Liferay.Language.get('filter-type')}
							onChange={(target: LabelValueObject) =>
								setState((state) => ({
									...state,
									selectedFilterType: target,
								}))
							}
							options={filterOperators.dateOperators}
							required={filterTypeRequired}
							value={selectedFilterType?.label ?? ''}
						/>
					)}

				{selectedFilterType &&
					(selectedFilterBy?.businessType === 'Integer' ||
						selectedFilterBy?.businessType === 'LongInteger') && (
						<Input
							error={errors.value}
							label={Liferay.Language.get('value')}
							onChange={({target: {value}}) => {
								const newValue = value.replace(/[\D]/g, '');

								setState((state) => ({
									...state,
									value: newValue,
								}));
							}}
							required
							type="number"
							value={value}
						/>
					)}

				{selectedFilterType &&
					(selectedFilterBy?.name === 'status' ||
						selectedFilterBy?.businessType ===
							'MultiselectPicklist' ||
						selectedFilterBy?.businessType === 'Picklist' ||
						selectedFilterBy?.businessType === 'Relationship') && (
						<MultipleSelect
							error={errors.items}
							label={Liferay.Language.get('value')}
							options={items}
							required
							setOptions={setItems}
						/>
					)}

				{selectedFilterType &&
					selectedFilterBy?.businessType === 'Date' &&
					!disableDateValues && (
						<div className="row">
							<div className="col-lg-6">
								<DatePicker
									error={errors.startDate}
									label={Liferay.Language.get('start')}
									onChange={(value) => {
										setItems([
											...items.filter(
												(item) => item.value !== 'ge'
											),
											{
												label: value,
												value: 'ge',
											},
										]);

										setState((state) => ({
											...state,
											filterStartDate: value,
										}));
									}}
									required
									value={filterStartDate}
								/>
							</div>

							<div className="col-lg-6">
								<DatePicker
									error={errors.endDate}
									label={Liferay.Language.get('end')}
									onChange={(value) => {
										setItems([
											...items.filter(
												(item) => item.value !== 'le'
											),
											{
												label: value,
												value: 'le',
											},
										]);

										setState((state) => ({
											...state,
											filterEndDate: value,
										}));
									}}
									required
									value={filterEndDate}
								/>
							</div>
						</div>
					)}
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={resetModal}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton
							displayType="primary"
							onClick={handleSaveFilter}
						>
							{Liferay.Language.get('save')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</ClayModal>
	) : null;
}

export default ModalAddFilter;
