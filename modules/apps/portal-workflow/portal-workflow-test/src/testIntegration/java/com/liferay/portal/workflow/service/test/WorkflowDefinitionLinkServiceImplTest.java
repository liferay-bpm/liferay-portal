/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.blogs.model.BlogsEntry;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.configuration.test.util.ConfigurationTestUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.WorkflowDefinitionLink;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.service.WorkflowDefinitionLinkService;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.context.ContextUserReplace;
import com.liferay.portal.kernel.test.randomizerbumpers.NumericStringRandomizerBumper;
import com.liferay.portal.kernel.test.randomizerbumpers.UniqueStringRandomizerBumper;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.kernel.test.util.CompanyTestUtil;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapDictionaryBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.util.PortalInstances;
import com.liferay.portal.workflow.configuration.WorkflowDefinitionConfiguration;
import com.liferay.portal.workflow.kaleo.model.KaleoDefinition;
import com.liferay.portal.workflow.kaleo.service.KaleoDefinitionLocalService;

import java.util.List;

import org.junit.After;
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
 * @author Jhosseph Gonzalez
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class WorkflowDefinitionLinkServiceImplTest {

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
			WorkflowDefinitionConfiguration.class.getName(),
			StringPool.QUESTION);
	}

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup(
			_company.getCompanyId(), _companyAdminUser.getUserId(),
			GroupConstants.DEFAULT_PARENT_GROUP_ID);
		_serviceContext = ServiceContextTestUtil.getServiceContext();
	}

	@After
	public void tearDown() throws Exception {
		ConfigurationTestUtil.saveConfiguration(
			_configuration,
			HashMapDictionaryBuilder.<String, Object>put(
				"company.administrator.can.publish", false
			).build());
	}

	@Test
	public void testAddWorkflowDefinitionLink() throws Exception {
		_testAddDefaultWorkflowDefinitionLinkWithoutCompanyAdmin();
		_testAddWorkflowDefinitionLink();
		_testAddWorkflowDefinitionLinkAsAnotherUser();
		_testAddWorkflowDefinitionLinkFromAnotherCompany();
		_testAddWorkflowDefinitionLinkWithGroupFromAnotherCompany();
		_testAddWorkflowDefinitionLinkWithoutUpdateGroupPermission();
		_testAddWorkflowDefinitionLinkWithUpdateGroupPermission();
	}

	@Test
	public void testGetWorkflowDefinitionLinks() throws Exception {
		try (ContextUserReplace contextUserReplace1 = new ContextUserReplace(
				_companyAdminUser)) {

			ConfigurationTestUtil.saveConfiguration(
				_configuration,
				HashMapDictionaryBuilder.<String, Object>put(
					"company.administrator.can.publish", true
				).build());

			WorkflowDefinitionLink workflowDefinitionLink1 =
				_addWorkflowDefinitionLink(
					null, "Single Approver", BlogsEntry.class.getName());

			User user = _addUser();

			try (ContextUserReplace contextUserReplace2 =
					new ContextUserReplace(user)) {

				AssertUtils.assertFailure(
					PrincipalException.MustBeCompanyAdmin.class,
					StringBundler.concat(
						"User ", user.getUserId(), " must be the company ",
						"administrator to perform the action"),
					() ->
						_workflowDefinitionLinkService.
							getWorkflowDefinitionLinks(
								TestPropsValues.getCompanyId(),
								"Single Approver", 1));
			}

			List<WorkflowDefinitionLink> workflowDefinitionLinks =
				_workflowDefinitionLinkService.getWorkflowDefinitionLinks(
					_company.getCompanyId(), "Single Approver", 1);

			WorkflowDefinitionLink workflowDefinitionLink2 =
				workflowDefinitionLinks.get(0);

			Assert.assertEquals(
				workflowDefinitionLink1.getClassName(),
				workflowDefinitionLink2.getClassName());
			Assert.assertEquals(
				workflowDefinitionLink1.getWorkflowDefinitionName(),
				workflowDefinitionLink2.getWorkflowDefinitionName());
		}
	}

	@Test
	public void testUpdateWorkflowDefinitionLink() throws Exception {
		_testUpdateDefaultWorkflowDefinitionLinkWithoutCompanyAdmin();
		_testUpdateWorkflowDefinitionLink();
		_testUpdateWorkflowDefinitionLinkAsAnotherUser();
		_testUpdateWorkflowDefinitionLinkFromAnotherCompany();
		_testUpdateWorkflowDefinitionLinkWithGroupFromAnotherCompany();
		_testUpdateWorkflowDefinitionLinkWithoutUpdateGroupPermission();
		_testUpdateWorkflowDefinitionLinkWithUpdateGroupPermission();
	}

	private User _addCMSAdministratorUser() throws Exception {
		return UserTestUtil.addCompanyUser(
			_company, RoleConstants.CMS_ADMINISTRATOR);
	}

	private KaleoDefinition _addKaleoDefinition() throws Exception {
		return _kaleoDefinitionLocalService.addKaleoDefinition(
			null, RandomTestUtil.randomString(), RandomTestUtil.randomString(),
			RandomTestUtil.randomString(), null, StringPool.BLANK, false, 1,
			_serviceContext);
	}

	private User _addSiteAdministratorUser() throws Exception {
		User user = UserTestUtil.addGroupAdminUser(_group);

		Role role = _roleLocalService.getRole(
			_company.getCompanyId(), RoleConstants.CMS_ADMINISTRATOR);

		_userLocalService.addRoleUser(role.getRoleId(), user);

		return user;
	}

	private User _addUser() throws Exception {
		return UserTestUtil.addUser(
			_company.getCompanyId(), TestPropsValues.getUserId(),
			RandomTestUtil.randomString(
				NumericStringRandomizerBumper.INSTANCE,
				UniqueStringRandomizerBumper.INSTANCE),
			LocaleUtil.getDefault(), RandomTestUtil.randomString(),
			RandomTestUtil.randomString(), new long[0], _serviceContext);
	}

	private WorkflowDefinitionLink _addWorkflowDefinitionLink(
			long userId, long companyId, long groupId)
		throws Exception {

		return _workflowDefinitionLinkService.addWorkflowDefinitionLink(
			null, userId, companyId, groupId, BlogsEntry.class.getName(), 0, 0,
			"Single Approver", 1);
	}

	private WorkflowDefinitionLink _addWorkflowDefinitionLink(
			String externalReferenceCode, String kaleoDefinitionName,
			String className)
		throws Exception {

		return _workflowDefinitionLinkService.addWorkflowDefinitionLink(
			externalReferenceCode, _companyAdminUser.getUserId(),
			_company.getCompanyId(), _group.getGroupId(), className, 0, 0,
			kaleoDefinitionName, 1);
	}

	private void _testAddDefaultWorkflowDefinitionLinkWithoutCompanyAdmin()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.MustBeCompanyAdmin.class,
				StringBundler.concat(
					"User ", user.getUserId(), " must be the company ",
					"administrator to perform the action"),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(),
					WorkflowConstants.DEFAULT_GROUP_ID));
		}
	}

	private void _testAddWorkflowDefinitionLink() throws Exception {
		KaleoDefinition kaleoDefinition = _addKaleoDefinition();

		_kaleoDefinitionLocalService.activateKaleoDefinition(
			kaleoDefinition.getKaleoDefinitionId(), _serviceContext);

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				_companyAdminUser)) {

			AssertUtils.assertFailure(
				PrincipalException.MustBeCompanyAdmin.class,
				StringBundler.concat(
					"User ", _companyAdminUser.getUserId(),
					" must be the company administrator to perform the action"),
				() -> _workflowDefinitionLinkService.addWorkflowDefinitionLink(
					null, _companyAdminUser.getUserId(),
					TestPropsValues.getCompanyId(),
					TestPropsValues.getGroupId(), BlogsEntry.class.getName(), 0,
					0, kaleoDefinition.getName(), 1));

			ConfigurationTestUtil.saveConfiguration(
				_configuration,
				HashMapDictionaryBuilder.<String, Object>put(
					"company.administrator.can.publish", true
				).build());

			String externalReferenceCode = RandomTestUtil.randomString();

			WorkflowDefinitionLink workflowDefinitionLink =
				_addWorkflowDefinitionLink(
					externalReferenceCode, kaleoDefinition.getName(),
					BlogsEntry.class.getName());

			Assert.assertEquals(
				externalReferenceCode,
				workflowDefinitionLink.getExternalReferenceCode());
		}
	}

	private void _testAddWorkflowDefinitionLinkAsAnotherUser()
		throws Exception {

		User cmsAdministratorUser = _addCMSAdministratorUser();
		User user = _addUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				cmsAdministratorUser)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", cmsAdministratorUser.getUserId(),
					" cannot act on behalf of user ", user.getUserId()),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(), 0));
		}

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				TestPropsValues.getUser())) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", TestPropsValues.getUserId(),
					" cannot act on behalf of user ", user.getUserId()),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(), 0));
		}
	}

	private void _testAddWorkflowDefinitionLinkFromAnotherCompany()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", user.getUserId(),
					" must be an omniadmin to act in company ",
					TestPropsValues.getCompanyId()),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), TestPropsValues.getCompanyId(), 0));
		}
	}

	private void _testAddWorkflowDefinitionLinkWithGroupFromAnotherCompany()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"Group ", TestPropsValues.getGroupId(),
					" does not belong to company ", _company.getCompanyId()),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(),
					TestPropsValues.getGroupId()));
		}
	}

	private void _testAddWorkflowDefinitionLinkWithUpdateGroupPermission()
		throws Exception {

		User user = _addSiteAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			WorkflowDefinitionLink workflowDefinitionLink =
				_addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(),
					_group.getGroupId());

			Assert.assertEquals(
				_group.getGroupId(), workflowDefinitionLink.getGroupId());
			Assert.assertEquals(
				user.getUserId(), workflowDefinitionLink.getUserId());
		}
	}

	private void _testAddWorkflowDefinitionLinkWithoutUpdateGroupPermission()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.MustHavePermission.class,
				StringBundler.concat(
					"User ", user.getUserId(),
					" must have UPDATE permission for ", Group.class.getName(),
					StringPool.SPACE, _group.getGroupId()),
				() -> _addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(),
					_group.getGroupId()));
		}
	}

	private void _testUpdateDefaultWorkflowDefinitionLinkWithoutCompanyAdmin()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.MustBeCompanyAdmin.class,
				StringBundler.concat(
					"User ", user.getUserId(), " must be the company ",
					"administrator to perform the action"),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), _company.getCompanyId(),
					WorkflowConstants.DEFAULT_GROUP_ID));
		}
	}

	private void _testUpdateWorkflowDefinitionLink() throws Exception {
		try (ContextUserReplace contextUserReplace1 = new ContextUserReplace(
				_companyAdminUser)) {

			ConfigurationTestUtil.saveConfiguration(
				_configuration,
				HashMapDictionaryBuilder.<String, Object>put(
					"company.administrator.can.publish", true
				).build());

			WorkflowDefinitionLink workflowDefinitionLink1 =
				_addWorkflowDefinitionLink(
					null, "Single Approver", BlogsEntry.class.getName());

			KaleoDefinition kaleoDefinition = _addKaleoDefinition();
			User user = _addUser();

			try (ContextUserReplace contextUserReplace2 =
					new ContextUserReplace(user)) {

				AssertUtils.assertFailure(
					PrincipalException.MustBeCompanyAdmin.class,
					StringBundler.concat(
						"User ", user.getUserId(), " must be the company ",
						"administrator to perform the action"),
					() ->
						_workflowDefinitionLinkService.
							updateWorkflowDefinitionLink(
								workflowDefinitionLink1.
									getExternalReferenceCode(),
								TestPropsValues.getUserId(),
								TestPropsValues.getCompanyId(),
								workflowDefinitionLink1.getGroupId(),
								"com.liferay.account.model.AccountEntry", 0, 0,
								kaleoDefinition.getName(),
								workflowDefinitionLink1.
									getWorkflowDefinitionVersion()));
			}

			WorkflowDefinitionLink workflowDefinitionLink2 =
				_workflowDefinitionLinkService.updateWorkflowDefinitionLink(
					workflowDefinitionLink1.getExternalReferenceCode(),
					_companyAdminUser.getUserId(), _company.getCompanyId(),
					workflowDefinitionLink1.getGroupId(),
					"com.liferay.account.model.AccountEntry", 0, 0,
					kaleoDefinition.getName(),
					workflowDefinitionLink1.getWorkflowDefinitionVersion());

			Assert.assertEquals(
				"com.liferay.account.model.AccountEntry",
				workflowDefinitionLink2.getClassName());
			Assert.assertEquals(
				kaleoDefinition.getName(),
				workflowDefinitionLink2.getWorkflowDefinitionName());
		}
	}

	private void _testUpdateWorkflowDefinitionLinkAsAnotherUser()
		throws Exception {

		User cmsAdministratorUser = _addCMSAdministratorUser();
		User user = _addUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				cmsAdministratorUser)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", cmsAdministratorUser.getUserId(),
					" cannot act on behalf of user ", user.getUserId()),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), _company.getCompanyId(), 0));
		}

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				TestPropsValues.getUser())) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", TestPropsValues.getUserId(),
					" cannot act on behalf of user ", user.getUserId()),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), _company.getCompanyId(), 0));
		}
	}

	private void _testUpdateWorkflowDefinitionLinkFromAnotherCompany()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"User ", user.getUserId(),
					" must be an omniadmin to act in company ",
					TestPropsValues.getCompanyId()),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), TestPropsValues.getCompanyId(), 0));
		}
	}

	private void _testUpdateWorkflowDefinitionLinkWithGroupFromAnotherCompany()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.class,
				StringBundler.concat(
					"Group ", TestPropsValues.getGroupId(),
					" does not belong to company ", _company.getCompanyId()),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), _company.getCompanyId(),
					TestPropsValues.getGroupId()));
		}
	}

	private void _testUpdateWorkflowDefinitionLinkWithUpdateGroupPermission()
		throws Exception {

		User user = _addSiteAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			WorkflowDefinitionLink workflowDefinitionLink =
				_addWorkflowDefinitionLink(
					user.getUserId(), _company.getCompanyId(),
					_group.getGroupId());

			workflowDefinitionLink = _updateWorkflowDefinitionLink(
				workflowDefinitionLink.getExternalReferenceCode(),
				user.getUserId(), _company.getCompanyId(), _group.getGroupId());

			Assert.assertEquals(
				"com.liferay.account.model.AccountEntry",
				workflowDefinitionLink.getClassName());
		}
	}

	private void _testUpdateWorkflowDefinitionLinkWithoutUpdateGroupPermission()
		throws Exception {

		User user = _addCMSAdministratorUser();

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				user)) {

			AssertUtils.assertFailure(
				PrincipalException.MustHavePermission.class,
				StringBundler.concat(
					"User ", user.getUserId(),
					" must have UPDATE permission for ", Group.class.getName(),
					StringPool.SPACE, _group.getGroupId()),
				() -> _updateWorkflowDefinitionLink(
					null, user.getUserId(), _company.getCompanyId(),
					_group.getGroupId()));
		}
	}

	private WorkflowDefinitionLink _updateWorkflowDefinitionLink(
			String externalReferenceCode, long userId, long companyId,
			long groupId)
		throws Exception {

		return _workflowDefinitionLinkService.updateWorkflowDefinitionLink(
			externalReferenceCode, userId, companyId, groupId,
			"com.liferay.account.model.AccountEntry", 0, 0, "Single Approver",
			1);
	}

	private static Company _company;
	private static User _companyAdminUser;
	private static Configuration _configuration;

	@Inject
	private static ConfigurationAdmin _configurationAdmin;

	private Group _group;

	@Inject
	private KaleoDefinitionLocalService _kaleoDefinitionLocalService;

	@Inject
	private RoleLocalService _roleLocalService;

	private ServiceContext _serviceContext;

	@Inject
	private UserLocalService _userLocalService;

	@Inject
	private WorkflowDefinitionLinkService _workflowDefinitionLinkService;

}