/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.storage.salesforce.internal.rest.manager.v1_0.test;

import com.liferay.account.constants.AccountConstants;
import com.liferay.account.constants.AccountRoleConstants;
import com.liferay.account.model.AccountEntry;
import com.liferay.account.model.AccountEntryUserRel;
import com.liferay.account.service.AccountEntryLocalService;
import com.liferay.account.service.AccountEntryOrganizationRelLocalService;
import com.liferay.account.service.AccountEntryUserRelLocalService;
import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.list.type.entry.util.ListTypeEntryUtil;
import com.liferay.object.constants.ObjectActionKeys;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.exception.ObjectDefinitionAccountEntryRestrictedException;
import com.liferay.object.field.builder.DateObjectFieldBuilder;
import com.liferay.object.field.builder.LongIntegerObjectFieldBuilder;
import com.liferay.object.field.builder.PicklistObjectFieldBuilder;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.test.util.BaseObjectEntryManagerImplTestCase;
import com.liferay.object.storage.salesforce.configuration.SalesforceConfiguration;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.configuration.module.configuration.ConfigurationProvider;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Organization;
import com.liferay.portal.kernel.model.ResourceConstants;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.search.Sort;
import com.liferay.portal.kernel.search.SortFactoryUtil;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.OrganizationLocalService;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.UserGroupRoleLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.AssertUtils;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.OrganizationTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.DateFormatFactoryUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.HashMapDictionaryBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.Time;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.FeatureFlags;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.vulcan.dto.converter.DTOConverterContext;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.text.DateFormat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Guilherme Camacho
 */
@FeatureFlags("LPS-135430")
@RunWith(Arquillian.class)
public class SalesforceObjectEntryManagerImplTest
	extends BaseObjectEntryManagerImplTestCase {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@BeforeClass
	public static void setUpClass() throws Exception {
		adminUser = TestPropsValues.getUser();

		companyId = TestPropsValues.getCompanyId();

		_configurationProvider.saveCompanyConfiguration(
			SalesforceConfiguration.class, companyId,
			HashMapDictionaryBuilder.<String, Object>put(
				"consumerKey",
				TestPropsUtil.get("object.storage.salesforce.consumer.key")
			).put(
				"consumerSecret",
				TestPropsUtil.get("object.storage.salesforce.consumer.secret")
			).put(
				"loginURL",
				TestPropsUtil.get("object.storage.salesforce.login.url")
			).put(
				"password",
				TestPropsUtil.get("object.storage.salesforce.password")
			).put(
				"username",
				TestPropsUtil.get("object.storage.salesforce.username")
			).build());

		_simpleDateFormat = DateFormatFactoryUtil.getSimpleDateFormat(
			"yyyy-MM-dd");
	}

	@AfterClass
	public static void tearDownClass() throws Exception {
		_configurationProvider.saveCompanyConfiguration(
			SalesforceConfiguration.class, companyId,
			HashMapDictionaryBuilder.<String, Object>put(
				"consumerKey", ""
			).put(
				"consumerSecret", ""
			).put(
				"loginURL", ""
			).put(
				"password", ""
			).put(
				"username", ""
			).build());
	}

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		listTypeDefinition =
			listTypeDefinitionLocalService.addListTypeDefinition(
				"Status", TestPropsValues.getUserId(),
				Collections.singletonMap(
					LocaleUtil.getDefault(), RandomTestUtil.randomString()),
				false,
				Arrays.asList(
					ListTypeEntryUtil.createListTypeEntry(
						"Completed", "completed",
						Collections.singletonMap(LocaleUtil.US, "Completed")),
					ListTypeEntryUtil.createListTypeEntry(
						"Not Completed", "notCompleted",
						Collections.singletonMap(
							LocaleUtil.US, "Not Completed")),
					ListTypeEntryUtil.createListTypeEntry(
						"Queued", "queued",
						Collections.singletonMap(LocaleUtil.US, "Queued")),
					ListTypeEntryUtil.createListTypeEntry(
						"Started", "started",
						Collections.singletonMap(LocaleUtil.US, "Started"))));

		_accountAdministratorRole = _roleLocalService.getRole(
			companyId,
			AccountRoleConstants.REQUIRED_ROLE_NAME_ACCOUNT_ADMINISTRATOR);

		_buyerRole = _roleLocalService.getRole(companyId, "Buyer");

		_accountManagerRole = _roleLocalService.getRole(
			companyId, AccountRoleConstants.REQUIRED_ROLE_NAME_ACCOUNT_MANAGER);

		_objectDefinition1 =
			objectDefinitionLocalService.addCustomObjectDefinition(
				adminUser.getUserId(), 0, false, true, false,
				LocalizedMapUtil.getLocalizedMap("Ticket"), "Ticket", null,
				null, LocalizedMapUtil.getLocalizedMap("Tickets"), true,
				ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_SALESFORCE,
				ListUtil.fromArray(
					new DateObjectFieldBuilder(
					).externalReferenceCode(
						"Due_date__c"
					).userId(
						adminUser.getUserId()
					).labelMap(
						LocalizedMapUtil.getLocalizedMap("Due Date")
					).name(
						"dueDate"
					).build(),
					new PicklistObjectFieldBuilder(
					).externalReferenceCode(
						"Status__c"
					).userId(
						adminUser.getUserId()
					).labelMap(
						LocalizedMapUtil.getLocalizedMap("Status")
					).listTypeDefinitionId(
						listTypeDefinition.getListTypeDefinitionId()
					).name(
						"customStatus"
					).build(),
					new LongIntegerObjectFieldBuilder(
					).externalReferenceCode(
						"Object_Definition_id__c"
					).userId(
						adminUser.getUserId()
					).labelMap(
						LocalizedMapUtil.getLocalizedMap("Object Definition ID")
					).name(
						"objectDefinitionId"
					).build()));

		ObjectField objectField1 = ObjectFieldUtil.addCustomObjectField(
			new TextObjectFieldBuilder(
			).externalReferenceCode(
				"Title__c"
			).userId(
				adminUser.getUserId()
			).labelMap(
				LocalizedMapUtil.getLocalizedMap("Title")
			).name(
				"title"
			).objectDefinitionId(
				_objectDefinition1.getObjectDefinitionId()
			).build());

		_objectDefinition1.setTitleObjectFieldId(
			objectField1.getObjectFieldId());

		_objectDefinition1.setExternalReferenceCode("Ticket__c");

		_objectDefinition1 =
			objectDefinitionLocalService.updateObjectDefinition(
				_objectDefinition1);

		_objectDefinition1 =
			objectDefinitionLocalService.publishCustomObjectDefinition(
				adminUser.getUserId(),
				_objectDefinition1.getObjectDefinitionId());

		_objectDefinition2 =
			objectDefinitionLocalService.addCustomObjectDefinition(
				adminUser.getUserId(), 0, false, true, false,
				LocalizedMapUtil.getLocalizedMap("Board"), "Board", null, null,
				LocalizedMapUtil.getLocalizedMap("Boards"), true,
				ObjectDefinitionConstants.SCOPE_COMPANY,
				ObjectDefinitionConstants.STORAGE_TYPE_SALESFORCE,
				Collections.emptyList());

		ObjectField objectField2 = ObjectFieldUtil.addCustomObjectField(
			new TextObjectFieldBuilder(
			).externalReferenceCode(
				"Title__c"
			).userId(
				adminUser.getUserId()
			).labelMap(
				LocalizedMapUtil.getLocalizedMap("Title")
			).name(
				"title"
			).objectDefinitionId(
				_objectDefinition2.getObjectDefinitionId()
			).build());

		_objectDefinition2.setTitleObjectFieldId(
			objectField2.getObjectFieldId());

		_objectDefinition2.setExternalReferenceCode("Board__c");

		ObjectField objectAccountRestrictionField =
			ObjectFieldUtil.addCustomObjectField(
				new TextObjectFieldBuilder(
				).externalReferenceCode(
					"Account__c"
				).userId(
					adminUser.getUserId()
				).labelMap(
					LocalizedMapUtil.getLocalizedMap(
						"Account External Reference Code")
				).name(
					"accountExternalReferenceCode"
				).objectDefinitionId(
					_objectDefinition2.getObjectDefinitionId()
				).build());

		_objectDefinition2.setAccountEntryRestrictedObjectFieldId(
			objectAccountRestrictionField.getObjectFieldId());

		_objectDefinition2.setAccountEntryRestricted(true);

		_objectDefinition2 =
			objectDefinitionLocalService.updateObjectDefinition(
				_objectDefinition2);

		_objectDefinition2 =
			objectDefinitionLocalService.publishCustomObjectDefinition(
				adminUser.getUserId(),
				_objectDefinition2.getObjectDefinitionId());
	}

	@After
	public void tearDown() throws Exception {
		for (ObjectEntry objectEntry : _objectEntries1) {
			_objectEntryManager.deleteObjectEntry(
				companyId, dtoConverterContext,
				objectEntry.getExternalReferenceCode(), _objectDefinition1,
				ObjectDefinitionConstants.SCOPE_COMPANY);
		}

		for (ObjectEntry objectEntry : _objectEntries2) {
			_objectEntryManager.deleteObjectEntry(
				companyId, dtoConverterContext,
				objectEntry.getExternalReferenceCode(), _objectDefinition2,
				ObjectDefinitionConstants.SCOPE_COMPANY);
		}

		if (_objectDefinition1 != null) {
			objectDefinitionLocalService.deleteObjectDefinition(
				_objectDefinition1.getObjectDefinitionId());
		}

		if (_objectDefinition2 != null) {
			objectDefinitionLocalService.deleteObjectDefinition(
				_objectDefinition2.getObjectDefinitionId());
		}

		if (listTypeDefinition != null) {
			listTypeDefinitionLocalService.deleteListTypeDefinition(
				listTypeDefinition.getListTypeDefinitionId());
		}
	}

	@Test
	public void testAddObjectEntry() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry1(
			null, null, RandomTestUtil.randomString());

		Assert.assertNotNull(objectEntry.getExternalReferenceCode());
	}

	@Test
	public void testAddObjectEntryWithAccountEntryRestricted()
		throws Exception {

		// Regular roles' company scope permissions should not be restricted by
		// account entry

		AccountEntry accountEntry1 = _addAccountEntry("0010100001994ivAAA");

		_user = _addUser();

		Role role = _addRoleUser(
			new String[] {ObjectActionKeys.ADD_OBJECT_ENTRY},
			_objectDefinition2, _user);

		Assert.assertNotNull(
			_addObjectEntry2(RandomTestUtil.randomString(), accountEntry1));

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, _objectDefinition2.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), ObjectActionKeys.ADD_OBJECT_ENTRY);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" must have ADD_OBJECT_ENTRY permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry1,
				_getDTOConverterContextByUser(_user)));

		// Account entry restricted scope

		_user = _addUser();

		_assignAccountEntryRole(accountEntry1, _buyerRole, _user);

		_addResourcePermission(ObjectActionKeys.ADD_OBJECT_ENTRY, _buyerRole);

		AccountEntry accountEntry2 = _addAccountEntry("0010100001994iwAAA");

		AssertUtils.assertFailure(
			ObjectDefinitionAccountEntryRestrictedException.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" does not have access to account entry ",
				accountEntry2.getAccountEntryId()),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry2,
				_getDTOConverterContextByUser(_user)));

		// Account entry restricted with organization scope

		Organization organization1 = OrganizationTestUtil.addOrganization();

		_addAccountEntryOrganizationRel(accountEntry1, organization1);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		_addResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _accountManagerRole);

		AssertUtils.assertFailure(
			ObjectDefinitionAccountEntryRestrictedException.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" does not have access to account entry ",
				accountEntry2.getAccountEntryId()),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry2,
				_getDTOConverterContextByUser(_user)));

		_deleteAccountEntryOrganizationRel(accountEntry1, organization1);

		// Account entry restricted with suborganization scope

		Organization suborganization1 = OrganizationTestUtil.addOrganization(
			organization1.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry1, suborganization1);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		AssertUtils.assertFailure(
			ObjectDefinitionAccountEntryRestrictedException.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" does not have access to account entry ",
				accountEntry2.getAccountEntryId()),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry2,
				_getDTOConverterContextByUser(_user)));

		_deleteAccountEntryOrganizationRel(accountEntry1, suborganization1);

		_removeResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _objectDefinition2,
			_accountManagerRole);

		// Check account entry permission

		_user = _addUser();

		_testAddObjectEntryAccountEntryRestriction(accountEntry1);
		_testAddObjectEntryAccountEntryRestriction(accountEntry2);

		// Check account entry permission with organization

		_addAccountEntryOrganizationRel(accountEntry1, organization1);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" must have ADD_OBJECT_ENTRY permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry1,
				_getDTOConverterContextByUser(_user)));

		_addResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _accountManagerRole);

		Assert.assertNotNull(
			_addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry1,
				_getDTOConverterContextByUser(_user)));

		_removeResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _objectDefinition2,
			_accountManagerRole);

		// Check account entry permission with suborganization

		Organization organization2 = OrganizationTestUtil.addOrganization();

		Organization suborganization2 = OrganizationTestUtil.addOrganization(
			organization2.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry2, suborganization2);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" must have ADD_OBJECT_ENTRY permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry1,
				_getDTOConverterContextByUser(_user)));

		_addResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _accountManagerRole);

		Assert.assertNotNull(
			_addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry1,
				_getDTOConverterContextByUser(_user)));
	}

	@Test
	public void testAddOrUpdateObjectEntry() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry1(
			null, null, RandomTestUtil.randomString());

		String title = RandomTestUtil.randomString();

		objectEntry.setProperties(
			HashMapBuilder.putAll(
				objectEntry.getProperties()
			).put(
				"title", title
			).build());

		objectEntry = _objectEntryManager.updateObjectEntry(
			companyId, dtoConverterContext,
			objectEntry.getExternalReferenceCode(), _objectDefinition1,
			objectEntry, ObjectDefinitionConstants.SCOPE_COMPANY);

		Assert.assertEquals(
			title, MapUtil.getString(objectEntry.getProperties(), "title"));
	}

	@Test
	public void testDeleteObjectEntryWithAccountEntryRestricted()
		throws Exception {

		// Regular roles' company scope permissions should not be restricted by
		// account entry

		AccountEntry accountEntry1 = _addAccountEntry("0010100001994ivAAA");

		ObjectEntry objectEntry1 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry1);

		AccountEntry accountEntry2 = _addAccountEntry("0010100001994iwAAA");

		ObjectEntry objectEntry2 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry2);

		_user = _addUser();

		Role role = _addRoleUser(
			new String[] {ActionKeys.DELETE, ActionKeys.VIEW},
			_objectDefinition2, _user);

		_deleteObjectEntry2(objectEntry1);

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, _objectDefinition2.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), ActionKeys.DELETE);

		try {
			_deleteObjectEntry2(objectEntry2);

			Assert.fail();
		}
		catch (Exception exception) {
			Assert.assertEquals(
				exception.getMessage(),
				StringBundler.concat(
					"User ", _user.getUserId(),
					" must have DELETE permission for ",
					_objectDefinition2.getResourceName(), StringPool.SPACE));
		}

		objectEntry1 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry1);

		// Account entry scope

		_user = _addUser();

		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry1.getAccountEntryId(), _user.getUserId());
		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry2.getAccountEntryId(), _user.getUserId());

		_addResourcePermission(ActionKeys.DELETE, _accountAdministratorRole);
		_addResourcePermission(ActionKeys.VIEW, _accountAdministratorRole);

		_userGroupRoleLocalService.addUserGroupRole(
			_user.getUserId(), accountEntry1.getAccountEntryGroupId(),
			_accountAdministratorRole.getRoleId());

		_addResourcePermission(ActionKeys.VIEW, _buyerRole);

		_userGroupRoleLocalService.addUserGroupRole(
			_user.getUserId(), accountEntry2.getAccountEntryGroupId(),
			_buyerRole.getRoleId());

		_deleteObjectEntry2(objectEntry1);

		try {
			_deleteObjectEntry2(objectEntry2);

			Assert.fail();
		}
		catch (Exception exception) {
			Assert.assertEquals(
				exception.getMessage(),
				StringBundler.concat(
					"User ", _user.getUserId(),
					" must have DELETE permission for ",
					_objectDefinition2.getResourceName(), StringPool.SPACE));
		}

		// Organization scope

		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(adminUser));

		PrincipalThreadLocal.setName(adminUser.getUserId());

		objectEntry1 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry1);

		_user = _addUser();

		Organization organization1 = OrganizationTestUtil.addOrganization();

		_addResourcePermission(ActionKeys.VIEW, _accountManagerRole);

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		_addAccountEntryOrganizationRel(accountEntry1, organization1);

		Organization organization2 = OrganizationTestUtil.addOrganization();

		_addAccountEntryOrganizationRel(accountEntry2, organization2);

		_assertObjectEntriesSize(1);

		try {
			_deleteObjectEntry2(objectEntry1);

			Assert.fail();
		}
		catch (Exception exception) {
			Assert.assertEquals(
				exception.getMessage(),
				StringBundler.concat(
					"User ", _user.getUserId(), " must have DELETE permission ",
					"for ", _objectDefinition2.getResourceName(),
					StringPool.SPACE));
		}

		_assertObjectEntriesSize(1);

		_addResourcePermission(ActionKeys.DELETE, _accountManagerRole);

		_deleteObjectEntry2(objectEntry1);

		_assertObjectEntriesSize(0);

		_deleteAccountEntryOrganizationRel(accountEntry1, organization1);
		_deleteAccountEntryOrganizationRel(accountEntry2, organization2);

		// Suborganization scope

		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(adminUser));

		PrincipalThreadLocal.setName(adminUser.getUserId());

		objectEntry1 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry1);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		Organization suborganization1 = OrganizationTestUtil.addOrganization(
			organization1.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry1, suborganization1);

		Organization suborganization2 = OrganizationTestUtil.addOrganization(
			organization2.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry2, suborganization2);

		_assertObjectEntriesSize(1);

		_removeResourcePermission(
			ActionKeys.DELETE, _objectDefinition2, _accountManagerRole);

		try {
			_deleteObjectEntry2(objectEntry1);

			Assert.fail();
		}
		catch (Exception exception) {
			Assert.assertEquals(
				exception.getMessage(),
				StringBundler.concat(
					"User ", _user.getUserId(), " must have DELETE permission ",
					"for ", _objectDefinition2.getResourceName(),
					StringPool.SPACE));
		}

		_assertObjectEntriesSize(1);

		_addResourcePermission(ActionKeys.DELETE, _accountManagerRole);

		_deleteObjectEntry2(objectEntry1);

		_assertObjectEntriesSize(0);
	}

	@Test
	public void testGetObjectEntries() throws Exception {
		String title1 = "a" + RandomTestUtil.randomString();
		String title2 = "b" + RandomTestUtil.randomString();
		String title3 = "c" + RandomTestUtil.randomString();
		String title4 = "d" + RandomTestUtil.randomString();

		Date date = RandomTestUtil.nextDate();

		ObjectEntry objectEntry1 = _addObjectEntry1("queued", date, title1);
		ObjectEntry objectEntry2 = _addObjectEntry1(
			"started", new Date(date.getTime() - Time.DAY), title2);
		ObjectEntry objectEntry3 = _addObjectEntry1(
			"completed", new Date(date.getTime() + Time.DAY), title3);
		ObjectEntry objectEntry4 = _addObjectEntry1("queued", date, title4);

		// And/or with equals/not equals expression

		String filterString = StringBundler.concat(
			"(title eq ", getValue(title1), " or title eq ", getValue(title2),
			" or title eq ", getValue(title3), " or title eq ",
			getValue(title4), ") and ");

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				StringBundler.concat(
					filterString,
					buildEqualsExpressionFilterString("customStatus", "queued"),
					" and ", buildEqualsExpressionFilterString("dueDate", date),
					" and ", buildEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry1);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				StringBundler.concat(
					filterString,
					_buildNotEqualsExpressionFilterString(
						"customStatus", "queued"),
					" and ",
					_buildNotEqualsExpressionFilterString("dueDate", date),
					" and ",
					_buildNotEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry2, objectEntry3);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				StringBundler.concat(
					filterString,
					buildEqualsExpressionFilterString("customStatus", "queued"),
					" or ", buildEqualsExpressionFilterString("dueDate", date),
					" or ", buildEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry1, objectEntry4);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				StringBundler.concat(
					filterString,
					_buildNotEqualsExpressionFilterString(
						"customStatus", "queued"),
					" or ",
					_buildNotEqualsExpressionFilterString("dueDate", date),
					" or ",
					_buildNotEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry2, objectEntry3, objectEntry4);

		// Equals/not equals expression

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					buildEqualsExpressionFilterString("customStatus", "queued"))
			).build(),
			objectEntry1, objectEntry4);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					_buildNotEqualsExpressionFilterString(
						"customStatus", "queued"))
			).build(),
			objectEntry2, objectEntry3);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					buildEqualsExpressionFilterString("dueDate", date))
			).build(),
			objectEntry1, objectEntry4);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					_buildNotEqualsExpressionFilterString("dueDate", date))
			).build(),
			objectEntry2, objectEntry3);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					buildEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry1);

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				filterString.concat(
					_buildNotEqualsExpressionFilterString("title", title1))
			).build(),
			objectEntry2, objectEntry3, objectEntry4);

		// Range expression

		testGetObjectEntries(
			HashMapBuilder.put(
				"filter",
				buildRangeExpression(
					_simpleDateFormat.parse(
						MapUtil.getString(
							objectEntry1.getProperties(), "dueDate")),
					new Date(), "dueDate", "yyyy-MM-dd")
			).build(),
			objectEntry1, objectEntry4);
	}

	@Test
	public void testGetObjectEntriesWithAccountEntryRestricted()
		throws Exception {

		// Regular roles permissions should not be restricted by account entry

		AccountEntry accountEntry1 = _addAccountEntry("0010100001994ivAAA");

		_addObjectEntry2(RandomTestUtil.randomString(), accountEntry1);

		AccountEntry accountEntry2 = _addAccountEntry("0010100001994iwAAA");

		_addObjectEntry2(RandomTestUtil.randomString(), accountEntry2);

		_user = _addUser();

		_assertObjectEntriesSize(0);

		Role role = _addRoleUser(
			new String[] {ActionKeys.VIEW}, _objectDefinition2, _user);

		_assertObjectEntriesSize(2);

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, _objectDefinition2.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), ActionKeys.VIEW);

		// Regular roles permissions should bypass the account restriction

		Assert.assertTrue(
			AccountRoleConstants.isSharedRole(_accountAdministratorRole));

		AccountEntryUserRel accountEntryUserRel =
			_accountEntryUserRelLocalService.addAccountEntryUserRel(
				accountEntry1.getAccountEntryId(), _user.getUserId());

		_assertObjectEntriesSize(1);

		role = _addRoleUser(
			new String[] {ActionKeys.VIEW}, _objectDefinition2, _user);

		_assertObjectEntriesSize(2);

		_accountEntryUserRelLocalService.deleteAccountEntryUserRel(
			accountEntryUserRel);

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, _objectDefinition2.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), ActionKeys.VIEW);

		_assertObjectEntriesSize(0);

		// User should be able to view object entries for account entry 1
		// because he is a member of account entry 1

		Assert.assertTrue(
			AccountRoleConstants.isSharedRole(_accountAdministratorRole));

		accountEntryUserRel =
			_accountEntryUserRelLocalService.addAccountEntryUserRel(
				accountEntry1.getAccountEntryId(), _user.getUserId());

		_assertObjectEntriesSize(1);

		_accountEntryUserRelLocalService.deleteAccountEntryUserRel(
			accountEntryUserRel);

		_assertObjectEntriesSize(0);

		// User should be able to view object entries for account entry 1 and
		// account entry 2 because he is a member of an organization that
		// contains account entry 1 and account entry 2.

		Organization organization1 = OrganizationTestUtil.addOrganization();

		_addAccountEntryOrganizationRel(accountEntry1, organization1);
		_addAccountEntryOrganizationRel(accountEntry2, organization1);

		_user = _addUser();

		_organizationLocalService.addUserOrganization(
			_user.getUserId(), organization1.getOrganizationId());

		_assertObjectEntriesSize(2);

		_deleteAccountEntryOrganizationRel(accountEntry2, organization1);

		_assertObjectEntriesSize(1);

		_organizationLocalService.deleteUserOrganization(
			_user.getUserId(), organization1.getOrganizationId());

		_assertObjectEntriesSize(0);

		_deleteAccountEntryOrganizationRel(accountEntry1, organization1);

		// Check subOrganizations

		Organization suborganization1 = OrganizationTestUtil.addOrganization(
			organization1.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry1, suborganization1);

		Organization organization2 = OrganizationTestUtil.addOrganization();

		Organization suborganization2 = OrganizationTestUtil.addOrganization(
			organization2.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry2, suborganization2);

		_user = _addUser();

		_organizationLocalService.addUserOrganization(
			_user.getUserId(), organization1.getOrganizationId());

		_assertObjectEntriesSize(1);

		_organizationLocalService.addUserOrganization(
			_user.getUserId(), suborganization2.getOrganizationId());

		_assertObjectEntriesSize(2);

		_organizationLocalService.deleteUserOrganization(
			_user.getUserId(), suborganization2.getOrganizationId());

		_assertObjectEntriesSize(1);

		_organizationLocalService.deleteUserOrganization(
			_user.getUserId(), organization1.getOrganizationId());

		_assertObjectEntriesSize(0);
	}

	@Test
	public void testGetObjectEntry() throws Exception {
		String title = RandomTestUtil.randomString();

		ObjectEntry objectEntry = _addObjectEntry1(null, null, title);

		_assertObjectEntry(objectEntry.getExternalReferenceCode(), title);
	}

	@Test
	public void testPartialUpdateObjectEntry() throws Exception {
		ObjectEntry objectEntry = _addObjectEntry1(
			null, null, RandomTestUtil.randomString());

		_objectEntryManager.partialUpdateObjectEntry(
			TestPropsValues.getCompanyId(), dtoConverterContext,
			objectEntry.getExternalReferenceCode(), _objectDefinition1,
			new ObjectEntry() {
				{
					properties = HashMapBuilder.<String, Object>put(
						"title", "Able"
					).build();
				}
			},
			null);

		_assertObjectEntry(objectEntry.getExternalReferenceCode(), "Able");
	}

	@Test
	public void testUpdateObjectEntryWithAccountEntryRestricted()
		throws Exception {

		// Regular roles' company scope permissions should not be restricted by
		// account entry

		AccountEntry accountEntry1 = _addAccountEntry("0010100001994ivAAA");

		ObjectEntry objectEntry1 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry1);

		AccountEntry accountEntry2 = _addAccountEntry("0010100001994iwAAA");

		ObjectEntry objectEntry2 = _addObjectEntry2(
			RandomTestUtil.randomString(), accountEntry2);

		_user = _addUser();

		Role role = _addRoleUser(
			new String[] {ActionKeys.UPDATE, ActionKeys.VIEW},
			_objectDefinition2, _user);

		_objectEntryManager.updateObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry1.getExternalReferenceCode(), _objectDefinition2,
			objectEntry1, null);

		_objectEntryManager.updateObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry2.getExternalReferenceCode(), _objectDefinition2,
			objectEntry2, null);

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, _objectDefinition2.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), ActionKeys.UPDATE);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(), " must have UPDATE permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _objectEntryManager.updateObjectEntry(
				companyId, _getDTOConverterContextByUser(_user),
				objectEntry1.getExternalReferenceCode(), _objectDefinition2,
				objectEntry1, null));
		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(), " must have UPDATE permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _objectEntryManager.updateObjectEntry(
				companyId, _getDTOConverterContextByUser(_user),
				objectEntry2.getExternalReferenceCode(), _objectDefinition2,
				objectEntry2, null));

		// Account entry scope

		_addResourcePermission(ActionKeys.UPDATE, _accountAdministratorRole);
		_addResourcePermission(ActionKeys.VIEW, _accountAdministratorRole);

		_user = _addUser();

		_assignAccountEntryRole(
			accountEntry1, _accountAdministratorRole, _user);

		_addResourcePermission(ActionKeys.VIEW, _buyerRole);

		_assignAccountEntryRole(accountEntry2, _buyerRole, _user);

		_assertObjectEntriesSize(2);

		_objectEntryManager.updateObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry1.getExternalReferenceCode(), _objectDefinition2,
			objectEntry1, null);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(), " must have UPDATE permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _objectEntryManager.updateObjectEntry(
				companyId, _getDTOConverterContextByUser(_user),
				objectEntry2.getExternalReferenceCode(), _objectDefinition2,
				objectEntry2, null));

		// Organization scope

		_user = _addUser();

		Organization organization1 = OrganizationTestUtil.addOrganization();

		_addResourcePermission(ActionKeys.VIEW, _accountManagerRole);

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		_addAccountEntryOrganizationRel(accountEntry1, organization1);

		Organization organization2 = OrganizationTestUtil.addOrganization();

		_addAccountEntryOrganizationRel(accountEntry2, organization2);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(), " must have UPDATE permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _objectEntryManager.updateObjectEntry(
				companyId, _getDTOConverterContextByUser(_user),
				objectEntry1.getExternalReferenceCode(), _objectDefinition2,
				objectEntry1, null));

		_addResourcePermission(ActionKeys.UPDATE, _accountManagerRole);

		_objectEntryManager.updateObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry1.getExternalReferenceCode(), _objectDefinition2,
			objectEntry1, null);

		_removeResourcePermission(
			ActionKeys.UPDATE, _objectDefinition2, _accountManagerRole);

		// Suborganization scope

		Organization suborganization1 = OrganizationTestUtil.addOrganization(
			organization1.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry1, suborganization1);

		Organization suborganization2 = OrganizationTestUtil.addOrganization(
			organization2.getOrganizationId(), RandomTestUtil.randomString(),
			false);

		_addAccountEntryOrganizationRel(accountEntry2, suborganization2);

		_user = _addUser();

		_assignOrganizationRole(organization1, _accountManagerRole, _user);

		_assertObjectEntriesSize(1);

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(), " must have UPDATE permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _objectEntryManager.updateObjectEntry(
				companyId, _getDTOConverterContextByUser(_user),
				objectEntry1.getExternalReferenceCode(), _objectDefinition2,
				objectEntry1, null));

		_addResourcePermission(ActionKeys.UPDATE, _accountManagerRole);

		_objectEntryManager.updateObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry1.getExternalReferenceCode(), _objectDefinition2,
			objectEntry1, null);
	}

	@Override
	protected Page<ObjectEntry> getObjectEntries(
			Map<String, String> context, Sort[] sorts)
		throws Exception {

		if (sorts == null) {
			sorts = new Sort[] {SortFactoryUtil.create("title", false)};
		}

		return _objectEntryManager.getObjectEntries(
			companyId, _objectDefinition1, null, null, dtoConverterContext,
			context.get("filter"), Pagination.of(1, 3), context.get("search"),
			sorts);
	}

	private AccountEntry _addAccountEntry(String externalReferenceCode)
		throws Exception {

		return _accountEntryLocalService.addOrUpdateAccountEntry(
			externalReferenceCode, adminUser.getUserId(), 0L,
			RandomTestUtil.randomString(), RandomTestUtil.randomString(), null,
			null, null, RandomTestUtil.randomString(),
			AccountConstants.ACCOUNT_ENTRY_TYPE_BUSINESS,
			WorkflowConstants.STATUS_APPROVED,
			ServiceContextTestUtil.getServiceContext());
	}

	private void _addAccountEntryOrganizationRel(
			AccountEntry accountEntry, Organization organization)
		throws Exception {

		_accountEntryOrganizationRelLocalService.addAccountEntryOrganizationRel(
			accountEntry.getAccountEntryId(), organization.getOrganizationId());
	}

	private ObjectEntry _addObjectEntry1(
			String customStatus, Date date, String title)
		throws Exception {

		ObjectEntry objectEntry = _objectEntryManager.addObjectEntry(
			dtoConverterContext, _objectDefinition1,
			new ObjectEntry() {
				{
					properties = HashMapBuilder.<String, Object>put(
						"customStatus", customStatus
					).put(
						"dueDate",
						(date != null) ? _simpleDateFormat.format(date) : null
					).put(
						"objectDefinitionId",
						_objectDefinition.getObjectDefinitionId()
					).put(
						"title", title
					).build();
				}
			},
			ObjectDefinitionConstants.SCOPE_COMPANY);

		_objectEntries1.add(objectEntry);

		return objectEntry;
	}

	private ObjectEntry _addObjectEntry2(
			String title, AccountEntry accountEntry)
		throws Exception {

		return _addObjectEntry2(title, accountEntry, dtoConverterContext);
	}

	private ObjectEntry _addObjectEntry2(
			String title, AccountEntry accountEntry,
			DTOConverterContext currentDTOConverterContext)
		throws Exception {

		ObjectEntry objectEntry = _objectEntryManager.addObjectEntry(
			currentDTOConverterContext, _objectDefinition2,
			new ObjectEntry() {
				{
					properties = HashMapBuilder.<String, Object>put(
						"accountExternalReferenceCode",
						(accountEntry != null) ?
							accountEntry.getExternalReferenceCode() : null
					).put(
						"title", title
					).build();
				}
			},
			ObjectDefinitionConstants.SCOPE_COMPANY);

		_objectEntries2.add(objectEntry);

		return objectEntry;
	}

	private void _addResourcePermission(
			String actionId, ObjectDefinition objectDefinition, Role role)
		throws Exception {

		_resourcePermissionLocalService.addResourcePermission(
			companyId, objectDefinition.getResourceName(),
			ResourceConstants.SCOPE_GROUP_TEMPLATE, "0", role.getRoleId(),
			actionId);
	}

	private void _addResourcePermission(String actionId, Role role)
		throws Exception {

		_addResourcePermission(actionId, _objectDefinition2, role);
	}

	private Role _addRoleUser(
			String[] actionIds, ObjectDefinition objectDefinition, User user)
		throws Exception {

		Role role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);

		_resourcePermissionLocalService.setResourcePermissions(
			companyId, objectDefinition.getResourceName(),
			ResourceConstants.SCOPE_COMPANY, String.valueOf(companyId),
			role.getRoleId(), actionIds);

		_userLocalService.addRoleUser(role.getRoleId(), user);

		return role;
	}

	private User _addUser() throws Exception {
		User user = UserTestUtil.addUser();

		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(user));

		PrincipalThreadLocal.setName(user.getUserId());

		return user;
	}

	private void _assertObjectEntriesSize(long size) throws Exception {
		_assertObjectEntriesSize(_objectDefinition2, size);
	}

	private void _assertObjectEntriesSize(
			ObjectDefinition objectDefinition, long size)
		throws Exception {

		_assertObjectEntriesSize(objectDefinition, StringPool.BLANK, size);
	}

	private void _assertObjectEntriesSize(
			ObjectDefinition objectDefinition, String search, long size)
		throws Exception {

		Page<ObjectEntry> page = _objectEntryManager.getObjectEntries(
			companyId, objectDefinition, null, null,
			_getDTOConverterContextByUser(_user), StringPool.BLANK,
			Pagination.of(1, 2), search,
			new Sort[] {SortFactoryUtil.create("title", false)});

		Collection<ObjectEntry> objectEntries = page.getItems();

		Assert.assertEquals(
			objectEntries.toString(), size, objectEntries.size());
	}

	private void _assertObjectEntry(String externalReferenceCode, String title)
		throws Exception {

		ObjectEntry objectEntry = _objectEntryManager.getObjectEntry(
			companyId, dtoConverterContext, externalReferenceCode,
			_objectDefinition1, ObjectDefinitionConstants.SCOPE_COMPANY);

		Assert.assertEquals(
			title, MapUtil.getString(objectEntry.getProperties(), "title"));
	}

	private void _assignAccountEntryRole(
			AccountEntry accountEntry, Role role, User user)
		throws Exception {

		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry.getAccountEntryId(), user.getUserId());

		_userGroupRoleLocalService.addUserGroupRole(
			user.getUserId(), accountEntry.getAccountEntryGroupId(),
			role.getRoleId());
	}

	private void _assignOrganizationRole(
			Organization organization, Role role, User user)
		throws Exception {

		_organizationLocalService.addUserOrganization(
			user.getUserId(), organization.getOrganizationId());

		Group group = _groupLocalService.getOrganizationGroup(
			companyId, organization.getOrganizationId());

		_userGroupRoleLocalService.addUserGroupRole(
			user.getUserId(), group.getGroupId(), role.getRoleId());
	}

	private String _buildNotEqualsExpressionFilterString(
		String fieldName, Object value) {

		return StringBundler.concat(fieldName, " ne ", getValue(value));
	}

	private void _deleteAccountEntryOrganizationRel(
			AccountEntry accountEntry, Organization organization)
		throws Exception {

		_accountEntryOrganizationRelLocalService.
			deleteAccountEntryOrganizationRel(
				accountEntry.getAccountEntryId(),
				organization.getOrganizationId());
	}

	private void _deleteObjectEntry2(ObjectEntry objectEntry) throws Exception {
		_objectEntryManager.deleteObjectEntry(
			companyId, _getDTOConverterContextByUser(_user),
			objectEntry.getExternalReferenceCode(), _objectDefinition2, null);

		_objectEntries2.remove(objectEntry);
	}

	private DTOConverterContext _getDTOConverterContextByUser(User user) {
		return new DefaultDTOConverterContext(
			false, Collections.emptyMap(), dtoConverterRegistry, null,
			LocaleUtil.getDefault(), null, user);
	}

	private void _removeResourcePermission(
			String actionId, ObjectDefinition objectDefinition, Role role)
		throws Exception {

		_resourcePermissionLocalService.removeResourcePermission(
			companyId, objectDefinition.getResourceName(),
			ResourceConstants.SCOPE_GROUP_TEMPLATE, "0", role.getRoleId(),
			actionId);
	}

	private void _testAddObjectEntryAccountEntryRestriction(
			AccountEntry accountEntry)
		throws Exception {

		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry.getAccountEntryId(), _user.getUserId());

		AssertUtils.assertFailure(
			PrincipalException.MustHavePermission.class,
			StringBundler.concat(
				"User ", _user.getUserId(),
				" must have ADD_OBJECT_ENTRY permission for ",
				_objectDefinition2.getResourceName(), StringPool.SPACE),
			() -> _addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry,
				_getDTOConverterContextByUser(_user)));

		_addResourcePermission(ObjectActionKeys.ADD_OBJECT_ENTRY, _buyerRole);

		_userGroupRoleLocalService.addUserGroupRole(
			_user.getUserId(), accountEntry.getAccountEntryGroupId(),
			_buyerRole.getRoleId());

		Assert.assertNotNull(
			_addObjectEntry2(
				RandomTestUtil.randomString(), accountEntry,
				_getDTOConverterContextByUser(_user)));

		_userGroupRoleLocalService.deleteUserGroupRolesByUserId(
			_user.getUserId());

		_removeResourcePermission(
			ObjectActionKeys.ADD_OBJECT_ENTRY, _objectDefinition2, _buyerRole);
	}

	@Inject
	private static ConfigurationProvider _configurationProvider;

	private static DateFormat _simpleDateFormat;

	private Role _accountAdministratorRole;

	@Inject
	private AccountEntryLocalService _accountEntryLocalService;

	@Inject
	private AccountEntryOrganizationRelLocalService
		_accountEntryOrganizationRelLocalService;

	@Inject
	private AccountEntryUserRelLocalService _accountEntryUserRelLocalService;

	private Role _accountManagerRole;
	private Role _buyerRole;

	@Inject
	private GroupLocalService _groupLocalService;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition1;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition2;

	private final List<ObjectEntry> _objectEntries1 = new ArrayList<>();
	private final List<ObjectEntry> _objectEntries2 = new ArrayList<>();

	@Inject(
		filter = "object.entry.manager.storage.type=" + ObjectDefinitionConstants.STORAGE_TYPE_SALESFORCE
	)
	private ObjectEntryManager _objectEntryManager;

	@Inject
	private OrganizationLocalService _organizationLocalService;

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

	@Inject
	private RoleLocalService _roleLocalService;

	@DeleteAfterTestRun
	private User _user;

	@Inject
	private UserGroupRoleLocalService _userGroupRoleLocalService;

	@Inject
	private UserLocalService _userLocalService;

}