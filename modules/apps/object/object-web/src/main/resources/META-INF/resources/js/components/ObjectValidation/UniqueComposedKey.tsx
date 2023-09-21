/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	BuilderScreen,
	Card,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import {TBuilderScreenItem} from '@liferay/object-js-components-web/src/main/resources/META-INF/resources/components/BuilderScreen/BuilderScreen';
import React, {useEffect, useState} from 'react';

interface UniqueComposedKeyProps {
	creationLanguageId: Liferay.Language.Locale;
	objectFields: ObjectField[];
	setShowUniqueComposedKeyCardAlert: (value: boolean) => void;
	setValues: (values: Partial<ObjectValidation>) => void;
	showUniqueComposedKeyCardAlert: boolean;
	values: Partial<ObjectValidation>;
}

export function UniqueComposedKey({
	creationLanguageId,
	objectFields,
	setShowUniqueComposedKeyCardAlert,
	setValues,
	showUniqueComposedKeyCardAlert,
	values,
}: UniqueComposedKeyProps) {
	const [buildScreenItems, setBuildScreenItems] = useState<
		TBuilderScreenItem[]
	>([]);

	const filteredObjectFields = objectFields.filter(
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
			items: filteredObjectFields.map((filteredObjectField) => ({
				...filteredObjectField,
				checked: false,
			})),
			onSave: (selectedObjectFields: ObjectField[]) => {
				const newObjectValidationRuleSettings = selectedObjectFields.map(
					(selectedObjectField) => ({
						name: 'keyObjectFieldExternalReferenceCode',
						value: selectedObjectField.externalReferenceCode,
					})
				) as ObjectValidationRuleSetting[];

				setValues({
					objectValidationRuleSettings: newObjectValidationRuleSettings,
				});
			},
			selected: [],
			title: Liferay.Language.get('select-the-fields'),
		});
	};

	useEffect(() => {
		const newBuildScreenItems = values?.objectValidationRuleSettings?.map(
			(objectValidationRuleSetting) => {
				const filteredObjectFieldsInValidationRuleSetting = filteredObjectFields.find(
					(filteredObjectField) => {
						return (
							filteredObjectField.externalReferenceCode ===
							objectValidationRuleSetting.value
						);
					}
				);

				return {
					fieldLabel: getLocalizableLabel(
						creationLanguageId,
						filteredObjectFieldsInValidationRuleSetting?.label,
						filteredObjectFieldsInValidationRuleSetting?.name
					),
					label: filteredObjectFieldsInValidationRuleSetting?.label,
					objectFieldBusinessType:
						filteredObjectFieldsInValidationRuleSetting?.businessType,
					objectFieldName:
						filteredObjectFieldsInValidationRuleSetting?.name,
				};
			}
		) as TBuilderScreenItem[];

		setBuildScreenItems(newBuildScreenItems);

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
					buildScreenItems={buildScreenItems}
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
		</>
	);
}
