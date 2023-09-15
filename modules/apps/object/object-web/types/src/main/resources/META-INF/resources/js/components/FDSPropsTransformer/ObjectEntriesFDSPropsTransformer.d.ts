/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

interface ObjectEntriesDataRendererProps {
	values: {
		key: string;
		name: string;
		name_i18n: string;
	}[];
}
declare type ActionProps = {
	data: {
		id: string;
	};
};
export default function ObjectEntriesFDSPropsTransformer({
	...otherProps
}: {
	[x: string]: any;
}): {
	customDataRenderers: {
		objectEntriesDataRenderer: ({
			values,
		}: ObjectEntriesDataRendererProps) => string;
	};
	onActionDropdownItemClick({
		action,
		itemData,
		loadData,
	}: {
		action: ActionProps;
		itemData: ItemData;
		loadData: voidReturn;
	}): void;
};
export {};
