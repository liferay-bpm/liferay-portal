/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.action.executor;

import com.liferay.object.action.executor.ObjectActionExecutor;
import com.liferay.object.constants.ObjectActionExecutorConstants;
import com.liferay.object.exception.ObjectActionParametersException;
import com.liferay.object.model.ObjectAction;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.servlet.HttpHeaders;
import com.liferay.portal.kernel.util.ContentTypes;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.Http;
import com.liferay.portal.kernel.util.HttpComponentsUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.security.key.secret.SecretResolver;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Brian Wing Shun Chan
 */
@Component(service = ObjectActionExecutor.class)
public class WebhookObjectActionExecutorImpl implements ObjectActionExecutor {

	@Override
	public void execute(
			long companyId, long objectActionId,
			UnicodeProperties parametersUnicodeProperties,
			JSONObject payloadJSONObject, long userId)
		throws Exception {

		String url = parametersUnicodeProperties.get("url");

		if (!_isAllowedURL(parametersUnicodeProperties, url)) {
			throw new ObjectActionParametersException(
				"The URL is not allowed for object action " + objectActionId);
		}

		Http.Options options = new Http.Options();

		options.addHeader(
			HttpHeaders.CONTENT_TYPE, ContentTypes.APPLICATION_JSON);
		options.addHeader(
			"x-api-key",
			_secretResolver.resolve(
				companyId,
				StringBundler.concat(
					ObjectAction.class.getSimpleName(), StringPool.SLASH,
					companyId, StringPool.SLASH, objectActionId, "/secret"),
				parametersUnicodeProperties.get("secret")));
		options.setBody(
			payloadJSONObject.toString(), ContentTypes.APPLICATION_JSON,
			StringPool.UTF8);
		options.setFollowRedirects(false);
		options.setLocation(url);
		options.setPost(true);

		_http.URLtoString(options);
	}

	@Override
	public String getKey() {
		return ObjectActionExecutorConstants.KEY_WEBHOOK;
	}

	private boolean _isAllowedURL(
		UnicodeProperties parametersUnicodeProperties, String url) {

		boolean urlLocalNetworkAccessEnabled = GetterUtil.getBoolean(
			parametersUnicodeProperties.get("urlLocalNetworkAccessEnabled"));

		String[] urlHostsAllowed = new String[0];

		if (urlLocalNetworkAccessEnabled) {
			urlHostsAllowed = StringUtil.split(
				parametersUnicodeProperties.get("urlHostsAllowed"));
		}

		return HttpComponentsUtil.isAllowedURL(
			url, urlHostsAllowed, urlLocalNetworkAccessEnabled);
	}

	@Reference
	private Http _http;

	@Reference
	private SecretResolver _secretResolver;

}