/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.field.business.type.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.exception.ObjectEntryValuesException;
import com.liferay.object.field.builder.PhoneNumberObjectFieldBuilder;
import com.liferay.object.field.util.ObjectFieldUtil;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.io.Serializable;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Marco Leo
 */
@RunWith(Arquillian.class)
public class PhoneNumberObjectFieldBusinessTypeTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_objectDefinition =
			ObjectDefinitionTestUtil.addCustomObjectDefinition();

		_objectField = ObjectFieldUtil.addCustomObjectField(
			new PhoneNumberObjectFieldBuilder(
			).userId(
				TestPropsValues.getUserId()
			).labelMap(
				LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString())
			).name(
				"phoneNumberField"
			).objectDefinitionId(
				_objectDefinition.getObjectDefinitionId()
			).build());

		_objectDefinition =
			_objectDefinitionLocalService.publishCustomObjectDefinition(
				TestPropsValues.getUserId(),
				_objectDefinition.getObjectDefinitionId());
	}

	@After
	public void tearDown() throws Exception {
		_objectDefinitionLocalService.deleteObjectDefinition(
			_objectDefinition.getObjectDefinitionId());
	}

	@Test
	public void testAddObjectEntryWithEmptyPhoneNumber() throws Exception {
		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			_objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", ""
			).build(),
			ServiceContextTestUtil.getServiceContext());

		Assert.assertNotNull(objectEntry);
	}

	@Test
	public void testAddObjectEntryWithInvalidPhoneNumberContainingLetters()
		throws Exception {

		try {
			_objectEntryLocalService.addObjectEntry(
				TestPropsValues.getUserId(), 0,
				_objectDefinition.getObjectDefinitionId(),
				HashMapBuilder.<String, Serializable>put(
					"phoneNumberField", "abc123"
				).build(),
				ServiceContextTestUtil.getServiceContext());

			Assert.fail();
		}
		catch (ObjectEntryValuesException.InvalidPhoneNumber
					invalidPhoneNumber) {

			Assert.assertEquals(
				"phoneNumberField", invalidPhoneNumber.getObjectFieldName());
		}
	}

	@Test
	public void testAddObjectEntryWithInvalidPhoneNumberContainingSpecialChars()
		throws Exception {

		try {
			_objectEntryLocalService.addObjectEntry(
				TestPropsValues.getUserId(), 0,
				_objectDefinition.getObjectDefinitionId(),
				HashMapBuilder.<String, Serializable>put(
					"phoneNumberField", "+1@555#1234"
				).build(),
				ServiceContextTestUtil.getServiceContext());

			Assert.fail();
		}
		catch (ObjectEntryValuesException.InvalidPhoneNumber
					invalidPhoneNumber) {

			Assert.assertEquals(
				"phoneNumberField", invalidPhoneNumber.getObjectFieldName());
		}
	}

	@Test
	public void testAddObjectEntryWithValidDigitsOnlyPhoneNumber()
		throws Exception {

		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			_objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", "5551234567"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		Assert.assertEquals(
			"5551234567",
			objectEntry.getValues().get("phoneNumberField"));
	}

	@Test
	public void testAddObjectEntryWithValidE164PhoneNumber() throws Exception {
		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			_objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", "+15551234567"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		Assert.assertEquals(
			"+15551234567",
			objectEntry.getValues().get("phoneNumberField"));
	}

	@Test
	public void testAddObjectEntryWithValidFormattedPhoneNumber()
		throws Exception {

		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			_objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", "+1 (555) 123-4567"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		Assert.assertEquals(
			"+1 (555) 123-4567",
			objectEntry.getValues().get("phoneNumberField"));
	}

	@Test
	public void testObjectFieldBusinessType() {
		Assert.assertEquals(
			ObjectFieldConstants.BUSINESS_TYPE_PHONE_NUMBER,
			_objectField.getBusinessType());
		Assert.assertEquals(
			ObjectFieldConstants.DB_TYPE_STRING, _objectField.getDBType());
	}

	@Test
	public void testUpdateObjectEntryPhoneNumber() throws Exception {
		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
			TestPropsValues.getUserId(), 0,
			_objectDefinition.getObjectDefinitionId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", "+15551234567"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		objectEntry = _objectEntryLocalService.updateObjectEntry(
			TestPropsValues.getUserId(), objectEntry.getObjectEntryId(),
			HashMapBuilder.<String, Serializable>put(
				"phoneNumberField", "+449876543210"
			).build(),
			ServiceContextTestUtil.getServiceContext());

		Assert.assertEquals(
			"+449876543210",
			objectEntry.getValues().get("phoneNumberField"));
	}

	private ObjectDefinition _objectDefinition;
	private ObjectField _objectField;

	@Inject
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Inject
	private ObjectEntryLocalService _objectEntryLocalService;

}
