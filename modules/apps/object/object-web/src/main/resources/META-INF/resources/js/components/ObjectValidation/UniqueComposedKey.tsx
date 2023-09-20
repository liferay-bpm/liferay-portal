/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	BuilderScreen,
	Card,
	getLocalizableLabel,
} from '@liferay/object-js-components-web';
import React from 'react';

interface UniqueComposedKeyProps {
	creationLanguageId: Liferay.Language.Locale;
	objectFields: ObjectField[];
	setShowUniqueComposedKeyCardAlert: (value: boolean) => void;
	showUniqueComposedKeyCardAlert: boolean;
}

export function UniqueComposedKey({
	creationLanguageId,
	objectFields,
	setShowUniqueComposedKeyCardAlert,
	showUniqueComposedKeyCardAlert,
}: UniqueComposedKeyProps) {

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
			onSave: () => {},
			selected: filteredObjectFields,
			title: Liferay.Language.get('select-the-fields'),
		});
	};

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
					buildScreenItems={[]}
					emptyState={{
						buttonText: Liferay.Language.get('add-fields'),
						description: Liferay.Language.get(
							'add-a-minimum-of-two-fields-to-create-compose-unique-keys'
						),
						title: Liferay.Language.get('no-fields-added-yet'),
					}}
					firstColumnHeader={Liferay.Language.get('label')}
					onDeleteColumn={() => {}}
					openModal={handleAddFields}
					secondColumnHeader={Liferay.Language.get('type')}
				/>
			</Card>
		</>
	);
}
