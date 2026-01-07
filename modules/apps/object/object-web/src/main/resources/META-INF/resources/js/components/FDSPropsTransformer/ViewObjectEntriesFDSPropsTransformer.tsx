/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import AssetBulkActionTaskService from '../../common/services/AssetBulkActionTaskService';
import {AdditionalProps} from '../../main_view/props_transformer/AssetsFDSPropsTransformer';
import deleteAssetEntriesBulkAction from '../../main_view/props_transformer/actions/deleteAssetEntriesBulkAction';
import DecimalDataRenderer from './FDSDataRenderers/DecimalDataRenderer';
import MultiselectPicklistDataRenderer from './FDSDataRenderers/MultiselectPicklistDataRenderer';
import ObjectEntryStatusDataRenderer from './FDSDataRenderers/ObjectEntryStatusDataRenderer';

type ObjectEntryStatusDataRendererProps = {
	itemData: ObjectEntry;
	restContextPath: string;
};

export default function ViewObjectEntriesFDSPropsTransformer({
	additionalProps,
	...otherProps
}: {
	additionalProps: AdditionalProps;
}) {
	console.log('additionalProps: ', additionalProps);

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

				// if (additionalProps.brokenLinksCheckerEnabled) {
				// 	openAssetUsageListModal({
				// 		apiURL: otherProps.apiURL,
				// 		itemsData: selectedData.items,
				// 		onDelete: async () => {
				// 			executeBulkDeleteAction(
				// 				otherProps.apiURL as string,
				// 				otherProps.id || '',
				// 				selectedData
				// 			);
				// 		},

				// 		// Callback triggered after the request returns all assets
				// 		// with no usages, will skip the asset usage list modal.
				// 		// Instead, the default delete asset entries bulk action modal
				// 		// will be displayed.

				// 		onSkip: async () => {
				// 			deleteAssetEntriesBulkAction({
				// 				apiURL: otherProps.apiURL,
				// 				dataSetId: otherProps.id,
				// 				selectedData,
				// 			});
				// 		},
				// 		selectAll: selectedData.selectAll,
				// 	});
				// }
				// else {

				const bulkActionItems = (selectedData?.items || []).map(
					(item) => ({
						classExternalReferenceCode: item.externalReferenceCode,
						className:
							'com.liferay.object.model.ObjectDefinition#B1H2',
						classPK: item.id,
					})
				);

				// [
				// 	{
				// classExternalReferenceCode:
				// 	selectedData.items[0].externalReferenceCode,
				// className:
				// 	'com.liferay.object.model.ObjectDefinition#B1H2',
				// classPK: selectedData.items[0].id,
				// 	},
				// ];

				const response = await AssetBulkActionTaskService.createTask(
					{
						bulkActionItems,
						selectionScope: {
							selectAll: selectedData.selectAll,
						},
						type: 'DeleteBulkAction',
					},
					'http://localhost:8080/o/bulk/v1.0/bulk-action'
				);

				console.log('response: ', response);
			}
		},
	};
}
