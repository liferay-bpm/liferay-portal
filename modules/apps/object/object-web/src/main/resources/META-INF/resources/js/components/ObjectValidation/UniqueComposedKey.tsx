/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	BuilderScreen,
	Card,
	MultipleSelect,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import {TBuilderScreenItem} from '@liferay/object-js-components-web/src/main/resources/META-INF/resources/components/BuilderScreen/BuilderScreen';
import React, {useEffect, useState} from 'react';

import {ErrorMessage} from './ErrorMessage';
import {ObjectValidationErrors} from './useObjectValidationForm';

interface isMatchingObjectFieldObjectValidationRuleSettingProps {
	objectField: ObjectField;
	objectValidationRuleSetting: ObjectValidationRuleSetting;
	objectValidationRuleSettingNameMatches:
		| 'keyObjectFieldExternalReferenceCode'
		| 'outputObjectFieldExternalReferenceCode';
}
interface ModalSelectObjectFieldItemProps extends ObjectField {
	checked: boolean;
}
interface MultipleSelectOptionProps {
	checked: boolean;
	externalReferenceCode: string;
	label: string;
}

interface UniqueComposedKeyProps {
	creationLanguageId: Liferay.Language.Locale;
	customObjectFields: ObjectField[];
	disabled: boolean;
	errors: ObjectValidationErrors;
	setShowUniqueComposedKeyCardAlert: (value: boolean) => void;
	setValues: (values: Partial<ObjectValidation>) => void;
	showUniqueComposedKeyCardAlert: boolean;
	values: Partial<ObjectValidation>;
}

const isMatchingObjectFieldObjectValidationRuleSetting = ({
	objectField,
	objectValidationRuleSetting,
	objectValidationRuleSettingNameMatches,
}: isMatchingObjectFieldObjectValidationRuleSettingProps) => {
	return (
		objectField.externalReferenceCode ===
			objectValidationRuleSetting.value &&
		objectValidationRuleSetting.name ===
			objectValidationRuleSettingNameMatches
	);
};

export function UniqueComposedKey({
	creationLanguageId,
	customObjectFields,
	disabled,
	errors,
	setShowUniqueComposedKeyCardAlert,
	setValues,
	showUniqueComposedKeyCardAlert,
	values,
}: UniqueComposedKeyProps) {
	const [buildScreenItems, setBuildScreenItems] = useState<
		TBuilderScreenItem[]
	>([]);
	const [
		modalSelectObjectFieldsItems,
		setModalSelectObjectFieldsItems,
	] = useState<ModalSelectObjectFieldItemProps[]>([]);
	const [multipleSelectOptions, setMultipleSelectOptions] = useState<
		MultipleSelectOptionProps[]
	>([]);
	const filteredCustomObjectFields = customObjectFields.filter(
		(objectField) =>
			objectField.businessType === 'Integer' ||
			'Picklist' ||
			'Relationship' ||
			'Text'
	);

	const handleAddFields = () => {
		const parentWindow = Liferay.Util.getOpener();

		parentWindow.Liferay.fire('openModalSelectObjectFields', {
			getName: ({label, name}: ObjectField) =>
				getLocalizableLabel(creationLanguageId, label, name),
			header: Liferay.Language.get('add-fields'),
			items: modalSelectObjectFieldsItems,
			onSave: (selectedObjectFields: ObjectField[]) => {
				const objectValidationRuleSetting = values.objectValidationRuleSettings?.filter(
					(objectValidationRuleSetting) =>
						selectedObjectFields.some((selectedObjectField) => {
							return (
								selectedObjectField.externalReferenceCode ===
									objectValidationRuleSetting.value &&
								objectValidationRuleSetting.name ===
									'outputObjectFieldExternalReferenceCode'
							);
						})
				);
				selectedObjectFields.map((selectedObjectField) =>
					objectValidationRuleSetting?.push({
						name: 'keyObjectFieldExternalReferenceCode',
						value: selectedObjectField.externalReferenceCode,
					})
				);

				setValues({
					objectValidationRuleSettings: objectValidationRuleSetting,
				});
			},
			selected: modalSelectObjectFieldsItems.filter(
				(modalSelectObjectFieldsItem) =>
					modalSelectObjectFieldsItem.checked
			),
			title: Liferay.Language.get('select-the-fields'),
		});
	};

	useEffect(() => {
		if (!values.objectValidationRuleSettings) {
			return;
		}

		const newBuildScreenItems: TBuilderScreenItem[] = [];
		const newModalSelectObjectFieldsItems: ModalSelectObjectFieldItemProps[] = [];
		const newMultipleSelectOptions: MultipleSelectOptionProps[] = [];

		values.objectValidationRuleSettings.forEach(
			(objectValidationRuleSetting) => {
				const filteredObjectFieldObjectValidationRuleSetting = filteredCustomObjectFields.find(
					(filteredCustomObjectField) =>
						isMatchingObjectFieldObjectValidationRuleSetting({
							objectField: filteredCustomObjectField,
							objectValidationRuleSetting,
							objectValidationRuleSettingNameMatches:
								'keyObjectFieldExternalReferenceCode',
						})
				);

				if (filteredObjectFieldObjectValidationRuleSetting) {
					const label = getLocalizableLabel(
						creationLanguageId,
						filteredObjectFieldObjectValidationRuleSetting.label,
						filteredObjectFieldObjectValidationRuleSetting.name
					);

					newBuildScreenItems.push({
						externalReferenceCode:
							filteredObjectFieldObjectValidationRuleSetting.externalReferenceCode,
						fieldLabel: label,
						label:
							filteredObjectFieldObjectValidationRuleSetting.label,
						objectFieldBusinessType:
							filteredObjectFieldObjectValidationRuleSetting.businessType,
						objectFieldName:
							filteredObjectFieldObjectValidationRuleSetting.name,
					});

					newMultipleSelectOptions.push({
						checked: !!values.objectValidationRuleSettings?.find(
							(objectValidationRuleSetting) =>
								isMatchingObjectFieldObjectValidationRuleSetting(
									{
										objectField: filteredObjectFieldObjectValidationRuleSetting,
										objectValidationRuleSetting,
										objectValidationRuleSettingNameMatches:
											'outputObjectFieldExternalReferenceCode',
									}
								)
						),
						externalReferenceCode:
							filteredObjectFieldObjectValidationRuleSetting.externalReferenceCode,
						label,
					});
				}
			}
		);

		filteredCustomObjectFields.forEach((filteredCustomObjectField) =>
			newModalSelectObjectFieldsItems.push({
				...filteredCustomObjectField,
				checked: !!values.objectValidationRuleSettings?.find(
					(objectValidationRuleSetting) =>
						isMatchingObjectFieldObjectValidationRuleSetting({
							objectField: filteredCustomObjectField,
							objectValidationRuleSetting,
							objectValidationRuleSettingNameMatches:
								'keyObjectFieldExternalReferenceCode',
						})
				),
			})
		);

		setBuildScreenItems(newBuildScreenItems);
		setModalSelectObjectFieldsItems(newModalSelectObjectFieldsItems);
		setMultipleSelectOptions(newMultipleSelectOptions);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values.objectValidationRuleSettings]);

	return (
		<>
			<Card
				alert={{
					content: Liferay.Language.get(
						'a-unique-composite-key-validation-checks-if-the-combination-of-two-or-more-fields-can-be-used-to-uniquely-identify-each-entry'
					),
					otherProps: {
						displayType: 'info',
						title: Liferay.Language.get('info'),
						variant: 'stripe',
					},
					setShowAlert: setShowUniqueComposedKeyCardAlert,
					showAlert: showUniqueComposedKeyCardAlert,
				}}
				title={Liferay.Language.get('fields')}
			>
				<BuilderScreen
					buildScreenItems={buildScreenItems ?? []}
					defaultSort={false}
					emptyState={{
						buttonText: Liferay.Language.get('add-fields'),
						description: Liferay.Language.get(
							'add-a-minimum-of-two-fields-to-create-compose-unique-keys'
						),
						title: Liferay.Language.get('no-fields-added-yet'),
					}}
					filter={true}
					firstColumnHeader={Liferay.Language.get('label')}
					onDeleteColumn={() => {}}
					openModal={handleAddFields}
					secondColumnHeader={Liferay.Language.get('type')}
				/>
			</Card>

			<ErrorMessage
				disabled={disabled}
				errors={errors}
				setValues={setValues}
				values={values}
			>
				<MultipleSelect<MultipleSelectOptionProps>
					disabled={!buildScreenItems.length}
					error={errors.errorLabel}
					label={Liferay.Language.get('field')}
					options={multipleSelectOptions ?? []}
					required
					setOptions={(newOutputObjectFieldOptions) => {
						const objectValidationRuleSettings = values.objectValidationRuleSettings?.filter(
							(objectValidationRuleSetting) =>
								objectValidationRuleSetting.name !==
								'outputObjectFieldExternalReferenceCode'
						);

						newOutputObjectFieldOptions.forEach(
							(newOutputObjectFieldOption) => {
								if (newOutputObjectFieldOption.checked) {
									objectValidationRuleSettings?.push({
										name:
											'outputObjectFieldExternalReferenceCode',
										value:
											newOutputObjectFieldOption.externalReferenceCode,
									});
								}
							}
						);

						setValues({objectValidationRuleSettings});
						setMultipleSelectOptions(newOutputObjectFieldOptions);
					}}
				/>
			</ErrorMessage>
		</>
	);
}
