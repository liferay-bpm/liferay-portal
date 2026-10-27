/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.rest.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.search.test.rule.SearchTestRule;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.TimeRange;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.TimeRangeResource;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Rafael Praxedes
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class TimeRangeResourceTest extends BaseTimeRangeResourceTestCase {

	@Override
	@Test
	public void testGetTimeRangesPage() throws Exception {
		Page<TimeRange> timeRangesPage = timeRangeResource.getTimeRangesPage();

		List<TimeRange> timeRanges = (List<TimeRange>)timeRangesPage.getItems();

		Assert.assertEquals(timeRanges.toString(), 7, timeRanges.size());

		assertEquals(_getDefaultTimeRanges(), timeRanges);

		_testGetTimeRangesPageWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"defaultTimeRange", "id"};
	}

	private List<TimeRange> _getDefaultTimeRanges() {
		return new ArrayList<TimeRange>() {
			{
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 0;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 1;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 7;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = true;
							id = 30;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 90;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 180;
						}
					});
				add(
					new TimeRange() {
						{
							defaultTimeRange = false;
							id = 365;
						}
					});
			}
		};
	}

	private TimeRangeResource _getUserWithoutPermissionsTimeRangeResource()
		throws Exception {

		String password = RandomTestUtil.randomString();

		User user = UserTestUtil.addUser(testCompany, password);

		return TimeRangeResource.builder(
		).authentication(
			user.getEmailAddress(), password
		).endpoint(
			testCompany.getVirtualHostname(),
			PortalUtil.getPortalServerPort(false), "http"
		).locale(
			LocaleUtil.getDefault()
		).build();
	}

	private void _testGetTimeRangesPageWithoutPermission() throws Exception {
		TimeRangeResource userTimeRangeResource =
			_getUserWithoutPermissionsTimeRangeResource();

		assertHttpResponseStatusCode(
			404, userTimeRangeResource.getTimeRangesPageHttpResponse());
	}

}