/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.notification.rest.resource.v1_0.test;

import com.liferay.account.constants.AccountRoleConstants;
import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.notification.constants.NotificationConstants;
import com.liferay.notification.constants.NotificationRecipientConstants;
import com.liferay.notification.constants.NotificationRecipientSettingConstants;
import com.liferay.notification.constants.NotificationTemplateConstants;
import com.liferay.notification.rest.client.dto.v1_0.Creator;
import com.liferay.notification.rest.client.dto.v1_0.NotificationTemplate;
import com.liferay.notification.rest.client.pagination.Page;
import com.liferay.notification.rest.client.pagination.Pagination;
import com.liferay.notification.rest.client.permission.Permission;
import com.liferay.notification.rest.resource.v1_0.NotificationTemplateResource;
import com.liferay.notification.service.NotificationTemplateLocalService;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.UserGroup;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.HTTPTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserGroupTestUtil;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.Http;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.odata.entity.EntityField;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import jakarta.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;

/**
 * @author Gabriel Albuquerque
 */
@RunWith(Arquillian.class)
public class NotificationTemplateResourceTest
	extends BaseNotificationTemplateResourceTestCase {

	@Override
	@Test
	public void testGetNotificationTemplate() throws Exception {
		super.testGetNotificationTemplate();

		_role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);
		_user = UserTestUtil.addUser();
		_userGroup = UserGroupTestUtil.addUserGroup();

		_testGetNotificationTemplateCreator();
		_testGetNotificationTemplateEmail();
		_testGetNotificationTemplateNameTranslations();
		_testGetNotificationTemplatePermissions();
		_testGetNotificationTemplateUserNotification();
	}

	@Override
	@Test
	public void testGetNotificationTemplatesPage() throws Exception {
		super.testGetNotificationTemplatesPage();

		_testGetNotificationTemplatesPageWithSystemFilter();
	}

	@Override
	@Test
	public void testGetNotificationTemplatesPageWithSortInteger()
		throws Exception {

		testGetNotificationTemplatesPageWithSort(
			EntityField.Type.INTEGER,
			(entityField, notificationTemplate1, notificationTemplate2) -> {
				if (BeanTestUtil.hasProperty(
						notificationTemplate1, entityField.getName())) {

					BeanTestUtil.setProperty(
						notificationTemplate1, entityField.getName(), 0);
				}

				if (BeanTestUtil.hasProperty(
						notificationTemplate2, entityField.getName())) {

					BeanTestUtil.setProperty(
						notificationTemplate2, entityField.getName(), 1);
				}
			});
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetNotificationTemplate() throws Exception {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetNotificationTemplateByExternalReferenceCode()
		throws Exception {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetNotificationTemplateByExternalReferenceCodeNotFound() {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetNotificationTemplateNotFound() {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetNotificationTemplatesPage() throws Exception {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLPostNotificationTemplate() throws Exception {
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLPostNotificationTemplateCopy() throws Exception {
	}

	@Override
	@Test
	public void testPatchNotificationTemplate() throws Exception {
		super.testPatchNotificationTemplate();

		_role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);
		_user = UserTestUtil.addUser();
		_userGroup = UserGroupTestUtil.addUserGroup();

		_testPatchNotificationTemplateEmail();
		_testPatchNotificationTemplateUserNotification();
	}

	@Override
	@Test
	public void testPostNotificationTemplate() throws Exception {
		super.testPostNotificationTemplate();

		_role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);
		_user = UserTestUtil.addUser();
		_userGroup = UserGroupTestUtil.addUserGroup();

		_testPostNotificationTemplateEmail();
		_testPostNotificationTemplateUserNotification();
	}

	@Override
	@Test
	public void testPostNotificationTemplateCopy() throws Exception {
		super.testPostNotificationTemplateCopy();

		NotificationTemplate systemNotificationTemplate =
			randomNotificationTemplate();

		systemNotificationTemplate.setSystem(true);

		systemNotificationTemplate = _addNotificationTemplate(
			systemNotificationTemplate);

		Assert.assertTrue(systemNotificationTemplate.getSystem());

		NotificationTemplate notificationTemplate =
			notificationTemplateResource.postNotificationTemplateCopy(
				systemNotificationTemplate.getId());

		Assert.assertFalse(notificationTemplate.getSystem());
	}

	@Override
	@Test
	public void testPutNotificationTemplate() throws Exception {
		super.testPutNotificationTemplate();

		_role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);
		_user = UserTestUtil.addUser();
		_userGroup = UserGroupTestUtil.addUserGroup();

		_testPutNotificationTemplateEmail();
		_testPutNotificationTemplateUserNotification();
	}

	@Override
	protected NotificationTemplate randomNotificationTemplate()
		throws Exception {

		NotificationTemplate notificationTemplate =
			super.randomNotificationTemplate();

		notificationTemplate.setBody(
			LocalizedMapUtil.getI18nMap(
				RandomTestUtil.randomLocaleStringMap()));
		notificationTemplate.setEditorType(
			NotificationTemplate.EditorType.RICH_TEXT);
		notificationTemplate.setObjectDefinitionExternalReferenceCode(
			StringPool.BLANK);
		notificationTemplate.setObjectDefinitionId(0L);
		notificationTemplate.setRecipients(new Object[0]);
		notificationTemplate.setRecipientType(
			NotificationRecipientConstants.TYPE_USER);
		notificationTemplate.setSubject(
			LocalizedMapUtil.getI18nMap(
				RandomTestUtil.randomLocaleStringMap()));
		notificationTemplate.setType(
			NotificationConstants.TYPE_USER_NOTIFICATION);

		return notificationTemplate;
	}

	@Override
	protected NotificationTemplate
			testDeleteNotificationTemplate_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testDeleteNotificationTemplateByExternalReferenceCode_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testGetNotificationTemplate_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testGetNotificationTemplateByExternalReferenceCode_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testGetNotificationTemplatesPage_addNotificationTemplate(
				NotificationTemplate notificationTemplate)
		throws Exception {

		return _addNotificationTemplate(notificationTemplate);
	}

	@Override
	protected NotificationTemplate
			testGraphQLNotificationTemplate_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testPatchNotificationTemplate_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testPostNotificationTemplate_addNotificationTemplate(
				NotificationTemplate notificationTemplate)
		throws Exception {

		return _addNotificationTemplate(notificationTemplate);
	}

	@Override
	protected NotificationTemplate
			testPostNotificationTemplateCopy_addNotificationTemplate(
				NotificationTemplate notificationTemplate)
		throws Exception {

		return _addNotificationTemplate(notificationTemplate);
	}

	@Override
	protected NotificationTemplate
			testPutNotificationTemplate_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	@Override
	protected NotificationTemplate
			testPutNotificationTemplateByExternalReferenceCode_addNotificationTemplate()
		throws Exception {

		return _addNotificationTemplate(randomNotificationTemplate());
	}

	private NotificationTemplate _addNotificationTemplate(
			NotificationTemplate notificationTemplate)
		throws Exception {

		notificationTemplate =
			notificationTemplateResource.postNotificationTemplate(
				notificationTemplate);

		_notificationTemplates.add(
			_notificationTemplateLocalService.fetchNotificationTemplate(
				notificationTemplate.getId()));

		return notificationTemplate;
	}

	private void _assertFailureNotificationTemplate(
		String expectedTitle, JSONObject jsonObject) {

		Assert.assertEquals(
			jsonObject.toString(), Response.Status.BAD_REQUEST.name(),
			jsonObject.getString("status"));
		Assert.assertEquals(
			jsonObject.toString(), expectedTitle,
			jsonObject.getString("title"));
	}

	private void _assertNotificationTemplateRecipients(
			JSONArray expectedRecipientsJSONArray,
			JSONObject notificationTemplateJSONObject)
		throws Exception {

		JSONAssert.assertEquals(
			expectedRecipientsJSONArray.toString(),
			JSONUtil.getValueAsString(
				HTTPTestUtil.invokeToJSONObject(
					null,
					"notification/v1.0/notification-templates/" +
						notificationTemplateJSONObject.getLong("id"),
					Http.Method.GET),
				"JSONArray/recipients"),
			JSONCompareMode.NON_EXTENSIBLE);
	}

	private JSONObject _patchNotificationTemplateJSONObject(
			long notificationTemplateId, JSONArray recipientsJSONArray,
			String recipientType)
		throws Exception {

		return HTTPTestUtil.invokeToJSONObject(
			JSONUtil.put(
				"recipients", recipientsJSONArray
			).put(
				"recipientType", recipientType
			).toString(),
			"notification/v1.0/notification-templates/" +
				notificationTemplateId,
			Http.Method.PATCH);
	}

	private JSONObject _postNotificationTemplateJSONObject(
			JSONArray recipientsJSONArray, String recipientType, String type)
		throws Exception {

		JSONObject notificationTemplateJSONObject =
			HTTPTestUtil.invokeToJSONObject(
				JSONUtil.put(
					"editorType",
					NotificationTemplateConstants.EDITOR_TYPE_RICH_TEXT
				).put(
					"name", RandomTestUtil.randomString()
				).put(
					"recipients", recipientsJSONArray
				).put(
					"recipientType", recipientType
				).put(
					"subject",
					JSONUtil.put(
						LocaleUtil.toLanguageId(LocaleUtil.getDefault()),
						RandomTestUtil.randomString())
				).put(
					"type", type
				).toString(),
				"notification/v1.0/notification-templates", Http.Method.POST);

		com.liferay.notification.model.NotificationTemplate
			notificationTemplate =
				_notificationTemplateLocalService.fetchNotificationTemplate(
					notificationTemplateJSONObject.getLong("id"));

		if (notificationTemplate != null) {
			_notificationTemplates.add(notificationTemplate);
		}

		return notificationTemplateJSONObject;
	}

	private JSONObject _putNotificationTemplateJSONObject(
			long notificationTemplateId, JSONArray recipientsJSONArray,
			String recipientType, String type)
		throws Exception {

		return HTTPTestUtil.invokeToJSONObject(
			JSONUtil.put(
				"editorType",
				NotificationTemplateConstants.EDITOR_TYPE_RICH_TEXT
			).put(
				"name", RandomTestUtil.randomString()
			).put(
				"recipients", recipientsJSONArray
			).put(
				"recipientType", recipientType
			).put(
				"subject",
				JSONUtil.put(
					LocaleUtil.toLanguageId(LocaleUtil.getDefault()),
					RandomTestUtil.randomString())
			).put(
				"type", type
			).toString(),
			"notification/v1.0/notification-templates/" +
				notificationTemplateId,
			Http.Method.PUT);
	}

	private void _testGetNotificationTemplateCreator() throws Exception {
		NotificationTemplate notificationTemplate = _addNotificationTemplate(
			randomNotificationTemplate());

		Creator creator = notificationTemplate.getCreator();

		Assert.assertEquals(
			Long.valueOf(TestPropsValues.getUserId()), creator.getId());
	}

	private void _testGetNotificationTemplateEmail() throws Exception {
		String from = RandomTestUtil.randomString() + "@liferay.com";

		JSONObject fromNameJSONObject = JSONUtil.put(
			"en_US", RandomTestUtil.randomString());

		JSONObject notificationTemplateJSONObject =
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_BCC,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_NAME,
								_userGroup.getName()))
					).put(
						NotificationRecipientSettingConstants.NAME_BCC_TYPE,
						NotificationRecipientConstants.TYPE_USER_GROUP
					).put(
						NotificationRecipientSettingConstants.NAME_FROM, from
					).put(
						NotificationRecipientSettingConstants.NAME_FROM_NAME,
						fromNameJSONObject
					).put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_NAME,
								_role.getName()))
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_ROLE
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL);

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.NAME_BCC,
					JSONUtil.putAll(
						JSONUtil.put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
							_userGroup.getExternalReferenceCode()
						).put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_NAME,
							_userGroup.getName()
						))
				).put(
					NotificationRecipientSettingConstants.NAME_BCC_TYPE,
					NotificationRecipientConstants.TYPE_USER_GROUP
				).put(
					NotificationRecipientSettingConstants.NAME_FROM, from
				).put(
					NotificationRecipientSettingConstants.NAME_FROM_NAME,
					fromNameJSONObject
				).put(
					NotificationRecipientSettingConstants.NAME_TO,
					JSONUtil.putAll(_toRoleJSONObject(_role.getName()))
				).put(
					NotificationRecipientSettingConstants.NAME_TO_TYPE,
					NotificationRecipientConstants.TYPE_ROLE
				)),
			notificationTemplateJSONObject);
	}

	private void _testGetNotificationTemplateNameTranslations()
		throws Exception {

		NotificationTemplate notificationTemplate =
			randomNotificationTemplate();

		String englishName = RandomTestUtil.randomString();
		String portugueseName = RandomTestUtil.randomString();

		notificationTemplate.setName(() -> englishName);
		notificationTemplate.setName_i18n(
			HashMapBuilder.put(
				"en_US", englishName
			).put(
				"pt_BR", portugueseName
			).build());

		notificationTemplate = _addNotificationTemplate(notificationTemplate);

		notificationTemplate =
			notificationTemplateResource.
				getNotificationTemplateByExternalReferenceCode(
					notificationTemplate.getExternalReferenceCode());

		Assert.assertEquals(englishName, notificationTemplate.getName());

		Map<String, String> name_i18n = notificationTemplate.getName_i18n();

		Assert.assertEquals(englishName, name_i18n.get("en_US"));
		Assert.assertEquals(portugueseName, name_i18n.get("pt_BR"));
	}

	private void _testGetNotificationTemplatePermissions() throws Exception {
		NotificationTemplate notificationTemplate =
			randomNotificationTemplate();

		notificationTemplate.setPermissions(
			new Permission[] {
				new Permission() {
					{
						setActionIds(new Object[] {ActionKeys.VIEW});
						setRoleName(RoleConstants.ADMINISTRATOR);
					}
				}
			});

		notificationTemplate = _addNotificationTemplate(notificationTemplate);

		List<String> roleNames = new ArrayList<>();

		JSONArray permissionsJSONArray = JSONUtil.getValueAsJSONArray(
			HTTPTestUtil.invokeToJSONObject(
				null,
				"notification/v1.0/notification-templates/" +
					notificationTemplate.getId() + "?nestedFields=permissions",
				Http.Method.GET),
			"JSONArray/permissions");

		for (int i = 0; i < permissionsJSONArray.length(); i++) {
			JSONObject permissionJSONObject =
				permissionsJSONArray.getJSONObject(i);

			roleNames.add(permissionJSONObject.getString("roleName"));
		}

		Assert.assertTrue(
			roleNames.toString(),
			roleNames.contains(RoleConstants.ADMINISTRATOR));
		Assert.assertFalse(
			roleNames.toString(), roleNames.contains(RoleConstants.GUEST));
	}

	private void _testGetNotificationTemplatesPageWithSystemFilter()
		throws Exception {

		NotificationTemplate notificationTemplate =
			randomNotificationTemplate();

		notificationTemplate.setSystem(false);

		notificationTemplate = _addNotificationTemplate(notificationTemplate);

		NotificationTemplate systemNotificationTemplate =
			randomNotificationTemplate();

		systemNotificationTemplate.setSystem(true);

		systemNotificationTemplate = _addNotificationTemplate(
			systemNotificationTemplate);

		Page<NotificationTemplate> page =
			notificationTemplateResource.getNotificationTemplatesPage(
				null, null, "system eq false", Pagination.of(1, 100), null);

		List<Long> ids = TransformUtil.transform(
			page.getItems(), NotificationTemplate::getId);

		Assert.assertTrue(
			ids.toString(), ids.contains(notificationTemplate.getId()));
		Assert.assertFalse(
			ids.toString(), ids.contains(systemNotificationTemplate.getId()));
	}

	private void _testGetNotificationTemplateUserNotification()
		throws Exception {

		_testGetNotificationTemplateUserNotification(
			_toRoleJSONObject(_role.getName()),
			NotificationRecipientSettingConstants.NAME_ROLE_NAME,
			NotificationRecipientConstants.TYPE_ROLE, _role.getName());

		_testGetNotificationTemplateUserNotification(
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				_user.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				_user.getScreenName()
			),
			NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
			NotificationRecipientConstants.TYPE_USER, _user.getScreenName());

		_testGetNotificationTemplateUserNotification(
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
				_userGroup.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
				_userGroup.getName()
			),
			NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
			NotificationRecipientConstants.TYPE_USER_GROUP,
			_userGroup.getName());
	}

	private void _testGetNotificationTemplateUserNotification(
			JSONObject expectedRecipientJSONObject, String recipientName,
			String recipientType, String recipientValue)
		throws Exception {

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(expectedRecipientJSONObject),
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(JSONUtil.put(recipientName, recipientValue)),
				recipientType, NotificationConstants.TYPE_USER_NOTIFICATION));
	}

	private void _testPatchNotificationTemplateEmail() throws Exception {
		JSONObject notificationTemplateJSONObject =
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_FROM,
						RandomTestUtil.randomString() + "@liferay.com"
					).put(
						NotificationRecipientSettingConstants.NAME_FROM_NAME,
						JSONUtil.put("en_US", RandomTestUtil.randomString())
					).put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.put("en_US", RandomTestUtil.randomString())
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_EMAIL
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL);

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_patchNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_EXTERNAL_REFERENCE_CODE,
								RandomTestUtil.randomString()
							).put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_NAME,
								_role.getName()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_ROLE
					)),
				NotificationRecipientConstants.TYPE_EMAIL));

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_patchNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_BCC,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
								RandomTestUtil.randomString()
							).put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_NAME,
								_userGroup.getName()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_BCC_TYPE,
						NotificationRecipientConstants.TYPE_USER_GROUP
					)),
				NotificationRecipientConstants.TYPE_EMAIL));

		String from = RandomTestUtil.randomString() + "@liferay.com";

		JSONObject fromNameJSONObject = JSONUtil.put(
			"en_US", RandomTestUtil.randomString());

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.NAME_BCC,
					JSONUtil.putAll(
						JSONUtil.put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
							_userGroup.getExternalReferenceCode()
						).put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_NAME,
							_userGroup.getName()
						))
				).put(
					NotificationRecipientSettingConstants.NAME_BCC_TYPE,
					NotificationRecipientConstants.TYPE_USER_GROUP
				).put(
					NotificationRecipientSettingConstants.NAME_FROM, from
				).put(
					NotificationRecipientSettingConstants.NAME_FROM_NAME,
					fromNameJSONObject
				).put(
					NotificationRecipientSettingConstants.NAME_TO,
					JSONUtil.putAll(_toRoleJSONObject(_role.getName()))
				).put(
					NotificationRecipientSettingConstants.NAME_TO_TYPE,
					NotificationRecipientConstants.TYPE_ROLE
				)),
			_patchNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_BCC,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
								_userGroup.getExternalReferenceCode()
							).put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_NAME,
								RandomTestUtil.randomString()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_BCC_TYPE,
						NotificationRecipientConstants.TYPE_USER_GROUP
					).put(
						NotificationRecipientSettingConstants.NAME_FROM, from
					).put(
						NotificationRecipientSettingConstants.NAME_FROM_NAME,
						fromNameJSONObject
					).put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_EXTERNAL_REFERENCE_CODE,
								_role.getExternalReferenceCode()
							).put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_NAME,
								RandomTestUtil.randomString()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_ROLE
					)),
				NotificationRecipientConstants.TYPE_EMAIL));
	}

	private void _testPatchNotificationTemplateUserNotification()
		throws Exception {

		// Roles

		JSONObject notificationTemplateJSONObject =
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_SCREEN_NAME,
						"[%OBJECT_AUTHOR%]")),
				NotificationRecipientConstants.TYPE_TERM,
				NotificationConstants.TYPE_USER_NOTIFICATION);

		long notificationTemplateId = notificationTemplateJSONObject.getLong(
			"id");

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_patchNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						_role.getName()
					)),
				NotificationRecipientConstants.TYPE_ROLE));

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(_toRoleJSONObject(_role.getName())),
			_patchNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						_role.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_ROLE));

		// User

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_EXTERNAL_REFERENCE_CODE,
					_user.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
					_user.getScreenName()
				)),
			_patchNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_EXTERNAL_REFERENCE_CODE,
						_user.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_SCREEN_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_USER));

		// User group

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_patchNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						_userGroup.getName()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP));

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
					_userGroup.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
					_userGroup.getName()
				)),
			_patchNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						_userGroup.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP));
	}

	private void _testPostNotificationTemplate(JSONObject recipientJSONObject)
		throws Exception {

		_testPostNotificationTemplate(recipientJSONObject, recipientJSONObject);
	}

	private void _testPostNotificationTemplate(
			JSONObject expectedRecipientJSONObject,
			JSONObject recipientJSONObject)
		throws Exception {

		String from = RandomTestUtil.randomString();

		JSONObject fromNameJSONObject = JSONUtil.put(
			"en_US", RandomTestUtil.randomString());

		expectedRecipientJSONObject.put(
			"from", from
		).put(
			"fromName", fromNameJSONObject
		);

		recipientJSONObject.put(
			"from", from
		).put(
			"fromName", fromNameJSONObject
		);

		JSONObject notificationTemplateJSONObject = JSONUtil.put(
			"editorType", NotificationTemplateConstants.EDITOR_TYPE_RICH_TEXT
		).put(
			"name", RandomTestUtil.randomString()
		).put(
			"recipients", JSONUtil.putAll(recipientJSONObject)
		).put(
			"subject",
			JSONUtil.put(
				LocaleUtil.toLanguageId(LocaleUtil.getDefault()),
				RandomTestUtil.randomString())
		).put(
			"type", NotificationConstants.TYPE_EMAIL
		);

		JSONAssert.assertEquals(
			expectedRecipientJSONObject.toString(),
			JSONUtil.getValueAsString(
				HTTPTestUtil.invokeToJSONObject(
					notificationTemplateJSONObject.toString(),
					"notification/v1.0/notification-templates",
					Http.Method.POST),
				"JSONArray/recipients", "JSONObject/0"),
			JSONCompareMode.NON_EXTENSIBLE);

		NotificationTemplateResource.Builder
			notificationTemplateResourceBuilder =
				_notificationTemplateResourceFactory.create();

		NotificationTemplateResource notificationTemplateResource =
			notificationTemplateResourceBuilder.user(
				TestPropsValues.getUser()
			).build();

		Assert.assertNotNull(
			notificationTemplateResource.postNotificationTemplate(
				com.liferay.notification.rest.dto.v1_0.NotificationTemplate.
					toDTO(notificationTemplateJSONObject.toString())));
	}

	private void _testPostNotificationTemplateEmail() throws Exception {

		// Notification template recipient type email

		_testPostNotificationTemplate(
			JSONUtil.put(
				"to", JSONUtil.put("en_US", RandomTestUtil.randomString())
			).put(
				"toType", NotificationRecipientConstants.TYPE_EMAIL
			));

		// Notification template recipient type role

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						_role.getName()
					)),
				NotificationRecipientConstants.TYPE_ROLE,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_testPostNotificationTemplate(
			JSONUtil.put(
				"to",
				JSONUtil.putAll(
					_toRoleJSONObject(
						AccountRoleConstants.
							REQUIRED_ROLE_NAME_ACCOUNT_ADMINISTRATOR),
					_toRoleJSONObject(
						AccountRoleConstants.REQUIRED_ROLE_NAME_ACCOUNT_MEMBER),
					_toRoleJSONObject(RoleConstants.ORGANIZATION_ADMINISTRATOR),
					_toRoleJSONObject(RoleConstants.ORGANIZATION_OWNER),
					_toRoleJSONObject(_role.getName()))
			).put(
				"toType", NotificationRecipientConstants.TYPE_ROLE
			),
			JSONUtil.put(
				"to",
				JSONUtil.putAll(
					_toRoleJSONObject(
						AccountRoleConstants.
							REQUIRED_ROLE_NAME_ACCOUNT_ADMINISTRATOR),
					_toRoleJSONObject(
						AccountRoleConstants.REQUIRED_ROLE_NAME_ACCOUNT_MEMBER),
					_toRoleJSONObject(RoleConstants.ORGANIZATION_ADMINISTRATOR),
					_toRoleJSONObject(RoleConstants.ORGANIZATION_OWNER),
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						_role.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						RandomTestUtil.randomString()
					))
			).put(
				"toType", NotificationRecipientConstants.TYPE_ROLE
			));

		// Notification template recipient type subscribers

		_testPostNotificationTemplate(
			JSONUtil.put(
				"toType", NotificationRecipientConstants.TYPE_SUBSCRIBERS));

		// Notification template recipient type user group

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(_toRoleJSONObject(_role.getName())),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_ROLE_EXTERNAL_REFERENCE_CODE,
				_role.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_ROLE_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_ROLE);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(_toRoleJSONObject(_role.getName())),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_ROLE_EXTERNAL_REFERENCE_CODE,
				_role.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_ROLE_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_ROLE);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_ROLE_NAME,
				RandomTestUtil.randomString()),
			NotificationRecipientConstants.TYPE_ROLE);

		// Notification template recipient type term

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
					"[%OBJECT_AUTHOR%]")),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				"[%OBJECT_AUTHOR%]"),
			NotificationRecipientConstants.TYPE_TERM);

		// Notification template recipient type user

		JSONObject userJSONObject = JSONUtil.put(
			NotificationRecipientSettingConstants.
				NAME_USER_EXTERNAL_REFERENCE_CODE,
			_user.getExternalReferenceCode()
		).put(
			NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
			_user.getScreenName()
		);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(userJSONObject),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				_user.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(userJSONObject),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				RandomTestUtil.randomString()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				_user.getScreenName()
			),
			NotificationRecipientConstants.TYPE_USER);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				RandomTestUtil.randomString()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER);

		// Notification template recipient type user group

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						_userGroup.getName()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
					_userGroup.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
					_userGroup.getName()
				)),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
				_userGroup.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER_GROUP);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
				RandomTestUtil.randomString()),
			NotificationRecipientConstants.TYPE_USER_GROUP);
	}

	private void _testPostNotificationTemplateUserNotification()
		throws Exception {

		// Notification template recipient type role

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						_role.getName()
					)),
				NotificationRecipientConstants.TYPE_ROLE,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(_toRoleJSONObject(_role.getName())),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_ROLE_EXTERNAL_REFERENCE_CODE,
				_role.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_ROLE_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_ROLE);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_ROLE_NAME,
				RandomTestUtil.randomString()),
			NotificationRecipientConstants.TYPE_ROLE);

		// Notification template recipient type term

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
					"[%OBJECT_AUTHOR%]")),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				"[%OBJECT_AUTHOR%]"),
			NotificationRecipientConstants.TYPE_TERM);

		// Notification template recipient type user

		JSONObject userJSONObject = JSONUtil.put(
			NotificationRecipientSettingConstants.
				NAME_USER_EXTERNAL_REFERENCE_CODE,
			_user.getExternalReferenceCode()
		).put(
			NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
			_user.getScreenName()
		);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(userJSONObject),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				_user.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(userJSONObject),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				RandomTestUtil.randomString()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				_user.getScreenName()
			),
			NotificationRecipientConstants.TYPE_USER);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_EXTERNAL_REFERENCE_CODE,
				RandomTestUtil.randomString()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER);

		// Notification template recipient type user group

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						_userGroup.getName()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
					_userGroup.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
					_userGroup.getName()
				)),
			JSONUtil.put(
				NotificationRecipientSettingConstants.
					NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
				_userGroup.getExternalReferenceCode()
			).put(
				NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
				RandomTestUtil.randomString()
			),
			NotificationRecipientConstants.TYPE_USER_GROUP);

		_testPostNotificationTemplateWithRecipient(
			JSONUtil.putAll(),
			JSONUtil.put(
				NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
				RandomTestUtil.randomString()),
			NotificationRecipientConstants.TYPE_USER_GROUP);
	}

	private void _testPostNotificationTemplateWithRecipient(
			JSONArray expectedRecipientsJSONArray,
			JSONObject recipientJSONObject, String recipientType)
		throws Exception {

		_assertNotificationTemplateRecipients(
			expectedRecipientsJSONArray,
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(recipientJSONObject), recipientType,
				NotificationConstants.TYPE_USER_NOTIFICATION));
	}

	private void _testPutNotificationTemplateEmail() throws Exception {
		JSONObject notificationTemplateJSONObject =
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_FROM,
						RandomTestUtil.randomString() + "@liferay.com"
					).put(
						NotificationRecipientSettingConstants.NAME_FROM_NAME,
						JSONUtil.put("en_US", RandomTestUtil.randomString())
					).put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.put("en_US", RandomTestUtil.randomString())
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_EMAIL
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL);

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_putNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_EXTERNAL_REFERENCE_CODE,
								RandomTestUtil.randomString()
							).put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_NAME,
								_role.getName()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_ROLE
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL));

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_putNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_BCC,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
								RandomTestUtil.randomString()
							).put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_NAME,
								_userGroup.getName()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_BCC_TYPE,
						NotificationRecipientConstants.TYPE_USER_GROUP
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL));

		String from = RandomTestUtil.randomString() + "@liferay.com";

		JSONObject fromNameJSONObject = JSONUtil.put(
			"en_US", RandomTestUtil.randomString());

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.NAME_BCC,
					JSONUtil.putAll(
						JSONUtil.put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
							_userGroup.getExternalReferenceCode()
						).put(
							NotificationRecipientSettingConstants.
								NAME_USER_GROUP_NAME,
							_userGroup.getName()
						))
				).put(
					NotificationRecipientSettingConstants.NAME_BCC_TYPE,
					NotificationRecipientConstants.TYPE_USER_GROUP
				).put(
					NotificationRecipientSettingConstants.NAME_FROM, from
				).put(
					NotificationRecipientSettingConstants.NAME_FROM_NAME,
					fromNameJSONObject
				).put(
					NotificationRecipientSettingConstants.NAME_TO,
					JSONUtil.putAll(_toRoleJSONObject(_role.getName()))
				).put(
					NotificationRecipientSettingConstants.NAME_TO_TYPE,
					NotificationRecipientConstants.TYPE_ROLE
				)),
			_putNotificationTemplateJSONObject(
				notificationTemplateJSONObject.getLong("id"),
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.NAME_BCC,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
								_userGroup.getExternalReferenceCode()
							).put(
								NotificationRecipientSettingConstants.
									NAME_USER_GROUP_NAME,
								RandomTestUtil.randomString()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_BCC_TYPE,
						NotificationRecipientConstants.TYPE_USER_GROUP
					).put(
						NotificationRecipientSettingConstants.NAME_FROM, from
					).put(
						NotificationRecipientSettingConstants.NAME_FROM_NAME,
						fromNameJSONObject
					).put(
						NotificationRecipientSettingConstants.NAME_TO,
						JSONUtil.putAll(
							JSONUtil.put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_EXTERNAL_REFERENCE_CODE,
								_role.getExternalReferenceCode()
							).put(
								NotificationRecipientSettingConstants.
									NAME_ROLE_NAME,
								RandomTestUtil.randomString()
							))
					).put(
						NotificationRecipientSettingConstants.NAME_TO_TYPE,
						NotificationRecipientConstants.TYPE_ROLE
					)),
				NotificationRecipientConstants.TYPE_EMAIL,
				NotificationConstants.TYPE_EMAIL));
	}

	private void _testPutNotificationTemplateUserNotification()
		throws Exception {

		// Notification template recipient type role

		JSONObject notificationTemplateJSONObject =
			_postNotificationTemplateJSONObject(
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_SCREEN_NAME,
						"[%OBJECT_AUTHOR%]")),
				NotificationRecipientConstants.TYPE_TERM,
				NotificationConstants.TYPE_USER_NOTIFICATION);

		long notificationTemplateId = notificationTemplateJSONObject.getLong(
			"id");

		_assertFailureNotificationTemplate(
			"The role recipient does not exist.",
			_putNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						_role.getName()
					)),
				NotificationRecipientConstants.TYPE_ROLE,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(_toRoleJSONObject(_role.getName())),
			_putNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_ROLE_EXTERNAL_REFERENCE_CODE,
						_role.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.NAME_ROLE_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_ROLE,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		// Notification template recipient type user

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_EXTERNAL_REFERENCE_CODE,
					_user.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_SCREEN_NAME,
					_user.getScreenName()
				)),
			_putNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_EXTERNAL_REFERENCE_CODE,
						_user.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_SCREEN_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_USER,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		// Notification template recipient type user group

		_assertFailureNotificationTemplate(
			"The user group recipient does not exist.",
			_putNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						RandomTestUtil.randomString()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						_userGroup.getName()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP,
				NotificationConstants.TYPE_USER_NOTIFICATION));

		_assertNotificationTemplateRecipients(
			JSONUtil.putAll(
				JSONUtil.put(
					NotificationRecipientSettingConstants.
						NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
					_userGroup.getExternalReferenceCode()
				).put(
					NotificationRecipientSettingConstants.NAME_USER_GROUP_NAME,
					_userGroup.getName()
				)),
			_putNotificationTemplateJSONObject(
				notificationTemplateId,
				JSONUtil.putAll(
					JSONUtil.put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_EXTERNAL_REFERENCE_CODE,
						_userGroup.getExternalReferenceCode()
					).put(
						NotificationRecipientSettingConstants.
							NAME_USER_GROUP_NAME,
						RandomTestUtil.randomString()
					)),
				NotificationRecipientConstants.TYPE_USER_GROUP,
				NotificationConstants.TYPE_USER_NOTIFICATION));
	}

	private JSONObject _toRoleJSONObject(String roleName) throws Exception {
		Role role = _roleLocalService.getRole(
			TestPropsValues.getCompanyId(), roleName);

		return JSONUtil.put(
			NotificationRecipientSettingConstants.
				NAME_ROLE_EXTERNAL_REFERENCE_CODE,
			role.getExternalReferenceCode()
		).put(
			NotificationRecipientSettingConstants.NAME_ROLE_NAME, role.getName()
		).put(
			NotificationRecipientSettingConstants.NAME_ROLE_TYPE,
			RoleConstants.getTypeLabel(role.getType())
		);
	}

	@Inject
	private JSONFactory _jsonFactory;

	@Inject
	private NotificationTemplateLocalService _notificationTemplateLocalService;

	@Inject
	private NotificationTemplateResource.Factory
		_notificationTemplateResourceFactory;

	@DeleteAfterTestRun
	private List<com.liferay.notification.model.NotificationTemplate>
		_notificationTemplates = new ArrayList<>();

	@DeleteAfterTestRun
	private Role _role;

	@Inject
	private RoleLocalService _roleLocalService;

	@DeleteAfterTestRun
	private User _user;

	@DeleteAfterTestRun
	private UserGroup _userGroup;

}