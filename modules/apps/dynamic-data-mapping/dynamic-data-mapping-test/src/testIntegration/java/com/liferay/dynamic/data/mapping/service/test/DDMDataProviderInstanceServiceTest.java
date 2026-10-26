/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.dynamic.data.mapping.data.provider.DDMDataProvider;
import com.liferay.dynamic.data.mapping.model.DDMDataProviderInstance;
import com.liferay.dynamic.data.mapping.service.DDMDataProviderInstanceLocalService;
import com.liferay.dynamic.data.mapping.service.DDMDataProviderInstanceService;
import com.liferay.dynamic.data.mapping.storage.DDMFormValues;
import com.liferay.dynamic.data.mapping.test.util.DDMFormValuesTestUtil;
import com.liferay.dynamic.data.mapping.util.DDMFormFactory;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.model.ResourceConstants;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.context.ContextUserReplace;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Mateus Xavier
 */
@RunWith(Arquillian.class)
public class DDMDataProviderInstanceServiceTest extends BaseDDMServiceTestCase {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_password = RandomTestUtil.randomString();
		_userName = RandomTestUtil.randomString();

		_ddmDataProviderInstance = _addDDMDataProviderInstance();

		_role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);
		_user = UserTestUtil.addUser();

		_userLocalService.addRoleUser(_role.getRoleId(), _user);
	}

	@Test
	public void testGetDataProviderInstance() throws Exception {
		_setResourcePermissions(ActionKeys.VIEW);

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				_user)) {

			_assertGetDataProviderInstance(false);
		}

		_assertAuthenticationData(
			true,
			_ddmDataProviderInstanceLocalService.getDataProviderInstance(
				_ddmDataProviderInstance.getDataProviderInstanceId()));

		_setResourcePermissions(ActionKeys.UPDATE, ActionKeys.VIEW);

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				_user)) {

			_assertGetDataProviderInstance(true);
		}
	}

	@Test
	public void testGetDataProviderInstances() throws Exception {
		_setResourcePermissions(ActionKeys.UPDATE, ActionKeys.VIEW);

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				_user)) {

			_assertAuthenticationData(
				false,
				_ddmDataProviderInstanceService.getDataProviderInstances(
					group.getCompanyId(), new long[] {group.getGroupId()},
					QueryUtil.ALL_POS, QueryUtil.ALL_POS));
		}
	}

	@Test
	public void testSearch() throws Exception {
		_setResourcePermissions(ActionKeys.UPDATE, ActionKeys.VIEW);

		try (ContextUserReplace contextUserReplace = new ContextUserReplace(
				_user)) {

			_assertAuthenticationData(
				false,
				_ddmDataProviderInstanceService.search(
					group.getCompanyId(), new long[] {group.getGroupId()}, null,
					QueryUtil.ALL_POS, QueryUtil.ALL_POS, null));
			_assertAuthenticationData(
				false,
				_ddmDataProviderInstanceService.search(
					group.getCompanyId(), new long[] {group.getGroupId()}, null,
					null, true, QueryUtil.ALL_POS, QueryUtil.ALL_POS, null));
		}
	}

	private DDMDataProviderInstance _addDDMDataProviderInstance()
		throws Exception {

		DDMFormValues ddmFormValues = DDMFormValuesTestUtil.createDDMFormValues(
			DDMFormFactory.create(_ddmDataProvider.getSettings()));

		ddmFormValues.addDDMFormFieldValue(
			DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
				"password", _password));
		ddmFormValues.addDDMFormFieldValue(
			DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
				"timeout",
				String.valueOf(RandomTestUtil.randomInt(1000, 30000))));
		ddmFormValues.addDDMFormFieldValue(
			DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
				"url", "http://" + RandomTestUtil.randomString()));
		ddmFormValues.addDDMFormFieldValue(
			DDMFormValuesTestUtil.createUnlocalizedDDMFormFieldValue(
				"username", _userName));

		return _ddmDataProviderInstanceLocalService.addDataProviderInstance(
			TestPropsValues.getUserId(), group.getGroupId(),
			HashMapBuilder.put(
				LocaleUtil.getSiteDefault(), RandomTestUtil.randomString()
			).build(),
			null, ddmFormValues, "rest",
			ServiceContextTestUtil.getServiceContext(
				group, TestPropsValues.getUserId()));
	}

	private void _assertAuthenticationData(
		boolean expected, DDMDataProviderInstance ddmDataProviderInstance) {

		String definition = ddmDataProviderInstance.getDefinition();

		Assert.assertEquals(expected, definition.contains(_password));
		Assert.assertEquals(expected, definition.contains(_userName));
	}

	private void _assertAuthenticationData(
		boolean expected,
		List<DDMDataProviderInstance> ddmDataProviderInstances) {

		Assert.assertEquals(
			ddmDataProviderInstances.toString(), 1,
			ddmDataProviderInstances.size());

		_assertAuthenticationData(expected, ddmDataProviderInstances.get(0));
	}

	private void _assertGetDataProviderInstance(boolean expected)
		throws Exception {

		_assertAuthenticationData(
			expected,
			_ddmDataProviderInstanceService.fetchDataProviderInstance(
				_ddmDataProviderInstance.getDataProviderInstanceId()));
		_assertAuthenticationData(
			expected,
			_ddmDataProviderInstanceService.fetchDataProviderInstanceByUuid(
				_ddmDataProviderInstance.getUuid()));
		_assertAuthenticationData(
			expected,
			_ddmDataProviderInstanceService.getDataProviderInstance(
				_ddmDataProviderInstance.getDataProviderInstanceId()));
		_assertAuthenticationData(
			expected,
			_ddmDataProviderInstanceService.getDataProviderInstanceByUuid(
				_ddmDataProviderInstance.getUuid()));
	}

	private void _setResourcePermissions(String... actionIds) throws Exception {
		_resourcePermissionLocalService.setResourcePermissions(
			group.getCompanyId(), DDMDataProviderInstance.class.getName(),
			ResourceConstants.SCOPE_INDIVIDUAL,
			String.valueOf(
				_ddmDataProviderInstance.getDataProviderInstanceId()),
			_role.getRoleId(), actionIds);
	}

	@Inject(
		filter = "ddm.data.provider.type=rest", type = DDMDataProvider.class
	)
	private DDMDataProvider _ddmDataProvider;

	@DeleteAfterTestRun
	private DDMDataProviderInstance _ddmDataProviderInstance;

	@Inject
	private DDMDataProviderInstanceLocalService
		_ddmDataProviderInstanceLocalService;

	@Inject
	private DDMDataProviderInstanceService _ddmDataProviderInstanceService;

	private String _password;

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

	@DeleteAfterTestRun
	private Role _role;

	@DeleteAfterTestRun
	private User _user;

	@Inject
	private UserLocalService _userLocalService;

	private String _userName;

}