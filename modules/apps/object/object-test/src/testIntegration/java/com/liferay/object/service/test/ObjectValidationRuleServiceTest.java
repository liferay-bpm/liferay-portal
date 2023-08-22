/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectValidationRuleConstants;
import com.liferay.object.exception.ObjectValidationRuleEngineException;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectValidationRule;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectValidationRuleLocalService;
import com.liferay.object.service.ObjectValidationRuleService;
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
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.util.PortalInstances;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Arrays;
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
 * @author Marcela Cunha
 */
@RunWith(Arquillian.class)
public class ObjectValidationRuleServiceTest {

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
			false, _objectDefinitionLocalService,
			Arrays.asList(
				ObjectFieldUtil.createObjectField(
					ObjectFieldConstants.BUSINESS_TYPE_TEXT,
					ObjectFieldConstants.DB_TYPE_STRING,
					RandomTestUtil.randomString(), "textField")));
		_name = PrincipalThreadLocal.getName();
		_permissionChecker = PermissionThreadLocal.getPermissionChecker();
		_systemObjectDefinition =
			ObjectDefinitionTestUtil.addUnmodifiableSystemObjectDefinition(
				null, TestPropsValues.getUserId(), "Test", null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"Test", null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionConstants.SCOPE_COMPANY, null, 1,
				_objectDefinitionLocalService,
				Arrays.asList(
					ObjectFieldUtil.createObjectField(
						ObjectFieldConstants.BUSINESS_TYPE_TEXT,
						ObjectFieldConstants.DB_TYPE_STRING,
						RandomTestUtil.randomString(), "textField")));
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
	public void testAddObjectValidationRule() throws Exception {
		try {
			_testAddObjectValidationRule(
				ObjectValidationRuleConstants.ENGINE_TYPE_DDM,
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

		_testAddObjectValidationRule(
			ObjectValidationRuleConstants.ENGINE_TYPE_DDM,
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
			ObjectValidationRuleEngineException.class,
			"The user must have permission to choose engine groovy.",
			() -> _testAddObjectValidationRule(
				ObjectValidationRuleConstants.ENGINE_TYPE_GROOVY,
				objectDefinition.getObjectDefinitionId(), _companyAdminUser));

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", true
			).build());

		_testAddObjectValidationRule(
			ObjectValidationRuleConstants.ENGINE_TYPE_GROOVY,
			objectDefinition.getObjectDefinitionId(), _companyAdminUser);

		_objectDefinitionLocalService.deleteObjectDefinition(objectDefinition);
	}

	@Test
	public void testDeleteObjectValidationRule() throws Exception {
		try {
			_testDeleteObjectValidationRule(_guestUser);

			Assert.fail();
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have UPDATE permission for"));
		}

		_testDeleteObjectValidationRule(_user);
	}

	@Test
	public void testGetObjectValidationRule() throws Exception {
		try {
			_testGetObjectValidationRule(_guestUser);
		}
		catch (PrincipalException.MustHavePermission principalException) {
			String message = principalException.getMessage();

			Assert.assertTrue(
				message.contains(
					"User " + _guestUser.getUserId() +
						" must have VIEW permission for"));
		}

		_testGetObjectValidationRule(_user);
	}

	@Test
	public void testUpdateObjectValidationRule() throws Exception {
		try {
			_testUpdateObjectValidationRule(
				ObjectValidationRuleConstants.ENGINE_TYPE_DDM,
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

		_testUpdateObjectValidationRule(
			ObjectValidationRuleConstants.ENGINE_TYPE_DDM,
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
			ObjectValidationRuleEngineException.class,
			"The user must have permission to choose engine groovy.",
			() -> _testUpdateObjectValidationRule(
				ObjectValidationRuleConstants.ENGINE_TYPE_GROOVY,
				objectDefinition.getObjectDefinitionId(), _companyAdminUser));

		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"allowInstanceAdminExecuteCode", true
			).build());

		_testUpdateObjectValidationRule(
			ObjectValidationRuleConstants.ENGINE_TYPE_GROOVY,
			objectDefinition.getObjectDefinitionId(), _companyAdminUser);

		_objectDefinitionLocalService.deleteObjectDefinition(objectDefinition);
	}

	private ObjectValidationRule _addObjectValidationRule(
			long objectDefinitionId, User user)
		throws Exception {

		return _objectValidationRuleLocalService.addObjectValidationRule(
			user.getUserId(), objectDefinitionId, true,
			ObjectValidationRuleConstants.ENGINE_TYPE_DDM,
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
			ObjectValidationRuleConstants.OUTPUT_TYPE_FULL_VALIDATION,
			"isEmailAddress(textField)", Collections.emptyList());
	}

	private ObjectValidationRule _addObjectValidationRule(User user)
		throws Exception {

		return _addObjectValidationRule(
			_objectDefinition.getObjectDefinitionId(), user);
	}

	private void _setUser(User user) {
		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(user));

		PrincipalThreadLocal.setName(user.getUserId());
	}

	private void _testAddObjectValidationRule(
			String engine, long objectDefinitionId, User user)
		throws Exception {

		ObjectValidationRule objectValidationRule = null;

		try {
			_setUser(user);

			objectValidationRule =
				_objectValidationRuleService.addObjectValidationRule(
					objectDefinitionId, true, engine,
					LocalizedMapUtil.getLocalizedMap(
						RandomTestUtil.randomString()),
					LocalizedMapUtil.getLocalizedMap(
						RandomTestUtil.randomString()),
					ObjectValidationRuleConstants.OUTPUT_TYPE_FULL_VALIDATION,
					"isEmailAddress(textField)", Collections.emptyList());
		}
		finally {
			if (objectValidationRule != null) {
				_objectValidationRuleLocalService.deleteObjectValidationRule(
					objectValidationRule);
			}
		}
	}

	private void _testDeleteObjectValidationRule(User user) throws Exception {
		ObjectValidationRule deleteObjectValidationRule = null;
		ObjectValidationRule objectValidationRule = null;

		try {
			_setUser(user);

			objectValidationRule = _addObjectValidationRule(user);

			deleteObjectValidationRule =
				_objectValidationRuleService.deleteObjectValidationRule(
					objectValidationRule.getObjectValidationRuleId());
		}
		finally {
			if (deleteObjectValidationRule == null) {
				_objectValidationRuleLocalService.deleteObjectValidationRule(
					objectValidationRule);
			}
		}
	}

	private void _testGetObjectValidationRule(User user) throws Exception {
		ObjectValidationRule objectValidationRule = null;

		try {
			_setUser(user);

			objectValidationRule = _addObjectValidationRule(user);

			_objectValidationRuleService.getObjectValidationRule(
				objectValidationRule.getObjectValidationRuleId());
		}
		finally {
			if (objectValidationRule != null) {
				_objectValidationRuleLocalService.deleteObjectValidationRule(
					objectValidationRule);
			}
		}
	}

	private void _testUpdateObjectValidationRule(
			String engine, long objectDefinitionId, User user)
		throws Exception {

		ObjectValidationRule objectValidationRule = null;

		try {
			_setUser(user);

			objectValidationRule = _addObjectValidationRule(
				objectDefinitionId, user);

			objectValidationRule =
				_objectValidationRuleService.updateObjectValidationRule(
					objectValidationRule.getObjectValidationRuleId(), false,
					engine,
					LocalizedMapUtil.getLocalizedMap(
						RandomTestUtil.randomString()),
					LocalizedMapUtil.getLocalizedMap(
						RandomTestUtil.randomString()),
					ObjectValidationRuleConstants.OUTPUT_TYPE_FULL_VALIDATION,
					"isEmailAddress(textField)", Collections.emptyList());
		}
		finally {
			if (objectValidationRule != null) {
				_objectValidationRuleLocalService.deleteObjectValidationRule(
					objectValidationRule);
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

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectValidationRuleLocalService _objectValidationRuleLocalService;

	@Inject
	private ObjectValidationRuleService _objectValidationRuleService;

	private PermissionChecker _permissionChecker;

	@DeleteAfterTestRun
	private ObjectDefinition _systemObjectDefinition;

	private User _user;

	@Inject(type = UserLocalService.class)
	private UserLocalService _userLocalService;

}