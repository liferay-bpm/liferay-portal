/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.model.listener;

import com.liferay.message.boards.model.MBMessage;
import com.liferay.object.action.engine.ObjectActionEngine;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.internal.entry.util.ObjectEntryUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.portal.kernel.exception.ModelListenerException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.ModelListener;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;

import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Carolina Barbosa
 */
@Component(service = ModelListener.class)
public class MBMessageModelListener extends BaseModelListener<MBMessage> {

	@Override
	public void onAfterCreate(MBMessage mbMessage)
		throws ModelListenerException {

		try {
			ObjectDefinition objectDefinition =
				_objectDefinitionLocalService.
					fetchObjectDefinitionByExternalReferenceCode(
						"L_CMP_PROJECT", mbMessage.getCompanyId());

			if ((objectDefinition == null) ||
				!Objects.equals(
					objectDefinition.getClassName(),
					mbMessage.getClassName())) {

				return;
			}

			ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
				mbMessage.getClassPK());

			if (objectEntry == null) {
				return;
			}

			_objectActionEngine.executeObjectActions(
				objectEntry.getModelClassName(), objectEntry.getCompanyId(),
				ObjectActionTriggerConstants.KEY_ON_AFTER_COMMENT,
				() -> ObjectEntryUtil.getPayloadJSONObject(
					_dtoConverterRegistry, _jsonFactory,
					ObjectActionTriggerConstants.KEY_ON_AFTER_COMMENT,
					objectDefinition, objectEntry, null, null,
					_userLocalService.getUser(mbMessage.getUserId())),
				mbMessage.getUserId());
		}
		catch (PortalException portalException) {
			throw new ModelListenerException(portalException);
		}
	}

	@Reference
	private DTOConverterRegistry _dtoConverterRegistry;

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private ObjectActionEngine _objectActionEngine;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

	@Reference
	private UserLocalService _userLocalService;

}