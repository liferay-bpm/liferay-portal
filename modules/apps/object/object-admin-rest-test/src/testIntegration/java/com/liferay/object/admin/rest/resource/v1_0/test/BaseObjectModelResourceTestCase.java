/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.object.admin.rest.resource.v1_0.test;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.util.ISO8601DateFormat;

import com.liferay.object.admin.rest.client.dto.v1_0.ObjectModel;
import com.liferay.object.admin.rest.client.http.HttpInvoker;
import com.liferay.object.admin.rest.client.pagination.Page;
import com.liferay.object.admin.rest.client.pagination.Pagination;
import com.liferay.object.admin.rest.client.resource.v1_0.ObjectModelResource;
import com.liferay.object.admin.rest.client.serdes.v1_0.ObjectModelSerDes;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.reflect.ReflectionUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.service.CompanyLocalServiceUtil;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.DateFormatFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.odata.entity.EntityField;
import com.liferay.portal.odata.entity.EntityModel;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.resource.EntityModelResource;

import java.lang.reflect.Method;

import java.text.DateFormat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import javax.annotation.Generated;

import javax.ws.rs.core.MultivaluedHashMap;

import org.apache.commons.lang.time.DateUtils;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Murilo Stodolni
 * @generated
 */
@Generated("")
public abstract class BaseObjectModelResourceTestCase {

	@ClassRule
	@Rule
	public static final LiferayIntegrationTestRule liferayIntegrationTestRule =
		new LiferayIntegrationTestRule();

	@BeforeClass
	public static void setUpClass() throws Exception {
		_dateFormat = DateFormatFactoryUtil.getSimpleDateFormat(
			"yyyy-MM-dd'T'HH:mm:ss'Z'");
	}

	@Before
	public void setUp() throws Exception {
		irrelevantGroup = GroupTestUtil.addGroup();
		testGroup = GroupTestUtil.addGroup();

		testCompany = CompanyLocalServiceUtil.getCompany(
			testGroup.getCompanyId());

		_objectModelResource.setContextCompany(testCompany);

		ObjectModelResource.Builder builder = ObjectModelResource.builder();

		objectModelResource = builder.authentication(
			"test@liferay.com", "test"
		).locale(
			LocaleUtil.getDefault()
		).build();
	}

	@After
	public void tearDown() throws Exception {
		GroupTestUtil.deleteGroup(irrelevantGroup);
		GroupTestUtil.deleteGroup(testGroup);
	}

	@Test
	public void testClientSerDesToDTO() throws Exception {
		ObjectMapper objectMapper = new ObjectMapper() {
			{
				configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
				configure(
					SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true);
				enable(SerializationFeature.INDENT_OUTPUT);
				setDateFormat(new ISO8601DateFormat());
				setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
				setSerializationInclusion(JsonInclude.Include.NON_NULL);
				setVisibility(
					PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
				setVisibility(
					PropertyAccessor.GETTER, JsonAutoDetect.Visibility.NONE);
			}
		};

		ObjectModel objectModel1 = randomObjectModel();

		String json = objectMapper.writeValueAsString(objectModel1);

		ObjectModel objectModel2 = ObjectModelSerDes.toDTO(json);

		Assert.assertTrue(equals(objectModel1, objectModel2));
	}

	@Test
	public void testClientSerDesToJSON() throws Exception {
		ObjectMapper objectMapper = new ObjectMapper() {
			{
				configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
				configure(
					SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true);
				setDateFormat(new ISO8601DateFormat());
				setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
				setSerializationInclusion(JsonInclude.Include.NON_NULL);
				setVisibility(
					PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
				setVisibility(
					PropertyAccessor.GETTER, JsonAutoDetect.Visibility.NONE);
			}
		};

		ObjectModel objectModel = randomObjectModel();

		String json1 = objectMapper.writeValueAsString(objectModel);
		String json2 = ObjectModelSerDes.toJSON(objectModel);

		Assert.assertEquals(
			objectMapper.readTree(json1), objectMapper.readTree(json2));
	}

	@Test
	public void testEscapeRegexInStringFields() throws Exception {
		String regex = "^[0-9]+(\\.[0-9]{1,2})\"?";

		ObjectModel objectModel = randomObjectModel();

		objectModel.setExternalReferenceCode(regex);
		objectModel.setName(regex);

		String json = ObjectModelSerDes.toJSON(objectModel);

		Assert.assertFalse(json.contains(regex));

		objectModel = ObjectModelSerDes.toDTO(json);

		Assert.assertEquals(regex, objectModel.getExternalReferenceCode());
		Assert.assertEquals(regex, objectModel.getName());
	}

	@Test
	public void testGetObjectModelsPage() throws Exception {
		Page<ObjectModel> page = objectModelResource.getObjectModelsPage(
			null, Pagination.of(1, 10));

		long totalCount = page.getTotalCount();

		ObjectModel objectModel1 = testGetObjectModelsPage_addObjectModel(
			randomObjectModel());

		ObjectModel objectModel2 = testGetObjectModelsPage_addObjectModel(
			randomObjectModel());

		page = objectModelResource.getObjectModelsPage(
			null, Pagination.of(1, 10));

		Assert.assertEquals(totalCount + 2, page.getTotalCount());

		assertContains(objectModel1, (List<ObjectModel>)page.getItems());
		assertContains(objectModel2, (List<ObjectModel>)page.getItems());
		assertValid(page, testGetObjectModelsPage_getExpectedActions());

		objectModelResource.deleteObjectModel(objectModel1.getId());

		objectModelResource.deleteObjectModel(objectModel2.getId());
	}

	protected Map<String, Map<String, String>>
			testGetObjectModelsPage_getExpectedActions()
		throws Exception {

		Map<String, Map<String, String>> expectedActions = new HashMap<>();

		return expectedActions;
	}

	@Test
	public void testGetObjectModelsPageWithPagination() throws Exception {
		Page<ObjectModel> totalPage = objectModelResource.getObjectModelsPage(
			null, null);

		int totalCount = GetterUtil.getInteger(totalPage.getTotalCount());

		ObjectModel objectModel1 = testGetObjectModelsPage_addObjectModel(
			randomObjectModel());

		ObjectModel objectModel2 = testGetObjectModelsPage_addObjectModel(
			randomObjectModel());

		ObjectModel objectModel3 = testGetObjectModelsPage_addObjectModel(
			randomObjectModel());

		Page<ObjectModel> page1 = objectModelResource.getObjectModelsPage(
			null, Pagination.of(1, totalCount + 2));

		List<ObjectModel> objectModels1 = (List<ObjectModel>)page1.getItems();

		Assert.assertEquals(
			objectModels1.toString(), totalCount + 2, objectModels1.size());

		Page<ObjectModel> page2 = objectModelResource.getObjectModelsPage(
			null, Pagination.of(2, totalCount + 2));

		Assert.assertEquals(totalCount + 3, page2.getTotalCount());

		List<ObjectModel> objectModels2 = (List<ObjectModel>)page2.getItems();

		Assert.assertEquals(objectModels2.toString(), 1, objectModels2.size());

		Page<ObjectModel> page3 = objectModelResource.getObjectModelsPage(
			null, Pagination.of(1, totalCount + 3));

		assertContains(objectModel1, (List<ObjectModel>)page3.getItems());
		assertContains(objectModel2, (List<ObjectModel>)page3.getItems());
		assertContains(objectModel3, (List<ObjectModel>)page3.getItems());
	}

	protected ObjectModel testGetObjectModelsPage_addObjectModel(
			ObjectModel objectModel)
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testGraphQLGetObjectModelsPage() throws Exception {
		GraphQLField graphQLField = new GraphQLField(
			"objectModels",
			new HashMap<String, Object>() {
				{
					put("page", 1);
					put("pageSize", 10);
				}
			},
			new GraphQLField("items", getGraphQLFields()),
			new GraphQLField("page"), new GraphQLField("totalCount"));

		JSONObject objectModelsJSONObject = JSONUtil.getValueAsJSONObject(
			invokeGraphQLQuery(graphQLField), "JSONObject/data",
			"JSONObject/objectModels");

		long totalCount = objectModelsJSONObject.getLong("totalCount");

		ObjectModel objectModel1 =
			testGraphQLGetObjectModelsPage_addObjectModel();
		ObjectModel objectModel2 =
			testGraphQLGetObjectModelsPage_addObjectModel();

		objectModelsJSONObject = JSONUtil.getValueAsJSONObject(
			invokeGraphQLQuery(graphQLField), "JSONObject/data",
			"JSONObject/objectModels");

		Assert.assertEquals(
			totalCount + 2, objectModelsJSONObject.getLong("totalCount"));

		assertContains(
			objectModel1,
			Arrays.asList(
				ObjectModelSerDes.toDTOs(
					objectModelsJSONObject.getString("items"))));
		assertContains(
			objectModel2,
			Arrays.asList(
				ObjectModelSerDes.toDTOs(
					objectModelsJSONObject.getString("items"))));
	}

	protected ObjectModel testGraphQLGetObjectModelsPage_addObjectModel()
		throws Exception {

		return testGraphQLObjectModel_addObjectModel();
	}

	@Test
	public void testPostObjectModel() throws Exception {
		ObjectModel randomObjectModel = randomObjectModel();

		ObjectModel postObjectModel = testPostObjectModel_addObjectModel(
			randomObjectModel);

		assertEquals(randomObjectModel, postObjectModel);
		assertValid(postObjectModel);
	}

	protected ObjectModel testPostObjectModel_addObjectModel(
			ObjectModel objectModel)
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testGetObjectModelByExternalReferenceCode() throws Exception {
		ObjectModel postObjectModel =
			testGetObjectModelByExternalReferenceCode_addObjectModel();

		ObjectModel getObjectModel =
			objectModelResource.getObjectModelByExternalReferenceCode(
				postObjectModel.getExternalReferenceCode());

		assertEquals(postObjectModel, getObjectModel);
		assertValid(getObjectModel);
	}

	protected ObjectModel
			testGetObjectModelByExternalReferenceCode_addObjectModel()
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testGraphQLGetObjectModelByExternalReferenceCode()
		throws Exception {

		ObjectModel objectModel =
			testGraphQLGetObjectModelByExternalReferenceCode_addObjectModel();

		Assert.assertTrue(
			equals(
				objectModel,
				ObjectModelSerDes.toDTO(
					JSONUtil.getValueAsString(
						invokeGraphQLQuery(
							new GraphQLField(
								"objectModelByExternalReferenceCode",
								new HashMap<String, Object>() {
									{
										put(
											"externalReferenceCode",
											"\"" +
												objectModel.
													getExternalReferenceCode() +
														"\"");
									}
								},
								getGraphQLFields())),
						"JSONObject/data",
						"Object/objectModelByExternalReferenceCode"))));
	}

	@Test
	public void testGraphQLGetObjectModelByExternalReferenceCodeNotFound()
		throws Exception {

		String irrelevantExternalReferenceCode =
			"\"" + RandomTestUtil.randomString() + "\"";

		Assert.assertEquals(
			"Not Found",
			JSONUtil.getValueAsString(
				invokeGraphQLQuery(
					new GraphQLField(
						"objectModelByExternalReferenceCode",
						new HashMap<String, Object>() {
							{
								put(
									"externalReferenceCode",
									irrelevantExternalReferenceCode);
							}
						},
						getGraphQLFields())),
				"JSONArray/errors", "Object/0", "JSONObject/extensions",
				"Object/code"));
	}

	protected ObjectModel
			testGraphQLGetObjectModelByExternalReferenceCode_addObjectModel()
		throws Exception {

		return testGraphQLObjectModel_addObjectModel();
	}

	@Test
	public void testPutObjectModelByExternalReferenceCode() throws Exception {
		ObjectModel postObjectModel =
			testPutObjectModelByExternalReferenceCode_addObjectModel();

		ObjectModel randomObjectModel = randomObjectModel();

		ObjectModel putObjectModel =
			objectModelResource.putObjectModelByExternalReferenceCode(
				postObjectModel.getExternalReferenceCode(), randomObjectModel);

		assertEquals(randomObjectModel, putObjectModel);
		assertValid(putObjectModel);

		ObjectModel getObjectModel =
			objectModelResource.getObjectModelByExternalReferenceCode(
				putObjectModel.getExternalReferenceCode());

		assertEquals(randomObjectModel, getObjectModel);
		assertValid(getObjectModel);

		ObjectModel newObjectModel =
			testPutObjectModelByExternalReferenceCode_createObjectModel();

		putObjectModel =
			objectModelResource.putObjectModelByExternalReferenceCode(
				newObjectModel.getExternalReferenceCode(), newObjectModel);

		assertEquals(newObjectModel, putObjectModel);
		assertValid(putObjectModel);

		getObjectModel =
			objectModelResource.getObjectModelByExternalReferenceCode(
				putObjectModel.getExternalReferenceCode());

		assertEquals(newObjectModel, getObjectModel);

		Assert.assertEquals(
			newObjectModel.getExternalReferenceCode(),
			putObjectModel.getExternalReferenceCode());
	}

	protected ObjectModel
			testPutObjectModelByExternalReferenceCode_createObjectModel()
		throws Exception {

		return randomObjectModel();
	}

	protected ObjectModel
			testPutObjectModelByExternalReferenceCode_addObjectModel()
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testDeleteObjectModel() throws Exception {
		@SuppressWarnings("PMD.UnusedLocalVariable")
		ObjectModel objectModel = testDeleteObjectModel_addObjectModel();

		assertHttpResponseStatusCode(
			204,
			objectModelResource.deleteObjectModelHttpResponse(
				objectModel.getId()));

		assertHttpResponseStatusCode(
			404,
			objectModelResource.getObjectModelHttpResponse(
				objectModel.getId()));

		assertHttpResponseStatusCode(
			404, objectModelResource.getObjectModelHttpResponse(0L));
	}

	protected ObjectModel testDeleteObjectModel_addObjectModel()
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testGraphQLDeleteObjectModel() throws Exception {
		ObjectModel objectModel = testGraphQLDeleteObjectModel_addObjectModel();

		Assert.assertTrue(
			JSONUtil.getValueAsBoolean(
				invokeGraphQLMutation(
					new GraphQLField(
						"deleteObjectModel",
						new HashMap<String, Object>() {
							{
								put("objectModelId", objectModel.getId());
							}
						})),
				"JSONObject/data", "Object/deleteObjectModel"));
		JSONArray errorsJSONArray = JSONUtil.getValueAsJSONArray(
			invokeGraphQLQuery(
				new GraphQLField(
					"objectModel",
					new HashMap<String, Object>() {
						{
							put("objectModelId", objectModel.getId());
						}
					},
					new GraphQLField("id"))),
			"JSONArray/errors");

		Assert.assertTrue(errorsJSONArray.length() > 0);
	}

	protected ObjectModel testGraphQLDeleteObjectModel_addObjectModel()
		throws Exception {

		return testGraphQLObjectModel_addObjectModel();
	}

	@Test
	public void testGetObjectModel() throws Exception {
		ObjectModel postObjectModel = testGetObjectModel_addObjectModel();

		ObjectModel getObjectModel = objectModelResource.getObjectModel(
			postObjectModel.getId());

		assertEquals(postObjectModel, getObjectModel);
		assertValid(getObjectModel);
	}

	protected ObjectModel testGetObjectModel_addObjectModel() throws Exception {
		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testGraphQLGetObjectModel() throws Exception {
		ObjectModel objectModel = testGraphQLGetObjectModel_addObjectModel();

		Assert.assertTrue(
			equals(
				objectModel,
				ObjectModelSerDes.toDTO(
					JSONUtil.getValueAsString(
						invokeGraphQLQuery(
							new GraphQLField(
								"objectModel",
								new HashMap<String, Object>() {
									{
										put(
											"objectModelId",
											objectModel.getId());
									}
								},
								getGraphQLFields())),
						"JSONObject/data", "Object/objectModel"))));
	}

	@Test
	public void testGraphQLGetObjectModelNotFound() throws Exception {
		Long irrelevantObjectModelId = RandomTestUtil.randomLong();

		Assert.assertEquals(
			"Not Found",
			JSONUtil.getValueAsString(
				invokeGraphQLQuery(
					new GraphQLField(
						"objectModel",
						new HashMap<String, Object>() {
							{
								put("objectModelId", irrelevantObjectModelId);
							}
						},
						getGraphQLFields())),
				"JSONArray/errors", "Object/0", "JSONObject/extensions",
				"Object/code"));
	}

	protected ObjectModel testGraphQLGetObjectModel_addObjectModel()
		throws Exception {

		return testGraphQLObjectModel_addObjectModel();
	}

	@Test
	public void testPatchObjectModel() throws Exception {
		ObjectModel postObjectModel = testPatchObjectModel_addObjectModel();

		ObjectModel randomPatchObjectModel = randomPatchObjectModel();

		@SuppressWarnings("PMD.UnusedLocalVariable")
		ObjectModel patchObjectModel = objectModelResource.patchObjectModel(
			postObjectModel.getId(), randomPatchObjectModel);

		ObjectModel expectedPatchObjectModel = postObjectModel.clone();

		BeanTestUtil.copyProperties(
			randomPatchObjectModel, expectedPatchObjectModel);

		ObjectModel getObjectModel = objectModelResource.getObjectModel(
			patchObjectModel.getId());

		assertEquals(expectedPatchObjectModel, getObjectModel);
		assertValid(getObjectModel);
	}

	protected ObjectModel testPatchObjectModel_addObjectModel()
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	@Test
	public void testPutObjectModel() throws Exception {
		ObjectModel postObjectModel = testPutObjectModel_addObjectModel();

		ObjectModel randomObjectModel = randomObjectModel();

		ObjectModel putObjectModel = objectModelResource.putObjectModel(
			postObjectModel.getId(), randomObjectModel);

		assertEquals(randomObjectModel, putObjectModel);
		assertValid(putObjectModel);

		ObjectModel getObjectModel = objectModelResource.getObjectModel(
			putObjectModel.getId());

		assertEquals(randomObjectModel, getObjectModel);
		assertValid(getObjectModel);
	}

	protected ObjectModel testPutObjectModel_addObjectModel() throws Exception {
		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	protected ObjectModel testGraphQLObjectModel_addObjectModel()
		throws Exception {

		throw new UnsupportedOperationException(
			"This method needs to be implemented");
	}

	protected void assertContains(
		ObjectModel objectModel, List<ObjectModel> objectModels) {

		boolean contains = false;

		for (ObjectModel item : objectModels) {
			if (equals(objectModel, item)) {
				contains = true;

				break;
			}
		}

		Assert.assertTrue(
			objectModels + " does not contain " + objectModel, contains);
	}

	protected void assertHttpResponseStatusCode(
		int expectedHttpResponseStatusCode,
		HttpInvoker.HttpResponse actualHttpResponse) {

		Assert.assertEquals(
			expectedHttpResponseStatusCode, actualHttpResponse.getStatusCode());
	}

	protected void assertEquals(
		ObjectModel objectModel1, ObjectModel objectModel2) {

		Assert.assertTrue(
			objectModel1 + " does not equal " + objectModel2,
			equals(objectModel1, objectModel2));
	}

	protected void assertEquals(
		List<ObjectModel> objectModels1, List<ObjectModel> objectModels2) {

		Assert.assertEquals(objectModels1.size(), objectModels2.size());

		for (int i = 0; i < objectModels1.size(); i++) {
			ObjectModel objectModel1 = objectModels1.get(i);
			ObjectModel objectModel2 = objectModels2.get(i);

			assertEquals(objectModel1, objectModel2);
		}
	}

	protected void assertEqualsIgnoringOrder(
		List<ObjectModel> objectModels1, List<ObjectModel> objectModels2) {

		Assert.assertEquals(objectModels1.size(), objectModels2.size());

		for (ObjectModel objectModel1 : objectModels1) {
			boolean contains = false;

			for (ObjectModel objectModel2 : objectModels2) {
				if (equals(objectModel1, objectModel2)) {
					contains = true;

					break;
				}
			}

			Assert.assertTrue(
				objectModels2 + " does not contain " + objectModel1, contains);
		}
	}

	protected void assertValid(ObjectModel objectModel) throws Exception {
		boolean valid = true;

		if (objectModel.getDateCreated() == null) {
			valid = false;
		}

		if (objectModel.getDateModified() == null) {
			valid = false;
		}

		if (objectModel.getId() == null) {
			valid = false;
		}

		for (String additionalAssertFieldName :
				getAdditionalAssertFieldNames()) {

			if (Objects.equals("actions", additionalAssertFieldName)) {
				if (objectModel.getActions() == null) {
					valid = false;
				}

				continue;
			}

			if (Objects.equals(
					"externalReferenceCode", additionalAssertFieldName)) {

				if (objectModel.getExternalReferenceCode() == null) {
					valid = false;
				}

				continue;
			}

			if (Objects.equals("label", additionalAssertFieldName)) {
				if (objectModel.getLabel() == null) {
					valid = false;
				}

				continue;
			}

			if (Objects.equals("name", additionalAssertFieldName)) {
				if (objectModel.getName() == null) {
					valid = false;
				}

				continue;
			}

			throw new IllegalArgumentException(
				"Invalid additional assert field name " +
					additionalAssertFieldName);
		}

		Assert.assertTrue(valid);
	}

	protected void assertValid(Page<ObjectModel> page) {
		assertValid(page, Collections.emptyMap());
	}

	protected void assertValid(
		Page<ObjectModel> page,
		Map<String, Map<String, String>> expectedActions) {

		boolean valid = false;

		java.util.Collection<ObjectModel> objectModels = page.getItems();

		int size = objectModels.size();

		if ((page.getLastPage() > 0) && (page.getPage() > 0) &&
			(page.getPageSize() > 0) && (page.getTotalCount() > 0) &&
			(size > 0)) {

			valid = true;
		}

		Assert.assertTrue(valid);

		assertValid(page.getActions(), expectedActions);
	}

	protected void assertValid(
		Map<String, Map<String, String>> actions1,
		Map<String, Map<String, String>> actions2) {

		for (String key : actions2.keySet()) {
			Map action = actions1.get(key);

			Assert.assertNotNull(key + " does not contain an action", action);

			Map<String, String> expectedAction = actions2.get(key);

			Assert.assertEquals(
				expectedAction.get("method"), action.get("method"));
			Assert.assertEquals(expectedAction.get("href"), action.get("href"));
		}
	}

	protected String[] getAdditionalAssertFieldNames() {
		return new String[0];
	}

	protected List<GraphQLField> getGraphQLFields() throws Exception {
		List<GraphQLField> graphQLFields = new ArrayList<>();

		for (java.lang.reflect.Field field :
				getDeclaredFields(
					com.liferay.object.admin.rest.dto.v1_0.ObjectModel.class)) {

			if (!ArrayUtil.contains(
					getAdditionalAssertFieldNames(), field.getName())) {

				continue;
			}

			graphQLFields.addAll(getGraphQLFields(field));
		}

		return graphQLFields;
	}

	protected List<GraphQLField> getGraphQLFields(
			java.lang.reflect.Field... fields)
		throws Exception {

		List<GraphQLField> graphQLFields = new ArrayList<>();

		for (java.lang.reflect.Field field : fields) {
			com.liferay.portal.vulcan.graphql.annotation.GraphQLField
				vulcanGraphQLField = field.getAnnotation(
					com.liferay.portal.vulcan.graphql.annotation.GraphQLField.
						class);

			if (vulcanGraphQLField != null) {
				Class<?> clazz = field.getType();

				if (clazz.isArray()) {
					clazz = clazz.getComponentType();
				}

				List<GraphQLField> childrenGraphQLFields = getGraphQLFields(
					getDeclaredFields(clazz));

				graphQLFields.add(
					new GraphQLField(field.getName(), childrenGraphQLFields));
			}
		}

		return graphQLFields;
	}

	protected String[] getIgnoredEntityFieldNames() {
		return new String[0];
	}

	protected boolean equals(
		ObjectModel objectModel1, ObjectModel objectModel2) {

		if (objectModel1 == objectModel2) {
			return true;
		}

		for (String additionalAssertFieldName :
				getAdditionalAssertFieldNames()) {

			if (Objects.equals("actions", additionalAssertFieldName)) {
				if (!equals(
						(Map)objectModel1.getActions(),
						(Map)objectModel2.getActions())) {

					return false;
				}

				continue;
			}

			if (Objects.equals("dateCreated", additionalAssertFieldName)) {
				if (!Objects.deepEquals(
						objectModel1.getDateCreated(),
						objectModel2.getDateCreated())) {

					return false;
				}

				continue;
			}

			if (Objects.equals("dateModified", additionalAssertFieldName)) {
				if (!Objects.deepEquals(
						objectModel1.getDateModified(),
						objectModel2.getDateModified())) {

					return false;
				}

				continue;
			}

			if (Objects.equals(
					"externalReferenceCode", additionalAssertFieldName)) {

				if (!Objects.deepEquals(
						objectModel1.getExternalReferenceCode(),
						objectModel2.getExternalReferenceCode())) {

					return false;
				}

				continue;
			}

			if (Objects.equals("id", additionalAssertFieldName)) {
				if (!Objects.deepEquals(
						objectModel1.getId(), objectModel2.getId())) {

					return false;
				}

				continue;
			}

			if (Objects.equals("label", additionalAssertFieldName)) {
				if (!equals(
						(Map)objectModel1.getLabel(),
						(Map)objectModel2.getLabel())) {

					return false;
				}

				continue;
			}

			if (Objects.equals("name", additionalAssertFieldName)) {
				if (!Objects.deepEquals(
						objectModel1.getName(), objectModel2.getName())) {

					return false;
				}

				continue;
			}

			throw new IllegalArgumentException(
				"Invalid additional assert field name " +
					additionalAssertFieldName);
		}

		return true;
	}

	protected boolean equals(
		Map<String, Object> map1, Map<String, Object> map2) {

		if (Objects.equals(map1.keySet(), map2.keySet())) {
			for (Map.Entry<String, Object> entry : map1.entrySet()) {
				if (entry.getValue() instanceof Map) {
					if (!equals(
							(Map)entry.getValue(),
							(Map)map2.get(entry.getKey()))) {

						return false;
					}
				}
				else if (!Objects.deepEquals(
							entry.getValue(), map2.get(entry.getKey()))) {

					return false;
				}
			}

			return true;
		}

		return false;
	}

	protected java.lang.reflect.Field[] getDeclaredFields(Class clazz)
		throws Exception {

		return TransformUtil.transform(
			ReflectionUtil.getDeclaredFields(clazz),
			field -> {
				if (field.isSynthetic()) {
					return null;
				}

				return field;
			},
			java.lang.reflect.Field.class);
	}

	protected java.util.Collection<EntityField> getEntityFields()
		throws Exception {

		if (!(_objectModelResource instanceof EntityModelResource)) {
			throw new UnsupportedOperationException(
				"Resource is not an instance of EntityModelResource");
		}

		EntityModelResource entityModelResource =
			(EntityModelResource)_objectModelResource;

		EntityModel entityModel = entityModelResource.getEntityModel(
			new MultivaluedHashMap());

		if (entityModel == null) {
			return Collections.emptyList();
		}

		Map<String, EntityField> entityFieldsMap =
			entityModel.getEntityFieldsMap();

		return entityFieldsMap.values();
	}

	protected List<EntityField> getEntityFields(EntityField.Type type)
		throws Exception {

		return TransformUtil.transform(
			getEntityFields(),
			entityField -> {
				if (!Objects.equals(entityField.getType(), type) ||
					ArrayUtil.contains(
						getIgnoredEntityFieldNames(), entityField.getName())) {

					return null;
				}

				return entityField;
			});
	}

	protected String getFilterString(
		EntityField entityField, String operator, ObjectModel objectModel) {

		StringBundler sb = new StringBundler();

		String entityFieldName = entityField.getName();

		sb.append(entityFieldName);

		sb.append(" ");
		sb.append(operator);
		sb.append(" ");

		if (entityFieldName.equals("actions")) {
			throw new IllegalArgumentException(
				"Invalid entity field " + entityFieldName);
		}

		if (entityFieldName.equals("dateCreated")) {
			if (operator.equals("between")) {
				sb = new StringBundler();

				sb.append("(");
				sb.append(entityFieldName);
				sb.append(" gt ");
				sb.append(
					_dateFormat.format(
						DateUtils.addSeconds(
							objectModel.getDateCreated(), -2)));
				sb.append(" and ");
				sb.append(entityFieldName);
				sb.append(" lt ");
				sb.append(
					_dateFormat.format(
						DateUtils.addSeconds(objectModel.getDateCreated(), 2)));
				sb.append(")");
			}
			else {
				sb.append(entityFieldName);

				sb.append(" ");
				sb.append(operator);
				sb.append(" ");

				sb.append(_dateFormat.format(objectModel.getDateCreated()));
			}

			return sb.toString();
		}

		if (entityFieldName.equals("dateModified")) {
			if (operator.equals("between")) {
				sb = new StringBundler();

				sb.append("(");
				sb.append(entityFieldName);
				sb.append(" gt ");
				sb.append(
					_dateFormat.format(
						DateUtils.addSeconds(
							objectModel.getDateModified(), -2)));
				sb.append(" and ");
				sb.append(entityFieldName);
				sb.append(" lt ");
				sb.append(
					_dateFormat.format(
						DateUtils.addSeconds(
							objectModel.getDateModified(), 2)));
				sb.append(")");
			}
			else {
				sb.append(entityFieldName);

				sb.append(" ");
				sb.append(operator);
				sb.append(" ");

				sb.append(_dateFormat.format(objectModel.getDateModified()));
			}

			return sb.toString();
		}

		if (entityFieldName.equals("externalReferenceCode")) {
			sb.append("'");
			sb.append(String.valueOf(objectModel.getExternalReferenceCode()));
			sb.append("'");

			return sb.toString();
		}

		if (entityFieldName.equals("id")) {
			throw new IllegalArgumentException(
				"Invalid entity field " + entityFieldName);
		}

		if (entityFieldName.equals("label")) {
			throw new IllegalArgumentException(
				"Invalid entity field " + entityFieldName);
		}

		if (entityFieldName.equals("name")) {
			sb.append("'");
			sb.append(String.valueOf(objectModel.getName()));
			sb.append("'");

			return sb.toString();
		}

		throw new IllegalArgumentException(
			"Invalid entity field " + entityFieldName);
	}

	protected String invoke(String query) throws Exception {
		HttpInvoker httpInvoker = HttpInvoker.newHttpInvoker();

		httpInvoker.body(
			JSONUtil.put(
				"query", query
			).toString(),
			"application/json");
		httpInvoker.httpMethod(HttpInvoker.HttpMethod.POST);
		httpInvoker.path("http://localhost:8080/o/graphql");
		httpInvoker.userNameAndPassword("test@liferay.com:test");

		HttpInvoker.HttpResponse httpResponse = httpInvoker.invoke();

		return httpResponse.getContent();
	}

	protected JSONObject invokeGraphQLMutation(GraphQLField graphQLField)
		throws Exception {

		GraphQLField mutationGraphQLField = new GraphQLField(
			"mutation", graphQLField);

		return JSONFactoryUtil.createJSONObject(
			invoke(mutationGraphQLField.toString()));
	}

	protected JSONObject invokeGraphQLQuery(GraphQLField graphQLField)
		throws Exception {

		GraphQLField queryGraphQLField = new GraphQLField(
			"query", graphQLField);

		return JSONFactoryUtil.createJSONObject(
			invoke(queryGraphQLField.toString()));
	}

	protected ObjectModel randomObjectModel() throws Exception {
		return new ObjectModel() {
			{
				dateCreated = RandomTestUtil.nextDate();
				dateModified = RandomTestUtil.nextDate();
				externalReferenceCode = StringUtil.toLowerCase(
					RandomTestUtil.randomString());
				id = RandomTestUtil.randomLong();
				name = StringUtil.toLowerCase(RandomTestUtil.randomString());
			}
		};
	}

	protected ObjectModel randomIrrelevantObjectModel() throws Exception {
		ObjectModel randomIrrelevantObjectModel = randomObjectModel();

		return randomIrrelevantObjectModel;
	}

	protected ObjectModel randomPatchObjectModel() throws Exception {
		return randomObjectModel();
	}

	protected ObjectModelResource objectModelResource;
	protected Group irrelevantGroup;
	protected Company testCompany;
	protected Group testGroup;

	protected static class BeanTestUtil {

		public static void copyProperties(Object source, Object target)
			throws Exception {

			Class<?> sourceClass = _getSuperClass(source.getClass());

			Class<?> targetClass = target.getClass();

			for (java.lang.reflect.Field field :
					sourceClass.getDeclaredFields()) {

				if (field.isSynthetic()) {
					continue;
				}

				Method getMethod = _getMethod(
					sourceClass, field.getName(), "get");

				Method setMethod = _getMethod(
					targetClass, field.getName(), "set",
					getMethod.getReturnType());

				setMethod.invoke(target, getMethod.invoke(source));
			}
		}

		public static boolean hasProperty(Object bean, String name) {
			Method setMethod = _getMethod(
				bean.getClass(), "set" + StringUtil.upperCaseFirstLetter(name));

			if (setMethod != null) {
				return true;
			}

			return false;
		}

		public static void setProperty(Object bean, String name, Object value)
			throws Exception {

			Class<?> clazz = bean.getClass();

			Method setMethod = _getMethod(
				clazz, "set" + StringUtil.upperCaseFirstLetter(name));

			if (setMethod == null) {
				throw new NoSuchMethodException();
			}

			Class<?>[] parameterTypes = setMethod.getParameterTypes();

			setMethod.invoke(bean, _translateValue(parameterTypes[0], value));
		}

		private static Method _getMethod(Class<?> clazz, String name) {
			for (Method method : clazz.getMethods()) {
				if (name.equals(method.getName()) &&
					(method.getParameterCount() == 1) &&
					_parameterTypes.contains(method.getParameterTypes()[0])) {

					return method;
				}
			}

			return null;
		}

		private static Method _getMethod(
				Class<?> clazz, String fieldName, String prefix,
				Class<?>... parameterTypes)
			throws Exception {

			return clazz.getMethod(
				prefix + StringUtil.upperCaseFirstLetter(fieldName),
				parameterTypes);
		}

		private static Class<?> _getSuperClass(Class<?> clazz) {
			Class<?> superClass = clazz.getSuperclass();

			if ((superClass == null) || (superClass == Object.class)) {
				return clazz;
			}

			return superClass;
		}

		private static Object _translateValue(
			Class<?> parameterType, Object value) {

			if ((value instanceof Integer) &&
				parameterType.equals(Long.class)) {

				Integer intValue = (Integer)value;

				return intValue.longValue();
			}

			return value;
		}

		private static final Set<Class<?>> _parameterTypes = new HashSet<>(
			Arrays.asList(
				Boolean.class, Date.class, Double.class, Integer.class,
				Long.class, Map.class, String.class));

	}

	protected class GraphQLField {

		public GraphQLField(String key, GraphQLField... graphQLFields) {
			this(key, new HashMap<>(), graphQLFields);
		}

		public GraphQLField(String key, List<GraphQLField> graphQLFields) {
			this(key, new HashMap<>(), graphQLFields);
		}

		public GraphQLField(
			String key, Map<String, Object> parameterMap,
			GraphQLField... graphQLFields) {

			_key = key;
			_parameterMap = parameterMap;
			_graphQLFields = Arrays.asList(graphQLFields);
		}

		public GraphQLField(
			String key, Map<String, Object> parameterMap,
			List<GraphQLField> graphQLFields) {

			_key = key;
			_parameterMap = parameterMap;
			_graphQLFields = graphQLFields;
		}

		@Override
		public String toString() {
			StringBuilder sb = new StringBuilder(_key);

			if (!_parameterMap.isEmpty()) {
				sb.append("(");

				for (Map.Entry<String, Object> entry :
						_parameterMap.entrySet()) {

					sb.append(entry.getKey());
					sb.append(": ");
					sb.append(entry.getValue());
					sb.append(", ");
				}

				sb.setLength(sb.length() - 2);

				sb.append(")");
			}

			if (!_graphQLFields.isEmpty()) {
				sb.append("{");

				for (GraphQLField graphQLField : _graphQLFields) {
					sb.append(graphQLField.toString());
					sb.append(", ");
				}

				sb.setLength(sb.length() - 2);

				sb.append("}");
			}

			return sb.toString();
		}

		private final List<GraphQLField> _graphQLFields;
		private final String _key;
		private final Map<String, Object> _parameterMap;

	}

	private static final com.liferay.portal.kernel.log.Log _log =
		LogFactoryUtil.getLog(BaseObjectModelResourceTestCase.class);

	private static DateFormat _dateFormat;

	@Inject
	private com.liferay.object.admin.rest.resource.v1_0.ObjectModelResource
		_objectModelResource;

}