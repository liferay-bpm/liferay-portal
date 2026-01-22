/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import AssetBulkActionTaskService from '../../common/services/AssetBulkActionTaskService';
import DecimalDataRenderer from './FDSDataRenderers/DecimalDataRenderer';
import MultiselectPicklistDataRenderer from './FDSDataRenderers/MultiselectPicklistDataRenderer';
import ObjectEntryStatusDataRenderer from './FDSDataRenderers/ObjectEntryStatusDataRenderer';

type ObjectEntryStatusDataRendererProps = {
	itemData: ObjectEntry;
	restContextPath: string;
};

export default function ViewObjectEntriesFDSPropsTransformer({...otherProps}) {
	return {
		...otherProps,
		customDataRenderers: {
			decimalDataRenderer: DecimalDataRenderer,
			multiselectPicklistDataRenderer: MultiselectPicklistDataRenderer,
			statusDataRenderer: (props: ObjectEntryStatusDataRendererProps) => (
				<ObjectEntryStatusDataRenderer
					{...props}
					restContextPath={otherProps.apiURL}
				/>
			),
		},
		onActionDropdownItemClick({
			action,
			itemData,
		}: {
			action: {data: {id: string}};
			itemData: any;
		}) {
			if (action.data.id === 'deleteObjectEntry') {
				Liferay.fire('openModalDeleteObjectEntry', {
					objectEntry: itemData,
				});
			}
		},
		onBulkActionItemClick: async ({
			action,
			selectedData,
		}: {
			action: any;
			selectedData: any;
		}) => {
			if (action?.data?.id === 'delete') {
				console.log('action: ', action);
				console.log('selectedData: ', selectedData);

				const bulkActionItems = (selectedData?.items || []).map(
					(item) => ({
						classExternalReferenceCode: item.externalReferenceCode,
						className: '',
						classPK: item.id,
					})
				);

				const url = new URL(
					'http://localhost:8080/o/bulk/v1.0/bulk-action'
				);

				url.searchParams.set(
					'scope',
// 					String(Liferay.ThemeDisplay.getScopeGroupId())
					'0'
				);
				url.searchParams.set(
					'entryClassNames',
					'com.liferay.object.model.ObjectDefinition#Y7C4'
				);

				const response = await AssetBulkActionTaskService.createTask(
					{
						bulkActionItems,
						selectionScope: {
							selectAll: selectedData.selectAll,
						},
						type: 'DeleteObjectEntryBulkAction',
					},
					url.toString()
				);

				console.log('response: ', response);
			}
		},
	};
}
