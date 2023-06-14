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

import {BetaButton, FormError} from '@liferay/object-js-components-web';
import React from 'react';

import {ConfigurationContainer} from './ConfigurationContainer';
import {EntryDisplayContainer} from './EntryDisplayContainer';
import {ObjectDataContainer} from './ObjectDataContainer';
import {ScopeContainer} from './ScopeContainer';
import Sheet from './Sheet';

import './ObjectDetails.scss';
import {AccountRestrictionContainer} from './AccountRestrictionContainer';
import {ExternalDataSourceContainer} from './ExternalDataSourceContainer';
import {TranslationsContainer} from './TranslationsContainer';

export type KeyValuePair = {
	key: string;
	value: string;
};
interface EditObjectDetailsProps {
	companyKeyValuePair: KeyValuePair[];
	dbTableName: string;
	errors: FormError<Partial<ObjectDefinition>>;
	externalReferenceCode: string;
	handleChange: React.ChangeEventHandler<HTMLInputElement>;
	hasPublishObjectPermission: boolean;
	hasUpdateObjectDefinitionPermission: boolean;
	isApproved: boolean;
	label: LocalizedValue<string>;
	nonRelationshipObjectFieldsInfo: {
		label: LocalizedValue<string>;
		name: string;
	}[];
	objectDefinitionId: number;
	objectFields: ObjectField[];
	pluralLabel: LocalizedValue<string>;
	portletNamespace: string;
	setValues: any;
	shortName: string;
	siteKeyValuePair: KeyValuePair[];
	storageTypes: LabelValueObject[];
	values: any;
}

export default function EditObjectDetails({
	companyKeyValuePair,
	dbTableName,
	errors,
	handleChange,
	hasUpdateObjectDefinitionPermission,
	isApproved,
	nonRelationshipObjectFieldsInfo,
	objectFields,
	setValues,
	siteKeyValuePair,
	storageTypes,
	values,
}: EditObjectDetailsProps) {
	return (
		<>
			<div className="lfr-objects__object-definition-details">
				<Sheet title={Liferay.Language.get('basic-information')}>
					<ObjectDataContainer
						dbTableName={dbTableName}
						errors={errors}
						handleChange={handleChange}
						hasUpdateObjectDefinitionPermission={
							hasUpdateObjectDefinitionPermission
						}
						isApproved={isApproved}
						setValues={setValues}
						values={values}
					/>

					<EntryDisplayContainer
						errors={errors}
						nonRelationshipObjectFieldsInfo={
							nonRelationshipObjectFieldsInfo
						}
						objectFields={objectFields}
						setValues={setValues}
						values={values}
					/>

					{Liferay.FeatureFlags['LPS-135430'] && (
						<div className="lfr__object-web-edit-object-details-external-data-source-container">
							<ExternalDataSourceContainer
								errors={errors}
								setValues={setValues}
								storageTypes={storageTypes}
								values={values}
							/>

							<div className="lfr__object-web-edit-object-details-external-data-source-container-beta">
								{values.storageType === 'salesforce' && (
									<BetaButton />
								)}
							</div>
						</div>
					)}

					<ScopeContainer
						companyKeyValuePair={companyKeyValuePair}
						errors={errors}
						hasUpdateObjectDefinitionPermission={
							hasUpdateObjectDefinitionPermission
						}
						isApproved={isApproved}
						setValues={setValues}
						siteKeyValuePair={siteKeyValuePair}
						values={values}
					/>

					{(Liferay.FeatureFlags['LPS-167253']
						? values.modifiable
						: !values.system) && (
						<AccountRestrictionContainer
							errors={errors}
							isApproved={isApproved}
							objectFields={objectFields}
							setValues={setValues}
							values={values}
						/>
					)}

					<ConfigurationContainer
						hasUpdateObjectDefinitionPermission={
							hasUpdateObjectDefinitionPermission
						}
						setValues={setValues}
						values={values}
					/>

					{Liferay.FeatureFlags['LPS-146755'] && (
						<TranslationsContainer
							setValues={setValues}
							values={values}
						/>
					)}
				</Sheet>
			</div>
		</>
	);
}
