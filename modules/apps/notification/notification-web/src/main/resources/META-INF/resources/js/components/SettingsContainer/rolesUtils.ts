/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	MultiSelectItem,
	MultiSelectItemChild,
} from '@liferay/object-js-components-web';
import {createResourceURL, fetch} from 'frontend-js-web';

interface Role {
	name: string;
}

export async function getEmailNotificationRoles(baseResourceURL: string) {
	const response = await fetch(
		createResourceURL(baseResourceURL, {
			p_p_resource_id:
				'/notification_templates/get_email_notification_roles',
		}).toString()
	);

	const body = await response.json();

	const accountRoles = body.accountRoles as Role[];

	const accountRolesGroup = {
		children: accountRoles.map(({name}) => {
			return {
				checked: false,
				label: name,
				value: name,
			};
		}),
		label: 'Account Roles',
		value: 'accountRolesList',
	} as MultiSelectItem;

	const organizationRoles = body.organizationRoles as Role[];

	const organizationRolesGroup = {
		children: organizationRoles.map(({name}) => {
			return {
				checked: false,
				label: name,
				value: name,
			};
		}),
		label: 'Organization Roles',
		value: 'organizationRolesList',
	} as MultiSelectItem;

	return [accountRolesGroup, organizationRolesGroup];
}

export function getCheckedChildren(
	rolesNamesList: EmailNotificationRecipients[],
	children: MultiSelectItemChild[]
) {
	const rolesNames = rolesNamesList.map(({roleName}) => roleName);

	return children.map((child) => {
		return {
			...child,
			checked: rolesNames.includes(child.value),
		};
	});
}
