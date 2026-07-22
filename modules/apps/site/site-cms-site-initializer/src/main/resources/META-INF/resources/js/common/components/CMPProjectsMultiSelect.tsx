/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {NetworkStatus} from '@clayui/data-provider';
import ClayMultiSelect from '@clayui/multi-select';
import {openToast} from 'frontend-js-components-web';
import React, {useEffect, useState} from 'react';

import ApiHelper from '../services/ApiHelper';

type Project = {
	id: number;
	name: string;
	scopeKey: string;
};

type ProjectLink = {
	linkId: number;
	projectId: number;
	projectName: string;
	projectScopeKey: string;
};

type ProjectItem = {
	label: string;
	value: string;
};

type ProjectSearchItem = {
	embedded: {
		externalReferenceCode: string;
		id: number;
		scopeKey: string;
		title: string;
	};
};

type ProjectAssetRelationshipSearchItem = {
	embedded: {
		classExternalReferenceCode: string;
		className: string;
		groupExternalReferenceCode: string;
		id: number;
		r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId: number;
	};
};

type Props = {
	cmpProjectAssetRelationshipObjectDefinitionId: number | null;
	cmpProjectObjectDefinitionId: number | null;
	entryClassName: string;
	entryExternalReferenceCode: string;
	entryGroupExternalReferenceCode: string;
};

function buildSearchURL(objectDefinitionId: number, page: number) {
	return `/o/search/v1.0/search?emptySearch=true&nestedFields=embedded&page=${page}&pageSize=500&filter=${encodeURIComponent(
		`objectDefinitionId eq ${objectDefinitionId}`
	)}`;
}

// /o/search clamps pageSize to 500, so page through every result rather than
// reading only the first page.

async function fetchAllSearchItems<T>(objectDefinitionId: number) {
	const items: T[] = [];

	let lastPage = 1;
	let page = 1;

	while (page <= lastPage) {
		const {data, error} = await ApiHelper.get<{
			items: T[];
			lastPage: number;
		}>(buildSearchURL(objectDefinitionId, page));

		if (error || !data) {
			throw new Error(error || 'error');
		}

		items.push(...data.items);

		lastPage = data.lastPage;
		page += 1;
	}

	return items;
}

export default function CMPProjectsMultiSelect({
	cmpProjectAssetRelationshipObjectDefinitionId,
	cmpProjectObjectDefinitionId,
	entryClassName,
	entryExternalReferenceCode,
	entryGroupExternalReferenceCode,
}: Props) {
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [sourceProjects, setSourceProjects] = useState<Project[]>([]);
	const [selectedLinks, setSelectedLinks] = useState<ProjectLink[]>([]);

	useEffect(() => {
		if (!cmpProjectObjectDefinitionId) {
			setLoading(false);

			return;
		}

		fetchAllSearchItems<ProjectSearchItem>(cmpProjectObjectDefinitionId)
			.then((searchItems) => {
				setSourceProjects(
					searchItems.map(({embedded}) => ({
						id: embedded.id,
						name: embedded.title,
						scopeKey: embedded.scopeKey,
					}))
				);

				setLoading(false);
			})
			.catch((error) => {
				console.error(error);

				setLoading(false);
			});
	}, [cmpProjectObjectDefinitionId]);

	useEffect(() => {
		if (
			!cmpProjectAssetRelationshipObjectDefinitionId ||
			!sourceProjects.length
		) {
			return;
		}

		fetchAllSearchItems<ProjectAssetRelationshipSearchItem>(
			cmpProjectAssetRelationshipObjectDefinitionId
		)
			.then((searchItems) => {
				const links: ProjectLink[] = [];

				searchItems.forEach(({embedded}) => {
					if (
						embedded.className !== entryClassName ||
						embedded.classExternalReferenceCode !==
							entryExternalReferenceCode ||
						embedded.groupExternalReferenceCode !==
							entryGroupExternalReferenceCode
					) {
						return;
					}

					const project = sourceProjects.find(
						(sourceProject) =>
							sourceProject.id ===
							embedded.r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId
					);

					if (!project) {
						return;
					}

					links.push({
						linkId: embedded.id,
						projectId: project.id,
						projectName: project.name,
						projectScopeKey: project.scopeKey,
					});
				});

				setSelectedLinks(links);
			})
			.catch((error) => console.error(error));
	}, [
		cmpProjectAssetRelationshipObjectDefinitionId,
		entryClassName,
		entryExternalReferenceCode,
		entryGroupExternalReferenceCode,
		sourceProjects,
	]);

	const onItemsChange = async (items: ProjectItem[]) => {
		const selectedProjectIds = new Set(
			items.map((item) => Number(item.value))
		);

		const addedProjects = sourceProjects.filter(
			(project) =>
				selectedProjectIds.has(project.id) &&
				!selectedLinks.some((link) => link.projectId === project.id)
		);

		const removedLinks = selectedLinks.filter(
			(link) => !selectedProjectIds.has(link.projectId)
		);

		if (!addedProjects.length && !removedLinks.length) {
			return;
		}

		const addResults = await Promise.all(
			addedProjects.map((project) =>
				ApiHelper.post<{externalReferenceCode: string; id: number}>(
					`/o/cmp/project-asset-relationships/scopes/${project.scopeKey}`,
					{
						classExternalReferenceCode: entryExternalReferenceCode,
						className: entryClassName,
						groupExternalReferenceCode:
							entryGroupExternalReferenceCode,
						r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId:
							project.id,
					}
				).then((result) => ({project, result}))
			)
		);

		const removeResults = await Promise.all(
			removedLinks.map((link) =>
				ApiHelper.delete(
					`/o/cmp/project-asset-relationships/${link.linkId}`
				).then((result) => ({link, result}))
			)
		);

		let nextLinks = [...selectedLinks];
		let hasError = false;

		addResults.forEach(({project, result}) => {
			if (result.error || !result.data) {
				hasError = true;

				return;
			}

			nextLinks.push({
				linkId: result.data.id,
				projectId: project.id,
				projectName: project.name,
				projectScopeKey: project.scopeKey,
			});
		});

		removeResults.forEach(({link, result}) => {
			if (result.error) {
				hasError = true;

				return;
			}

			nextLinks = nextLinks.filter(
				(nextLink) => nextLink.linkId !== link.linkId
			);
		});

		setSelectedLinks(nextLinks);

		openToast({
			message: hasError
				? Liferay.Language.get('an-unexpected-error-occurred')
				: Liferay.Language.get('your-request-completed-successfully'),
			type: hasError ? 'danger' : 'success',
		});
	};

	const sourceItems: ProjectItem[] = sourceProjects.map((project) => ({
		label: project.name,
		value: String(project.id),
	}));

	const selectedItems: ProjectItem[] = selectedLinks.map((link) => ({
		label: link.projectName,
		value: String(link.projectId),
	}));

	if (!cmpProjectObjectDefinitionId) {
		return null;
	}

	if (!loading && !sourceItems.length) {
		return (
			<div className="p-3">
				<p className="mb-0 text-secondary">
					{Liferay.Language.get('no-projects-yet')}
				</p>
			</div>
		);
	}

	return (
		<div className="p-3">
			<label htmlFor="cmpProjectsMultiSelect">
				{Liferay.Language.get('projects')}
			</label>

			<ClayMultiSelect
				aria-label={Liferay.Language.get('projects')}
				id="cmpProjectsMultiSelect"
				items={selectedItems}
				key={sourceItems.length ? 'loaded' : 'empty'}
				loadingState={loading ? NetworkStatus.Polling : undefined}
				onChange={setQuery}
				onItemsChange={onItemsChange}
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
		</div>
	);
}
