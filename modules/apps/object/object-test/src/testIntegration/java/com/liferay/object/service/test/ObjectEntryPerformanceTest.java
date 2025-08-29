/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.test;

import com.liferay.account.constants.AccountConstants;
import com.liferay.account.model.AccountEntry;
import com.liferay.account.service.AccountEntryLocalService;
import com.liferay.account.service.AccountEntryUserRelLocalService;
import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.admin.rest.client.http.HttpInvoker;
import com.liferay.object.admin.rest.dto.v1_0.ObjectFolder;
import com.liferay.object.admin.rest.resource.v1_0.ObjectFolderResource;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.related.models.test.util.ObjectEntryTestUtil;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.object.test.util.ObjectRelationshipTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.petra.string.StringUtil;
import com.liferay.portal.configuration.test.util.CompanyConfigurationTemporarySwapper;
import com.liferay.portal.kernel.dao.orm.QueryUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.ResourceConstants;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.service.CompanyLocalServiceUtil;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.RoleLocalService;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.performance.PerformanceTimer;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.AssumeTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.HTTPTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.transaction.Propagation;
import com.liferay.portal.kernel.transaction.TransactionConfig;
import com.liferay.portal.kernel.transaction.TransactionInvokerUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.Http;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.util.PropertiesUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;
import com.liferay.portal.util.PortalInstances;
import com.liferay.portal.util.PropsValues;
import com.liferay.portal.vulcan.dto.converter.DTOConverterContext;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;

import java.io.Closeable;
import java.io.Serializable;

import java.net.ConnectException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.function.Predicate;

import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Mateus Santana
 */
@RunWith(Arquillian.class)
public class ObjectEntryPerformanceTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new AssumeTestRule("assume"), new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	public static void assume() {
		Assume.assumeTrue(Validator.isNull(System.getenv("JENKINS_HOME")));
	}

	@BeforeClass
	public static void setUpClass() throws Exception {
		Class<?> clazz = ObjectEntryPerformanceTest.class;

		_properties = PropertiesUtil.load(
			clazz.getResourceAsStream(
				"dependencies/object-entry-performance.properties"),
			"UTF-8");

		_objectEntriesCount = GetterUtil.getInteger(
			_properties.getProperty("object.entries.count"));
	}

	@Test
	public void testGetObjectEntries() throws Exception {
		_customObjectDefinition =
			ObjectDefinitionTestUtil.addCustomObjectDefinition(
				false,
				Collections.singletonList(
					ObjectFieldUtil.createObjectField(
						ObjectFieldConstants.BUSINESS_TYPE_TEXT,
						ObjectFieldConstants.DB_TYPE_STRING, "Performance",
						"performance")));

		_customObjectDefinition =
			_objectDefinitionLocalService.publishCustomObjectDefinition(
				TestPropsValues.getUserId(),
				_customObjectDefinition.getObjectDefinitionId());

		ObjectEntryManager objectEntryManager =
			_objectEntryManagerRegistry.getObjectEntryManager(
				_customObjectDefinition.getStorageType());

		DTOConverterContext dtoConverterContext =
			new DefaultDTOConverterContext(
				false, Collections.emptyMap(), _dtoConverterRegistry, null,
				LocaleUtil.getDefault(), null, TestPropsValues.getUser());

		for (int i = 0; i < _objectEntriesCount; i++) {
			objectEntryManager.addObjectEntry(
				dtoConverterContext, _customObjectDefinition,
				new ObjectEntry() {
					{
						properties = HashMapBuilder.<String, Object>put(
							"performance", RandomTestUtil.randomString()
						).build();
					}
				},
				ObjectDefinitionConstants.SCOPE_COMPANY);
		}

		try (Closeable closeable = new PerformanceTimer(
				GetterUtil.getInteger(
					_properties.getProperty("object.entries.get.max.time")),
				"Get object entries by object definition " +
					_customObjectDefinition.getObjectDefinitionId())) {

			_objectEntryLocalService.getObjectEntries(
				0, _customObjectDefinition.getObjectDefinitionId(),
				QueryUtil.ALL_POS, QueryUtil.ALL_POS);
		}
	}

	@Test
	public void testGetObjectEntriesWithNestedFields() throws Exception {
		_customObjectDefinition =
			ObjectDefinitionTestUtil.publishObjectDefinition();

		List<Long> objectEntryIds = new ArrayList<>();

		for (int i = 0; i < _objectEntriesCount; i++) {
			com.liferay.object.model.ObjectEntry objectEntry =
				ObjectEntryTestUtil.addObjectEntry(
					0, _customObjectDefinition.getObjectDefinitionId(),
					Collections.emptyMap());

			objectEntryIds.add(objectEntry.getObjectEntryId());
		}

		List<String> objectRelationshipNames1 = new ArrayList<>();
		List<String> objectRelationshipNames2 = new ArrayList<>();

		for (int i = 0;
			 i < GetterUtil.getInteger(
				 _properties.getProperty("related.object.definitions.count"));
			 i++) {

			ObjectDefinition relatedObjectDefinition =
				ObjectDefinitionTestUtil.publishObjectDefinition();

			ObjectRelationship objectRelationship1 =
				ObjectRelationshipTestUtil.addObjectRelationship(
					_objectRelationshipLocalService,
					_objectDefinitionLocalService.fetchObjectDefinition(
						_customObjectDefinition.getCompanyId(), "AccountEntry"),
					relatedObjectDefinition);

			objectRelationshipNames1.add(objectRelationship1.getName());

			ObjectRelationship objectRelationship2 =
				ObjectRelationshipTestUtil.addObjectRelationship(
					_objectRelationshipLocalService, _customObjectDefinition,
					relatedObjectDefinition);

			objectRelationshipNames2.add(objectRelationship2.getName());

			relatedObjectDefinition =
				_objectDefinitionLocalService.enableAccountEntryRestricted(
					objectRelationship1);

			_relatedObjectDefinitions.add(relatedObjectDefinition);
		}

		AccountEntry accountEntry = _accountEntryLocalService.addAccountEntry(
			StringPool.BLANK, TestPropsValues.getUserId(), 0L,
			RandomTestUtil.randomString(), RandomTestUtil.randomString(), null,
			null, null, RandomTestUtil.randomString(),
			AccountConstants.ACCOUNT_ENTRY_TYPE_BUSINESS,
			WorkflowConstants.STATUS_APPROVED,
			ServiceContextTestUtil.getServiceContext());

		for (int i = 0;
			 i < GetterUtil.getInteger(
				 _properties.getProperty("related.object.entries.count"));
			 i++) {

			for (int j = 0;
				 j < GetterUtil.getInteger(
					 _properties.getProperty(
						 "related.object.definitions.count"));
				 j++) {

				ObjectDefinition relatedObjectDefinition =
					_relatedObjectDefinitions.get(j);

				ObjectEntryTestUtil.addObjectEntry(
					0, relatedObjectDefinition.getObjectDefinitionId(),
					HashMapBuilder.<String, Serializable>put(
						StringBundler.concat(
							"r_", objectRelationshipNames1.get(j),
							"_accountEntryId"),
						accountEntry.getAccountEntryId()
					).put(
						StringBundler.concat(
							"r_", objectRelationshipNames2.get(j), "_",
							_customObjectDefinition.getPKObjectFieldName()),
						objectEntryIds.get(i % _objectEntriesCount)
					).build());
			}
		}

		String password = RandomTestUtil.randomString();

		User user = UserTestUtil.addUser(
			_customObjectDefinition.getCompanyId(), TestPropsValues.getUserId(),
			password, RandomTestUtil.randomString() + "@liferay.com",
			RandomTestUtil.randomString(), LocaleUtil.getDefault(),
			RandomTestUtil.randomString(), RandomTestUtil.randomString(), null,
			ServiceContextTestUtil.getServiceContext());

		user.setEmailAddressVerified(true);

		user = _userLocalService.updateUser(user);

		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry.getAccountEntryId(), user.getUserId());

		Role role = _roleLocalService.getRole(
			_customObjectDefinition.getCompanyId(), RoleConstants.USER);

		_resourcePermissionLocalService.addResourcePermission(
			_customObjectDefinition.getCompanyId(),
			_customObjectDefinition.getClassName(),
			ResourceConstants.SCOPE_COMPANY,
			String.valueOf(_customObjectDefinition.getCompanyId()),
			role.getRoleId(), ActionKeys.VIEW);

		try (Closeable closeable = new PerformanceTimer(
				GetterUtil.getInteger(
					_properties.getProperty("object.entries.get.max.time")),
				"Get object entries with nested fields")) {

			HTTPTestUtil.customize(
			).withCredentials(
				user.getEmailAddress(), password
			).apply(
				() -> HTTPTestUtil.invokeToJSONObject(
					null,
					StringBundler.concat(
						_customObjectDefinition.getRESTContextPath(),
						"?nestedFields=",
						StringUtil.merge(
							objectRelationshipNames2, StringPool.COMMA)),
					Http.Method.GET)
			);
		}
	}

	@Test
	public void testHttpPostAndDeleteObjectEntries() throws Throwable {
		TransactionConfig.Builder transactionConfigBuilder =
			new TransactionConfig.Builder();

		_company = TransactionInvokerUtil.invoke(
			transactionConfigBuilder.setPropagation(
				Propagation.REQUIRED
			).setRollbackForClasses(
				Exception.class
			).build(),
			() -> {
				Company company = CompanyLocalServiceUtil.addCompany(
					null, _VIRTUAL_HOST_NAME, _VIRTUAL_HOST_NAME,
					_VIRTUAL_HOST_NAME, 0, true, true, null, null, null, null,
					null, null);

				PortalInstances.initCompany(company);

				return company;
			});

		try {
			_invoke(null, HttpInvoker.HttpMethod.GET, _getPath(""));
		}
		catch (ConnectException connectException) {
			throw new Exception(
				StringBundler.concat(
					"Unable to resolve \"", _VIRTUAL_HOST_NAME, "\". Update ",
					"/etc/hosts and rerun the test."),
				connectException);
		}

		ObjectFolderResource.Builder objectFolderResourceBuilder =
			_objectFolderResourceFactory.create();

		ObjectFolderResource objectFolderResource =
			objectFolderResourceBuilder.user(
				UserTestUtil.getAdminUser(_company.getCompanyId())
			).build();

		objectFolderResource.setContextCompany(_company);

		JSONObject objectFolderJSONObject = _jsonFactory.createJSONObject(
			StringUtil.read(
				ObjectEntryPerformanceTest.class.getClassLoader(),
				"/com/liferay/object/web/internal/object/definitions/portlet" +
					"/action/test/dependencies/test-object-folder-4.json"));

		ObjectFolder objectFolder = ObjectFolder.toDTO(
			objectFolderJSONObject.toString());

		objectFolder.setName("SampleObjectFolder");

		objectFolderResource.putObjectFolderByExternalReferenceCode(
			objectFolder.getExternalReferenceCode(), objectFolder);

		try (PerformanceTimer performanceTimer1 = new PerformanceTimer(
				GetterUtil.getInteger(
					_properties.getProperty("object.entries.import.max.time")),
				StringBundler.concat(
					"Import ", _objectEntriesCount, " object entries"))) {

			JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

			for (int i = 0; i < _objectEntriesCount; i++) {
				jsonArray.put(JSONUtil.put("alpha", "foo"));
			}

			_invoke(
				jsonArray.toString(), HttpInvoker.HttpMethod.POST,
				_getPath("/o/c/foos/batch"));

			List<ObjectDefinition> objectDefinitions =
				_objectDefinitionLocalService.getCustomObjectDefinitions(0);

			_customObjectDefinition = objectDefinitions.get(0);

			_waitFor(
				0,
				currentObjectEntriesCount ->
					currentObjectEntriesCount < _objectEntriesCount);
		}

		try (CompanyConfigurationTemporarySwapper
				companyConfigurationTemporarySwapper =
					new CompanyConfigurationTemporarySwapper(
						_company.getCompanyId(),
						"com.liferay.portal.vulcan.internal.configuration." +
							"HeadlessAPICompanyConfiguration",
						MapUtil.singletonDictionary(
							"pageSizeLimit", _objectEntriesCount));
			PerformanceTimer performanceTimer = new PerformanceTimer(
				GetterUtil.getInteger(
					_properties.getProperty("object.entries.delete.max.time")),
				StringBundler.concat(
					"Delete ", _objectEntriesCount, " object entries"))) {

			HttpInvoker.HttpResponse httpResponse = _invoke(
				null, HttpInvoker.HttpMethod.GET,
				_getPath(
					"/o/c/foos/?fields=id&pageSize=" + _objectEntriesCount));

			JSONObject jsonObject = _jsonFactory.createJSONObject(
				httpResponse.getContent());

			JSONArray jsonArray = (JSONArray)jsonObject.get("items");

			_invoke(
				jsonArray.toString(), HttpInvoker.HttpMethod.DELETE,
				_getPath("/o/c/foos/batch"));

			_waitFor(
				_objectEntriesCount,
				currentObjectEntriesCount -> currentObjectEntriesCount != 0);
		}
	}

	private String _getPath(String pathSuffix) {
		return StringBundler.concat(
			"http://", _VIRTUAL_HOST_NAME, ":8080", pathSuffix);
	}

	private HttpInvoker.HttpResponse _invoke(
			String bodyJSON, HttpInvoker.HttpMethod httpMethod, String path)
		throws Exception {

		HttpInvoker httpInvoker = HttpInvoker.newHttpInvoker();

		if (bodyJSON != null) {
			httpInvoker.body(bodyJSON, "application/json");
		}

		httpInvoker.httpMethod(httpMethod);
		httpInvoker.path(path);
		httpInvoker.userNameAndPassword(
			StringBundler.concat(
				"test@", _VIRTUAL_HOST_NAME, ":",
				PropsValues.DEFAULT_ADMIN_PASSWORD));

		return httpInvoker.invoke();
	}

	private void _waitFor(
		long currentObjectEntriesCount, Predicate<Long> predicate) {

		while (predicate.test(currentObjectEntriesCount)) {
			currentObjectEntriesCount =
				_objectEntryLocalService.getObjectEntriesCount(
					_customObjectDefinition.getObjectDefinitionId());
		}
	}

	private static final String _VIRTUAL_HOST_NAME = "www.able.com";

	private static int _objectEntriesCount;
	private static Properties _properties;

	@Inject
	private AccountEntryLocalService _accountEntryLocalService;

	@Inject
	private AccountEntryUserRelLocalService _accountEntryUserRelLocalService;

	@DeleteAfterTestRun
	private Company _company;

	@DeleteAfterTestRun
	private ObjectDefinition _customObjectDefinition;

	@Inject
	private DTOConverterRegistry _dtoConverterRegistry;

	@Inject
	private JSONFactory _jsonFactory;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

	@Inject
	private ObjectFolderResource.Factory _objectFolderResourceFactory;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@DeleteAfterTestRun
	private List<ObjectDefinition> _relatedObjectDefinitions =
		new ArrayList<>();

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

	@Inject
	private RoleLocalService _roleLocalService;

	@Inject
	private UserLocalService _userLocalService;

}