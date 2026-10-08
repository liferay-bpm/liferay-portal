/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.util.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceTestUtil;
import com.liferay.dynamic.data.mapping.util.comparator.DDMFormInstanceNameComparator;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.GroupTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Nathaly Gomes
 */
@RunWith(Arquillian.class)
public class DDMFormInstanceNameComparatorTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_group = GroupTestUtil.addGroup();

		_ddmFormInstance1 = DDMFormInstanceTestUtil.addDDMFormInstance(
			_group, TestPropsValues.getUserId());

		Locale defaultLocale = LocaleUtil.getSiteDefault();

		_ddmFormInstance1.setNameMap(
			HashMapBuilder.put(
				defaultLocale, "{name A}"
			).build(),
			defaultLocale);

		_ddmFormInstance2 = DDMFormInstanceTestUtil.addDDMFormInstance(
			_group, TestPropsValues.getUserId());

		_ddmFormInstance2.setNameMap(
			HashMapBuilder.put(
				LocaleUtil.JAPAN, "name b"
			).build(),
			LocaleUtil.JAPAN);

		_ddmFormInstance3 = DDMFormInstanceTestUtil.addDDMFormInstance(
			_group, TestPropsValues.getUserId());

		_ddmFormInstance3.setNameMap(
			HashMapBuilder.put(
				defaultLocale, "name c"
			).build(),
			defaultLocale);

		_ddmFormInstance4 = DDMFormInstanceTestUtil.addDDMFormInstance(
			_group, TestPropsValues.getUserId());

		_ddmFormInstance4.setNameMap(
			HashMapBuilder.put(
				LocaleUtil.JAPAN, "アンケート"
			).build(),
			LocaleUtil.JAPAN);
	}

	@Test
	public void testCompare() {
		List<DDMFormInstance> ddmFormInstances = ListUtil.fromArray(
			_ddmFormInstance3, _ddmFormInstance1, _ddmFormInstance4,
			_ddmFormInstance2);

		Collections.sort(
			ddmFormInstances, DDMFormInstanceNameComparator.getInstance(true));

		Assert.assertEquals(_ddmFormInstance1, ddmFormInstances.get(0));
		Assert.assertEquals(_ddmFormInstance2, ddmFormInstances.get(1));
		Assert.assertEquals(_ddmFormInstance3, ddmFormInstances.get(2));
		Assert.assertEquals(_ddmFormInstance4, ddmFormInstances.get(3));
	}

	private DDMFormInstance _ddmFormInstance1;
	private DDMFormInstance _ddmFormInstance2;
	private DDMFormInstance _ddmFormInstance3;
	private DDMFormInstance _ddmFormInstance4;

	@DeleteAfterTestRun
	private Group _group;

}