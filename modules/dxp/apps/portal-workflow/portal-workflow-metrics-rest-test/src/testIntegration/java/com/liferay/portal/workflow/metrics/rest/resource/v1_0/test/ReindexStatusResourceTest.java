/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.rest.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.search.test.rule.SearchTestRule;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.ReindexStatus;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.ReindexStatusResource;
import com.liferay.portal.workflow.metrics.rest.resource.v1_0.test.helper.WorkflowMetricsRESTTestHelper;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Rafael Praxedes
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class ReindexStatusResourceTest
	extends BaseReindexStatusResourceTestCase {

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_reindexStatusResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				ReindexStatusResource.class, testCompany);
	}

	@Override
	@Test
	public void testGetReindexStatusesPage() throws Exception {
		Page<ReindexStatus> reindexStatusPage =
			reindexStatusResource.getReindexStatusesPage();

		List<ReindexStatus> reindexStatuses =
			(List<ReindexStatus>)reindexStatusPage.getItems();

		Assert.assertEquals(
			reindexStatuses.toString(), 0, reindexStatuses.size());

		_testGetReindexStatusesPageWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	private void _testGetReindexStatusesPageWithoutPermission()
		throws Exception {

		assertHttpResponseStatusCode(
			404, _reindexStatusResource.getReindexStatusesPageHttpResponse());
	}

	private ReindexStatusResource _reindexStatusResource;

	@Inject
	private WorkflowMetricsRESTTestHelper _workflowMetricsRESTTestHelper;

}