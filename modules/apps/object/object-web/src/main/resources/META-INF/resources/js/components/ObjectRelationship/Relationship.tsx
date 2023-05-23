/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {
	FrontendDataSet,
	IFrontendDataSetProps,

	// @ts-ignore

} from '@liferay/frontend-data-set-web';
import {API, getLocalizableLabel} from '@liferay/object-js-components-web';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

interface ItemData {
	id: number;
	reverse: boolean;
}

interface fdsItem {
	action: {id: string};
	itemData: ItemData;
	openSidePanel: ({url}: {url: string}) => void;
	value: LocalizedValue<string>;
}

interface IField extends IFrontendDataSetProps {
	objectDefinitionExternalReferenceCode: string;
	url: string;
}

export default function Relationship({
	apiURL,
	creationMenu,
	formName,
	id,
	items,
	objectDefinitionExternalReferenceCode,
	style,
	url,
}: IField) {
	const [creationLanguageId, setCreationLanguageId] = useState<
		Liferay.Language.Locale
	>();

	useEffect(() => {
		const makeFetch = async () => {
			const objectDefinition = await API.getObjectDefinitionByExternalReferenceCode(
				objectDefinitionExternalReferenceCode
			);

			setCreationLanguageId(objectDefinition.defaultLanguageId);
		};

		makeFetch();
	}, [objectDefinitionExternalReferenceCode]);

	function formatActionURL(url: string, id: number) {
		if (!url) {
			return '';
		}

		return url
			.replace(new RegExp('{(.*?)}', 'mg'), id.toString())
			.replace(new RegExp('(%7B.*?%7D)', 'mg'), id.toString());
	}

	function ObjectFieldHierarchyDataRenderer({
		itemData,
	}: {
		itemData: ItemData;
	}) {
		return (
			<strong
				className={classNames(
					itemData.reverse ? 'label-info' : 'label-success',
					'label'
				)}
			>
				{itemData.reverse
					? Liferay.Language.get('child')
					: Liferay.Language.get('parent')}
			</strong>
		);
	}

	function objectFieldLabelDataRenderer({
		itemData,
		openSidePanel,
		value,
	}: fdsItem) {
		const handleEditField = () => {
			openSidePanel({
				url: formatActionURL(url, itemData.id),
			});
		};

		return (
			<div className="table-list-title">
				<a href="#" onClick={handleEditField}>
					{getLocalizableLabel(
						creationLanguageId as Liferay.Language.Locale,
						value
					)}
				</a>
			</div>
		);
	}

	const dataSetProps = {
		actionParameterName: '',
		apiURL,
		creationMenu,
		currentURL: window.location.pathname + window.location.search,
		customDataRenderers: {
			ObjectFieldHierarchyDataRenderer,
			objectFieldLabelDataRenderer,
		},
		customViewsEnabled: false,
		formName,
		id,
		itemsActions: items,
		namespace:
			'_com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_',

		pagination: {
			deltas: [
				{
					label: 4,
				},
				{
					label: 8,
				},
				{
					label: 20,
				},
				{
					label: 40,
				},
				{
					label: 60,
				},
			],
			initialDelta: 0,
			initialPageNumber: 0,
		},
		portletId:
			'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
		showManagementBar: true,
		showPagination: true,
		showSearch: true,
		style,
		views: [
			{
				contentRenderer: 'table',
				label: 'Table',
				name: 'table',
				schema: {
					fields: [
						{
							contentRenderer: 'objectFieldLabelDataRenderer',
							expand: false,
							fieldName: 'label',
							label: Liferay.Language.get('label'),
							localizeLabel: true,
							sortable: false,
						},
						{
							expand: false,
							fieldName: 'objectDefinitionName2',
							label: Liferay.Language.get('related-object'),
							localizeLabel: true,
							sortable: false,
						},
						{
							expand: false,
							fieldName: 'type',
							label: Liferay.Language.get('type'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer: 'ObjectFieldHierarchyDataRenderer',
							expand: false,
							fieldName: 'hierarchy',
							label: Liferay.Language.get('hierarchy'),
							localizeLabel: true,
							sortable: false,
						},
					],
				},
				thumbnail: 'table',
			},
		],
	};

	return <FrontendDataSet {...dataSetProps} />;
}
