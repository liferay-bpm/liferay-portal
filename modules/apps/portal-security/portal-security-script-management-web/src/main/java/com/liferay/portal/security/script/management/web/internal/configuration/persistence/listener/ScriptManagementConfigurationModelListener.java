/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.security.script.management.web.internal.configuration.persistence.listener;

import com.liferay.osgi.service.tracker.collections.list.ServiceTrackerList;
import com.liferay.osgi.service.tracker.collections.list.ServiceTrackerListFactory;
import com.liferay.portal.configuration.persistence.listener.ConfigurationModelListener;
import com.liferay.portal.configuration.persistence.listener.ConfigurationModelListenerException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.LocaleThreadLocal;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.security.script.management.configuration.ScriptManagementConfiguration;
import com.liferay.portal.security.script.management.groovy.script.uses.factory.GroovyScriptUsesFactory;

import java.util.Dictionary;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Yuri Monteiro
 */
@Component(
	property = "model.class.name=com.liferay.portal.security.script.management.configuration.ScriptManagementConfiguration",
	service = ConfigurationModelListener.class
)
public class ScriptManagementConfigurationModelListener
	implements ConfigurationModelListener {

	@Override
	public void onBeforeDelete(String pid)
		throws ConfigurationModelListenerException {

		_checkActiveGroovyScriptUses();
	}

	@Override
	public void onBeforeSave(String pid, Dictionary<String, Object> properties)
		throws ConfigurationModelListenerException {

		if (GetterUtil.getBoolean(
				properties.get("allowScriptContentToBeExecutedOrIncluded"))) {

			return;
		}

		_checkActiveGroovyScriptUses();
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
		_serviceTrackerList = ServiceTrackerListFactory.open(
			bundleContext, GroovyScriptUsesFactory.class);
	}

	@Deactivate
	protected void deactivate() {
		_serviceTrackerList.close();
	}

	private void _checkActiveGroovyScriptUses()
		throws ConfigurationModelListenerException {

		boolean activeGroovyScriptUses = false;

		try {
			activeGroovyScriptUses = _hasActiveGroovyScriptUses();
		}
		catch (Exception exception) {
			throw new ConfigurationModelListenerException(
				exception, ScriptManagementConfiguration.class, getClass(),
				null);
		}

		if (!activeGroovyScriptUses) {
			return;
		}

		String message = _language.get(
			LocaleThreadLocal.getThemeDisplayLocale(),
			"resolve-all-active-scripting-uses-before-proceeding-you-can-" +
				"deactivate-the-source-entity-or-remove-the-script");

		throw new ConfigurationModelListenerException(
			message, ScriptManagementConfiguration.class, getClass(), null);
	}

	private boolean _hasActiveGroovyScriptUses() throws Exception {
		if (PropsValues.DATABASE_PARTITION_ENABLED) {
			boolean[] activeGroovyScriptUses = {false};

			_companyLocalService.forEachCompanyId(
				companyId -> {
					if (_hasActiveGroovyScriptUsesInCurrentCompany()) {
						activeGroovyScriptUses[0] = true;
					}
				});

			return activeGroovyScriptUses[0];
		}

		return _hasActiveGroovyScriptUsesInCurrentCompany();
	}

	private boolean _hasActiveGroovyScriptUsesInCurrentCompany()
		throws Exception {

		for (GroovyScriptUsesFactory groovyScriptUsesFactory :
				_serviceTrackerList) {

			if (groovyScriptUsesFactory.hasActiveUses()) {
				return true;
			}
		}

		return false;
	}

	@Reference
	private CompanyLocalService _companyLocalService;

	@Reference
	private Language _language;

	private ServiceTrackerList<GroovyScriptUsesFactory> _serviceTrackerList;

}