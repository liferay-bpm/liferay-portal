/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Option} from '@clayui/core';
import ClayLabel from '@clayui/label';
import {
	API,
	SingleSelect,
	stringUtils,
} from '@liferay/object-js-components-web';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import './SelectObjectDefinition.scss';

interface SelectObjectDefinitionProps {
	creationLanguageId: Liferay.Language.Locale;
	disabled?: boolean;
	error?: string;
	label?: string;
	objectDefinition?: Partial<ObjectDefinition>;
	objectDefinitionExternalReferenceCode?: string;

	objectDefinitions?: Partial<ObjectDefinition>[];
	readOnly?: boolean;
	reverseOrder: boolean;
	setObjectDefinition: (
		value: React.SetStateAction<Partial<ObjectDefinition> | undefined>
	) => void;
	setValues: (values: Partial<ObjectRelationship>) => void;
}

type ObjectDefinitionSelectItem = {
	__sentinel?: boolean;
	label: string;
	system?: boolean;
	value: string;
};

const PAGE_SIZE = 50;
const SENTINEL_VALUE = '__LOAD_MORE_SENTINEL__';
const NONE_SELECTED_KEY = '__NONE_SELECTED__';

export default function SelectObjectDefinition({
	creationLanguageId,
	disabled,
	error,
	label,
	objectDefinition,
	objectDefinitionExternalReferenceCode,
	objectDefinitions = [],
	readOnly,
	reverseOrder,
	setObjectDefinition,
	setValues,
}: SelectObjectDefinitionProps) {
	const [
		selectedObjectDefinitionExternalReferenceCode,
		setSelectedObjectDefinitionExternalReferenceCode,
	] = useState<string | undefined>(objectDefinition?.externalReferenceCode);

	const [remoteObjectDefinitions, setRemoteObjectDefinitions] = useState<
		Partial<ObjectDefinition>[]
	>([]);

	const [search, setSearch] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (readOnly && !objectDefinition) {
			(async () => {
				const {externalReferenceCode} =
					await API.getObjectDefinitionByExternalReferenceCode(
						objectDefinitionExternalReferenceCode as string
					);

				setSelectedObjectDefinitionExternalReferenceCode(
					externalReferenceCode
				);
			})();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!readOnly && objectDefinitions.length) {
			setRemoteObjectDefinitions(objectDefinitions);
		}
	}, [objectDefinitions, readOnly]);

	const _isSelectable = (def: Partial<ObjectDefinition>) => {
		return (
			!def.parameterRequired &&
			(!Liferay.FeatureFlags['LPS-135430'] ||
				def.storageType === 'default')
		);
	};

	const _loadPage = async ({reset}: {reset: boolean}) => {
		if (loading) {
			return;
		}
		if (!reset && !hasMore) {
			return;
		}

		setLoading(true);

		try {
			const nextPage = reset ? 1 : page;

			const {items} = await API.getObjectDefinitionsPage({
				page: nextPage,
				pageSize: PAGE_SIZE,
				search: search.trim() ? search.trim() : undefined,
			});

			const filtered = (items ?? []).filter(_isSelectable);

			setRemoteObjectDefinitions((prev) => {
				const base = reset ? [] : prev;

				const byERC = new Map<string, Partial<ObjectDefinition>>();

				for (const d of base) {
					if (d.externalReferenceCode) {
						byERC.set(d.externalReferenceCode, d);
					}
				}
				for (const d of filtered) {
					if (d.externalReferenceCode) {
						byERC.set(d.externalReferenceCode, d);
					}
				}

				return Array.from(byERC.values());
			});

			setHasMore((items?.length ?? 0) === PAGE_SIZE);
			setPage(reset ? 2 : nextPage + 1);
		}
		catch (error) {
			console.error(error);
			setHasMore(false);
		}
		finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!readOnly) {
			_loadPage({reset: true});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [readOnly]);

	useEffect(() => {
		if (readOnly) {
			return;
		}

		const t = setTimeout(() => {
			_loadPage({reset: true});
		}, 250);

		return () => clearTimeout(t);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	const sentinelRef = useCallback((node: HTMLDivElement | null) => {
		if (!node) {
			return;
		}

		const listbox = node.closest('[role="listbox"]') as HTMLElement | null;

		if (listbox) {
			setScrollRoot(listbox);
		}
	}, []);

	useEffect(() => {
		if (!scrollRoot) {
			return;
		}

		const sentinel = scrollRoot.querySelector(
			`[data-sentinel="true"]`
		) as HTMLElement | null;

		if (!sentinel) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					_loadPage({reset: false});
				}
			},
			{
				root: scrollRoot,
				threshold: 0.1,
			}
		);

		observer.observe(sentinel);

		return () => observer.disconnect();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scrollRoot, hasMore, loading]);

	const objectDefinitionsItems = useMemo<ObjectDefinitionSelectItem[]>(() => {
		const defs = remoteObjectDefinitions ?? [];

		const mapped = defs
			.map(
				({
					externalReferenceCode,
					label: definitionLabel,
					name,
					system,
				}: Partial<ObjectDefinition>): ObjectDefinitionSelectItem | null => {
					if (!externalReferenceCode) {
						return null;
					}

					return {
						label: stringUtils.getLocalizableLabel({
							fallbackLabel: name,
							fallbackLanguageId:
								creationLanguageId as Liferay.Language.Locale,
							labels: definitionLabel,
						}),
						system,
						value: externalReferenceCode,
					};
				}
			)
			.filter(
				(item): item is ObjectDefinitionSelectItem => item !== null
			);

		if (!readOnly && hasMore) {
			mapped.push({
				__sentinel: true,
				label: '',
				value: SENTINEL_VALUE,
			});
		}

		return mapped;
	}, [creationLanguageId, remoteObjectDefinitions, hasMore, readOnly]);

	const selectedKeyForPicker =
		selectedObjectDefinitionExternalReferenceCode ?? NONE_SELECTED_KEY;

	return (
		<div>
			{!readOnly && (
				<div className="mb-2">
					<input
						className="form-control"
						disabled={disabled}
						onChange={(event) => setSearch(event.target.value)}
						placeholder={Liferay.Language.get('search')}
						value={search}
					/>
				</div>
			)}

			<SingleSelect<ObjectDefinitionSelectItem>
				disabled={disabled}
				error={error}
				id="objectRelationshipSelectObjectDefinition"
				items={objectDefinitionsItems}
				label={label ?? ''}
				onSelectionChange={(value) => {
					if (
						value === SENTINEL_VALUE ||
						value === NONE_SELECTED_KEY
					) {
						return;
					}

					const selectedObjectDefinition = (
						remoteObjectDefinitions ?? []
					).find((def) => def.externalReferenceCode === value);

					if (!reverseOrder) {
						setValues({
							objectDefinitionExternalReferenceCode2:
								selectedObjectDefinition?.externalReferenceCode,
							objectDefinitionId2: selectedObjectDefinition?.id,
							objectDefinitionName2:
								selectedObjectDefinition?.name,
						});
					}
					else {
						setValues({
							objectDefinitionExternalReferenceCode1:
								selectedObjectDefinition?.externalReferenceCode,
							objectDefinitionId1: selectedObjectDefinition?.id,
						});
					}

					setObjectDefinition(selectedObjectDefinition);
					setSelectedObjectDefinitionExternalReferenceCode(
						selectedObjectDefinition?.externalReferenceCode
					);
				}}
				placeholder={Liferay.Language.get('select-an-option')}
				required
				selectedKey={selectedKeyForPicker}
			>
				{({
					__sentinel,
					label,
					system,
					value,
				}: ObjectDefinitionSelectItem) => {
					if (__sentinel) {
						return (
							<Option disabled key={value} textValue="loading">
								<div
									data-sentinel="true"
									ref={sentinelRef}
									style={{
										padding: '8px',
										textAlign: 'center',
									}}
								>
									{loading
										? Liferay.Language.get('loading')
										: Liferay.Language.get(
												'scroll-to-bottom'
											)}
								</div>
							</Option>
						);
					}

					return (
						<Option key={value} textValue={label}>
							<div className="lfr-objects__select-object-definition-option">
								<div>{label}</div>

								<ClayLabel
									displayType={system ? 'info' : 'warning'}
								>
									{system
										? Liferay.Language.get('system')
										: Liferay.Language.get('custom')}
								</ClayLabel>
							</div>
						</Option>
					);
				}}
			</SingleSelect>
		</div>
	);
}
