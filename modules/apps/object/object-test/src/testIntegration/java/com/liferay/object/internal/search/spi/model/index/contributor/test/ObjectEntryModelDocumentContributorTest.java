/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.search.spi.model.index.contributor.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.depot.constants.DepotConstants;
import com.liferay.depot.model.DepotEntry;
import com.liferay.depot.service.DepotEntryLocalServiceUtil;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectDefinitionSettingConstants;
import com.liferay.object.constants.ObjectEntryFolderConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.definition.util.ObjectDefinitionUtil;
import com.liferay.object.field.builder.AssigneeObjectFieldBuilder;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryFolder;
import com.liferay.object.model.ObjectField;
import com.liferay.object.rest.test.util.ObjectEntryTestUtil;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectDefinitionSettingLocalService;
import com.liferay.object.service.ObjectEntryFolderLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.kernel.search.DocumentImpl;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.service.ClassNameLocalService;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.RoleTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.DateUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.TextFormatter;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.search.spi.model.index.contributor.ModelDocumentContributor;
import com.liferay.portal.test.rule.FeatureFlag;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.io.Serializable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceReference;

/**
 * @author Jhosseph Gonzalez
 */
@RunWith(Arquillian.class)
public class ObjectEntryModelDocumentContributorTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testContributeWithAssigneeObjectField() throws Exception {
		String objectFieldName = "a" + RandomTestUtil.randomString();

		ObjectDefinition objectDefinition =
			ObjectDefinitionTestUtil.publishObjectDefinition();

		ObjectFieldUtil.addCustomObjectField(
			new AssigneeObjectFieldBuilder(
			).indexed(
				true
			).labelMap(
				RandomTestUtil.randomLocaleStringMap()
			).name(
				objectFieldName
			).objectDefinitionId(
				objectDefinition.getObjectDefinitionId()
			).userId(
				TestPropsValues.getUserId()
			).build());

		objectDefinition = _objectDefinitionLocalService.getObjectDefinition(
			objectDefinition.getObjectDefinitionId());

		ModelDocumentContributor<ObjectEntry>
			objectEntryModelDocumentContributor =
				_getObjectEntryModelDocumentContributor(
					objectDefinition.getClassName());

		Role role = RoleTestUtil.addRole(RoleConstants.TYPE_REGULAR);

		long roleClassNameId = _classNameLocalService.getClassNameId(
			Role.class.getName());
		long roleClassPK = role.getRoleId();

		ObjectEntry roleObjectEntry = ObjectEntryTestUtil.addObjectEntry(
			objectDefinition,
			HashMapBuilder.<String, Serializable>put(
				objectFieldName,
				HashMapBuilder.put(
					"classNameId", roleClassNameId
				).put(
					"classPK", roleClassPK
				).build()
			).build());

		Document roleDocument = new DocumentImpl();

		objectEntryModelDocumentContributor.contribute(
			roleDocument, roleObjectEntry);

		Field roleField = roleDocument.getField("objectEntryContent");

		Assert.assertNotNull(roleField);

		String roleValue = roleField.getValue();

		Assert.assertTrue(
			roleValue,
			roleValue.contains(
				StringBundler.concat(
					objectFieldName, ": ", roleClassNameId, "_", roleClassPK)));
		Assert.assertTrue(
			roleValue,
			roleValue.contains(
				StringBundler.concat(objectFieldName, ": ", role.getName())));

		User user = UserTestUtil.addUser();

		long userClassNameId = _classNameLocalService.getClassNameId(
			User.class.getName());
		long userClassPK = user.getUserId();

		ObjectEntry userObjectEntry = ObjectEntryTestUtil.addObjectEntry(
			objectDefinition,
			HashMapBuilder.<String, Serializable>put(
				objectFieldName,
				HashMapBuilder.put(
					"classNameId", userClassNameId
				).put(
					"classPK", userClassPK
				).build()
			).build());

		Document userDocument = new DocumentImpl();

		objectEntryModelDocumentContributor.contribute(
			userDocument, userObjectEntry);

		Field userField = userDocument.getField("objectEntryContent");

		Assert.assertNotNull(userField);

		String value = userField.getValue();

		Assert.assertTrue(
			value,
			value.contains(
				StringBundler.concat(
					objectFieldName, ": ", userClassNameId, "_", userClassPK)));
		Assert.assertTrue(
			value,
			value.contains(
				StringBundler.concat(
					objectFieldName, ": ", user.getFullName())));
	}

	@FeatureFlag("LPD-58677")
	@Test
	public void testContributeWithCMPLinkedObjectEntries() throws Exception {
		Group group = GroupTestUtil.addGroup();

		ObjectEntryFolder objectEntryFolder =
			_objectEntryFolderLocalService.addObjectEntryFolder(
				ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_CONTENTS,
				group.getGroupId(), TestPropsValues.getUserId(),
				ObjectEntryFolderConstants.
					PARENT_OBJECT_ENTRY_FOLDER_ID_DEFAULT,
				RandomTestUtil.randomString(),
				Collections.singletonMap(
					LocaleUtil.getDefault(), RandomTestUtil.randomString()),
				StringUtil.randomId(),
				ServiceContextTestUtil.getServiceContext());

		ObjectDefinition objectDefinition =
			ObjectDefinitionTestUtil.publishObjectDefinition(
				false, false, false, ObjectDefinitionTestUtil.getRandomName(),
				Collections.singletonList(
					_buildTextObjectField("a" + StringUtil.randomId())),
				0, ObjectDefinitionConstants.SCOPE_SITE,
				TestPropsValues.getUserId());

		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			group.getGroupId(), TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId(),
			objectEntryFolder.getObjectEntryFolderId(), null,
			Collections.emptyMap(),
			ServiceContextTestUtil.getServiceContext(group.getGroupId()));

		DepotEntry depotEntry = DepotEntryLocalServiceUtil.addDepotEntry(
			Collections.singletonMap(
				LocaleUtil.getDefault(), RandomTestUtil.randomString()),
			Collections.singletonMap(
				LocaleUtil.getDefault(), RandomTestUtil.randomString()),
			DepotConstants.TYPE_PROJECT,
			ServiceContextTestUtil.getServiceContext());

		ObjectDefinition cmpProjectObjectDefinition =
			_getOrAddCMPObjectDefinition(
				"L_CMP_PROJECT", "CMPProject", null, null);

		ObjectDefinition cmpTaskObjectDefinition = _getOrAddCMPObjectDefinition(
			"L_CMP_TASK", "CMPTask", cmpProjectObjectDefinition,
			"cmpProjectToCMPTasks");

		ObjectDefinition cmpProjectLinkObjectDefinition =
			_getOrAddCMPLinkObjectDefinition(
				"L_CMP_PROJECT_LINK", "CMPProjectLink",
				cmpProjectObjectDefinition, "cmpProjectToCMPProjectLinks");

		ObjectDefinition cmpTaskLinkObjectDefinition =
			_getOrAddCMPLinkObjectDefinition(
				"L_CMP_TASK_LINK", "CMPTaskLink", cmpTaskObjectDefinition,
				"cmpTaskToCMPTaskLinks");

		ObjectEntry cmpProjectObjectEntry1 = _addCMPObjectEntry(
			depotEntry.getGroupId(), cmpProjectObjectDefinition,
			Collections.emptyMap());

		ObjectEntry cmpProjectObjectEntry2 = _addCMPObjectEntry(
			depotEntry.getGroupId(), cmpProjectObjectDefinition,
			Collections.emptyMap());

		ObjectEntry cmpTaskObjectEntry = _addCMPObjectEntry(
			depotEntry.getGroupId(), cmpTaskObjectDefinition,
			Collections.singletonMap(
				"r_cmpProjectToCMPTasks_c_cmpProjectId",
				cmpProjectObjectEntry2.getObjectEntryId()));

		ObjectEntry cmpProjectLinkObjectEntry = _addCMPLinkObjectEntry(
			depotEntry.getGroupId(), group,
			cmpProjectObjectEntry1.getObjectEntryId(),
			cmpProjectLinkObjectDefinition, objectEntry,
			"r_cmpProjectToCMPProjectLinks_c_cmpProjectId");

		ObjectEntry cmpTaskLinkObjectEntry = _addCMPLinkObjectEntry(
			depotEntry.getGroupId(), group,
			cmpTaskObjectEntry.getObjectEntryId(), cmpTaskLinkObjectDefinition,
			objectEntry, "r_cmpTaskToCMPTaskLinks_c_cmpTaskId");

		long[] cmpProjectObjectEntryIds = {
			cmpProjectObjectEntry1.getObjectEntryId(),
			cmpProjectObjectEntry2.getObjectEntryId()
		};
		long[] cmpTaskObjectEntryIds = {cmpTaskObjectEntry.getObjectEntryId()};

		_assertCMPLinkedObjectEntryIds(
			cmpProjectObjectEntryIds, cmpTaskObjectEntryIds,
			_getObjectEntryModelDocumentContributor(
				objectDefinition.getClassName()),
			objectEntry);
		_assertCMPLinkedObjectEntryIds(
			cmpProjectObjectEntryIds, cmpTaskObjectEntryIds,
			_getObjectEntryModelDocumentContributor(
				ObjectEntry.class.getName()),
			objectEntry);

		_objectEntryLocalService.deleteObjectEntry(
			cmpProjectLinkObjectEntry.getObjectEntryId());

		_assertCMPLinkedObjectEntryIds(
			new long[] {cmpProjectObjectEntry2.getObjectEntryId()},
			cmpTaskObjectEntryIds,
			_getObjectEntryModelDocumentContributor(
				ObjectEntry.class.getName()),
			objectEntry);

		_objectEntryLocalService.deleteObjectEntry(
			cmpTaskLinkObjectEntry.getObjectEntryId());

		_assertCMPLinkedObjectEntryIds(
			new long[0], new long[0],
			_getObjectEntryModelDocumentContributor(
				ObjectEntry.class.getName()),
			objectEntry);
	}

	@Test
	public void testContributeWithDateField() throws Exception {
		ObjectDefinition objectDefinition =
			_addModifiableSystemObjectDefinition(
				false, "a" + RandomTestUtil.randomString());

		ModelDocumentContributor<ObjectEntry>
			objectEntryModelDocumentContributor =
				_getObjectEntryModelDocumentContributor(
					objectDefinition.getClassName());

		Document document = new DocumentImpl();

		Date displayDate = new Date();

		ObjectEntry objectEntry = ObjectEntryTestUtil.addObjectEntry(
			TestPropsValues.getGroupId(), objectDefinition,
			HashMapBuilder.<String, Serializable>put(
				Field.DISPLAY_DATE, displayDate
			).build());

		objectEntryModelDocumentContributor.contribute(document, objectEntry);

		Field field = document.getField(Field.DISPLAY_DATE);

		Assert.assertEquals(
			DateUtil.getDate(displayDate, "yyyyMMddHHmmss", LocaleUtil.US),
			field.getValue());
	}

	@Test
	public void testContributeWithLocalizedFields() throws Exception {
		String objectFieldName = "a" + RandomTestUtil.randomString();

		ObjectDefinition objectDefinition =
			_addModifiableSystemObjectDefinition(true, objectFieldName);

		ModelDocumentContributor<ObjectEntry>
			objectEntryModelDocumentContributor =
				_getObjectEntryModelDocumentContributor(
					objectDefinition.getClassName());

		Document document = new DocumentImpl();

		String englishObjectFieldValue = RandomTestUtil.randomString();
		String portugueseObjectFieldValue =
			objectFieldName + RandomTestUtil.randomString();

		ObjectEntry objectEntry = ObjectEntryTestUtil.addObjectEntry(
			TestPropsValues.getGroupId(), objectDefinition,
			HashMapBuilder.<String, Serializable>put(
				objectFieldName, englishObjectFieldValue
			).put(
				objectFieldName + "_i18n",
				HashMapBuilder.<String, Serializable>put(
					"en_US", englishObjectFieldValue
				).put(
					"pt_BR", portugueseObjectFieldValue
				).build()
			).build());

		objectEntryModelDocumentContributor.contribute(document, objectEntry);

		_assertObjectEntryContentField(
			document, englishObjectFieldValue,
			Field.getLocalizedName(LocaleUtil.US, "objectEntryContent"),
			objectFieldName);
		_assertObjectEntryContentField(
			document, portugueseObjectFieldValue,
			Field.getLocalizedName(LocaleUtil.BRAZIL, "objectEntryContent"),
			objectFieldName);

		Assert.assertNull(document.getField("objectEntryContent"));
	}

	@Test
	public void testContributeWithNonlocalizedFields() throws Exception {
		String objectFieldName = "a" + RandomTestUtil.randomString();

		ObjectDefinition objectDefinition =
			_addModifiableSystemObjectDefinition(false, objectFieldName);

		ModelDocumentContributor<ObjectEntry>
			objectEntryModelDocumentContributor =
				_getObjectEntryModelDocumentContributor(
					objectDefinition.getClassName());

		Document document = new DocumentImpl();

		String objectFieldValue = RandomTestUtil.randomString();

		ObjectEntry objectEntry = ObjectEntryTestUtil.addObjectEntry(
			TestPropsValues.getGroupId(), objectDefinition,
			HashMapBuilder.<String, Serializable>put(
				objectFieldName, objectFieldValue
			).build());

		objectEntryModelDocumentContributor.contribute(document, objectEntry);

		_assertObjectEntryContentField(
			document, objectFieldValue, "objectEntryContent", objectFieldName);

		Assert.assertNull(
			document.getField(
				Field.getLocalizedName(LocaleUtil.US, "objectEntryContent")));
	}

	private ObjectEntry _addCMPLinkObjectEntry(
			long depotEntryGroupId, Group group, long linkedObjectEntryId,
			ObjectDefinition objectDefinition, ObjectEntry objectEntry,
			String relationshipObjectFieldName)
		throws Exception {

		return _objectEntryLocalService.addObjectEntry(
			depotEntryGroupId, TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId(), 0, null,
			HashMapBuilder.<String, Serializable>put(
				relationshipObjectFieldName, linkedObjectEntryId
			).put(
				"classExternalReferenceCode",
				objectEntry.getExternalReferenceCode()
			).put(
				"className", objectEntry.getModelClassName()
			).put(
				"groupExternalReferenceCode", group.getExternalReferenceCode()
			).build(),
			ServiceContextTestUtil.getServiceContext());
	}

	private ObjectEntry _addCMPObjectEntry(
			long depotEntryGroupId, ObjectDefinition objectDefinition,
			Map<String, Serializable> values)
		throws Exception {

		return _objectEntryLocalService.addObjectEntry(
			depotEntryGroupId, TestPropsValues.getUserId(),
			objectDefinition.getObjectDefinitionId(), 0, null,
			HashMapBuilder.putAll(
				values
			).put(
				"title", RandomTestUtil.randomString()
			).build(),
			ServiceContextTestUtil.getServiceContext());
	}

	private ObjectDefinition _addModifiableSystemObjectDefinition(
			boolean localized, String objectFieldName)
		throws Exception {

		ObjectField objectField = ObjectFieldUtil.createObjectField(
			0, ObjectFieldConstants.BUSINESS_TYPE_TEXT, null,
			ObjectFieldConstants.DB_TYPE_STRING, true, false, null,
			RandomTestUtil.randomString(), objectFieldName, false, true);

		objectField.setLocalized(localized);

		ObjectDefinition modifiableSystemObjectDefinition =
			ObjectDefinitionTestUtil.addModifiableSystemObjectDefinition(
				TestPropsValues.getUserId(), null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				"Test" + ObjectDefinitionTestUtil.getRandomName(), null, null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				ObjectDefinitionConstants.SCOPE_SITE, null, 1,
				Arrays.asList(objectField));

		return _objectDefinitionLocalService.publishSystemObjectDefinition(
			TestPropsValues.getUserId(),
			modifiableSystemObjectDefinition.getObjectDefinitionId());
	}

	private void _addObjectRelationship(
			String name, ObjectDefinition objectDefinition,
			ObjectDefinition relatedObjectDefinition)
		throws Exception {

		_objectRelationshipLocalService.addObjectRelationship(
			null, TestPropsValues.getUserId(),
			relatedObjectDefinition.getObjectDefinitionId(),
			objectDefinition.getObjectDefinitionId(), 0,
			ObjectRelationshipConstants.DELETION_TYPE_PREVENT, false,
			Collections.singletonMap(LocaleUtil.getDefault(), name), name,
			false, ObjectRelationshipConstants.TYPE_ONE_TO_MANY, null);
	}

	private void _assertCMPLinkedObjectEntryIds(
		long[] expectedCMPProjectObjectEntryIds,
		long[] expectedCMPTaskObjectEntryIds,
		ModelDocumentContributor<ObjectEntry> modelDocumentContributor,
		ObjectEntry objectEntry) {

		Document document = new DocumentImpl();

		modelDocumentContributor.contribute(document, objectEntry);

		_assertFieldValues(
			document, expectedCMPProjectObjectEntryIds,
			"cmpProjectObjectEntryIds");
		_assertFieldValues(
			document, expectedCMPTaskObjectEntryIds, "cmpTaskObjectEntryIds");
	}

	private void _assertFieldValues(
		Document document, long[] expectedObjectEntryIds, String fieldName) {

		Field field = document.getField(fieldName);

		if (expectedObjectEntryIds.length == 0) {
			Assert.assertNull(fieldName, field);

			return;
		}

		Assert.assertEquals(
			fieldName,
			ListUtil.sort(
				Arrays.asList(ArrayUtil.toStringArray(expectedObjectEntryIds))),
			ListUtil.sort(Arrays.asList(field.getValues())));
	}

	private void _assertObjectEntryContentField(
		Document document, String expectedValue, String fieldName,
		String objectFieldName) {

		Field field = document.getField(fieldName);

		String value = field.getValue();

		Assert.assertTrue(
			value,
			value.contains(
				StringBundler.concat(objectFieldName, ": ", expectedValue)));
	}

	private ObjectField _buildTextObjectField(String name) {
		return new TextObjectFieldBuilder(
		).labelMap(
			RandomTestUtil.randomLocaleStringMap()
		).name(
			name
		).build();
	}

	private ModelDocumentContributor<ObjectEntry>
			_getObjectEntryModelDocumentContributor(String className)
		throws Exception {

		Bundle bundle = FrameworkUtil.getBundle(
			ObjectEntryModelDocumentContributorTest.class);

		BundleContext bundleContext = bundle.getBundleContext();

		List<ServiceReference<ModelDocumentContributor<ObjectEntry>>>
			serviceReferences = new ArrayList<>(
				bundleContext.getServiceReferences(
					(Class<ModelDocumentContributor<ObjectEntry>>)
						(Class<?>)ModelDocumentContributor.class,
					"(indexer.class.name=" + className + ")"));

		return bundleContext.getService(serviceReferences.get(0));
	}

	private ObjectDefinition _getOrAddCMPLinkObjectDefinition(
			String externalReferenceCode, String name,
			ObjectDefinition relatedObjectDefinition, String relationshipName)
		throws Exception {

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.
				fetchObjectDefinitionByExternalReferenceCode(
					externalReferenceCode, TestPropsValues.getCompanyId());

		if (objectDefinition != null) {
			return objectDefinition;
		}

		objectDefinition = _publishCMPObjectDefinition(
			externalReferenceCode, name,
			Arrays.asList(
				_buildTextObjectField("classExternalReferenceCode"),
				_buildTextObjectField("className"),
				_buildTextObjectField("groupExternalReferenceCode")));

		_addObjectRelationship(
			relationshipName, objectDefinition, relatedObjectDefinition);

		return objectDefinition;
	}

	private ObjectDefinition _getOrAddCMPObjectDefinition(
			String externalReferenceCode, String name,
			ObjectDefinition relatedObjectDefinition, String relationshipName)
		throws Exception {

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.
				fetchObjectDefinitionByExternalReferenceCode(
					externalReferenceCode, TestPropsValues.getCompanyId());

		if (objectDefinition != null) {
			return objectDefinition;
		}

		objectDefinition = _publishCMPObjectDefinition(
			externalReferenceCode, name,
			Arrays.asList(
				_buildTextObjectField("state"),
				_buildTextObjectField("title")));

		if (relatedObjectDefinition != null) {
			_addObjectRelationship(
				relationshipName, objectDefinition, relatedObjectDefinition);
		}

		return objectDefinition;
	}

	private ObjectDefinition _publishCMPObjectDefinition(
			String externalReferenceCode, String name,
			List<ObjectField> objectFields)
		throws Exception {

		ObjectDefinition objectDefinition =
			_objectDefinitionLocalService.addSystemObjectDefinition(
				externalReferenceCode, TestPropsValues.getUserId(), 0,
				ObjectDefinitionUtil.generateRandomClassName(), null, true,
				false, true, false, true, false, false, false, false, false,
				null,
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, name, null, null, null,
				"c_" + TextFormatter.format(name + "Id", TextFormatter.I),
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString()),
				true, ObjectDefinitionConstants.SCOPE_DEPOT, null, 1,
				WorkflowConstants.STATUS_DRAFT, Collections.emptyList(),
				objectFields, Collections.emptyList());

		objectDefinition =
			_objectDefinitionLocalService.publishSystemObjectDefinition(
				TestPropsValues.getUserId(),
				objectDefinition.getObjectDefinitionId());

		_objectDefinitionSettingLocalService.addObjectDefinitionSetting(
			objectDefinition.getUserId(),
			objectDefinition.getObjectDefinitionId(),
			ObjectDefinitionSettingConstants.NAME_ACCEPT_ALL_GROUPS,
			StringPool.TRUE);

		return objectDefinition;
	}

	@Inject
	private ClassNameLocalService _classNameLocalService;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectDefinitionSettingLocalService
		_objectDefinitionSettingLocalService;

	@Inject
	private ObjectEntryFolderLocalService _objectEntryFolderLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

	@Inject
	private ObjectFieldLocalService _objectFieldLocalService;

	@Inject
	private ObjectRelationshipLocalService _objectRelationshipLocalService;

}