/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.runtime.integration.internal.security.permission.resource;

import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.workflow.WorkflowTask;
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
	public void testContains() throws Exception {

		// Kaleo task instance token from a different company

		KaleoTaskInstanceToken kaleoTaskInstanceToken1 = Mockito.mock(
			KaleoTaskInstanceToken.class);

		long companyId = RandomTestUtil.randomLong();

		Mockito.when(
			kaleoTaskInstanceToken1.getCompanyId()
		).thenReturn(
			companyId
		);

		PermissionChecker permissionChecker1 = Mockito.mock(
			PermissionChecker.class);

		Mockito.when(
			permissionChecker1.getCompanyId()
		).thenReturn(
			companyId + 1
		);

		Assert.assertFalse(
			_kaleoTaskModelResourcePermission.contains(
				permissionChecker1, kaleoTaskInstanceToken1,
				RandomTestUtil.randomString()));

		// Kaleo task instance token from the same company

		KaleoTaskInstanceToken kaleoTaskInstanceToken2 = Mockito.mock(
			KaleoTaskInstanceToken.class);

		Mockito.when(
			kaleoTaskInstanceToken2.getCompanyId()
		).thenReturn(
			companyId
		);

		KaleoWorkflowModelConverter kaleoWorkflowModelConverter = Mockito.mock(
			KaleoWorkflowModelConverter.class);

		ReflectionTestUtil.setFieldValue(
			_kaleoTaskModelResourcePermission, "_kaleoWorkflowModelConverter",
			kaleoWorkflowModelConverter);

		WorkflowTask workflowTask = Mockito.mock(WorkflowTask.class);

		Mockito.when(
			kaleoWorkflowModelConverter.toWorkflowTask(
				Mockito.eq(kaleoTaskInstanceToken2), Mockito.any())
		).thenReturn(
			workflowTask
		);

		WorkflowTaskPermission workflowTaskPermission = Mockito.mock(
			WorkflowTaskPermission.class);

		ReflectionTestUtil.setFieldValue(
			_kaleoTaskModelResourcePermission, "_workflowTaskPermission",
			workflowTaskPermission);

		Mockito.when(
			workflowTaskPermission.contains(
				Mockito.any(), Mockito.eq(workflowTask), Mockito.anyLong())
		).thenReturn(
			true
		);

		PermissionChecker permissionChecker2 = Mockito.mock(
			PermissionChecker.class);

		Mockito.when(
			permissionChecker2.getCompanyId()
		).thenReturn(
			companyId
		);

		Assert.assertTrue(
			_kaleoTaskModelResourcePermission.contains(
				permissionChecker2, kaleoTaskInstanceToken2,
				RandomTestUtil.randomString()));

		// Kaleo task instance token with a different company's administrator

		PermissionChecker permissionChecker3 = Mockito.mock(
			PermissionChecker.class);

		Mockito.when(
			permissionChecker3.getCompanyId()
		).thenReturn(
			companyId + 1
		);

		Mockito.when(
			permissionChecker3.isCompanyAdmin()
		).thenReturn(
			true
		);

		Assert.assertFalse(
			_kaleoTaskModelResourcePermission.contains(
				permissionChecker3, kaleoTaskInstanceToken1,
				RandomTestUtil.randomString()));

		// Kaleo task instance token with the same company's administrator

		KaleoTaskInstanceToken kaleoTaskInstanceToken3 = Mockito.mock(
			KaleoTaskInstanceToken.class);

		Mockito.when(
			kaleoTaskInstanceToken3.getCompanyId()
		).thenReturn(
			companyId
		);

		PermissionChecker permissionChecker4 = Mockito.mock(
			PermissionChecker.class);

		Mockito.when(
			permissionChecker4.getCompanyId()
		).thenReturn(
			companyId
		);

		Mockito.when(
			permissionChecker4.isCompanyAdmin()
		).thenReturn(
			true
		);

		Assert.assertTrue(
			_kaleoTaskModelResourcePermission.contains(
				permissionChecker4, kaleoTaskInstanceToken3,
				RandomTestUtil.randomString()));

		Mockito.verify(
			kaleoWorkflowModelConverter, Mockito.never()
		).toWorkflowTask(
			Mockito.eq(kaleoTaskInstanceToken3), Mockito.any()
		);
	}

	private final KaleoTaskModelResourcePermission
		_kaleoTaskModelResourcePermission =
			new KaleoTaskModelResourcePermission();

}