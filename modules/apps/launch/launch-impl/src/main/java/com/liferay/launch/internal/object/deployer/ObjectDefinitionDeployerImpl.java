/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.internal.object.deployer;

import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.launch.internal.entry.manager.ObjectEntryLaunchEntryManager;
import com.liferay.object.deployer.ObjectDefinitionDeployer;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryVersionLocalService;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.util.HashMapDictionaryBuilder;

import java.util.Collections;
import java.util.List;

import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Alejandro Tardín
 */
@Component(service = ObjectDefinitionDeployer.class)
public class ObjectDefinitionDeployerImpl implements ObjectDefinitionDeployer {

	@Override
	public List<ServiceRegistration<?>> deploy(
		ObjectDefinition objectDefinition) {

		if (!objectDefinition.isEnableObjectEntryDraft() ||
			!objectDefinition.isEnableObjectEntryVersioning()) {

			return Collections.emptyList();
		}

		return Collections.singletonList(
			_bundleContext.registerService(
				LaunchEntryManager.class,
				new ObjectEntryLaunchEntryManager(
					_groupLocalService, objectDefinition,
					_objectEntryLocalService, _objectEntryVersionLocalService),
				HashMapDictionaryBuilder.<String, Object>put(
					"company.id", objectDefinition.getCompanyId()
				).put(
					"launch.entry.manager.class.name",
					objectDefinition.getClassName()
				).build()));
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
		_bundleContext = bundleContext;
	}

	private BundleContext _bundleContext;

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private ObjectEntryVersionLocalService _objectEntryVersionLocalService;

}