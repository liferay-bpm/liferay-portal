/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.info.item.provider;

import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.ERCInfoItemIdentifier;
import com.liferay.info.item.InfoItemClassDetails;
import com.liferay.info.item.InfoItemDetails;
import com.liferay.info.item.InfoItemIdentifier;
import com.liferay.info.item.InfoItemReference;
import com.liferay.info.item.provider.InfoItemDetailsProvider;
import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.LocaleUtil;

import java.util.Objects;

/**
 * @author Guilherme Camacho
 */
public class ObjectEntryInfoItemDetailsProvider
	implements InfoItemDetailsProvider<ObjectEntry> {

	public ObjectEntryInfoItemDetailsProvider(
		GroupLocalService groupLocalService,
		ObjectDefinition objectDefinition) {

		_groupLocalService = groupLocalService;
		_objectDefinition = objectDefinition;
	}

	@Override
	public InfoItemClassDetails getInfoItemClassDetails() {
		return new InfoItemClassDetails(
			_objectDefinition.getClassName(),
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
		ObjectEntry objectEntry) {

		if (!_objectDefinition.isDefaultStorageType()) {
			return new InfoItemDetails(
				getInfoItemClassDetails(),
				new InfoItemReference(
					_objectDefinition.getClassName(),
					new ERCInfoItemIdentifier(
						objectEntry.getExternalReferenceCode())));
		}

		if (Objects.equals(
				infoItemIdentifierClass, ClassPKInfoItemIdentifier.class)) {

			return new InfoItemDetails(
				getInfoItemClassDetails(),
				new InfoItemReference(
					_objectDefinition.getClassName(),
					objectEntry.getObjectEntryId()));
		}

		if (!Objects.equals(
				infoItemIdentifierClass, ERCInfoItemIdentifier.class)) {

			return null;
		}

		String scopeExternalReferenceCode = null;

		if (groupId != objectEntry.getGroupId()) {
			Group group = _groupLocalService.fetchGroup(
				objectEntry.getGroupId());

			scopeExternalReferenceCode = group.getExternalReferenceCode();
		}

		return new InfoItemDetails(
			getInfoItemClassDetails(),
			new InfoItemReference(
				_objectDefinition.getClassName(),
				new ERCInfoItemIdentifier(
					objectEntry.getExternalReferenceCode(),
					scopeExternalReferenceCode)));
	}

	@Override
	public InfoItemDetails getInfoItemDetails(ObjectEntry objectEntry) {
		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		return getInfoItemDetails(
			serviceContext.getScopeGroupId(), ClassPKInfoItemIdentifier.class,
			objectEntry);
	}

	private final GroupLocalService _groupLocalService;
	private final ObjectDefinition _objectDefinition;

}