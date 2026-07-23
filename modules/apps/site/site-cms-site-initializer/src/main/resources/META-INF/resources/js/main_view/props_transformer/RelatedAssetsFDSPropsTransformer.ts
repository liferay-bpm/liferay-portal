/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	FDS_EVENT,
	IBulkActionItem,
	IView,
} from '@liferay/frontend-data-set-web';
import {openToast} from 'frontend-js-components-web';

import ApiHelper from '../../common/services/ApiHelper';
import AssetsFDSPropsTransformer, {
	AdditionalProps,
} from './AssetsFDSPropsTransformer';
import fileDropAction from './actions/fileDropAction';
import {MultipleFileUploaderData} from './actions/multipleFilesUploadAction';
import transformFDSBulkActions from './utils/transformFDSBulkActions';

export type LinkObjectEntryContext = {
	objectEntryId: string;
	objectRelationshipFieldName: string;
	restContextPath: string;
	scopeGroupId: string;
};

export default function RelatedAssetsFDSPropsTransformer({
	additionalProps,
	bulkActions = [],
	creationMenu,
	id,
	itemsActions = [],
	views,
	...otherProps
}: {
	additionalProps: AdditionalProps &
		MultipleFileUploaderData & {
			linkObjectEntryContext: LinkObjectEntryContext;
		};
	bulkActions: Array<IBulkActionItem>;
	creationMenu: any;
	id: string;
	itemsActions?: any[];
	otherProps: any;
	views: IView[];
}) {
	const assetsData = AssetsFDSPropsTransformer({
		additionalProps,
		creationMenu,
		itemsActions,
		...otherProps,
		views,
	});

	return {
		...assetsData,
		bulkActions: transformFDSBulkActions(bulkActions),
		fileDropSettings: {
			enabled: true,
			isDropTarget: () => true,
			onFileDrop: (droppedFiles: any, dropTarget?: any) => {
				fileDropAction(
					{
						...additionalProps,
						loadData: () =>
							Liferay.fire(FDS_EVENT.UPDATE_DISPLAY, {id}),
					},
					droppedFiles,
					dropTarget
				);
			},
		},
		id,
		infoPanelComponent: null,
		async onActionDropdownItemClick({
			action,
			event,
			itemData,
			items,
			loadData,
		}: {
			action: any;
			event: Event;
			itemData: ItemData;
			items: any;
			loadData: () => {};
		}) {
			if (action.data.id === 'unlink-asset') {
				const {embedded, entryClassName} = itemData;
				const {
					objectEntryId,
					objectRelationshipFieldName,
					restContextPath,
					scopeGroupId,
				} = additionalProps.linkObjectEntryContext;

				const filter = [
					`${objectRelationshipFieldName} eq '${objectEntryId}'`,
					`className eq '${entryClassName}'`,
					`classExternalReferenceCode eq '${embedded.externalReferenceCode}'`,
					`groupExternalReferenceCode eq '${embedded.systemProperties.scope.externalReferenceCode}'`,
				].join(' and ');

				const {data, error} = await ApiHelper.get<{
					items: Array<{id: number}>;
				}>(
					`${restContextPath}/scopes/${scopeGroupId}?filter=${encodeURIComponent(
						filter
					)}`
				);

				const linkObjectEntry = data?.items?.[0];

				if (error || !linkObjectEntry) {
					openToast({
						message: Liferay.Language.get(
							'an-unexpected-error-occurred'
						),
						type: 'danger',
					});

					return;
				}

				const {error: deleteError} = await ApiHelper.delete(
					`${restContextPath}/${linkObjectEntry.id}`
				);

				openToast({
					message: deleteError
						? Liferay.Language.get('an-unexpected-error-occurred')
						: Liferay.Language.get(
								'your-request-completed-successfully'
							),
					type: deleteError ? 'danger' : 'success',
				});

				loadData();
			}
			else {
				assetsData.onActionDropdownItemClick({
					action,
					event,
					itemData,
					items,
					loadData,
				});
			}
		},
	};
}
