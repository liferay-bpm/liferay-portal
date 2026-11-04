/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.form.dto.v1_0.util;

import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceVersion;
import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.model.DDMStructureVersion;
import com.liferay.headless.form.dto.v1_0.Form;
import com.liferay.petra.function.UnsafeSupplierValue;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.MVCCModel;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Locale;

/**
 * @author Gabriel Albuquerque
 */
public class FormUtil {

	public static Form toForm(
			Boolean acceptAllLanguages, DDMFormInstance ddmFormInstance,
			Portal portal, Locale preferredLocale,
			UserLocalService userLocalService)
		throws Exception {

		if (ddmFormInstance == null) {
			return null;
		}

		UnsafeSupplierValue<DDMFormInstanceVersion, PortalException>
			ddmFormInstanceVersionUnsafeSupplierValue =
				new UnsafeSupplierValue<>(
					ddmFormInstance::getLatestApprovedFormInstanceVersion);

		return new Form() {
			{
				setAvailableLanguages(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return LocaleUtil.toW3cLanguageIds(
							ddmFormInstanceVersion.getAvailableLanguageIds());
					});
				setCreator(
					() -> CreatorUtil.toCreator(
						portal,
						userLocalService.fetchUser(
							ddmFormInstance.getUserId())));
				setDateCreated(ddmFormInstance::getCreateDate);
				setDateModified(ddmFormInstance::getModifiedDate);
				setDatePublished(ddmFormInstance::getLastPublishDate);
				setDefaultLanguage(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return ddmFormInstanceVersion.getDefaultLanguageId();
					});
				setDescription(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return ddmFormInstanceVersion.getDescription(
							preferredLocale);
					});
				setDescription_i18n(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return LocalizedMapUtil.getI18nMap(
							acceptAllLanguages,
							ddmFormInstanceVersion.getDescriptionMap());
					});
				setId(ddmFormInstance::getFormInstanceId);
				setName(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return ddmFormInstanceVersion.getName(preferredLocale);
					});
				setName_i18n(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						return LocalizedMapUtil.getI18nMap(
							acceptAllLanguages,
							ddmFormInstanceVersion.getNameMap());
					});
				setStructure(
					() -> {
						DDMFormInstanceVersion ddmFormInstanceVersion =
							ddmFormInstanceVersionUnsafeSupplierValue.
								getValue();

						DDMStructureVersion ddmStructureVersion =
							ddmFormInstanceVersion.getStructureVersion();

						DDMStructure ddmStructure = MVCCModel.scratchClone(
							ddmStructureVersion.getStructure());

						ddmStructure.setVersion(
							ddmStructureVersion.getVersion());
						ddmStructure.setName(ddmStructureVersion.getName());
						ddmStructure.setDescription(
							ddmStructureVersion.getDescription());
						ddmStructure.setDefinition(
							ddmStructureVersion.getDefinition());

						return StructureUtil.toFormStructure(
							acceptAllLanguages, ddmStructure, preferredLocale,
							portal, userLocalService);
					});
			}
		};
	}

}