/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.system.info.item.provider;

import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.ERCInfoItemIdentifier;
import com.liferay.info.item.InfoItemClassDetails;
import com.liferay.info.item.InfoItemDetails;
import com.liferay.info.item.InfoItemIdentifier;
import com.liferay.info.item.InfoItemReference;
import com.liferay.info.item.provider.InfoItemDetailsProvider;
import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.system.SystemObjectEntry;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.LocaleUtil;

import java.util.Map;
import java.util.Objects;

/**
 * @author Carolina Barbosa
 */
public class SystemObjectEntryInfoItemDetailsProvider
	implements InfoItemDetailsProvider<SystemObjectEntry> {

	public SystemObjectEntryInfoItemDetailsProvider(
		GroupLocalService groupLocalService, String itemClassName,
		ObjectDefinition objectDefinition) {

		_groupLocalService = groupLocalService;
		_itemClassName = itemClassName;
		_objectDefinition = objectDefinition;
	}

	@Override
	public InfoItemClassDetails getInfoItemClassDetails() {
		return new InfoItemClassDetails(
			_itemClassName,
			InfoLocalizedValue.<String>builder(
			).defaultLocale(
				LocaleUtil.fromLanguageId(
					_objectDefinition.getDefaultLanguageId())
			).values(
				_objectDefinition.getLabelMap()
			).build());
	}

	@Override
	public InfoItemDetails getInfoItemDetails(
		long groupId,
		Class<? extends InfoItemIdentifier> infoItemIdentifierClass,
		SystemObjectEntry systemObjectEntry) {

		if (Objects.equals(
				infoItemIdentifierClass, ClassPKInfoItemIdentifier.class)) {

			return new InfoItemDetails(
				getInfoItemClassDetails(),
				new InfoItemReference(
					_itemClassName, systemObjectEntry.getClassPK()));
		}

		if (!Objects.equals(
				infoItemIdentifierClass, ERCInfoItemIdentifier.class)) {

			return null;
		}

		Group group = _groupLocalService.fetchGroup(groupId);

		String scopeExternalReferenceCode = group.getExternalReferenceCode();

		Map<String, Object> values = systemObjectEntry.getValues();

		Long valuesGroupId = (Long)values.get("groupId");

		if ((valuesGroupId != null) && (valuesGroupId != groupId)) {
			group = _groupLocalService.fetchGroup(valuesGroupId);

			scopeExternalReferenceCode = group.getExternalReferenceCode();
		}

		return new InfoItemDetails(
			getInfoItemClassDetails(),
			new InfoItemReference(
				_itemClassName,
				new ERCInfoItemIdentifier(
					String.valueOf(values.get("externalReferenceCode")),
					scopeExternalReferenceCode)));
	}

	@Override
	public InfoItemDetails getInfoItemDetails(
		SystemObjectEntry systemObjectEntry) {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		return getInfoItemDetails(
			serviceContext.getScopeGroupId(), ClassPKInfoItemIdentifier.class,
			systemObjectEntry);
	}

	private final GroupLocalService _groupLocalService;
	private final String _itemClassName;
	private final ObjectDefinition _objectDefinition;

}