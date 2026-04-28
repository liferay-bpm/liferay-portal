/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.field.phone.number.util;

import com.liferay.portal.kernel.model.Country;
import com.liferay.portal.kernel.service.CountryLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleThreadLocal;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.kernel.util.Validator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * @author Yuri Monteiro
 */
public class PhoneNumberCountryUtil {

	public static final String KEY_A2 = "a2";

	public static final String KEY_IDD = "idd";

	public static final String KEY_NAME = "name";

	public static List<Map<String, String>> getCountries(
		CountryLocalService countryLocalService) {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			return Collections.emptyList();
		}

		long companyId = serviceContext.getCompanyId();

		if (companyId == 0) {
			return Collections.emptyList();
		}

		Locale locale = LocaleThreadLocal.getThemeDisplayLocale();

		if (locale == null) {
			locale = LocaleUtil.getDefault();
		}

		List<Map<String, String>> countries = new ArrayList<>();

		String languageId = LocaleUtil.toLanguageId(locale);

		for (Country country :
				countryLocalService.getCompanyCountries(companyId, true)) {

			String a2 = country.getA2();

			if (!_availableCountryA2List.contains(a2)) {
				continue;
			}

			String idd = country.getIdd();

			if (Validator.isNull(idd)) {
				continue;
			}

			countries.add(
				HashMapBuilder.put(
					KEY_A2, a2
				).put(
					KEY_IDD, idd
				).put(
					KEY_NAME, country.getTitle(languageId)
				).build());
		}

		return ListUtil.sort(
			countries, Comparator.comparing(country -> country.get(KEY_NAME)));
	}

	private static final Set<String> _availableCountryA2List;

	static {
		Set<String> countryA2List = new HashSet<>();

		for (String languageId : PropsValues.LOCALES) {
			Locale locale = LocaleUtil.fromLanguageId(languageId, false);

			String countryA2 = locale.getCountry();

			if (Validator.isNotNull(countryA2)) {
				countryA2List.add(countryA2);
			}
		}

		_availableCountryA2List = Collections.unmodifiableSet(countryA2List);
	}

}