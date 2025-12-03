/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.entry.util.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.entry.util.ObjectEntryValuesUtil;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.model.ObjectField;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.util.LocalizedMapUtil;

import java.util.Collections;
import java.util.Map;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Yuri Monteiro
 */
@RunWith(Arquillian.class)
public class ObjectEntryValuesUtilTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Test
	public void testGetTitleFieldValue() {
		String objectFieldName = RandomTestUtil.randomString();

		ObjectField objectField = _createObjectField(objectFieldName);

		Map<String, Object> modelAttributes = Collections.singletonMap(
			objectFieldName, RandomTestUtil.randomString());

		Object titleFieldValue = ObjectEntryValuesUtil.getTitleFieldValue(
			ObjectFieldConstants.BUSINESS_TYPE_TEXT, modelAttributes,
			objectField, null, null);

		Assert.assertNull(titleFieldValue);

		String modelAttributesTitle = RandomTestUtil.randomString();

		modelAttributes = Collections.singletonMap(
			objectFieldName, modelAttributesTitle);

		String value = RandomTestUtil.randomString();

		Map<String, Object> values = Collections.singletonMap(
			objectFieldName, value);

		titleFieldValue = ObjectEntryValuesUtil.getTitleFieldValue(
			ObjectFieldConstants.BUSINESS_TYPE_TEXT, modelAttributes,
			objectField, null, values);

		Assert.assertEquals(value, titleFieldValue);

		titleFieldValue = ObjectEntryValuesUtil.getTitleFieldValue(
			ObjectFieldConstants.BUSINESS_TYPE_TEXT,
			HashMapBuilder.<String, Object>put(
				objectField.getDBColumnName(), modelAttributesTitle
			).put(
				objectField.getName(), RandomTestUtil.randomString()
			).build(),
			objectField, null,
			HashMapBuilder.<String, Object>put(
				RandomTestUtil.randomString(), RandomTestUtil.randomString()
			).build());

		Assert.assertEquals(modelAttributesTitle, titleFieldValue);
	}

	@Test
	public void testGetValue() {
		Assert.assertNull(
			ObjectEntryValuesUtil.getValue(null, null, Collections.emptyMap()));

		ObjectField creatorObjectField = _createObjectField("creator");

		String userName = RandomTestUtil.randomString();

		Object value = ObjectEntryValuesUtil.getValue(
			null, creatorObjectField,
			HashMapBuilder.<String, Object>put(
				"userName", userName
			).build());

		Assert.assertEquals(userName, value);

		ObjectField idObjectField = _createObjectField("id");

		long objectEntryId = RandomTestUtil.randomLong();

		value = ObjectEntryValuesUtil.getValue(
			null, idObjectField,
			HashMapBuilder.<String, Object>put(
				"objectEntryId", objectEntryId
			).build());

		Assert.assertEquals(objectEntryId, value);

		ObjectField localizedObjectField = _createLocalizedObjectField(
			"textObjectField");

		String portugueseValue = RandomTestUtil.randomString();

		Map<String, Object> localizedValues =
			HashMapBuilder.<String, Object>put(
				localizedObjectField.getName(), RandomTestUtil.randomString()
			).put(
				localizedObjectField.getI18nObjectFieldName(),
				HashMapBuilder.<String, Object>put(
					"en_US", RandomTestUtil.randomString()
				).put(
					"pt_BR", portugueseValue
				).build()
			).build();

		Object localizedValue = ObjectEntryValuesUtil.getValue(
			"pt_BR", localizedObjectField, localizedValues);

		Assert.assertEquals(portugueseValue, localizedValue);
	}

	@Test
	public void testGetValueString() {
		String fieldName = RandomTestUtil.randomString();

		ObjectField objectField = _createObjectField(fieldName);

		String value = RandomTestUtil.randomString();

		Assert.assertEquals(
			value,
			ObjectEntryValuesUtil.getValueString(
				objectField, Collections.singletonMap(fieldName, value)));
	}

	private ObjectField _createLocalizedObjectField(String name) {
		return new TextObjectFieldBuilder(
		).labelMap(
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString())
		).localized(
			true
		).name(
			name
		).build();
	}

	private ObjectField _createObjectField(String name) {
		return new TextObjectFieldBuilder(
		).labelMap(
			LocalizedMapUtil.getLocalizedMap(RandomTestUtil.randomString())
		).name(
			name
		).build();
	}

}