/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {NetworkStatus} from '@clayui/data-provider';
import ClayModal from '@clayui/modal';
import ClayMultiSelect from '@clayui/multi-select';
import {sub} from 'frontend-js-web';
import React, {useEffect, useMemo, useState} from 'react';

import ApiHelper from '../../../common/services/ApiHelper';
import {
	IBulkActionFDSData,
	IBulkActionTaskStarterDTO,
} from '../../../common/types/BulkActionTask';
import {OBJECT_ENTRY_FOLDER_CLASS_NAME} from '../../../common/utils/constants';
import {displayErrorToast} from '../../../common/utils/toastUtil';
import {triggerAssetBulkAction} from '../../props_transformer/actions/triggerAssetBulkAction';

type ProjectItem = {
	label: string;
	value: string;
};

type ProjectSearchItem = {
	embedded: {
		id: number;
		scopeKey: string;
		title: string;
	};
};

async function fetchAllProjects(objectDefinitionId: number) {
	const items: ProjectSearchItem[] = [];

	let lastPage = 1;
	let page = 1;

	while (page <= lastPage) {
		const {data, error} = await ApiHelper.get<{
			items: ProjectSearchItem[];
			lastPage: number;
		}>(
			`/o/search/v1.0/search?emptySearch=true&nestedFields=embedded&page=${page}&pageSize=500&filter=${encodeURIComponent(
				`objectDefinitionId eq ${objectDefinitionId}`
			)}`
		);

		if (error || !data) {
			throw new Error(error || 'error');
		}

		items.push(...data.items);

		lastPage = data.lastPage;
		page += 1;
	}

	return items;
}

export default function AddAssetsToProjectModalContent({
	apiURL,
	closeModal,
	cmpProjectObjectDefinitionId,
	selectedData: selected,
}: {
	apiURL?: string;
	closeModal: () => void;
	cmpProjectObjectDefinitionId: number | null;
	selectedData: IBulkActionFDSData;
}) {
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [sourceItems, setSourceItems] = useState<ProjectItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<ProjectItem[]>([]);
	const [submitDisabled, setSubmitDisabled] = useState(false);

	const selectedData = useMemo(
		() => ({
			...selected,
			items:
				selected?.items?.filter(
					({entryClassName}) =>
						entryClassName !== OBJECT_ENTRY_FOLDER_CLASS_NAME
				) || [],
		}),
		[selected]
	);

	useEffect(() => {
		if (!cmpProjectObjectDefinitionId) {
			setLoading(false);

			return;
		}

		fetchAllProjects(cmpProjectObjectDefinitionId)
			.then((projectSearchItems) => {
				setSourceItems(
					projectSearchItems.map(({embedded}) => ({
						label: embedded.title,
						value: embedded.scopeKey,
					}))
				);

				setLoading(false);
			})
			.catch((error) => {
				console.error(error);

				setLoading(false);
			});
	}, [cmpProjectObjectDefinitionId]);

	const doBulkSubmit = () => {
		setSubmitDisabled(true);

		triggerAssetBulkAction({
			additionalData: {
				targetName: selectedItems.map((item) => item.label).join(', '),
			},
			apiURL,
			keyValues: {
				projectScopeKeys: selectedItems.map((item) => item.value),
			},
			onCreateError: ({error}) => {
				setSubmitDisabled(false);

				displayErrorToast(error as string);
			},
			onCreateSuccess: (response) => {
				if (response.error) {
					setSubmitDisabled(false);

					displayErrorToast(response.error as string);

					return;
				}

				closeModal();
			},
			overrideDefaultErrorToast: true,
			selectedData,
			type: 'AddObjectToProjectBulkSelectionAction',
		} as IBulkActionTaskStarterDTO<'AddObjectToProjectBulkSelectionAction'>);
	};

	return (
		<>
			<ClayModal.Header
				closeButtonAriaLabel={Liferay.Language.get('close')}
			>
				{Liferay.Language.get('add-assets-to-project')}
			</ClayModal.Header>

			<ClayModal.Body>
				<p>
					{selectedData.selectAll
						? Liferay.Language.get(
								'select-the-projects-to-add-all-the-selected-assets-to'
							)
						: sub(
								Liferay.Language.get(
									'select-the-projects-to-add-the-x-selected-assets-to'
								),
								selectedData.items?.length ?? 0
							)}
				</p>

				{!loading && !sourceItems.length ? (
					<p className="mb-0 text-secondary">
						{Liferay.Language.get('no-projects-yet')}
					</p>
				) : (
					<>
						<label htmlFor="cmpAddAssetsToProjectMultiSelect">
							{Liferay.Language.get('projects')}
						</label>

						<ClayMultiSelect
							aria-label={Liferay.Language.get('projects')}
							id="cmpAddAssetsToProjectMultiSelect"
							items={selectedItems}
							key={sourceItems.length ? 'loaded' : 'empty'}
							loadingState={
								loading ? NetworkStatus.Polling : undefined
							}
							onChange={setQuery}
							onItemsChange={(items: ProjectItem[]) =>
								setSelectedItems(
									sourceItems.filter((sourceItem) =>
										items.some(
											(item) =>
												item.value === sourceItem.value
										)
									)
								)
							}
							sourceItems={sourceItems}
							value={query}
						>
							{(item: ProjectItem) => (
								<ClayMultiSelect.Item
									key={item.value}
									textValue={item.label}
								>
									{item.label}
								</ClayMultiSelect.Item>
							)}
						</ClayMultiSelect>
					</>
				)}
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={closeModal}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton
							disabled={!selectedItems.length || submitDisabled}
							displayType="primary"
							onClick={doBulkSubmit}
							type="button"
						>
							{Liferay.Language.get('add')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</>
	);
}
