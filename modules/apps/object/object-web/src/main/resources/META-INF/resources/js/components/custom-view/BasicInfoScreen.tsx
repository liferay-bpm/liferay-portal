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

import ClayForm, {ClayCheckbox} from '@clayui/form';
import React from 'react';

import {normalizeLanguageId} from '../../utils/string';
import Card from '../Card/Card';
import Input from '../form/Input';

const defaultLanguageId = normalizeLanguageId(
	Liferay.ThemeDisplay.getDefaultLanguageId()
);

const BasicInfoScreen = () => {
	return (
		<Card>
			<Card.Header title={Liferay.Language.get('basic-info')} />

			<Card.Body>
				<ClayForm.Group>
					<Input
						disabled={false} // isViewOnly}
						id="objectLayoutName"
						label={Liferay.Language.get('name')}
						name="name"
						onChange={({target: {value}}: any) => {

							// dispatch({
							// 	payload: {
							// 		name: {
							// 			[defaultLanguageId]: value,
							// 		},
							// 	},
							// 	type: TYPES.CHANGE_OBJECT_LAYOUT_NAME,
							// });

						}}
						required
						value="" // objectLayout.name[defaultLanguageId]}
					/>
				</ClayForm.Group>

				<ClayForm.Group className="mb-0">
					<ClayCheckbox
						checked={true} // objectLayout.defaultObjectLayout}
						disabled={false} // isViewOnly}
						label={Liferay.Language.get('mark-as-default')}
						onChange={({target: {checked}}) => {

							// dispatch({
							// 	payload: {checked},
							// 	type: TYPES.SET_OBJECT_LAYOUT_AS_DEFAULT,
							// });

						}}
					/>
				</ClayForm.Group>
			</Card.Body>
		</Card>
	);
};

export default BasicInfoScreen;
