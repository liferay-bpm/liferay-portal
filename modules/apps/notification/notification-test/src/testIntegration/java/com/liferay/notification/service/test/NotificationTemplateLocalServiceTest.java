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

package com.liferay.notification.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.notification.exception.NotificationTemplateFromException;
import com.liferay.notification.exception.NotificationTemplateNameException;
import com.liferay.notification.model.NotificationQueueEntry;
import com.liferay.notification.model.NotificationTemplate;
import com.liferay.notification.service.NotificationQueueEntryLocalService;
import com.liferay.notification.service.NotificationTemplateLocalService;
import com.liferay.object.action.util.ObjectActionVariablesUtil;
import com.liferay.object.constants.ObjectActionExecutorConstants;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.util.LocalizedMapUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.UnicodePropertiesBuilder;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.io.Serializable;

import java.util.Collections;
import java.util.List;

import org.apache.commons.lang.StringUtils;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Gustavo Lima
 * @author Gabriel Albuquerque
 */
@RunWith(Arquillian.class)
public class NotificationTemplateLocalServiceTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testAddNotificationTemplate() throws Exception {
		try {
			_addNotificationTemplate("", RandomTestUtil.randomString());

			Assert.fail();
		}
		catch (NotificationTemplateNameException
					notificationTemplateNameException) {

			Assert.assertEquals(
				"Name is null", notificationTemplateNameException.getMessage());
		}

		try {
			_addNotificationTemplate(RandomTestUtil.randomString(), "");

			Assert.fail();
		}
		catch (NotificationTemplateFromException
					notificationTemplateFromException) {

			Assert.assertEquals(
				"From is null", notificationTemplateFromException.getMessage());
		}

		NotificationTemplate notificationTemplate = _addNotificationTemplate(
			RandomTestUtil.randomString(), RandomTestUtil.randomString());

		Assert.assertNotNull(notificationTemplate);
		Assert.assertNotNull(
			_notificationTemplateLocalService.fetchNotificationTemplate(
				notificationTemplate.getNotificationTemplateId()));
	}

	@Test
	public void testDeleteNotificationTemplate() throws Exception {
		NotificationTemplate notificationTemplate = _addNotificationTemplate(
			RandomTestUtil.randomString(), RandomTestUtil.randomString());

		NotificationQueueEntry notificationQueueEntry =
			_notificationQueueEntryLocalService.addNotificationQueueEntry(
				TestPropsValues.getUserId(),
				notificationTemplate.getNotificationTemplateId(),
				notificationTemplate.getBcc(),
				notificationTemplate.getBody(LocaleUtil.US),
				notificationTemplate.getCc(), RandomTestUtil.randomString(), 0,
				notificationTemplate.getFrom(),
				notificationTemplate.getFromName(LocaleUtil.US), 0,
				notificationTemplate.getSubject(LocaleUtil.US),
				notificationTemplate.getTo(LocaleUtil.US),
				RandomTestUtil.randomString(), Collections.emptyList());

		Assert.assertEquals(
			notificationTemplate.getNotificationTemplateId(),
			notificationQueueEntry.getNotificationTemplateId());

		_notificationTemplateLocalService.deleteNotificationTemplate(
			notificationTemplate.getNotificationTemplateId());

		notificationQueueEntry =
			_notificationQueueEntryLocalService.fetchNotificationQueueEntry(
				notificationQueueEntry.getNotificationQueueEntryId());

		Assert.assertEquals(
			0, notificationQueueEntry.getNotificationTemplateId());
	}

	@Test
	public void testSendNotificationTemplate() throws Exception {
		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				TestPropsValues.getUserId(),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"A" + RandomTestUtil.randomString(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.emptyList());

		ObjectField objectField = _objectFieldLocalService.addCustomObjectField(
			TestPropsValues.getUserId(), 0,
			objectDefinition.getObjectDefinitionId(),
			ObjectFieldConstants.BUSINESS_TYPE_TEXT,
			ObjectFieldConstants.DB_TYPE_STRING, null, true, true, null,
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			"ableField", false, false, Collections.emptyList());

		_objectDefinitionLocalService.publishCustomObjectDefinition(
			TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId());

		String objectDefinitionName = objectDefinition.getName();

		String term = StringUtils.upperCase(
			StringBundler.concat(
				"[%", objectDefinitionName.substring(2), "_",
				objectField.getName(), "%]"));

		NotificationTemplate notificationTemplate =
			_notificationTemplateLocalService.addNotificationTemplate(
				TestPropsValues.getUserId(),
				objectDefinition.getObjectDefinitionId(), term,
				Collections.singletonMap(LocaleUtil.US, term), term, "",
				term + "@liferay.com",
				Collections.singletonMap(LocaleUtil.US, term),
				objectDefinition.getName() + "Template",
				Collections.singletonMap(LocaleUtil.US, term),
				Collections.singletonMap(LocaleUtil.US, term + "@liferay.com"),
				Collections.emptyList());

		_objectActionLocalService.addObjectAction(
			TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId(), true, StringPool.BLANK,
			RandomTestUtil.randomString(), RandomTestUtil.randomString(),
			ObjectActionExecutorConstants.KEY_WEBHOOK,
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			UnicodePropertiesBuilder.put(
				"secret", "onafteradd"
			).put(
				"url", "https://onafteradd.com"
			).build());

		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"ableField", "ableValue"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		_notificationTemplateLocalService.sendNotificationTemplate(
			TestPropsValues.getUserId(),
			notificationTemplate.getNotificationTemplateId(),
			objectDefinition.getClassName(),
			ObjectActionVariablesUtil.toVariables(
				null, objectDefinition,
				_getPayloadJSONObject(objectDefinition, objectEntry), null));

		List<NotificationQueueEntry> notificationQueueEntries =
			_notificationQueueEntryLocalService.getNotificationQueueEntries(
				QueryUtil.ALL_POS, QueryUtil.ALL_POS);

		NotificationQueueEntry notificationQueueEntry =
			notificationQueueEntries.get(1);

		Assert.assertNotNull(notificationQueueEntry);

		Assert.assertEquals(1, notificationQueueEntry.getStatus());
		Assert.assertEquals("ableValue", notificationQueueEntry.getBcc());
		Assert.assertEquals("ableValue", notificationQueueEntry.getCc());
		Assert.assertEquals(
			"ableValue@liferay.com", notificationQueueEntry.getFrom());
		Assert.assertEquals(
			"ableValue@liferay.com", notificationQueueEntry.getTo());
	}

	private NotificationTemplate _addNotificationTemplate(
			String name, String from)
		throws PortalException {

		return _notificationTemplateLocalService.addNotificationTemplate(
			TestPropsValues.getUserId(), 0, RandomTestUtil.randomString(),
			Collections.singletonMap(
				LocaleUtil.US, RandomTestUtil.randomString()),
			RandomTestUtil.randomString(), RandomTestUtil.randomString(), from,
			Collections.singletonMap(
				LocaleUtil.US, RandomTestUtil.randomString()),
			name,
			Collections.singletonMap(
				LocaleUtil.US, RandomTestUtil.randomString()),
			Collections.singletonMap(
				LocaleUtil.US, RandomTestUtil.randomString()),
			Collections.emptyList());
	}

	private JSONObject _getPayloadJSONObject(
		ObjectDefinition objectDefinition, ObjectEntry objectEntry) {

		JSONObject jsonObject = _jsonFactory.createJSONObject();

		jsonObject.put(
			"classPK", objectEntry.getObjectEntryId()
		).put(
			"companyId", objectDefinition.getCompanyId()
		).put(
			"objectActionTriggerKey", "onAfterAdd"
		).put(
			"objectDefinitionId", objectDefinition.getObjectDefinitionId()
		).put(
			"objectEntry",
			HashMapBuilder.putAll(
				objectEntry.getModelAttributes()
			).put(
				"values", objectEntry.getValues()
			).build()
		);

		return jsonObject;
	}

	@Inject
	private JSONFactory _jsonFactory;

	@Inject
	private NotificationQueueEntryLocalService
		_notificationQueueEntryLocalService;

	@Inject
	private NotificationTemplateLocalService _notificationTemplateLocalService;

	@Inject
	private ObjectActionLocalService _objectActionLocalService;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectFieldLocalService _objectFieldLocalService;

}