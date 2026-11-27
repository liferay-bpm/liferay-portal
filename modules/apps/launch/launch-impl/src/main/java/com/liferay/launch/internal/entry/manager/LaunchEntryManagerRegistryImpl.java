/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.internal.entry.manager;

import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.launch.entry.manager.LaunchEntryManagerRegistry;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMap;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMapFactory;
import com.liferay.portal.kernel.model.CompanyConstants;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.util.GetterUtil;

import java.util.ArrayList;
import java.util.List;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;

/**
 * @author Alejandro Tardín
 */
@Component(service = LaunchEntryManagerRegistry.class)
public class LaunchEntryManagerRegistryImpl
	implements LaunchEntryManagerRegistry {

	@Override
	public LaunchEntryManager getLaunchEntryManager(String className) {
		return _classNameServiceTrackerMap.getService(className);
	}

	@Override
	public List<LaunchEntryManager> getLaunchEntryManagers() {
		List<LaunchEntryManager> launchEntryManagers = new ArrayList<>();

		List<LaunchEntryManager> systemLaunchEntryManagers =
			_companyIdServiceTrackerMap.getService(CompanyConstants.SYSTEM);

		if (systemLaunchEntryManagers != null) {
			launchEntryManagers.addAll(systemLaunchEntryManagers);
		}

		List<LaunchEntryManager> companyLaunchEntryManagers =
			_companyIdServiceTrackerMap.getService(
				CompanyThreadLocal.getCompanyId());

		if (companyLaunchEntryManagers != null) {
			launchEntryManagers.addAll(companyLaunchEntryManagers);
		}

		return launchEntryManagers;
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
		_classNameServiceTrackerMap =
			ServiceTrackerMapFactory.openSingleValueMap(
				bundleContext, LaunchEntryManager.class,
				"launch.entry.manager.class.name");
		_companyIdServiceTrackerMap =
			ServiceTrackerMapFactory.openMultiValueMap(
				bundleContext, LaunchEntryManager.class,
				"(launch.entry.manager.class.name=*)",
				(serviceReference, emitter) -> emitter.emit(
					GetterUtil.getLong(
						serviceReference.getProperty("company.id"))));
	}

	@Deactivate
	protected void deactivate() {
		_classNameServiceTrackerMap.close();
		_companyIdServiceTrackerMap.close();
	}

	private ServiceTrackerMap<String, LaunchEntryManager>
		_classNameServiceTrackerMap;
	private ServiceTrackerMap<Long, List<LaunchEntryManager>>
		_companyIdServiceTrackerMap;

}