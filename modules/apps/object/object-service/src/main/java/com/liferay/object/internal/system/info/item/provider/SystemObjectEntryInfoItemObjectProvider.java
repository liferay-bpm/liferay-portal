/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.system.info.item.provider;

import com.liferay.info.exception.NoSuchInfoItemException;
import com.liferay.info.item.ClassPKInfoItemIdentifier;
import com.liferay.info.item.ERCInfoItemIdentifier;
import com.liferay.info.item.InfoItemIdentifier;
import com.liferay.info.item.provider.InfoItemObjectProvider;
import com.liferay.object.entry.util.ObjectEntryDTOConverterUtil;
import com.liferay.object.system.SystemObjectDefinitionManager;
import com.liferay.object.system.SystemObjectEntry;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.vulcan.dto.converter.DTOConverter;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;
import com.liferay.portal.vulcan.util.ObjectMapperUtil;

import java.util.Collections;
import java.util.Map;

import org.osgi.service.component.annotations.Component;

/**
 * @author Carolina Barbosa
 */
@Component(
	property = {
		"info.item.identifier=com.liferay.info.item.ClassPKInfoItemIdentifier",
		"info.item.identifier=com.liferay.info.item.ERCInfoItemIdentifier"
	},
	service = InfoItemObjectProvider.class
)
public class SystemObjectEntryInfoItemObjectProvider
	implements InfoItemObjectProvider<SystemObjectEntry> {

	public SystemObjectEntryInfoItemObjectProvider(
		GroupLocalService groupLocalService,
		DTOConverterRegistry dtoConverterRegistry,
		SystemObjectDefinitionManager systemObjectDefinitionManager) {

		_groupLocalService = groupLocalService;
		_dtoConverterRegistry = dtoConverterRegistry;
		_systemObjectDefinitionManager = systemObjectDefinitionManager;
	}

	@Override
	public SystemObjectEntry getInfoItem(InfoItemIdentifier infoItemIdentifier)
		throws NoSuchInfoItemException {

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		ThemeDisplay themeDisplay = serviceContext.getThemeDisplay();

		return getInfoItem(themeDisplay.getScopeGroupId(), infoItemIdentifier);
	}

	@Override
	public SystemObjectEntry getInfoItem(
			long groupId, InfoItemIdentifier infoItemIdentifier)
		throws NoSuchInfoItemException {

		if (!(infoItemIdentifier instanceof ClassPKInfoItemIdentifier) &&
			!(infoItemIdentifier instanceof ERCInfoItemIdentifier)) {

			throw new NoSuchInfoItemException(
				"Unsupported info item identifier " + infoItemIdentifier);
		}

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (infoItemIdentifier instanceof ClassPKInfoItemIdentifier) {
			ClassPKInfoItemIdentifier classPKInfoItemIdentifier =
				(ClassPKInfoItemIdentifier)infoItemIdentifier;

			try {
				ThemeDisplay themeDisplay = serviceContext.getThemeDisplay();

				if (themeDisplay == null) {
					return new SystemObjectEntry(
						classPKInfoItemIdentifier.getClassPK(), "",
						Collections.emptyMap());
				}

				DTOConverter<?, ?> dtoConverter =
					ObjectEntryDTOConverterUtil.getDTOConverter(
						_dtoConverterRegistry, _systemObjectDefinitionManager);

				Object dto = dtoConverter.toDTO(
					new DefaultDTOConverterContext(
						false, Collections.emptyMap(), _dtoConverterRegistry,
						classPKInfoItemIdentifier.getClassPK(),
						themeDisplay.getLocale(), null,
						themeDisplay.getUser()));

				if (dto == null) {
					return new SystemObjectEntry(
						classPKInfoItemIdentifier.getClassPK(), "",
						Collections.emptyMap());
				}

				return new SystemObjectEntry(
					classPKInfoItemIdentifier.getClassPK(), "",
					ObjectMapperUtil.readValue(Map.class, dto.toString()));
			}
			catch (Exception exception) {
				if (_log.isDebugEnabled()) {
					_log.debug(exception);
				}

				throw new NoSuchInfoItemException(
					"Unable to get info item for " +
						classPKInfoItemIdentifier.getClassPK());
			}
		}

		ERCInfoItemIdentifier ercInfoItemIdentifier =
			(ERCInfoItemIdentifier)infoItemIdentifier;

		Group group = _groupLocalService.fetchGroup(groupId);

		if (Validator.isNotNull(
				ercInfoItemIdentifier.getScopeExternalReferenceCode())) {

			try {
				group = _groupLocalService.getGroupByExternalReferenceCode(
					ercInfoItemIdentifier.getScopeExternalReferenceCode(),
					serviceContext.getCompanyId());
			}
			catch (PortalException portalException) {
				throw new NoSuchInfoItemException(
					StringBundler.concat(
						"No group found with external reference code ",
						ercInfoItemIdentifier.getScopeExternalReferenceCode(),
						" and company ID ", serviceContext.getCompanyId()),
					portalException);
			}
		}

		try {
			ThemeDisplay themeDisplay = serviceContext.getThemeDisplay();

			Object dto = ObjectEntryDTOConverterUtil.toDTO(
				_systemObjectDefinitionManager.
					getBaseModelByExternalReferenceCode(
						ercInfoItemIdentifier.getExternalReferenceCode(),
						group.getCompanyId()),
				_dtoConverterRegistry, _systemObjectDefinitionManager,
				themeDisplay.getUser());

			if (dto == null) {
				return new SystemObjectEntry(
					0L, ercInfoItemIdentifier.getExternalReferenceCode(),
					Collections.emptyMap());
			}

			return new SystemObjectEntry(
				0L, ercInfoItemIdentifier.getExternalReferenceCode(),
				ObjectMapperUtil.readValue(Map.class, dto.toString()));
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}

			throw new NoSuchInfoItemException(
				"Unable to get info item for " +
					ercInfoItemIdentifier.getExternalReferenceCode());
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		SystemObjectEntryInfoItemObjectProvider.class);

	private final DTOConverterRegistry _dtoConverterRegistry;
	private final GroupLocalService _groupLocalService;
	private final SystemObjectDefinitionManager _systemObjectDefinitionManager;

}