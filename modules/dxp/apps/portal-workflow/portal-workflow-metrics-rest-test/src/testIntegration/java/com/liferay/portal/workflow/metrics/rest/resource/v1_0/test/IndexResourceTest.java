/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.rest.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.petra.function.UnsafeFunction;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.search.test.rule.SearchTestRule;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.Index;
import com.liferay.portal.workflow.metrics.rest.client.http.HttpInvoker;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.IndexResource;
import com.liferay.portal.workflow.metrics.rest.resource.v1_0.test.helper.WorkflowMetricsRESTTestHelper;

import java.util.Arrays;
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
public class IndexResourceTest extends BaseIndexResourceTestCase {

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_indexResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				IndexResource.class, testCompany);
	}

	@Override
	@Test
	public void testGetIndexesPage() throws Exception {
		Page<Index> indexesPage = indexResource.getIndexesPage();

		List<Index> indexes = (List<Index>)indexesPage.getItems();

		Assert.assertEquals(indexes.toString(), 7, indexes.size());

		assertEqualsIgnoringOrder(indexes, _getDefaultIndexes());

		_testGetIndexesPageWithoutPermission();
	}

	@Override
	@Test
	public void testPatchIndexRefresh() throws Exception {
		_assertPatchIndexes(indexResource::patchIndexRefreshHttpResponse);

		_testPatchIndexRefreshWithoutPermission();
	}

	@Override
	@Test
	public void testPatchIndexReindex() throws Exception {
		_assertPatchIndexes(indexResource::patchIndexReindexHttpResponse);

		_testPatchIndexReindexWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"key"};
	}

	private void _assertPatchIndexes(
			UnsafeFunction<Index, HttpInvoker.HttpResponse, Exception>
				patchIndexesHttpResponseUnsafeFunction)
		throws Exception {

		assertHttpResponseStatusCode(
			400, patchIndexesHttpResponseUnsafeFunction.apply(new Index()));

		assertHttpResponseStatusCode(
			400,
			patchIndexesHttpResponseUnsafeFunction.apply(
				new Index() {
					{
						key = "Invalid";
					}
				}));

		for (Index index : _getDefaultIndexes()) {
			assertHttpResponseStatusCode(
				204, patchIndexesHttpResponseUnsafeFunction.apply(index));
		}

		assertHttpResponseStatusCode(
			204,
			patchIndexesHttpResponseUnsafeFunction.apply(
				new Index() {
					{
						key = Index.Group.METRIC.getValue();
					}
				}));
		assertHttpResponseStatusCode(
			204,
			patchIndexesHttpResponseUnsafeFunction.apply(
				new Index() {
					{
						key = Index.Group.SLA.getValue();
					}
				}));
		assertHttpResponseStatusCode(
			204,
			patchIndexesHttpResponseUnsafeFunction.apply(
				new Index() {
					{
						key = Index.Group.ALL.getValue();
					}
				}));
	}

	private List<Index> _getDefaultIndexes() {
		return Arrays.asList(
			new Index() {
				{
					key = "instance";
				}
			},
			new Index() {
				{
					key = "node";
				}
			},
			new Index() {
				{
					key = "process";
				}
			},
			new Index() {
				{
					key = "sla-instance-result";
				}
			},
			new Index() {
				{
					key = "sla-task-result";
				}
			},
			new Index() {
				{
					key = "task";
				}
			},
			new Index() {
				{
					key = "transition";
				}
			});
	}

	private void _testGetIndexesPageWithoutPermission() throws Exception {
		assertHttpResponseStatusCode(
			404, _indexResource.getIndexesPageHttpResponse());
	}

	private void _testPatchIndexRefreshWithoutPermission() throws Exception {
		assertHttpResponseStatusCode(
			403,
			_indexResource.patchIndexRefreshHttpResponse(
				new Index() {
					{
						key = Index.Group.ALL.getValue();
					}
				}));
	}

	private void _testPatchIndexReindexWithoutPermission() throws Exception {
		assertHttpResponseStatusCode(
			403,
			_indexResource.patchIndexReindexHttpResponse(
				new Index() {
					{
						key = Index.Group.ALL.getValue();
					}
				}));
	}

	private IndexResource _indexResource;

	@Inject
	private WorkflowMetricsRESTTestHelper _workflowMetricsRESTTestHelper;

}