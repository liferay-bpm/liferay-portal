/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.form.field.type.internal.phonenumber;

import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldTemplateContextContributor;
import com.liferay.dynamic.data.mapping.form.field.type.constants.DDMFormFieldTypeConstants;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderingContext;
import com.liferay.dynamic.data.mapping.util.DDMFormFieldTemplateContextContributorUtil;
import com.liferay.portal.kernel.json.JSONException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.service.CountryLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;

import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = "ddm.form.field.type.name=" + DDMFormFieldTypeConstants.LOCALIZABLE_PHONE_NUMBER,
	service = DDMFormFieldTemplateContextContributor.class
)
public class LocalizablePhoneNumberDDMFormFieldTemplateContextContributor
	implements DDMFormFieldTemplateContextContributor {

	@Override
	public Map<String, Object> getParameters(
		DDMFormField ddmFormField,
		DDMFormFieldRenderingContext ddmFormFieldRenderingContext) {

		Map<String, Object> parameters = HashMapBuilder.<String, Object>put(
			"countries",
			PhoneNumberCountryUtil.getCountries(_countryLocalService)
		).put(
			"localizedObjectField",
			GetterUtil.getBoolean(
				ddmFormField.getProperty("localizedObjectField"))
		).put(
			"value", _getValueJSONObject(ddmFormFieldRenderingContext)
		).build();

		if (ddmFormFieldRenderingContext.isReturnFullContext()) {
			DDMForm ddmForm = ddmFormField.getDDMForm();

			parameters.putAll(
				DDMFormFieldTemplateContextContributorUtil.
					getLocalizationParameters(
						ddmFormField, ddmForm.getDefaultLocale()));
		}

		return parameters;
	}

	private Object _getValueJSONObject(
		DDMFormFieldRenderingContext ddmFormFieldRenderingContext) {

		try {
			return _jsonFactory.createJSONObject(
				ddmFormFieldRenderingContext.getValue());
		}
		catch (JSONException jsonException) {
			if (_log.isDebugEnabled()) {
				_log.debug(jsonException);
			}
		}

		return _jsonFactory.createJSONObject();
	}

	private static final Log _log = LogFactoryUtil.getLog(
		LocalizablePhoneNumberDDMFormFieldTemplateContextContributor.class);

	@Reference
	private CountryLocalService _countryLocalService;

	@Reference
	private JSONFactory _jsonFactory;

}