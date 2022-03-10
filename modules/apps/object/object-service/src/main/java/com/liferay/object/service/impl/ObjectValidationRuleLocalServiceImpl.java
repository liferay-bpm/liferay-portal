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

package com.liferay.object.service.impl;

import com.liferay.object.exception.ObjectValidationException;
import com.liferay.object.model.ObjectValidationRule;
import com.liferay.object.service.base.ObjectValidationRuleLocalServiceBaseImpl;
import com.liferay.object.validation.rule.ObjectValidationRuleEngine;
import com.liferay.object.validation.rule.ObjectValidationRuleEngineServicesTracker;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.BaseModel;
import com.liferay.portal.kernel.model.SystemEventConstants;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.systemevent.SystemEvent;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
 */
@Component(
	property = "model.class.name=com.liferay.object.model.ObjectValidationRule",
	service = AopService.class
)
public class ObjectValidationRuleLocalServiceImpl
	extends ObjectValidationRuleLocalServiceBaseImpl {

	@Override
	public ObjectValidationRule addObjectValidationRule(
			long userId, long objectDefinitionId, boolean active,
			Map<Locale, String> errorLabelMap, Map<Locale, String> nameMap,
			String engine, String script)
		throws PortalException {

		ObjectValidationRule objectValidationRule =
			objectValidationRulePersistence.create(
				counterLocalService.increment());

		User user = _userLocalService.getUser(userId);

		objectValidationRule.setCompanyId(user.getCompanyId());
		objectValidationRule.setUserId(user.getUserId());
		objectValidationRule.setUserName(user.getFullName());

		objectValidationRule.setObjectDefinitionId(objectDefinitionId);
		objectValidationRule.setActive(active);
		objectValidationRule.setErrorLabelMap(errorLabelMap);
		objectValidationRule.setNameMap(nameMap);
		objectValidationRule.setEngine(engine);
		objectValidationRule.setScript(script);

		return objectValidationRulePersistence.update(objectValidationRule);
	}

	@Override
	public ObjectValidationRule deleteObjectValidationRule(
			long objectValidationRuleId)
		throws PortalException {

		ObjectValidationRule objectValidationRule =
			objectValidationRulePersistence.findByPrimaryKey(
				objectValidationRuleId);

		return deleteObjectValidationRule(objectValidationRule);
	}

	@Override
	@SystemEvent(type = SystemEventConstants.TYPE_DELETE)
	public ObjectValidationRule deleteObjectValidationRule(
		ObjectValidationRule objectValidationRule) {

		return objectValidationRulePersistence.remove(objectValidationRule);
	}

	@Override
	public List<ObjectValidationRule> getObjectValidationRules(
		long objectDefinitionId, boolean active) {

		return objectValidationRulePersistence.findByODI_A(
			objectDefinitionId, active);
	}

	@Override
	public ObjectValidationRule updateObjectValidationRule(
			long objectValidationRuleId, boolean active,
			Map<Locale, String> errorLabelMap, Map<Locale, String> nameMap,
			String engine, String script)
		throws PortalException {

		ObjectValidationRule objectValidationRule =
			objectValidationRulePersistence.findByPrimaryKey(
				objectValidationRuleId);

		objectValidationRule.setActive(active);
		objectValidationRule.setErrorLabelMap(errorLabelMap);
		objectValidationRule.setNameMap(nameMap);
		objectValidationRule.setEngine(engine);
		objectValidationRule.setScript(script);

		return objectValidationRulePersistence.update(objectValidationRule);
	}

	@Override
	public void validate(
			long userId, long objectDefinitionId,
			BaseModel<?> originalBaseModel, BaseModel<?> baseModel)
		throws PortalException {

		List<ObjectValidationRule> objectValidationRules =
			objectValidationRuleLocalService.getObjectValidationRules(
				objectDefinitionId, true);

		for (ObjectValidationRule objectValidationRule :
				objectValidationRules) {

			ObjectValidationRuleEngine objectValidationRuleEngine =
				_objectValidationRuleEngineServicesTracker.
					getObjectValidationRuleEngine(
						objectValidationRule.getEngine());

			HashMapBuilder.HashMapWrapper<String, Object> hashMapWrapper =
				HashMapBuilder.<String, Object>putAll(
					baseModel.getModelAttributes());

			if (originalBaseModel != null) {
				Map<String, Object> modelAttributes =
					originalBaseModel.getModelAttributes();

				for (Map.Entry<String, Object> entry :
						modelAttributes.entrySet()) {

					hashMapWrapper.put(
						"original." + entry.getKey(), entry.getValue());
				}
			}

			if (userId > 0) {
				User user = _userLocalService.getUser(userId);

				hashMapWrapper.put(
					"user.emailAddress", user.getEmailAddress()
				).put(
					"user.firstName", user.getFirstName()
				).put(
					"user.lastName", user.getLastName()
				).put(
					"userId", userId
				);
			}

			if (!objectValidationRuleEngine.evaluate(
					hashMapWrapper.build(), objectValidationRule.getScript())) {

				throw new ObjectValidationException(
					objectValidationRule.getErrorLabel(
						LocaleUtil.getMostRelevantLocale()));
			}
		}
	}

	@Reference
	private ObjectValidationRuleEngineServicesTracker
		_objectValidationRuleEngineServicesTracker;

	@Reference
	private UserLocalService _userLocalService;

}