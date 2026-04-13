/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.dynamic.data.mapping.form.field.type.internal.phone.number;

import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldTemplateContextContributor;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderingContext;
import com.liferay.dynamic.data.mapping.util.DDMFormFieldTemplateContextContributorUtil;
import com.liferay.object.dynamic.data.mapping.form.field.type.constants.ObjectDDMFormFieldTypeConstants;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.model.Country;
import com.liferay.portal.kernel.service.CountryLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleThreadLocal;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.kernel.util.Validator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = "ddm.form.field.type.name=" + ObjectDDMFormFieldTypeConstants.PHONE_NUMBER,
	service = DDMFormFieldTemplateContextContributor.class
)
public class PhoneNumberDDMFormFieldTemplateContextContributor
	implements DDMFormFieldTemplateContextContributor {

	@Override
	public Map<String, Object> getParameters(
		DDMFormField ddmFormField,
		DDMFormFieldRenderingContext ddmFormFieldRenderingContext) {

		DDMForm ddmForm = ddmFormField.getDDMForm();
		boolean localizedObjectField = GetterUtil.getBoolean(
			ddmFormField.getProperty("localizedObjectField"));

		return HashMapBuilder.<String, Object>put(
			"countries", _getCountries()
		).put(
			"localizedObjectField", localizedObjectField
		).put(
			"value",
			() -> {
				String value = ddmFormFieldRenderingContext.getValue();

				if (Validator.isNull(value)) {
					return null;
				}

				if (localizedObjectField) {
					return _jsonFactory.looseDeserialize(value);
				}

				return value;
			}
		).putAll(
			DDMFormFieldTemplateContextContributorUtil.
				getLocalizationParameters(
					ddmFormField, ddmForm.getDefaultLocale())
		).build();
	}

	private Set<String> _getAvailableLocaleCountryA2s() {
		Set<String> availableLocaleCountryA2s = _availableLocaleCountryA2s;

		if (availableLocaleCountryA2s != null) {
			return availableLocaleCountryA2s;
		}

		Set<String> countryA2s = new HashSet<>();

		for (String languageId : PropsValues.LOCALES) {
			Locale availableLocale = LocaleUtil.fromLanguageId(
				languageId, false);

			String countryA2 = availableLocale.getCountry();

			if (Validator.isNotNull(countryA2)) {
				countryA2s.add(countryA2);
			}
		}

		availableLocaleCountryA2s = Collections.unmodifiableSet(countryA2s);

		_availableLocaleCountryA2s = availableLocaleCountryA2s;

		return availableLocaleCountryA2s;
	}

	private List<Map<String, String>> _getCountries() {
		List<Map<String, String>> countries = new ArrayList<>();

		long companyId = 0;

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext != null) {
			companyId = serviceContext.getCompanyId();
		}

		if (companyId == 0) {
			return countries;
		}

		Set<String> availableLocaleCountryA2s = _getAvailableLocaleCountryA2s();

		Locale locale = LocaleThreadLocal.getThemeDisplayLocale();

		if (locale == null) {
			locale = LocaleUtil.getDefault();
		}

		for (Country country :
				_countryLocalService.getCompanyCountries(companyId, true)) {

			if (!availableLocaleCountryA2s.contains(country.getA2())) {
				continue;
			}

			String idd = country.getIdd();

			if (Validator.isNull(idd)) {
				continue;
			}

			countries.add(
				HashMapBuilder.put(
					"a2", country.getA2()
				).put(
					"idd", idd
				).put(
					"name", country.getTitle(LocaleUtil.toLanguageId(locale))
				).build());
		}

		return countries;
	}

	private static volatile Set<String> _availableLocaleCountryA2s;

	@Reference
	private CountryLocalService _countryLocalService;

	@Reference
	private JSONFactory _jsonFactory;

}