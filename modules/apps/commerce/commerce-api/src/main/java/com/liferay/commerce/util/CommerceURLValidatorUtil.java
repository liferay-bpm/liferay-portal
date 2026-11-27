/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.commerce.util;

import com.liferay.portal.configuration.module.configuration.ConfigurationProviderUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.HttpComponentsUtil;
import com.liferay.portal.security.configuration.URLFetchSecurityCompanyConfiguration;

/**
 * @author Stefano Motta
 */
public class CommerceURLValidatorUtil {

	public static boolean isValidURL(long companyId, String url) {
		try {
			URLFetchSecurityCompanyConfiguration
				urlFetchSecurityCompanyConfiguration =
					ConfigurationProviderUtil.getCompanyConfiguration(
						URLFetchSecurityCompanyConfiguration.class, companyId);

			return HttpComponentsUtil.isAllowedURL(
				url, urlFetchSecurityCompanyConfiguration.urlHostsAllowed(),
				urlFetchSecurityCompanyConfiguration.
					urlLocalNetworkAccessEnabled());
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}

			return false;
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		CommerceURLValidatorUtil.class);

}