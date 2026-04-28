/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.object.definitions.portlet.action;

import com.liferay.object.constants.ObjectPortletKeys;
import com.liferay.object.field.phone.number.util.PhoneNumberCountryUtil;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.service.CountryLocalService;

import jakarta.portlet.ResourceRequest;
import jakarta.portlet.ResourceResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Yuri Monteiro
 */
@Component(
	property = {
		"jakarta.portlet.name=" + ObjectPortletKeys.OBJECT_DEFINITIONS,
		"mvc.command.name=/object_definitions/get_countries"
	},
	service = MVCResourceCommand.class
)
public class GetCountriesMVCResourceCommand extends BaseMVCResourceCommand {

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws Exception {

		JSONPortletResponseUtil.writeJSON(
			resourceRequest, resourceResponse,
			JSONUtil.toJSONArray(
				PhoneNumberCountryUtil.getCountries(_countryLocalService),
				country -> JSONUtil.put(
					PhoneNumberCountryUtil.KEY_A2,
					country.get(PhoneNumberCountryUtil.KEY_A2)
				).put(
					PhoneNumberCountryUtil.KEY_IDD,
					country.get(PhoneNumberCountryUtil.KEY_IDD)
				).put(
					PhoneNumberCountryUtil.KEY_NAME,
					country.get(PhoneNumberCountryUtil.KEY_NAME)
				)));
	}

	@Reference
	private CountryLocalService _countryLocalService;

}