/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cms.site.initializer.internal.upgrade.registry;

import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFolderLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.upgrade.registry.UpgradeStepRegistrator;
import com.liferay.site.cms.site.initializer.internal.upgrade.v1_0_0.CMSObjectRelationshipEdgeUpgradeProcess;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Víctor Galán
 */
@Component(service = UpgradeStepRegistrator.class)
public class SiteCMSSiteInitializerUpgradeStepRegistrator
	implements UpgradeStepRegistrator {

	@Override
	public void register(Registry registry) {
		registry.registerInitialization();

		registry.register(
			"0.0.1", "1.0.0",
			new CMSObjectRelationshipEdgeUpgradeProcess(
				_companyLocalService, _objectDefinitionLocalService,
				_objectFolderLocalService, _objectRelationshipLocalService));
	}

	@Reference
	private CompanyLocalService _companyLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectFolderLocalService _objectFolderLocalService;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}