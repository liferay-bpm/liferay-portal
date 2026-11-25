/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.rest.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.headless.batch.engine.client.http.HttpInvoker.HttpResponse;
import com.liferay.headless.batch.engine.client.resource.v1_0.ImportTaskResource;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.search.document.Document;
import com.liferay.portal.search.test.rule.SearchTestRule;
import com.liferay.portal.test.log.LogCapture;
import com.liferay.portal.test.log.LoggerTestUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.workflow.metrics.rest.client.dto.v1_0.Process;
import com.liferay.portal.workflow.metrics.rest.client.http.HttpInvoker;
import com.liferay.portal.workflow.metrics.rest.client.resource.v1_0.ProcessResource;
import com.liferay.portal.workflow.metrics.rest.resource.v1_0.test.helper.WorkflowMetricsRESTTestHelper;

import java.util.ArrayList;
import java.util.List;

import org.junit.After;
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
public class ProcessResourceTest extends BaseProcessResourceTestCase {

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_documents = _workflowMetricsRESTTestHelper.getDocuments(
			testGroup.getCompanyId());

		for (Document document : _documents) {
			_workflowMetricsRESTTestHelper.deleteProcess(
				document.getLong("companyId"), document.getLong("processId"));
		}

		_importTaskResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				ImportTaskResource.class, testCompany);

		_processResource =
			_workflowMetricsRESTTestHelper.getUserWithoutResourcePermissions(
				ProcessResource.class, testCompany);
	}

	@After
	@Override
	public void tearDown() throws Exception {
		super.tearDown();

		for (Document document : _documents) {
			_workflowMetricsRESTTestHelper.restoreProcess(document);
		}

		_deleteProcesses();
	}

	@Override
	@Test
	public void testBatchEngineDeleteImportTask() throws Exception {
		super.testBatchEngineDeleteImportTask();

		_testBatchEngineDeleteImportTaskWithoutPermission();
	}

	@Override
	@Test
	public void testDeleteProcess() throws Exception {
		super.testDeleteProcess();

		_testDeleteProcessWithoutPermission();
	}

	@Override
	@Test
	public void testGetProcess() throws Exception {
		super.testGetProcess();

		_testGetProcessWithoutPermission();
	}

	@Override
	@Test
	public void testGetProcessTitle() throws Exception {
		Process process = randomProcess();

		_addProcess(process);

		String title = processResource.getProcessTitle(process.getId());

		Assert.assertEquals(process.getTitle(), title);

		_testGetProcessTitleWithoutPermission();
	}

	@Override
	@Test
	public void testGraphQLGetProcess() throws Exception {
		super.testGraphQLGetProcess();

		_testGraphQLGetProcessWithoutPermission();
	}

	@Override
	@Test
	public void testPostProcess() throws Exception {
		super.testPostProcess();

		_testPostProcessWithoutPermission();
	}

	@Override
	@Test
	public void testPutProcess() throws Exception {
		super.testPutProcess();

		_testPutProcessWithoutPermission();
	}

	@Rule
	public SearchTestRule searchTestRule = new SearchTestRule();

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"title"};
	}

	@Override
	protected Process randomProcess() throws Exception {
		Process process = super.randomProcess();

		process.setTitle(RandomTestUtil.randomString());
		process.setTitle_i18n(
			HashMapBuilder.put(
				LocaleUtil.US.toString(), process.getTitle()
			).build());

		return process;
	}

	@Override
	protected Process testDeleteProcess_addProcess() throws Exception {
		return testGetProcess_addProcess();
	}

	@Override
	protected Process testGetProcess_addProcess() throws Exception {
		return _addProcess(randomProcess());
	}

	@Override
	protected Process testGraphQLProcess_addProcess() throws Exception {
		return testGetProcess_addProcess();
	}

	@Override
	protected Process testPostProcess_addProcess(Process process)
		throws Exception {

		return _addProcess(process);
	}

	@Override
	protected Process testPutProcess_addProcess() throws Exception {
		return testGetProcess_addProcess();
	}

	private Process _addProcess(Process process) throws Exception {
		process = _workflowMetricsRESTTestHelper.addProcess(
			testGroup.getCompanyId(), process);

		_processes.add(process);

		return process;
	}

	private void _deleteProcesses() throws Exception {
		for (Process process : _processes) {
			_workflowMetricsRESTTestHelper.deleteProcess(
				testGroup.getCompanyId(), process);
		}
	}

	private void _testBatchEngineDeleteImportTaskWithoutPermission()
		throws Exception {

		Process process = testBatchEngineDeleteImportTask_addProcess();

		try (LogCapture logCapture = LoggerTestUtil.configureLog4JLogger(
				"com.liferay.batch.engine.internal." +
					"BatchEngineImportTaskExecutorImpl",
				LoggerTestUtil.ERROR)) {

			HttpResponse httpResponse =
				_importTaskResource.deleteImportTaskHttpResponse(
					"com.liferay.portal.workflow.metrics.rest.dto.v1_0.Process",
					null, null, "ON_ERROR_FAIL", null,
					JSONUtil.putAll(JSONUtil.put("id", process.getId())));

			Assert.assertEquals(200, httpResponse.getStatusCode());

			waitForFinish(
				"FAILED",
				JSONFactoryUtil.createJSONObject(httpResponse.getContent()));
		}

		assertHttpResponseStatusCode(
			200, processResource.getProcessHttpResponse(process.getId()));
	}

	private void _testDeleteProcessWithoutPermission() throws Exception {
		Process process = testDeleteProcess_addProcess();

		assertHttpResponseStatusCode(
			403, _processResource.deleteProcessHttpResponse(process.getId()));

		assertHttpResponseStatusCode(
			200, processResource.getProcessHttpResponse(process.getId()));
	}

	private void _testGetProcessTitleWithoutPermission() throws Exception {
		Process process = testGetProcess_addProcess();

		assertHttpResponseStatusCode(
			404, _processResource.getProcessTitleHttpResponse(process.getId()));
	}

	private void _testGetProcessWithoutPermission() throws Exception {
		Process process = testGetProcess_addProcess();

		assertHttpResponseStatusCode(
			404, _processResource.getProcessHttpResponse(process.getId()));
	}

	private void _testGraphQLGetProcessWithoutPermission() throws Exception {
		String password = RandomTestUtil.randomString();

		User user = UserTestUtil.addUser(testCompany, password);

		GraphQLField processGraphQLField = new GraphQLField(
			"process",
			HashMapBuilder.<String, Object>put(
				"processId",
				() -> {
					Process process = testGraphQLGetProcess_addProcess();

					return process.getId();
				}
			).build(),
			getGraphQLFields());

		for (GraphQLField graphQLField :
				new GraphQLField[] {
					processGraphQLField,
					new GraphQLField(
						"portalWorkflowMetrics_v1_0", processGraphQLField)
				}) {

			HttpInvoker httpInvoker = HttpInvoker.newHttpInvoker();

			httpInvoker.body(
				JSONUtil.put(
					"query",
					String.valueOf(new GraphQLField("query", graphQLField))
				).toString(),
				"application/json");
			httpInvoker.httpMethod(HttpInvoker.HttpMethod.POST);
			httpInvoker.path(
				"http://localhost:" + PortalUtil.getPortalServerPort(false) +
					"/o/graphql");
			httpInvoker.userNameAndPassword(
				user.getEmailAddress() + ":" + password);

			HttpInvoker.HttpResponse httpResponse = httpInvoker.invoke();

			JSONObject jsonObject = JSONFactoryUtil.createJSONObject(
				httpResponse.getContent());

			JSONArray errorsJSONArray = jsonObject.getJSONArray("errors");

			Assert.assertTrue(errorsJSONArray.length() > 0);
		}
	}

	private void _testPostProcessWithoutPermission() throws Exception {
		Process process = randomProcess();

		assertHttpResponseStatusCode(
			403, _processResource.postProcessHttpResponse(process));

		assertHttpResponseStatusCode(
			404, processResource.getProcessHttpResponse(process.getId()));
	}

	private void _testPutProcessWithoutPermission() throws Exception {
		Process process = testPutProcess_addProcess();

		assertHttpResponseStatusCode(
			403,
			_processResource.putProcessHttpResponse(
				process.getId(), randomProcess()));

		assertEquals(process, processResource.getProcess(process.getId()));
	}

	private Document[] _documents;
	private ImportTaskResource _importTaskResource;
	private ProcessResource _processResource;
	private final List<Process> _processes = new ArrayList<>();

	@Inject
	private WorkflowMetricsRESTTestHelper _workflowMetricsRESTTestHelper;

}