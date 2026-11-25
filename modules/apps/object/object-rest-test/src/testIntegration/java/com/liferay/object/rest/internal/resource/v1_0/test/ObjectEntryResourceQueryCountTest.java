/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.rest.test.util.ObjectEntryTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.randomizerbumpers.UniqueStringRandomizerBumper;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.HTTPTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.util.Http;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.URLCodec;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Alejandro Tardín
 */
@RunWith(Arquillian.class)
public class ObjectEntryResourceQueryCountTest
	extends BaseObjectEntryResourceTestCase {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Test
	@TestInfo("LPD-117379")
	public void testGetObjectEntriesPageWithFilter() throws Exception {

		// Object entries are loaded in one query

		_addObjectEntries(5);

		String endpoint = _getEndpoint();

		int objectEntryQueriesCount = _getQueriesCount(
			endpoint, 5, " ObjectEntry ");

		_addObjectEntries(5);

		Assert.assertEquals(
			objectEntryQueriesCount,
			_getQueriesCount(endpoint, 10, " ObjectEntry "));

		// View permission is not checked again for each object entry

		ObjectDefinition objectDefinition = getObjectDefinition1();
		Role role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);

		addResourcePermission(
			ActionKeys.VIEW, objectDefinition.getClassName(), role);

		String password = RandomTestUtil.randomString();

		User user = addUser(
			RandomTestUtil.randomString(UniqueStringRandomizerBumper.INSTANCE),
			password);

		roleLocalService.addUserRole(user.getUserId(), role.getRoleId());

		HTTPTestUtil.customize(
		).withCredentials(
			user.getEmailAddress(), password
		).apply(
			() -> {
				int resourcePermissionQueriesCount = _getQueriesCount(
					endpoint + "&restrictFields=actions", 10,
					" ResourcePermission ");

				_addObjectEntries(5);

				Assert.assertEquals(
					resourcePermissionQueriesCount,
					_getQueriesCount(
						endpoint + "&restrictFields=actions", 15,
						" ResourcePermission "));
			}
		);
	}

	private void _addObjectEntries(int count) throws Exception {
		for (int i = 0; i < count; i++) {
			ObjectEntryTestUtil.addObjectEntry(
				getObjectDefinition1(), OBJECT_FIELD_NAME_TEXT,
				_OBJECT_FIELD_VALUE);
		}
	}

	private String _getEndpoint() throws Exception {
		ObjectDefinition objectDefinition = getObjectDefinition1();

		return StringBundler.concat(
			objectDefinition.getRESTContextPath(), "?filter=",
			URLCodec.encodeURL(
				StringBundler.concat(
					OBJECT_FIELD_NAME_TEXT, " eq '", _OBJECT_FIELD_VALUE, "'")),
			"&pageSize=20");
	}

	private int _getQueriesCount(
			String endpoint, int expectedItemsCount, String tableName)
		throws Exception {

		HTTPTestUtil.invokeToJSONObject(null, endpoint, Http.Method.GET);

		_multiVMPool.clear();

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				"org.hibernate.SQL", LoggerTestUtil.DEBUG)) {

			JSONObject jsonObject = HTTPTestUtil.invokeToJSONObject(
				null, endpoint, Http.Method.GET);

			JSONArray itemsJSONArray = jsonObject.getJSONArray("items");

			Assert.assertEquals(expectedItemsCount, itemsJSONArray.length());

			return ListUtil.count(
				logCapture.getLogEntries(),
				logEntry -> {
					String message = logEntry.getMessage();

					return message.contains(tableName);
				});
		}
	}

	private static final String _OBJECT_FIELD_VALUE =
		RandomTestUtil.randomString();

	@Inject
	private MultiVMPool _multiVMPool;

}