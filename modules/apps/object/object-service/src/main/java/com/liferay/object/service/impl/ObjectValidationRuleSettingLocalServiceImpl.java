/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.impl;

import com.liferay.object.constants.ObjectValidationRuleConstants;
import com.liferay.object.constants.ObjectValidationRuleSettingConstants;
import com.liferay.object.exception.ObjectValidationRuleSettingCountException;
import com.liferay.object.model.ObjectValidationRule;
import com.liferay.object.model.ObjectValidationRuleSetting;
import com.liferay.object.service.base.ObjectValidationRuleSettingLocalServiceBaseImpl;
import com.liferay.object.service.persistence.ObjectValidationRulePersistence;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.SetUtil;
import com.liferay.portal.kernel.util.StringUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = "model.class.name=com.liferay.object.model.ObjectValidationRuleSetting",
	service = AopService.class
)
public class ObjectValidationRuleSettingLocalServiceImpl
	extends ObjectValidationRuleSettingLocalServiceBaseImpl {

	@Override
	public ObjectValidationRuleSetting addObjectValidationRuleSetting(
			long userId, long objectValidationRuleId, String name, String value)
		throws PortalException {

		_objectValidationRulePersistence.findByPrimaryKey(
			objectValidationRuleId);

		ObjectValidationRuleSetting objectValidationRuleSetting =
			objectValidationRuleSettingPersistence.create(
				counterLocalService.increment());

		User user = _userLocalService.getUser(userId);

		objectValidationRuleSetting.setCompanyId(user.getCompanyId());
		objectValidationRuleSetting.setUserId(user.getUserId());
		objectValidationRuleSetting.setUserName(user.getFullName());

		objectValidationRuleSetting.setObjectValidationRuleId(
			objectValidationRuleId);
		objectValidationRuleSetting.setName(name);
		objectValidationRuleSetting.setValue(value);

		return objectValidationRuleSettingPersistence.update(
			objectValidationRuleSetting);
	}

	@Override
	public List<ObjectValidationRuleSetting> updateObjectValidationRuleSettings(
			ObjectValidationRule objectValidationRule,
			List<ObjectValidationRuleSetting> objectValidationRuleSettings)
		throws PortalException {

		List<ObjectValidationRuleSetting> keyObjectValidationRuleSettings =
			new ArrayList<>();

		List<ObjectValidationRuleSetting> outputObjectValidationRuleSettings =
			new ArrayList<>();

		for (ObjectValidationRuleSetting objectValidationRuleSetting :
				objectValidationRuleSettings) {

			if (objectValidationRuleSetting.compareName(
					ObjectValidationRuleSettingConstants.
						NAME_COMPOSITE_KEY_OBJECT_FIELD_ID)) {

				keyObjectValidationRuleSettings.add(
					objectValidationRuleSetting);

				continue;
			}

			outputObjectValidationRuleSettings.add(objectValidationRuleSetting);
		}

		long userId = objectValidationRule.getUserId();

		User user = _userLocalService.getUser(userId);

		if (StringUtil.equals(
				objectValidationRule.getEngine(),
				ObjectValidationRuleConstants.ENGINE_TYPE_COMPOSITE_KEY) &&
			(keyObjectValidationRuleSettings.size() < 2)) {

			throw new ObjectValidationRuleSettingCountException(
				StringBundler.concat(
					"The ", objectValidationRule.getName(user.getLocale()),
					" Unique Composite Key must have at least two Object ",
					"Fields to compose the Object Validation Rule"));
		}

		long objectValidationRuleId =
			objectValidationRule.getObjectValidationRuleId();

		_deleteOldObjectValidationRuleSettings(
			objectValidationRuleId,
			ObjectValidationRuleSettingConstants.
				NAME_COMPOSITE_KEY_OBJECT_FIELD_ID,
			keyObjectValidationRuleSettings,
			objectValidationRuleSettingPersistence.findByOVRI_N(
				objectValidationRuleId,
				ObjectValidationRuleSettingConstants.
					NAME_COMPOSITE_KEY_OBJECT_FIELD_ID));

		_deleteOldObjectValidationRuleSettings(
			objectValidationRuleId,
			ObjectValidationRuleSettingConstants.NAME_OUTPUT_OBJECT_FIELD_ID,
			outputObjectValidationRuleSettings,
			objectValidationRuleSettingPersistence.findByOVRI_N(
				objectValidationRuleId,
				ObjectValidationRuleSettingConstants.
					NAME_OUTPUT_OBJECT_FIELD_ID));

		return _addOrUpdateObjectValidationRuleSetting(
			objectValidationRuleId, objectValidationRuleSettings, userId);
	}

	private List<ObjectValidationRuleSetting>
			_addOrUpdateObjectValidationRuleSetting(
				long objectValidationRuleId,
				List<ObjectValidationRuleSetting> objectValidationRuleSettings,
				long userId)
		throws PortalException {

		List<ObjectValidationRuleSetting> updatedObjectValidationRuleSettings =
			new ArrayList<>();

		for (ObjectValidationRuleSetting objectValidationRuleSetting :
				objectValidationRuleSettings) {

			ObjectValidationRuleSetting
				serviceBuilderObjectValidationRuleSetting =
					objectValidationRuleSettingPersistence.fetchByOVRI_N_V(
						objectValidationRuleId,
						objectValidationRuleSetting.getName(),
						objectValidationRuleSetting.getValue());

			if (serviceBuilderObjectValidationRuleSetting != null) {
				serviceBuilderObjectValidationRuleSetting.setName(
					objectValidationRuleSetting.getName());
				serviceBuilderObjectValidationRuleSetting.setValue(
					objectValidationRuleSetting.getValue());

				updatedObjectValidationRuleSettings.add(
					updateObjectValidationRuleSetting(
						serviceBuilderObjectValidationRuleSetting));

				continue;
			}

			updatedObjectValidationRuleSettings.add(
				addObjectValidationRuleSetting(
					userId, objectValidationRuleId,
					objectValidationRuleSetting.getName(),
					objectValidationRuleSetting.getValue()));
		}

		return updatedObjectValidationRuleSettings;
	}

	private void _deleteOldObjectValidationRuleSettings(
			long objectValidationRuleId, String objectValidationRuleSettingName,
			List<ObjectValidationRuleSetting> objectValidationRuleSettings,
			List<ObjectValidationRuleSetting> oldObjectValidationRuleSettings)
		throws PortalException {

		Set<String> deleteOldObjectObjectValidationRuleSettingValues =
			SetUtil.asymmetricDifference(
				TransformUtil.transform(
					oldObjectValidationRuleSettings,
					ObjectValidationRuleSetting::getValue),
				TransformUtil.transform(
					objectValidationRuleSettings,
					ObjectValidationRuleSetting::getValue));

		for (String deleteOldObjectObjectValidationRuleSettingValue :
				deleteOldObjectObjectValidationRuleSettingValues) {

			ObjectValidationRuleSetting
				serviceBuilderObjectValidationRuleSetting =
					objectValidationRuleSettingPersistence.findByOVRI_N_V(
						objectValidationRuleId, objectValidationRuleSettingName,
						deleteOldObjectObjectValidationRuleSettingValue);

			deleteObjectValidationRuleSetting(
				serviceBuilderObjectValidationRuleSetting.
					getObjectValidationRuleSettingId());
		}
	}

	@Reference
	private ObjectValidationRulePersistence _objectValidationRulePersistence;

	@Reference
	private UserLocalService _userLocalService;

}