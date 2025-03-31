/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.dynamic.data.mapping.form.field.type.internal.multi.select.picklist;

import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldTemplateContextContributor;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.model.DDMFormFieldOptions;
import com.liferay.dynamic.data.mapping.model.LocalizedValue;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderingContext;
import com.liferay.dynamic.data.mapping.util.DDMFormFieldTemplateContextContributorUtil;
import com.liferay.list.type.service.ListTypeEntryLocalService;
import com.liferay.object.dynamic.data.mapping.form.field.type.constants.ObjectDDMFormFieldTypeConstants;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleThreadLocal;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Pedro Leite
 */
@Component(
	property = "ddm.form.field.type.name=" + ObjectDDMFormFieldTypeConstants.MULTISELECT_PICKLIST,
	service = DDMFormFieldTemplateContextContributor.class
)
public class MultiselectPicklistDDMFormFieldTemplateContextContributor
	implements DDMFormFieldTemplateContextContributor {

	@Override
	public Map<String, Object> getParameters(
		DDMFormField ddmFormField,
		DDMFormFieldRenderingContext ddmFormFieldRenderingContext) {

		DDMForm ddmForm = ddmFormField.getDDMForm();
		boolean localizedObjectField = GetterUtil.getBoolean(
			ddmFormField.getProperty("localizedObjectField"));

		return HashMapBuilder.<String, Object>put(
			"editOnlyInDefaultLanguage",
			GetterUtil.getBoolean(
				ddmFormField.getProperty("editOnlyInDefaultLanguage"))
		).put(
			"isLocalizationSupported",
			GetterUtil.getBoolean(
				ddmFormField.getProperty("isLocalizationSupported"))
		).put(
			"localizedObjectField", localizedObjectField
		).put(
			"options",
			() -> {
				DDMFormFieldOptions ddmFormFieldOptions =
					(DDMFormFieldOptions)ddmFormField.getProperty("options");
				List<Map<String, Object>> options = new ArrayList<>();

				for (String optionValue :
						ddmFormFieldOptions.getOptionsValues()) {

					if (optionValue == null) {
						continue;
					}

					LocalizedValue localizedValue =
						ddmFormFieldOptions.getOptionLabels(optionValue);

					Map<Locale, String> labelMap = _getLabelMap(
						ddmFormField, optionValue, _listTypeEntryLocalService,
						localizedValue);

					options.add(
						HashMapBuilder.<String, Object>put(
							"label",
							() -> {
								if (localizedObjectField) {
									return GetterUtil.getString(
										labelMap.get(
											localizedValue.getDefaultLocale()));
								}

								return GetterUtil.getString(
									labelMap.get(
										LocaleThreadLocal.
											getThemeDisplayLocale()));
							}
						).put(
							"labelMap", labelMap
						).put(
							"reference",
							ddmFormFieldOptions.getOptionReference(optionValue)
						).put(
							"value", optionValue
						).build());
				}

				return options;
			}
		).putAll(
			DDMFormFieldTemplateContextContributorUtil.getLocaleMap(
				ddmForm.getDefaultLocale())
		).build();
	}

	private Map<Locale, String> _getLabelMap(
		DDMFormField ddmFormField, String key,
		ListTypeEntryLocalService listTypeEntryLocalService,
		LocalizedValue localizedValue) {

		Map<Locale, String> labelMap =
			DDMFormFieldTemplateContextContributorUtil.getListTypeEntryNameMap(
				ddmFormField, key, listTypeEntryLocalService);

		if (labelMap != null) {
			return labelMap;
		}

		return localizedValue.getValues();
	}

	@Reference
	private ListTypeEntryLocalService _listTypeEntryLocalService;

}