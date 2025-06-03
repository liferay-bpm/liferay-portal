/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.task.web.internal.portlet.routes;

import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.workflow.WorkflowTask;
import com.liferay.portal.test.rule.LiferayUnitTestRule;
import com.liferay.portal.workflow.security.permission.WorkflowTaskPermission;
import com.liferay.portal.workflow.task.web.internal.portlet.MyWorkflowTaskPortlet;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Nathaly Gomes
 */
public class MyWorkflowTaskPortletTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testHasWorkflowTaskViewPermission()
		throws IllegalAccessException, InvocationTargetException,
			   NoSuchMethodException {

		MyWorkflowTaskPortlet myWorkflowTaskPortlet =
			new MyWorkflowTaskPortlet();

		ReflectionTestUtil.setFieldValue(
			myWorkflowTaskPortlet, "_workflowTaskPermission",
			Mockito.mock(WorkflowTaskPermission.class));

		Class<?> clazz = myWorkflowTaskPortlet.getClass();

		Method method = clazz.getDeclaredMethod(
			"_hasWorkflowTaskViewPermission", ThemeDisplay.class,
			WorkflowTask.class);

		method.setAccessible(true);

		method.invoke(myWorkflowTaskPortlet, _themeDisplay, _workflowTask);

		Mockito.verify(
			_themeDisplay
		).getSiteGroupId();

		Mockito.verify(
			_workflowTask, Mockito.never()
		).getOptionalAttributes();
	}

	private final ThemeDisplay _themeDisplay = Mockito.mock(ThemeDisplay.class);
	private final WorkflowTask _workflowTask = Mockito.mock(WorkflowTask.class);

}