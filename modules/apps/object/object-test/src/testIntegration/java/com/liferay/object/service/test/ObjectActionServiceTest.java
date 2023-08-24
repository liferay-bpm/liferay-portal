/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectActionExecutorConstants;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.exception.ObjectActionExecutorKeyException;
import com.liferay.object.model.ObjectAction;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectActionLocalService;
import com.liferay.object.service.ObjectActionService;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.configuration.test.util.ConfigurationTestUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.CompanyTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapDictionaryBuilder;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.UnicodePropertiesBuilder;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.util.PortalInstances;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Collections;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

/**
 * @author Brian Wing Shun Chan
 */
@RunWith(Arquillian.class)
public class ObjectActionServiceTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@BeforeClass
	public static void setUpClass() throws Exception {
		_company = CompanyTestUtil.addCompany();

		PortalInstances.initCompany(_company);

		_companyAdminUser = UserTestUtil.addCompanyAdminUser(_company);

		_configuration = _configurationAdmin.getConfiguration(
			"com.liferay.object.configuration.ObjectScriptConfiguration",
			StringPool.QUESTION);

		_originalName = PrincipalThreadLocal.getName();

		PrincipalThreadLocal.setName(TestPropsValues.getUserId());
	}

	@AfterClass
	public static void tearDownClass() throws Exception {
		_companyLocalService.deleteCompany(_company);

		ConfigurationTestUtil.deleteConfiguration(_configuration);

		PrincipalThreadLocal.setName(_originalName);
	}

	@Before
	public void setUp() throws Exception {
		_guestUser = _userLocalService.getGuestUser(
			TestPropsValues.getCompanyId());
		_objectDefinition = ObjectDefinitionTestUtil.addObjectDefinition(
			_objectDefinitionLocalService);
		_name = PrincipalThreadLocal.getName();
		_permissionChecker = PermissionThreadLocal.getPermissionChecker();
		_user = TestPropsValues.getUser();

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", false
			).build());
	}

	@After
	public void tearDown() {
		PermissionThreadLocal.setPermissionChecker(_permissionChecker);

		PrincipalThreadLocal.setName(_name);
	}

	@Test
	public void testAddObjectAction() throws Exception {
		try {
			_testAddObjectAction(
				ObjectActionExecutorConstants.KEY_WEBHOOK,
				_objectDefinition.getObjectDefinitionId(), _guestUser);

			Assert.fail();
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have UPDATE permission for"));
		}

		_testAddObjectAction(
			ObjectActionExecutorConstants.KEY_WEBHOOK,
			_objectDefinition.getObjectDefinitionId(), _user);

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				_companyAdminUser.getUserId(), 0, false, false,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"A" + RandomTestUtil.randomString(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.emptyList());

		AssertUtils.assertFailure(
			ObjectActionExecutorKeyException.class,
			"The user must have permission to choose object action executor " +
				"key groovy",
			() -> _testAddObjectAction(
				ObjectActionExecutorConstants.KEY_GROOVY,
				objectDefinition.getObjectDefinitionId(), _companyAdminUser));

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", true
			).build());

		_testAddObjectAction(
			ObjectActionExecutorConstants.KEY_GROOVY,
			objectDefinition.getObjectDefinitionId(), _companyAdminUser);

		ObjectAction objectAction = _objectActionService.addObjectAction(
			RandomTestUtil.randomString(),
			objectDefinition.getObjectDefinitionId(), true, StringPool.BLANK,
			RandomTestUtil.randomString(),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			RandomTestUtil.randomString(),
			ObjectActionExecutorConstants.KEY_GROOVY,
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			new UnicodeProperties());

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", false
			).build());

		objectAction = _objectActionService.getObjectAction(
			objectAction.getObjectActionId());

		Assert.assertFalse(objectAction.isActive());

		_objectDefinitionLocalService.deleteObjectDefinition(objectDefinition);
	}

	@Test
	public void testDeleteObjectAction() throws Exception {
		try {
			_testDeleteObjectAction(_guestUser);

			Assert.fail();
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have UPDATE permission for"));
		}

		_testDeleteObjectAction(_user);
	}

	@Test
	public void testGetObjectAction() throws Exception {
		try {
			_testGetObjectAction(_guestUser);
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have VIEW permission for"));
		}

		_testGetObjectAction(_user);
	}

	@Test
	public void testUpdateObjectAction() throws Exception {
		try {
			_testUpdateObjectAction(
				_objectDefinition.getObjectDefinitionId(), _guestUser);

			Assert.fail();
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have UPDATE permission for"));
		}

		_testUpdateObjectAction(
			_objectDefinition.getObjectDefinitionId(), _user);

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.addCustomObjectDefinition(
				_companyAdminUser.getUserId(), 0, false, false,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"A" + RandomTestUtil.randomString(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT,
				Collections.emptyList());

		AssertUtils.assertFailure(
			ObjectActionExecutorKeyException.class,
			"The user must have permission to choose object action executor " +
				"key groovy",
			() -> _testUpdateObjectAction(
				objectDefinition.getObjectDefinitionId(), _companyAdminUser));

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", true
			).build());

		_testUpdateObjectAction(
			objectDefinition.getObjectDefinitionId(), _companyAdminUser);

		_objectDefinitionLocalService.deleteObjectDefinition(objectDefinition);
	}

	private ObjectAction _addObjectAction(long objectDefinitionId, User user)
		throws Exception {

		return _objectActionLocalService.addObjectAction(
			RandomTestUtil.randomString(), user.getUserId(), objectDefinitionId,
			true, StringPool.BLANK, RandomTestUtil.randomString(),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			RandomTestUtil.randomString(),
			ObjectActionExecutorConstants.KEY_WEBHOOK,
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			UnicodePropertiesBuilder.put(
				"url", RandomTestUtil.randomString()
			).build());
	}

	private ObjectAction _addObjectAction(User user) throws Exception {
		return _addObjectAction(
			_objectDefinition.getObjectDefinitionId(), user);
	}

	private void _setUser(User user) {
		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(user));

		PrincipalThreadLocal.setName(user.getUserId());
	}

	private void _testAddObjectAction(
			String objectActionExecutorKey, long objectDefinitionId, User user)
		throws Exception {

		ObjectAction objectAction = null;

		UnicodeProperties parametersUnicodeProperties = new UnicodeProperties();

		if (StringUtil.equals(
				objectActionExecutorKey,
				ObjectActionExecutorConstants.KEY_WEBHOOK)) {

			parametersUnicodeProperties = UnicodePropertiesBuilder.put(
				"url", RandomTestUtil.randomString()
			).build();
		}

		try {
			_setUser(user);

			objectAction = _objectActionService.addObjectAction(
				RandomTestUtil.randomString(), objectDefinitionId, true,
				StringPool.BLANK, RandomTestUtil.randomString(),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				RandomTestUtil.randomString(), objectActionExecutorKey,
				ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
				parametersUnicodeProperties);
		}
		finally {
			if (objectAction != null) {
				_objectActionLocalService.deleteObjectAction(objectAction);
			}
		}
	}

	private void _testDeleteObjectAction(User user) throws Exception {
		ObjectAction deleteObjectAction = null;
		ObjectAction objectAction = null;

		try {
			_setUser(user);

			objectAction = _addObjectAction(user);

			deleteObjectAction = _objectActionService.deleteObjectAction(
				objectAction.getObjectActionId());
		}
		finally {
			if (deleteObjectAction == null) {
				_objectActionLocalService.deleteObjectAction(objectAction);
			}
		}
	}

	private void _testGetObjectAction(User user) throws Exception {
		ObjectAction objectAction = null;

		try {
			_setUser(user);

			objectAction = _addObjectAction(user);

			_objectActionService.getObjectAction(
				objectAction.getObjectActionId());
		}
		finally {
			if (objectAction != null) {
				_objectActionLocalService.deleteObjectAction(objectAction);
			}
		}
	}

	private void _testUpdateObjectAction(long objectDefinitionId, User user)
		throws Exception {

		ObjectAction objectAction = null;

		try {
			_setUser(user);

			objectAction = _addObjectAction(objectDefinitionId, user);

			objectAction = _objectActionService.updateObjectAction(
				RandomTestUtil.randomString(), objectAction.getObjectActionId(),
				true, StringPool.BLANK, RandomTestUtil.randomString(),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				RandomTestUtil.randomString(),
				ObjectActionExecutorConstants.KEY_GROOVY,
				ObjectActionTriggerConstants.KEY_ON_AFTER_UPDATE,
				new UnicodeProperties());
		}
		finally {
			if (objectAction != null) {
				_objectActionLocalService.deleteObjectAction(objectAction);
			}
		}
	}

	private static Company _company;
	private static User _companyAdminUser;

	@Inject
	private static CompanyLocalService _companyLocalService;

	private static Configuration _configuration;

	@Inject
	private static ConfigurationAdmin _configurationAdmin;

	private static String _originalName;

	private User _guestUser;
	private String _name;

	@Inject
	private ObjectActionLocalService _objectActionLocalService;

	@Inject
	private ObjectActionService _objectActionService;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	private PermissionChecker _permissionChecker;
	private User _user;

	@Inject(type = UserLocalService.class)
	private UserLocalService _userLocalService;

}