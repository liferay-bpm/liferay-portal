/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.form.field.type.internal.phonenumber;

import com.liferay.portal.kernel.model.Country;
import com.liferay.portal.kernel.service.CountryLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleThreadLocal;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Validator;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author Marco Leo
 */
public class PhoneNumberCountryUtil {

	public static List<Map<String, String>> getCountries(
		CountryLocalService countryLocalService) {

		List<Map<String, String>> countriesList = new ArrayList<>();

		long companyId = 0;

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext != null) {
			companyId = serviceContext.getCompanyId();
		}

		if (companyId == 0) {
			return countriesList;
		}

		Locale locale = LocaleThreadLocal.getThemeDisplayLocale();

		if (locale == null) {
			locale = LocaleUtil.getDefault();
		}

		String languageId = LocaleUtil.toLanguageId(locale);

		for (Country country :
				countryLocalService.getCompanyCountries(companyId, true)) {

			String idd = country.getIdd();

			if (Validator.isNull(idd)) {
				continue;
			}

			countriesList.add(
				HashMapBuilder.put(
					"a2", country.getA2()
				).put(
					"idd", idd
				).put(
					"name", country.getTitle(languageId)
				).build());
		}

		return countriesList;
	}

}