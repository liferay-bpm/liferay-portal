/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.upgrade.v7_2_0;

import com.liferay.object.configuration.ObjectConfiguration;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.util.HashMapDictionary;

import java.util.Dictionary;

import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

/**
 * @author Pedro Leite
 */
public class ObjectConfigurationUpgradeProcess extends UpgradeProcess {

	public ObjectConfigurationUpgradeProcess(
		ConfigurationAdmin configurationAdmin) {

		_configurationAdmin = configurationAdmin;
	}

	@Override
	protected void doUpgrade() throws Exception {
		if (!hasTable("Configuration_")) {
			return;
		}

		Configuration configuration = _configurationAdmin.getConfiguration(
			ObjectConfiguration.class.getName(), StringPool.QUESTION);

		Dictionary<String, Object> dictionary = configuration.getProperties();

		if (dictionary == null) {
			dictionary = new HashMapDictionary<>();
		}

		dictionary.put("allowAdministratorsExecuteScript", "true");

		configuration.update(dictionary);
	}

	private final ConfigurationAdmin _configurationAdmin;

}