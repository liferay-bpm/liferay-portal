/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayProgressBar from '@clayui/progress-bar';
import {IInternalRenderer} from '@liferay/frontend-data-set-web';
import {fetch} from 'frontend-js-web';

import StateLabel from '../../common/components/StateLabel';
import {getScopeExternalReferenceCode} from '../../common/utils/getScopeExternalReferenceCode';
import {AdditionalProps} from './AssetsFDSPropsTransformer';
import ACTIONS from './actions/creationMenuActions';
import deleteItemAction from './actions/deleteItemAction';
import manageMembersAction from './actions/manageMembersAction';
import SimpleActionLinkRenderer from './cell_renderers/SimpleActionLinkRenderer';
import UserRelationshipRenderer from './cell_renderers/UserRelationshipRenderer';
import addOnClickToCreationMenuItems from './utils/addOnClickToCreationMenuItems';

export default function ProjectsFDSPropsTransformer({
	additionalProps,
	creationMenu,
	...otherProps
}: {
	additionalProps: AdditionalProps;
	creationMenu: any;
}) {
	return {
		...otherProps,
		creationMenu: {
			...creationMenu,
			primaryItems: addOnClickToCreationMenuItems(
				creationMenu.primaryItems,
				ACTIONS
			),
		},
		customRenderers: {
			tableCell: [
				{
					component: ({value}) => ClayProgressBar({value}),
					name: 'progressBarTableCellRenderer',
					type: 'internal',
				} as IInternalRenderer,
				{
					component: ({actions, itemData, options, value}) =>
						SimpleActionLinkRenderer({
							actions,
							additionalProps,
							itemData,
							options,
							value,
						}),
					name: 'simpleActionLinkTableCellRenderer',
					type: 'internal',
				} as IInternalRenderer,
				{
					component: ({value}) => StateLabel(value),
					name: 'stateTableCellRenderer',
					type: 'internal',
				} as IInternalRenderer,
				{
					component: UserRelationshipRenderer,
					name: 'userRelationshipTableCellRenderer',
					type: 'internal',
				} as IInternalRenderer,
			],
		},
		async onActionDropdownItemClick({
			action,
			itemData,
			loadData,
		}: {
			action: any;
			itemData: ItemData;
			loadData: () => {};
		}) {
			if (action?.data?.id === 'delete') {
				await deleteItemAction(itemData, loadData);
			}
			else if (action?.data?.id === 'view-members') {
				const scopeExternalReferenceCode =
					getScopeExternalReferenceCode(itemData);

				const response = await fetch(
					`/o/headless-asset-library/v1.0/asset-libraries/${scopeExternalReferenceCode}`,
					{
						method: 'GET',
					}
				);

				const {actions, creatorUserId} = await response.json();

				manageMembersAction({
					assetLibraryCreatorUserId: creatorUserId,
					externalReferenceCode: scopeExternalReferenceCode,
					hasAssignMembersPermission: 'assign-members' in actions,
					title: Liferay.Language.get('all-members'),
				});
			}
		},
	};
}
