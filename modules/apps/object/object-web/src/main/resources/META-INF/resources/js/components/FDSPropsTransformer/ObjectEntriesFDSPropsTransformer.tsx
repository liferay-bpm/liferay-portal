/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {openModal} from 'frontend-js-web';

import ModalDeleteObjectEntry from '../ObjectEntry/ModalDeleteObjectEntry';

interface ObjectEntriesDataRendererProps {
	values: {
		key: string;
		name: string;
		name_i18n: string;
	}[];
}

type ActionProps = {
	data: {id: string};
};

export default function ObjectEntriesFDSPropsTransformer({...otherProps}) {
	return {
		...otherProps,
		customDataRenderers: {
			objectEntriesDataRenderer: ({
				values,
			}: ObjectEntriesDataRendererProps) =>
				values ? values.map((value) => value.name).join(', ') : '',
		},
		onActionDropdownItemClick({
			action,
			itemData,
			loadData,
		}: {
			action: ActionProps;
			itemData: ItemData;
			loadData: voidReturn;
		}) {
			if (action.data.id === 'delete') {
				openModal({
					contentComponent: ({
						closeModal,
					}: {
						closeModal: voidReturn;
					}) =>
						ModalDeleteObjectEntry({
							closeModal,
							itemData,
							loadData,
						}),
					id: 'deleteObjectEntry',
				});
			}
		},
	};
}
