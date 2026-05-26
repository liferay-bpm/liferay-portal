/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.runtime.integration.internal.security.permission.resource;

import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.workflow.WorkflowTask;
import com.liferay.portal.security.permission.SimplePermissionChecker;
import com.liferay.portal.test.rule.LiferayUnitTestRule;
import com.liferay.portal.workflow.kaleo.KaleoWorkflowModelConverter;
import com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken;
import com.liferay.portal.workflow.security.permission.WorkflowTaskPermission;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Roselaine Marques
 */
public class KaleoTaskModelResourcePermissionTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testContainsFalseWhenKaleoTaskInstanceTokenBelongsToDifferentVirtualInstance()
		throws Exception {

		long companyId = RandomTestUtil.randomLong();

		KaleoTaskInstanceToken kaleoTaskInstanceToken = Mockito.mock(
			KaleoTaskInstanceToken.class);

		Mockito.when(
			kaleoTaskInstanceToken.getCompanyId()
		).thenReturn(
			companyId
		);

		Assert.assertFalse(
			_kaleoTaskModelResourcePermission.contains(
				_mockPermissionChecker(companyId + 1), kaleoTaskInstanceToken,
				null));
	}

	@Test
	public void testWhenKaleoTaskInstanceTokenBelongsToSameVirtualInstance()
		throws Exception {

		KaleoWorkflowModelConverter kaleoWorkflowModelConverter = Mockito.mock(
			KaleoWorkflowModelConverter.class);
		WorkflowTaskPermission workflowTaskPermission = Mockito.mock(
			WorkflowTaskPermission.class);

		ReflectionTestUtil.setFieldValue(
			_kaleoTaskModelResourcePermission, "_kaleoWorkflowModelConverter",
			kaleoWorkflowModelConverter);
		ReflectionTestUtil.setFieldValue(
			_kaleoTaskModelResourcePermission, "_workflowTaskPermission",
			workflowTaskPermission);

		long companyId = RandomTestUtil.randomLong();

		KaleoTaskInstanceToken kaleoTaskInstanceToken = Mockito.mock(
			KaleoTaskInstanceToken.class);

		Mockito.when(
			kaleoTaskInstanceToken.getCompanyId()
		).thenReturn(
			companyId
		);

		WorkflowTask workflowTask = Mockito.mock(WorkflowTask.class);

		Mockito.when(
			kaleoWorkflowModelConverter.toWorkflowTask(
				Mockito.eq(kaleoTaskInstanceToken), Mockito.any())
		).thenReturn(
			workflowTask
		);

		Mockito.when(
			workflowTaskPermission.contains(
				Mockito.any(), Mockito.eq(workflowTask), Mockito.anyLong())
		).thenReturn(
			true
		);

		Assert.assertTrue(
			_kaleoTaskModelResourcePermission.contains(
				_mockPermissionChecker(companyId), kaleoTaskInstanceToken,
				null));
	}

	private PermissionChecker _mockPermissionChecker(long companyId) {
		return new SimplePermissionChecker() {

			@Override
			public long getCompanyId() {
				return companyId;
			}

			@Override
			public User getUser() {
				return _user;
			}

		};
	}

	private static final User _user = Mockito.mock(User.class);

	private final KaleoTaskModelResourcePermission
		_kaleoTaskModelResourcePermission =
			new KaleoTaskModelResourcePermission();

}