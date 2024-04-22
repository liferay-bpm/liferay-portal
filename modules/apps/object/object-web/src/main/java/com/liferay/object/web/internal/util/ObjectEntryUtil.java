/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.util;

import com.liferay.info.field.InfoField;
import com.liferay.info.field.InfoFieldValue;
import com.liferay.info.field.type.DateInfoFieldType;
import com.liferay.info.field.type.DateTimeInfoFieldType;
import com.liferay.info.item.InfoItemFieldValues;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectEntryLocalServiceUtil;
import com.liferay.object.web.internal.model.ProxyObjectEntry;
import com.liferay.portal.kernel.util.FastDateFormatFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;

import java.text.Format;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * @author Eudaldo Alonso
 */
public class ObjectEntryUtil {

	public static ObjectEntry toObjectEntry(
		long objectDefinitionId,
		com.liferay.object.rest.dto.v1_0.ObjectEntry objectEntry) {

		ObjectEntry serviceBuilderObjectEntry =
			ObjectEntryLocalServiceUtil.createObjectEntry(0L);

		serviceBuilderObjectEntry.setExternalReferenceCode(
			objectEntry.getExternalReferenceCode());
		serviceBuilderObjectEntry.setObjectEntryId(
			GetterUtil.getLong(objectEntry.getId()));
		serviceBuilderObjectEntry.setObjectDefinitionId(objectDefinitionId);

		return new ProxyObjectEntry(serviceBuilderObjectEntry, objectEntry);
	}

	public static Map<String, Object> toProperties(
		InfoItemFieldValues infoItemFieldValues) {

		Map<String, Object> properties = new HashMap<>();

		for (InfoFieldValue<Object> infoFieldValue :
				infoItemFieldValues.getInfoFieldValues()) {

			InfoField<?> infoField = infoFieldValue.getInfoField();

			Object value = infoFieldValue.getValue();

			if (Objects.equals(
					DateInfoFieldType.INSTANCE, infoField.getInfoFieldType()) &&
				(value instanceof Date)) {

				Format format = FastDateFormatFactoryUtil.getSimpleDateFormat(
					"yyyy-MM-dd");

				properties.put(infoField.getName(), format.format(value));
			}
			else if (Objects.equals(
						DateTimeInfoFieldType.INSTANCE,
						infoField.getInfoFieldType()) &&
					 (value instanceof LocalDateTime)) {

				DateTimeFormatter dateTimeFormatter =
					DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

				properties.put(
					infoField.getName(),
					dateTimeFormatter.format((LocalDateTime)value));
			}
			else {
				properties.put(infoField.getName(), value);
			}
		}

		return properties;
	}

}