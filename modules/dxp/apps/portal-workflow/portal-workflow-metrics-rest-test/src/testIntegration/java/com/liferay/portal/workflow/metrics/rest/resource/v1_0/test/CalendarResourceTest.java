/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.rest.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.headless.batch.engine.client.dto.v1_0.ExportTask;
import com.liferay.headless.batch.engine.client.resource.v1_0.ExportTaskResource;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.search.test.rule.SearchTestRule;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.Calendar;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.CalendarResource;
import com.liferay.portal.workflow.metrics.rest.resource.v1_0.test.helper.WorkflowMetricsRESTTestHelper;
import com.liferay.portal.workflow.metrics.sla.calendar.WorkflowMetricsSLACalendar;

import java.time.Duration;
import java.time.LocalDateTime;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceRegistration;

/**
 * @author Rafael Praxedes
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class CalendarResourceTest extends BaseCalendarResourceTestCase {

	@BeforeClass
	public static void setUpClass() throws Exception {
		BaseCalendarResourceTestCase.setUpClass();

		Bundle bundle = FrameworkUtil.getBundle(
			WorkflowMetricsRESTTestHelper.class);

		_bundleContext = bundle.getBundleContext();
	}

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_userCalendarResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				CalendarResource.class, testCompany);
		_userExportTaskResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				ExportTaskResource.class, testCompany);
	}

	@After
	@Override
	public void tearDown() throws Exception {
		super.tearDown();

		if (_serviceRegistration == null) {
			return;
		}

		_serviceRegistration.unregister();
	}

	@Override
	@Test
	public void testGetCalendarsPage() throws Exception {
		Page<Calendar> calendarsPage = calendarResource.getCalendarsPage();

		List<Calendar> calendars = (List<Calendar>)calendarsPage.getItems();

		Assert.assertEquals(calendars.toString(), 1, calendars.size());

		assertEquals(_getDefaultCalendar(), calendars.get(0));

		_registerCustomCalendar();

		calendarsPage = calendarResource.getCalendarsPage();

		calendars = (List<Calendar>)calendarsPage.getItems();

		Assert.assertEquals(calendars.toString(), 2, calendars.size());

		assertEqualsIgnoringOrder(
			Arrays.asList(_getDefaultCalendar(), _getCustomCalendar()),
			calendars);

		_testGetCalendarsPageWithoutPermission();
		_testGetCalendarsPageExportWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"defaultCalendar", "key", "title"};
	}

	private Calendar _getCustomCalendar() {
		return new Calendar() {
			{
				defaultCalendar = false;
				key = "custom";
				title = "Custom";
			}
		};
	}

	private Calendar _getDefaultCalendar() {
		return new Calendar() {
			{
				defaultCalendar = true;
				key = "default";
				title = "24/7";
			}
		};
	}

	private void _registerCustomCalendar() {
		_serviceRegistration = _bundleContext.registerService(
			WorkflowMetricsSLACalendar.class,
			new WorkflowMetricsSLACalendar() {

				@Override
				public Duration getDuration(
					LocalDateTime startLocalDateTime,
					LocalDateTime endLocalDateTime) {

					return Duration.ZERO;
				}

				@Override
				public String getKey() {
					return "custom";
				}

				@Override
				public LocalDateTime getOverdueLocalDateTime(
					LocalDateTime nowLocalDateTime,
					Duration remainingDuration) {

					return nowLocalDateTime;
				}

				@Override
				public String getTitle(Locale locale) {
					return "Custom";
				}

			},
			null);
	}

	private void _testGetCalendarsPageExportWithoutPermission()
		throws Exception {

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				"com.liferay.batch.engine.internal." +
					"BatchEngineExportTaskExecutorImpl",
				LoggerTestUtil.ERROR)) {

			ExportTask exportTask = _userExportTaskResource.postExportTask(
				"com.liferay.portal.workflow.metrics.rest.dto.v1_0.Calendar",
				"JSON", null, null, null, null, null);

			while (true) {
				exportTask = _userExportTaskResource.getExportTask(
					exportTask.getId());

				ExportTask.ExecuteStatus executeStatus =
					exportTask.getExecuteStatus();

				if ((executeStatus == ExportTask.ExecuteStatus.COMPLETED) ||
					(executeStatus == ExportTask.ExecuteStatus.FAILED)) {

					Assert.assertEquals(
						ExportTask.ExecuteStatus.FAILED, executeStatus);

					break;
				}
			}
		}
	}

	private void _testGetCalendarsPageWithoutPermission() throws Exception {
		assertHttpResponseStatusCode(
			404, _userCalendarResource.getCalendarsPageHttpResponse());
	}

	private static BundleContext _bundleContext;

	private ServiceRegistration<WorkflowMetricsSLACalendar>
		_serviceRegistration;
	private CalendarResource _userCalendarResource;
	private ExportTaskResource _userExportTaskResource;

	@Inject
	private WorkflowMetricsRESTTestHelper _workflowMetricsRESTTestHelper;

}