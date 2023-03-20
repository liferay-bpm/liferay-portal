/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.notification.web.internal.portlet.action;

import com.liferay.notification.constants.NotificationPortletKeys;
import com.liferay.object.definition.notification.term.util.ObjectDefinitionNotificationTermUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCResourceCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.StringUtil;

import java.util.List;
import java.util.Map;

import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Paulo Albuquerque
 */
@Component(
	property = {
		"javax.portlet.name=" + NotificationPortletKeys.NOTIFICATION_TEMPLATES,
		"mvc.command.name=/notification_templates/get_notification_template_init_data"
	},
	service = MVCResourceCommand.class
)
public class GetNotificationTemplateInitDataMVCResourceCommand
	extends BaseMVCResourceCommand {

	@Override
	protected void doServeResource(
			ResourceRequest resourceRequest, ResourceResponse resourceResponse)
		throws Exception {

		_objectDefinition = _objectDefinitionLocalService.fetchObjectDefinition(
			ParamUtil.getLong(resourceRequest, "objectDefinitionId"));

		if (_objectDefinition == null) {
			return;
		}

		User user = _userLocalService.getUser(PrincipalThreadLocal.getUserId());

		Map<String, String> authorObjectFieldNames = HashMapBuilder.put(
			"author-email-address", "AUTHOR_EMAIL_ADDRESS"
		).put(
			"author-first-name", "AUTHOR_FIRST_NAME"
		).put(
			"author-id", "AUTHOR_ID"
		).put(
			"author-last-name", "AUTHOR_LAST_NAME"
		).put(
			"author-middle-name", "AUTHOR_MIDDLE_NAME"
		).put(
			"author-prefix", "AUTHOR_PREFIX"
		).put(
			"author-suffix", "AUTHOR_SUFFIX"
		).build();

		List<ObjectField> objectFields =
			_objectFieldLocalService.getObjectFields(
				_objectDefinition.getObjectDefinitionId());

		JSONArray termsJSONArray = _jsonFactory.createJSONArray();

		for (ObjectField objectField : objectFields) {
			if (StringUtil.equals(objectField.getName(), "creator") &&
				FeatureFlagManagerUtil.isEnabled("LPS-171625")) {

				authorObjectFieldNames.forEach(
					(termLabel, objectFieldName) -> termsJSONArray.put(
						JSONUtil.put(
							"termLabel",
							_language.get(user.getLocale(), termLabel)
						).put(
							"termName", _getTermName(objectFieldName)
						)));
			}
			else {
				termsJSONArray.put(
					JSONUtil.put(
						"termLabel", objectField.getLabel(user.getLocale())
					).put(
						"termName", _getTermName(objectField.getName())
					));
			}
		}

		List<ObjectRelationship> objectRelationships =
			_objectRelationshipLocalService.
				getObjectRelationshipsByObjectDefinitionId2(
					_objectDefinition.getObjectDefinitionId());

		JSONArray relationshipSectionsJSONArray =
			_jsonFactory.createJSONArray();

		for (ObjectRelationship objectRelationship : objectRelationships) {
			ObjectDefinition objectDefinition =
				_objectDefinitionLocalService.getObjectDefinition(
					objectRelationship.getObjectDefinitionId1());

			relationshipSectionsJSONArray.put(
				JSONUtil.put(
					"relationshipId",
					objectRelationship.getObjectRelationshipId()
				).put(
					"sectionLabel",
					StringBundler.concat(
						objectRelationship.getLabel(user.getLocale()),
						StringPool.SPACE, StringPool.OPEN_PARENTHESIS,
						StringUtil.upperCase(
							objectDefinition.getLabel(user.getLocale())),
						StringPool.CLOSE_PARENTHESIS)
				));
		}

		JSONPortletResponseUtil.writeJSON(
			resourceRequest, resourceResponse,
			JSONUtil.put(
				"relationshipSections", relationshipSectionsJSONArray
			).put(
				"terms", termsJSONArray
			));
	}

	private String _getTermName(String objectFieldName) {
		return ObjectDefinitionNotificationTermUtil.getObjectFieldTermName(
			_objectDefinition.getShortName(), objectFieldName);
	}

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private Language _language;

	private ObjectDefinition _objectDefinition;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectFieldLocalService _objectFieldLocalService;

	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Reference
	private UserLocalService _userLocalService;

}