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
import com.liferay.notification.term.contributor.NotificationTermContributor;
import com.liferay.notification.type.NotificationType;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.HashMapDictionaryBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.ProxyUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;

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

	@BeforeClass
	public static void setUpClass() {
		Bundle bundle = FrameworkUtil.getBundle(
			NotificationTemplateLocalServiceTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		bundleContext.registerService(
			NotificationType.class,
			(NotificationType)ProxyUtil.newProxyInstance(
				NotificationType.class.getClassLoader(),
				new Class<?>[] {NotificationType.class},
				(proxy, method, args) -> {
					if (Objects.equals(method.getName(), "getKey")) {
						return "notificationTypeKey";
					}

					if (Objects.equals(method.getName(), "getClassName")) {
						return "";
					}

					if (Objects.equals(method.getName(), "getClassPK")) {
						return 0L;
					}

					return null;
				}),
			HashMapDictionaryBuilder.put(
				"notification.type.key", "notificationTypeKey"
			).build());

		bundleContext.registerService(
			NotificationTermContributor.class,
			(NotificationTermContributor)ProxyUtil.newProxyInstance(
				NotificationTermContributor.class.getClassLoader(),
				new Class<?>[] {NotificationTermContributor.class},
				(proxy, method, args) -> {
					if (Objects.equals(method.getName(), "getTermValue")) {
						HashMap<String, String> object =
							(HashMap<String, String>)args[1];

						return object.get((String)args[2]);
					}

					return null;
				}),
			HashMapDictionaryBuilder.put(
				"notification.type.key", "notificationTypeKey"
			).build());
	}

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
		String term = "[%able%]";

		NotificationTemplate notificationTemplate =
			_notificationTemplateLocalService.addNotificationTemplate(
				TestPropsValues.getUserId(), 0, term,
				Collections.singletonMap(LocaleUtil.US, term), term, "",
				term + "@liferay.com",
				Collections.singletonMap(LocaleUtil.US, term), "New Template",
				Collections.singletonMap(LocaleUtil.US, term),
				Collections.singletonMap(LocaleUtil.US, term + "@liferay.com"),
				Collections.emptyList());

		_notificationTemplateLocalService.sendNotificationTemplate(
			TestPropsValues.getUserId(),
			notificationTemplate.getNotificationTemplateId(),
			"notificationTypeKey",
			HashMapBuilder.put(
				term, "ableValue"
			).build());

		List<NotificationQueueEntry> notificationQueueEntries =
			_notificationQueueEntryLocalService.getNotificationQueueEntries(
				QueryUtil.ALL_POS, QueryUtil.ALL_POS);

		NotificationQueueEntry notificationQueueEntry =
			notificationQueueEntries.get(notificationQueueEntries.size() - 1);

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