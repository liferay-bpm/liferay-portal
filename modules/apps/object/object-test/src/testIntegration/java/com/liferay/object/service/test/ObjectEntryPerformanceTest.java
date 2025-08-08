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
import com.liferay.object.field.builder.BooleanObjectFieldBuilder;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.rest.dto.v1_0.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
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
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.service.CompanyLocalServiceUtil;
import com.liferay.portal.kernel.service.ResourcePermissionLocalService;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import com.liferay.portal.kernel.test.performance.PerformanceTimer;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.AssumeTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.transaction.Propagation;
import com.liferay.portal.kernel.transaction.TransactionConfig;
import com.liferay.portal.kernel.transaction.TransactionInvokerUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
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
import com.liferay.portal.vulcan.fields.NestedFieldsContext;
import com.liferay.portal.vulcan.fields.NestedFieldsContextThreadLocal;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.io.Closeable;

import java.net.ConnectException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
		_objectDefinition = ObjectDefinitionTestUtil.addCustomObjectDefinition(
			false,
			Collections.singletonList(
				ObjectFieldUtil.createObjectField(
					ObjectFieldConstants.BUSINESS_TYPE_TEXT,
					ObjectFieldConstants.DB_TYPE_STRING, "Performance",
					"performance")));

		_objectDefinition =
			_objectDefinitionLocalService.publishCustomObjectDefinition(
				TestPropsValues.getUserId(),
				_objectDefinition.getObjectDefinitionId());

		ObjectEntryManager objectEntryManager =
			_objectEntryManagerRegistry.getObjectEntryManager(
				_objectDefinition.getStorageType());

		DTOConverterContext dtoConverterContext =
			new DefaultDTOConverterContext(
				false, Collections.emptyMap(), _dtoConverterRegistry, null,
				LocaleUtil.getDefault(), null, TestPropsValues.getUser());

		for (int i = 0; i < _objectEntriesCount; i++) {
			objectEntryManager.addObjectEntry(
				dtoConverterContext, _objectDefinition,
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
					_objectDefinition.getObjectDefinitionId())) {

			_objectEntryLocalService.getObjectEntries(
				0, _objectDefinition.getObjectDefinitionId(), QueryUtil.ALL_POS,
				QueryUtil.ALL_POS);
		}
	}

	@Test
	public void testGetObjectEntriesWithNestedFields() throws Exception {
		List<ObjectField> objectFields = new ArrayList<>();

		int objectFieldsCount = GetterUtil.getInteger(
			_properties.getProperty("object.fields.count"));

		for (int i = 0; i < objectFieldsCount; i++) {
			objectFields.add(
				new BooleanObjectFieldBuilder(
				).labelMap(
					RandomTestUtil.randomLocaleStringMap()
				).name(
					"a" + RandomTestUtil.randomString()
				).build());
		}

		ObjectDefinition objectDefinition1 =
			ObjectDefinitionTestUtil.publishObjectDefinition(
				objectFields, ObjectDefinitionConstants.SCOPE_COMPANY,
				TestPropsValues.getUserId());

		List<String> objectRelationshipNames = new ArrayList<>();

		ObjectRelationship accountEntryObjectRelationship1 =
			ObjectRelationshipTestUtil.addObjectRelationship(
				_objectRelationshipLocalService,
				objectDefinitionLocalService.fetchObjectDefinition(
					TestPropsValues.getCompanyId(), "AccountEntry"),
				objectDefinition1);

		objectRelationshipNames.add(accountEntryObjectRelationship1.getName());

		objectDefinition1.setAccountEntryRestrictedObjectFieldId(
			accountEntryObjectRelationship1.getObjectFieldId2());

		objectDefinition1.setAccountEntryRestricted(true);

		objectDefinition1 = objectDefinitionLocalService.updateObjectDefinition(
			objectDefinition1);

		Map<String, String> accountEntryRelationshipObjectFieldNames =
			new HashMap<>();
		List<ObjectDefinition> relatedObjectDefinitions = new ArrayList<>();
		Map<String, String> relationshipObjectFieldNames = new HashMap<>();

		int relatedObjectDefinitionsCount = GetterUtil.getInteger(
			_properties.getProperty("related.object.definitions.count"));

		for (int i = 0; i < relatedObjectDefinitionsCount; i++) {
			ObjectDefinition objectDefinition2 =
				ObjectDefinitionTestUtil.publishObjectDefinition(
					objectFields, ObjectDefinitionConstants.SCOPE_COMPANY,
					TestPropsValues.getUserId());

			ObjectRelationship accountEntryObjectRelationship2 =
				ObjectRelationshipTestUtil.addObjectRelationship(
					_objectRelationshipLocalService,
					objectDefinitionLocalService.fetchObjectDefinition(
						TestPropsValues.getCompanyId(), "AccountEntry"),
					objectDefinition2);

			ObjectField accountEntryRelationshipObjectField2 =
				_objectFieldLocalService.getObjectField(
					accountEntryObjectRelationship2.getObjectFieldId2());

			accountEntryRelationshipObjectFieldNames.put(
				objectDefinition2.getName(),
				accountEntryRelationshipObjectField2.getName());

			objectDefinition2.setAccountEntryRestrictedObjectFieldId(
				accountEntryObjectRelationship2.getObjectFieldId2());

			objectDefinition2.setAccountEntryRestricted(true);

			objectDefinition2 =
				objectDefinitionLocalService.updateObjectDefinition(
					objectDefinition2);

			relatedObjectDefinitions.add(objectDefinition2);

			ObjectRelationship objectRelationship =
				ObjectRelationshipTestUtil.addObjectRelationship(
					_objectRelationshipLocalService, objectDefinition1,
					objectDefinition2);

			objectRelationshipNames.add(objectRelationship.getName());

			ObjectField relationshipObjectField =
				_objectFieldLocalService.getObjectField(
					objectRelationship.getObjectFieldId2());

			relationshipObjectFieldNames.put(
				objectDefinition2.getName(), relationshipObjectField.getName());
		}

		ObjectEntryManager objectEntryManager =
			_objectEntryManagerRegistry.getObjectEntryManager(
				objectDefinition1.getStorageType());

		DTOConverterContext dtoConverterContext =
			new DefaultDTOConverterContext(
				false, Collections.emptyMap(), _dtoConverterRegistry, null,
				LocaleUtil.getDefault(), null, TestPropsValues.getUser());

		AccountEntry accountEntry = _accountEntryLocalService.addAccountEntry(
			StringPool.BLANK, TestPropsValues.getUserId(), 0L,
			RandomTestUtil.randomString(), RandomTestUtil.randomString(), null,
			null, null, RandomTestUtil.randomString(),
			AccountConstants.ACCOUNT_ENTRY_TYPE_BUSINESS,
			WorkflowConstants.STATUS_APPROVED,
			ServiceContextTestUtil.getServiceContext());

		ObjectField accountEntryRelationshipObjectField =
			_objectFieldLocalService.getObjectField(
				accountEntryObjectRelationship1.getObjectFieldId2());

		int objectEntriesNestedFieldsCount = GetterUtil.getInteger(
			_properties.getProperty("object.entries.with.nested.fields.count"));

		for (int i = 0; i < objectEntriesNestedFieldsCount; i++) {
			ObjectEntry objectEntry = objectEntryManager.addObjectEntry(
				dtoConverterContext, objectDefinition1,
				new ObjectEntry() {
					{
						properties = HashMapBuilder.<String, Object>put(
							accountEntryRelationshipObjectField.getName(),
							accountEntry.getAccountEntryId()
						).build();
					}
				},
				ObjectDefinitionConstants.SCOPE_COMPANY);

			for (ObjectDefinition relatedObjectDefinition :
					relatedObjectDefinitions) {

				objectEntryManager.addObjectEntry(
					dtoConverterContext, relatedObjectDefinition,
					new ObjectEntry() {
						{
							properties = HashMapBuilder.<String, Object>put(
								accountEntryRelationshipObjectFieldNames.get(
									relatedObjectDefinition.getName()),
								accountEntry.getAccountEntryId()
							).put(
								relationshipObjectFieldNames.get(
									relatedObjectDefinition.getName()),
								objectEntry.getId()
							).build();
						}
					},
					ObjectDefinitionConstants.SCOPE_COMPANY);
			}
		}

		// Nested fields: object relationship name

		Role role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);

		User user = UserTestUtil.addUser();

		UserLocalServiceUtil.addRoleUser(role.getRoleId(), user.getUserId());

		_accountEntryUserRelLocalService.addAccountEntryUserRel(
			accountEntry.getAccountEntryId(), user.getUserId());

		String originalName = PrincipalThreadLocal.getName();
		PermissionChecker originalPermissionChecker =
			PermissionThreadLocal.getPermissionChecker();

		PermissionThreadLocal.setPermissionChecker(
			PermissionCheckerFactoryUtil.create(user));

		PrincipalThreadLocal.setName(user.getUserId());

		dtoConverterContext = new DefaultDTOConverterContext(
			false, Collections.emptyMap(), _dtoConverterRegistry, null,
			LocaleUtil.getDefault(), null, user);

		NestedFieldsContext originalNestedFieldsContext =
			NestedFieldsContextThreadLocal.getNestedFieldsContext();

		NestedFieldsContextThreadLocal.setNestedFieldsContext(
			new NestedFieldsContext(
				1, null, objectRelationshipNames, null, null, null));

		try (Closeable closeable = new PerformanceTimer(
				GetterUtil.getInteger(
					_properties.getProperty("object.entries.get.max.time")),
				"Get object entries with nested fields object relationship " +
					"name by object definition " +
						objectDefinition1.getObjectDefinitionId())) {

			objectEntryManager.getObjectEntries(
				TestPropsValues.getCompanyId(), objectDefinition1, null, null,
				dtoConverterContext, (String)null,
				Pagination.of(
					1,
					GetterUtil.getInteger(
						_properties.getProperty(
							"object.entries.max.page.size"))),
				null, null);
		}

		NestedFieldsContextThreadLocal.setNestedFieldsContext(
			originalNestedFieldsContext);

		PermissionThreadLocal.setPermissionChecker(originalPermissionChecker);

		PrincipalThreadLocal.setName(originalName);

		_objectDefinitionLocalService.deleteObjectDefinition(objectDefinition1);

		for (ObjectDefinition relatedObjectDefinition :
				relatedObjectDefinitions) {

			_objectDefinitionLocalService.deleteObjectDefinition(
				relatedObjectDefinition);
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

			_objectDefinition = objectDefinitions.get(0);

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

	@Inject
	protected static ObjectDefinitionLocalService objectDefinitionLocalService;

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
					_objectDefinition.getObjectDefinitionId());
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

	@Inject
	private DTOConverterRegistry _dtoConverterRegistry;

	@Inject
	private JSONFactory _jsonFactory;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;

	@Inject
	private ObjectFieldLocalService _objectFieldLocalService;

	@Inject
	private ObjectFolderResource.Factory _objectFolderResourceFactory;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

	@Inject
	private ResourcePermissionLocalService _resourcePermissionLocalService;

}