/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.action.trigger.messaging;

import com.liferay.object.action.engine.ObjectActionEngine;
import com.liferay.object.internal.entry.util.ObjectEntryUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.messaging.BaseMessageListener;
import com.liferay.portal.kernel.messaging.Destination;
import com.liferay.portal.kernel.messaging.DestinationConfiguration;
import com.liferay.portal.kernel.messaging.DestinationFactory;
import com.liferay.portal.kernel.messaging.DestinationNames;
import com.liferay.portal.kernel.messaging.Message;
import com.liferay.portal.kernel.messaging.MessageListener;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;

import java.util.ArrayList;
import java.util.List;

import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leov
 */
@Component(
	property = {
		"destination.name=" + DestinationNames.OBJECT_ENTRY_ATTACHMENT_DOWNLOAD,
		"destination.name=" + DestinationNames.OBJECT_ENTRY_ON_AFTER_ADD
	},
	service = MessageListener.class
)
public class ObjectActionsTriggerMessageListener extends BaseMessageListener {

	@Activate
	protected void activate(BundleContext bundleContext) {
		_registerService(
			bundleContext, DestinationNames.OBJECT_ENTRY_ON_AFTER_ADD);

		_registerService(
			bundleContext, DestinationNames.OBJECT_ENTRY_ATTACHMENT_DOWNLOAD);
	}

	@Deactivate
	protected void deactivate() {
		_serviceRegistrations.forEach(ServiceRegistration::unregister);

		_serviceRegistrations.clear();
	}

	@Override
	protected void doReceive(Message message) throws Exception {
		String objectDefinitionExternalReferenceCode = message.getString(
			"objectDefinitionExternalReferenceCode");
		long companyId = message.getLong("companyId");

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.
				fetchObjectDefinitionByExternalReferenceCode(
					objectDefinitionExternalReferenceCode, companyId);

		if (objectDefinition == null) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					StringBundler.concat(
						"Object definition is null for external reference ",
						"code ", objectDefinitionExternalReferenceCode,
						" and company ", companyId));

				return;
			}
		}

		String objectEntryExternalReferenceCode = message.getString(
			"objectEntryExternalReferenceCode");

		ObjectEntry objectEntry = _objectEntryLocalService.fetchObjectEntry(
			objectEntryExternalReferenceCode,
			objectDefinition.getObjectDefinitionId());

		if (objectEntry == null) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					StringBundler.concat(
						"Object entry is null for external reference code ",
						objectEntryExternalReferenceCode,
						" and object definition ",
						objectDefinitionExternalReferenceCode));

				return;
			}
		}

		String objectActionTrigger = message.getString("actionTrigger");

		_objectActionEngine.executeObjectActions(
			objectDefinition.getClassName(), message.getLong("companyId"),
			objectActionTrigger,
			() -> ObjectEntryUtil.getPayloadJSONObject(
				_dtoConverterRegistry, _jsonFactory, objectActionTrigger,
				objectDefinition, objectEntry, null,
				_userLocalService.getUser(message.getLong("userId"))),
			message.getLong("userId"));
	}

	private void _registerService(
		BundleContext bundleContext, String destinationName) {

		DestinationConfiguration afterCreateDestinationConfiguration =
			new DestinationConfiguration(
				DestinationConfiguration.DESTINATION_TYPE_SYNCHRONOUS,
				destinationName);

		Destination afterCreationDestination =
			_destinationFactory.createDestination(
				afterCreateDestinationConfiguration);

		_serviceRegistrations.add(
			bundleContext.registerService(
				Destination.class, afterCreationDestination,
				MapUtil.singletonDictionary(
					"destination.name", afterCreationDestination.getName())));
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectActionsTriggerMessageListener.class);

	@Reference
	private DestinationFactory _destinationFactory;

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

	private final List<ServiceRegistration<Destination>> _serviceRegistrations =
		new ArrayList<>();

	@Reference
	private UserLocalService _userLocalService;

}