/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '../../../css/recycle_bin/RecycleBin.scss';

import {ClayButtonWithIcon} from '@clayui/button';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import ClayToolbar from '@clayui/toolbar';
import {openModal, openToast} from 'frontend-js-components-web';
import {fetch} from 'frontend-js-web';
import React from 'react';

import EmptyRecycleBinModalContent from '../modal/EmptyRecycleBinModalContent';

export default function RecycleBinToolbar() {
	const emptyRecycleBin = async () => {
		const filter = encodeURIComponent(
			"cmsRoot eq true and (cmsSection eq 'contents' or cmsSection eq 'files') and status eq 8"
		);

		const response = await fetch(
			`/o/headless-cms/v1.0/bulk-action?filter=${filter}&nestedFields=embedded`,
			{
				body: JSON.stringify({
					selectAll: true,
					type: 'DeleteBulkAction',
				}),
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'x-csrf-token': Liferay.authToken,
				},
				method: 'POST',
			}
		);

		const entry = await response.json();

		openToast({
			message: Liferay.Util.sub(
				Liferay.Language.get(
					'x-items-were-permanently-deleted-from-the-recycle-bin'
				),
				entry.numberOfItems
			),
			type: 'success',
		});

		// TODO Reload page

	};

	return (
		<div>
			<ClayToolbar
				aria-label={Liferay.Language.get('recycle-bin')}
				className="recycle-bin-toolbar"
				light
			>
				<div className="container-fluid">
					<ClayToolbar.Nav>
						<ClayToolbar.Item className="text-left">
							<ClayToolbar.Section>
								<div className="recycle-bin-title">
									<span>
										{Liferay.Language.get('recycle-bin')}
									</span>
								</div>
							</ClayToolbar.Section>
						</ClayToolbar.Item>

						<ClayToolbar.Item>
							<ClayDropDownWithItems
								items={[
									{
										label: Liferay.Language.get(
											'empty-recycle-bin'
										),
										onClick: () => {
											openModal({
												contentComponent: ({
													closeModal,
												}: {
													closeModal: () => void;
												}) =>
													EmptyRecycleBinModalContent(
														{
															closeModal,
															emptyRecycleBin,
														}
													),
												size: 'md',
												status: 'danger',
											});
										},
										symbolLeft: 'trash',
									},
								]}
								menuWidth="shrink"
								trigger={
									<ClayButtonWithIcon
										aria-label={Liferay.Language.get(
											'more-actions'
										)}
										displayType="unstyled"
										size="xs"
										symbol="ellipsis-v"
									/>
								}
							/>
						</ClayToolbar.Item>
					</ClayToolbar.Nav>
				</div>
			</ClayToolbar>
		</div>
	);
}
