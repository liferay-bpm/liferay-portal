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
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.Node;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.Process;
import com.liferay.portal.workflow.metrics.rest.client.pagination.Page;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.NodeResource;
import com.liferay.portal.workflow.metrics.rest.resource.v1_0.test.helper.WorkflowMetricsRESTTestHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Rafael Praxedes
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class NodeResourceTest extends BaseNodeResourceTestCase {

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_process = _workflowMetricsRESTTestHelper.addProcess(
			testGroup.getCompanyId());
	}

	@After
	@Override
	public void tearDown() throws Exception {
		super.tearDown();

		if (_process != null) {
			_workflowMetricsRESTTestHelper.deleteProcess(
				testGroup.getCompanyId(), _process);
		}

		_deleteNodes();
	}

	@Override
	@Test
	public void testDeleteProcessNode() throws Exception {
		super.testDeleteProcessNode();

		_testDeleteProcessNodeWithoutPermission();
	}

	@Override
	@Test
	public void testGetProcessNodesPage() throws Exception {
		super.testGetProcessNodesPage();

		_deleteNodes();

		Node node1 = randomNode();

		node1.setId(1L);
		node1.setName("A");

		node1 = testGetProcessNodesPage_addNode(_process.getId(), node1);

		Node node2 = randomNode();

		node2.setId(2L);
		node2.setName("B");

		node2 = testGetProcessNodesPage_addNode(_process.getId(), node2);

		_workflowMetricsRESTTestHelper.updateProcess(
			testGroup.getCompanyId(), _process.getId(), "2.0");

		node1.setId(3L);

		node1 = _addNode(node1, _process.getId(), "2.0");

		node2.setId(4L);

		node2 = _addNode(node2, _process.getId(), "2.0");

		Page<Node> page = nodeResource.getProcessNodesPage(_process.getId());

		assertEqualsIgnoringOrder(
			Arrays.asList(node1, node2), (List<Node>)page.getItems());

		_testGetProcessNodesPageWithoutPermission();
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLDeleteProcessNode() throws Exception {
		super.testGraphQLDeleteProcessNode();
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLGetProcessNodesPage() throws Exception {
		super.testGraphQLGetProcessNodesPage();
	}

	@Ignore
	@Override
	@Test
	public void testGraphQLPostProcessNode() throws Exception {
		super.testGraphQLPostProcessNode();
	}

	@Override
	@Test
	public void testPostProcessNode() throws Exception {
		super.testPostProcessNode();

		_testPostProcessNodeWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"name"};
	}

	@Override
	protected Node testDeleteProcessNode_addNode() throws Exception {
		return testGetProcessNodesPage_addNode(_process.getId(), randomNode());
	}

	@Override
	protected Long testDeleteProcessNode_getProcessId(Node node) {
		return node.getProcessId();
	}

	@Override
	protected Node testGetProcessNodesPage_addNode(Long processId, Node node)
		throws Exception {

		return _addNode(node, processId, "1.0");
	}

	@Override
	protected Map<String, Map<String, String>>
			testGetProcessNodesPage_getExpectedActions(Long processId)
		throws Exception {

		return Collections.emptyMap();
	}

	@Override
	protected Long testGetProcessNodesPage_getProcessId() throws Exception {
		return _process.getId();
	}

	private Node _addNode(Node node, Long processId, String version)
		throws Exception {

		node = _workflowMetricsRESTTestHelper.addNode(
			testGroup.getCompanyId(), node, processId, version);

		_nodes.add(node);

		return node;
	}

	private void _deleteNodes() throws Exception {
		for (Node node : _nodes) {
			_workflowMetricsRESTTestHelper.deleteNode(
				testGroup.getCompanyId(), node, _process.getId());
		}
	}

	private NodeResource _getUserWithoutPermissionsNodeResource()
		throws Exception {

		String password = RandomTestUtil.randomString();

		User user = UserTestUtil.addUser(testCompany, password);

		return NodeResource.builder(
		).authentication(
			user.getEmailAddress(), password
		).endpoint(
			testCompany.getVirtualHostname(),
			PortalUtil.getPortalServerPort(false), "http"
		).locale(
			LocaleUtil.getDefault()
		).build();
	}

	private void _testDeleteProcessNodeWithoutPermission() throws Exception {
		Node node = testDeleteProcessNode_addNode();

		NodeResource userNodeResource =
			_getUserWithoutPermissionsNodeResource();

		assertHttpResponseStatusCode(
			403,
			userNodeResource.deleteProcessNodeHttpResponse(
				_process.getId(), node.getId()));

		Page<Node> page = nodeResource.getProcessNodesPage(_process.getId());

		assertContains(node, (List<Node>)page.getItems());
	}

	private void _testGetProcessNodesPageWithoutPermission() throws Exception {
		NodeResource userNodeResource =
			_getUserWithoutPermissionsNodeResource();

		assertHttpResponseStatusCode(
			404,
			userNodeResource.getProcessNodesPageHttpResponse(_process.getId()));
	}

	private void _testPostProcessNodeWithoutPermission() throws Exception {
		Page<Node> page = nodeResource.getProcessNodesPage(_process.getId());

		long totalCount = page.getTotalCount();

		NodeResource userNodeResource =
			_getUserWithoutPermissionsNodeResource();

		assertHttpResponseStatusCode(
			403,
			userNodeResource.postProcessNodeHttpResponse(
				_process.getId(), randomNode()));

		page = nodeResource.getProcessNodesPage(_process.getId());

		Assert.assertEquals(totalCount, page.getTotalCount());
	}

	private final List<Node> _nodes = new ArrayList<>();
	private Process _process;

	@Inject
	private WorkflowMetricsRESTTestHelper _workflowMetricsRESTTestHelper;

}