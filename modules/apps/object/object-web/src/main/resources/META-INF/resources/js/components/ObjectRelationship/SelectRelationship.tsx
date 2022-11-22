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

import {API, Select} from '@liferay/object-js-components-web';
import React, {useEffect, useMemo, useState} from 'react';

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

interface IProps {
	error?: string;
	objectDefinitionExternalReferenceCode?: string;
	onChange: (objectFieldName: string) => void;
	value?: string;
}

export default function SelectRelationship({
	error,
	objectDefinitionExternalReferenceCode,
	onChange,
	value,
	...otherProps
}: IProps) {
	const [fields, setFields] = useState<ObjectField[]>([]);
	const options = useMemo(
		() =>
			fields.map(({label, name}) => {
				return {
					label: label[defaultLanguageId]!,
					name,
				};
			}),
		[fields]
	);
	const selectedValue = useMemo(() => {
		return fields.find(({name}) => name === value);
	}, [fields, value]);

	useEffect(() => {
		const makeFetch = async () => {
			if (objectDefinitionExternalReferenceCode) {
				const objectFields = await API.getObjectFieldsByExternalReferenceCode(
					objectDefinitionExternalReferenceCode
				);
				const options = objectFields?.filter(
					({businessType}) => businessType === 'Relationship'
				);
				setFields(options);
			}
			else {
				setFields([]);
			}
		};
		makeFetch();
	}, [objectDefinitionExternalReferenceCode]);

	return (
		<Select
			error={error}
			label={Liferay.Language.get('parameter')}
			onChange={({target: {value}}) => {
				onChange(fields.find(({name}) => name === value)?.name!);
			}}
			options={options}
			required
			tooltip={Liferay.Language.get(
				'choose-a-relationship-field-from-the-selected-object'
			)}
			value={selectedValue?.label[defaultLanguageId]}
			{...otherProps}
		/>
	);
}
