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
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.ReindexStatus;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.ReindexStatusResource;

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
public class ReindexStatusResourceTest
	extends BaseReindexStatusResourceTestCase {

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

	private ReindexStatusResource
			_getUserWithoutPermissionsReindexStatusResource()
		throws Exception {

		String password = RandomTestUtil.randomString();

		User user = UserTestUtil.addUser(testCompany, password);

		return ReindexStatusResource.builder(
		).authentication(
			user.getEmailAddress(), password
		).endpoint(
			testCompany.getVirtualHostname(),
			PortalUtil.getPortalServerPort(false), "http"
		).locale(
			LocaleUtil.getDefault()
		).build();
	}

	private void _testGetReindexStatusesPageWithoutPermission()
		throws Exception {

		ReindexStatusResource userReindexStatusResource =
			_getUserWithoutPermissionsReindexStatusResource();

		assertHttpResponseStatusCode(
			404,
			userReindexStatusResource.getReindexStatusesPageHttpResponse());
	}

}