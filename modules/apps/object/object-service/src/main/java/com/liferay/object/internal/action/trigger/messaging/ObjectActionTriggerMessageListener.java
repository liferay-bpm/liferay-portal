/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.action.trigger.messaging;

import com.liferay.object.action.engine.ObjectActionEngine;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.internal.entry.util.ObjectEntryUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
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
import com.liferay.portal.kernel.util.StringUtil;
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
		"destination.name=" + DestinationNames.OBJECT_ENTRY_ON_AFTER_ADD,
		"destination.name=" + DestinationNames.OBJECT_ENTRY_ON_AFTER_UPDATE
	},
	service = MessageListener.class
)
public class ObjectActionTriggerMessageListener extends BaseMessageListener {

	@Activate
	protected void activate(BundleContext bundleContext) {
		_registerService(
			bundleContext, DestinationNames.OBJECT_ENTRY_ON_AFTER_ADD);

		_registerService(
			bundleContext, DestinationNames.OBJECT_ENTRY_ON_AFTER_UPDATE);

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

		String objectActionTrigger = message.getString("objectActionTrigger");

		_objectActionEngine.executeObjectActions(
			objectDefinition.getClassName(), message.getLong("companyId"),
			objectActionTrigger,
			() -> ObjectEntryUtil.getPayloadJSONObject(
				_dtoConverterRegistry, _jsonFactory, objectActionTrigger,
				objectDefinition, objectEntry, null,
				_userLocalService.getUser(message.getLong("userId"))),
			message.getLong("userId"));

		if (!FeatureFlagManagerUtil.isEnabled("LPS-187142") ||
			(!objectDefinition.isRootDescendantNode() &&
			 (!objectDefinition.isRootNode() ||
			  StringUtil.equals(
				  objectActionTrigger,
				  ObjectActionTriggerConstants.KEY_ON_AFTER_ADD)))) {

			return;
		}

		ObjectEntry rootObjectEntry = _objectEntryLocalService.fetchObjectEntry(
			objectEntry.getRootObjectEntryId());

		if (rootObjectEntry == null) {
			return;
		}

		ObjectDefinition rootObjectDefinition =
			_objectDefinitionLocalService.getObjectDefinition(
				rootObjectEntry.getObjectDefinitionId());

		_objectActionEngine.executeObjectActions(
			rootObjectDefinition.getClassName(), message.getLong("companyId"),
			ObjectActionTriggerConstants.KEY_ON_AFTER_ROOT_UPDATE,
			() -> ObjectEntryUtil.getPayloadJSONObject(
				_dtoConverterRegistry, _jsonFactory,
				ObjectActionTriggerConstants.KEY_ON_AFTER_ROOT_UPDATE,
				rootObjectDefinition, rootObjectEntry, null,
				_userLocalService.getUser(message.getLong("userId"))),
			message.getLong("userId"));
	}

	private void _registerService(
		BundleContext bundleContext, String destinationName) {

		DestinationConfiguration destinationConfiguration =
			new DestinationConfiguration(
				DestinationConfiguration.DESTINATION_TYPE_SYNCHRONOUS,
				destinationName);

		Destination destination = _destinationFactory.createDestination(
			destinationConfiguration);

		_serviceRegistrations.add(
			bundleContext.registerService(
				Destination.class, destination,
				MapUtil.singletonDictionary(
					"destination.name", destination.getName())));
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectActionTriggerMessageListener.class);

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