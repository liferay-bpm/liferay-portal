/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ObjectRelationshipAPI} from '@liferay/object-admin-rest-client-js';
import {expect, mergeTests} from '@playwright/test';

import {dataApiHelpersTest} from '../../../fixtures/dataApiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {objectPagesTest} from '../../../fixtures/objectPagesTest';
import {getRandomInt} from '../../../utils/getRandomInt';
import getRandomString from '../../../utils/getRandomString';
import {waitForAlert} from '../../../utils/waitForAlert';
import {generateObjectFields} from './utils/generateObjectFields';

const test = mergeTests(
	dataApiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	objectPagesTest
);

test(
	'LPD-78504 Can return child and parents with post child student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				studentDefinition.externalReferenceCode,
				{
					label: {en_US: 'StudentSubjects'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		const subject2 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Science'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject2.externalReferenceCode,
			}
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[relationship.name]).toHaveLength(2);

		const subjectNames = result[relationship.name].map(
			(entry: any) => entry[subjectFieldName]
		);

		expect(subjectNames).toContain('Math');
		expect(subjectNames).toContain('Science');
	}
);

test(
	'LPD-78504 Can return child and parents with post child subject in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				studentDefinition.externalReferenceCode,
				{
					label: {en_US: 'StudentSubjects'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const student2 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student2'},
			studentAppName
		);

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student2.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject1.externalReferenceCode,
			}
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						subject1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[relationship.name]).toHaveLength(2);

		const studentNames = result[relationship.name].map(
			(entry: any) => entry[studentFieldName]
		);

		expect(studentNames).toContain('Student1');
		expect(studentNames).toContain('Student2');
	}
);

test(
	'LPD-78504 Can return child and parent with post child user in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'UserStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const userAppName = 'headless-admin-user/v1.0/user-accounts';

		const studentFieldName = studentFields[0].name!;

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		apiHelpers.data.push({id: user.id, type: 'userAccount'});

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[relationship.name]).toHaveLength(1);
		expect(result[relationship.name][0]).toHaveProperty('id');
	}
);

test(
	'LPD-78504 Can return child and system parent with post child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'UserStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const userAppName = 'headless-admin-user/v1.0/user-accounts';

		const studentFieldName = studentFields[0].name!;

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		apiHelpers.data.push({id: user.id, type: 'userAccount'});

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[`r_${relationship.name}_userId`]).toBe(user.id);
	}
);

test(
	'LPD-78504 Can return custom objects with post subject in many to one relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				subjectDefinition.externalReferenceCode,
				{
					label: {en_US: 'SubjectPrerequisites'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const subjectFieldName = subjectFields[0].name!;

		const parentSubject = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'ParentSubject'},
			subjectAppName
		);

		const childSubject = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'ChildSubject'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: subjectAppName,
				currentExternalReferenceCode:
					parentSubject.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					childSubject.externalReferenceCode,
			}
		);

		const parentResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						parentSubject.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(parentResult[relationship.name]).toHaveLength(1);
		expect(parentResult[relationship.name][0][subjectFieldName]).toBe(
			'ChildSubject'
		);

		const childResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						childSubject.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(
			childResult[
				`r_${relationship.name}_${subjectDefinition.pkObjectFieldName}`
			]
		).toBe(parentSubject.id);
	}
);

test(
	'LPD-78504 Can return updated child and parents with patch child student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				studentDefinition.externalReferenceCode,
				{
					label: {en_US: 'StudentSubjects'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[studentFieldName]: 'UpdatedStudent1'},
			studentAppName,
			student1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[studentFieldName]).toBe('UpdatedStudent1');
		expect(result[relationship.name]).toHaveLength(1);
		expect(result[relationship.name][0][subjectFieldName]).toBe('Math');
	}
);

test(
	'LPD-78504 Can return updated child and parents with patch child user in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'UserStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const userAppName = 'headless-admin-user/v1.0/user-accounts';

		const studentFieldName = studentFields[0].name!;

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		apiHelpers.data.push({id: user.id, type: 'userAccount'});

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[studentFieldName]: 'UpdatedStudent1'},
			studentAppName,
			student1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[studentFieldName]).toBe('UpdatedStudent1');
		expect(result[relationship.name]).toHaveLength(1);
		expect(result[relationship.name][0]).toHaveProperty('id');
	}
);

test(
	'LPD-78504 Can return updated child and parent with patch child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				subjectDefinition.externalReferenceCode,
				{
					label: {en_US: 'SubjectStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: subjectAppName,
				currentExternalReferenceCode:
					subject1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[studentFieldName]: 'UpdatedStudent1'},
			studentAppName,
			student1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[studentFieldName]).toBe('UpdatedStudent1');
		expect(
			result[
				`r_${relationship.name}_${subjectDefinition.pkObjectFieldName}`
			]
		).toBe(subject1.id);
	}
);

test(
	'LPD-78504 Can return updated child and system parent with patch child student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'UserStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const userAppName = 'headless-admin-user/v1.0/user-accounts';

		const studentFieldName = studentFields[0].name!;

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		apiHelpers.data.push({id: user.id, type: 'userAccount'});

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[studentFieldName]: 'UpdatedStudent1'},
			studentAppName,
			student1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[studentFieldName]).toBe('UpdatedStudent1');
		expect(result[`r_${relationship.name}_userId`]).toBe(user.id);
	}
);

test(
	'LPD-78504 Can return updated custom objects with patch subject in one to many relationship with itself',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				subjectDefinition.externalReferenceCode,
				{
					label: {en_US: 'SubjectPrerequisites'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const subjectFieldName = subjectFields[0].name!;

		const parentSubject = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'ParentSubject'},
			subjectAppName
		);

		const childSubject = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'ChildSubject'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: subjectAppName,
				currentExternalReferenceCode:
					parentSubject.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					childSubject.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[subjectFieldName]: 'UpdatedChildSubject'},
			subjectAppName,
			childSubject.id
		);

		const parentResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						parentSubject.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(parentResult[relationship.name]).toHaveLength(1);
		expect(
			parentResult[relationship.name][0][subjectFieldName]
		).toBe('UpdatedChildSubject');

		const childResult =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						childSubject.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(childResult[subjectFieldName]).toBe('UpdatedChildSubject');
		expect(
			childResult[
				`r_${relationship.name}_${subjectDefinition.pkObjectFieldName}`
			]
		).toBe(parentSubject.id);
	}
);

test(
	'LPD-78504 Can return updated parent and children with patch parent student in many to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				studentDefinition.externalReferenceCode,
				{
					label: {en_US: 'StudentSubjects'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						subjectDefinition.externalReferenceCode,
					objectDefinitionId2: subjectDefinition.id,
					objectDefinitionName2: subjectDefinition.name,
					type: 'manyToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		const subject2 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Science'},
			subjectAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: studentAppName,
				currentExternalReferenceCode:
					student1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					subject2.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.patchObjectEntry(
			{[studentFieldName]: 'UpdatedStudent1'},
			studentAppName,
			student1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: studentAppName,
					externalReferenceCode:
						student1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[studentFieldName]).toBe('UpdatedStudent1');
		expect(result[relationship.name]).toHaveLength(2);

		const subjectNames = result[relationship.name].map(
			(entry: any) => entry[subjectFieldName]
		);

		expect(subjectNames).toContain('Math');
		expect(subjectNames).toContain('Science');
	}
);

test(
	'LPD-78504 Can return updated parent and children with put parent student in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});
		const subjectFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const subjectDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: subjectFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: subjectDefinition.id,
			type: 'objectDefinition',
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				subjectDefinition.externalReferenceCode,
				{
					label: {en_US: 'SubjectStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const subjectAppName =
			'c/' + subjectDefinition.name.toLowerCase() + 's';

		const studentFieldName = studentFields[0].name!;
		const subjectFieldName = subjectFields[0].name!;

		const subject1 = await apiHelpers.objectEntry.postObjectEntry(
			{[subjectFieldName]: 'Math'},
			subjectAppName
		);

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const student2 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student2'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: subjectAppName,
				currentExternalReferenceCode:
					subject1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: subjectAppName,
				currentExternalReferenceCode:
					subject1.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student2.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putObjectEntry(
			{[subjectFieldName]: 'UpdatedMath'},
			subjectAppName,
			subject1.id
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: subjectAppName,
					externalReferenceCode:
						subject1.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[subjectFieldName]).toBe('UpdatedMath');
		expect(result[relationship.name]).toHaveLength(2);

		const studentNames = result[relationship.name].map(
			(entry: any) => entry[studentFieldName]
		);

		expect(studentNames).toContain('Student1');
		expect(studentNames).toContain('Student2');
	}
);

test(
	'LPD-78504 Can return updated parent and children with put parent user in one to many relationship',
	{tag: '@LPD-78504'},
	async ({apiHelpers}) => {
		const studentFields = generateObjectFields({
			objectFieldBusinessTypes: ['Text'],
		});

		const studentDefinition =
			await apiHelpers.objectAdmin.postRandomObjectDefinition({
				objectFields: studentFields,
				status: {code: 0},
			});

		apiHelpers.data.push({
			id: studentDefinition.id,
			type: 'objectDefinition',
		});

		const objectRelationshipAPIClient =
			await apiHelpers.buildRestClient(ObjectRelationshipAPI);

		const relationshipName = 'relationship' + getRandomInt();

		const {body: relationship} =
			await objectRelationshipAPIClient.postObjectDefinitionByExternalReferenceCodeObjectRelationship(
				'L_USER',
				{
					label: {en_US: 'UserStudents'},
					name: relationshipName,
					objectDefinitionExternalReferenceCode2:
						studentDefinition.externalReferenceCode,
					objectDefinitionId2: studentDefinition.id,
					objectDefinitionName2: studentDefinition.name,
					type: 'oneToMany',
				}
			);

		apiHelpers.data.push({
			id: relationship.id,
			type: 'objectRelationship',
		});

		const studentAppName =
			'c/' + studentDefinition.name.toLowerCase() + 's';
		const userAppName = 'headless-admin-user/v1.0/user-accounts';

		const studentFieldName = studentFields[0].name!;

		const user = await apiHelpers.headlessAdminUser.postUserAccount();

		apiHelpers.data.push({id: user.id, type: 'userAccount'});

		const student1 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student1'},
			studentAppName
		);

		const student2 = await apiHelpers.objectEntry.postObjectEntry(
			{[studentFieldName]: 'Student2'},
			studentAppName
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student1.externalReferenceCode,
			}
		);

		await apiHelpers.objectEntry.putByExternalReferenceCodeCurrentExternalReferenceCodeObjectRelationshipNameRelatedExternalReferenceCode(
			{
				applicationName: userAppName,
				currentExternalReferenceCode:
					user.externalReferenceCode,
				objectRelationshipName: relationship.name,
				relatedExternalReferenceCode:
					student2.externalReferenceCode,
			}
		);

		const result =
			await apiHelpers.objectEntry.getObjectEntryByExternalReferenceCode(
				{
					applicationName: userAppName,
					externalReferenceCode: user.externalReferenceCode,
					nestedField: relationship.name,
				}
			);

		expect(result[relationship.name]).toHaveLength(2);

		const studentNames = result[relationship.name].map(
			(entry: any) => entry[studentFieldName]
		);

		expect(studentNames).toContain('Student1');
		expect(studentNames).toContain('Student2');
	}
);
