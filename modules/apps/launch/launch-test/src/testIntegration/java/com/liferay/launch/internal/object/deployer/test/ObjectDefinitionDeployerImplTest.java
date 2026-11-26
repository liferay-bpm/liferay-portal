/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.launch.internal.object.deployer.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.item.selector.criteria.info.item.criterion.InfoItemItemSelectorCriterion;
import com.liferay.launch.entry.manager.LaunchEntryManager;
import com.liferay.launch.entry.manager.LaunchEntryManagerRegistry;
import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.field.builder.TextObjectFieldBuilder;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.test.util.ObjectDefinitionTestUtil;
import com.liferay.object.test.util.ObjectEntryTestUtil;
import com.liferay.petra.lang.SafeCloseable;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.DeleteAfterTestRun;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Alejandro Tardín
 */
@RunWith(Arquillian.class)
public class ObjectDefinitionDeployerImplTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Test
	@TestInfo("LPD-110889")
	public void testDeploy() throws Exception {
		_objectDefinition1 = _publishObjectDefinition(false);

		Assert.assertNull(
			_launchEntryManagerRegistry.getLaunchEntryManager(
				_objectDefinition1.getClassName()));

		_objectDefinition2 = _publishObjectDefinition(true);

		LaunchEntryManager launchEntryManager =
			_launchEntryManagerRegistry.getLaunchEntryManager(
				_objectDefinition2.getClassName());

		Assert.assertEquals(
			_objectDefinition2.getClassName(),
			launchEntryManager.getClassName());

		InfoItemItemSelectorCriterion infoItemItemSelectorCriterion =
			(InfoItemItemSelectorCriterion)
				launchEntryManager.getItemSelectorCriterion();

		Assert.assertEquals(
			_objectDefinition2.getClassName(),
			infoItemItemSelectorCriterion.getItemType());

		Locale locale = LocaleUtil.getDefault();

		Assert.assertEquals(
			_objectDefinition2.getLabel(locale),
			launchEntryManager.getLabel(locale));

		ObjectEntry objectEntry1 = ObjectEntryTestUtil.addObjectEntry(
			_objectDefinition1);

		Assert.assertNull(
			launchEntryManager.fetchItem(objectEntry1.getObjectEntryId()));

		ObjectEntry objectEntry2 = ObjectEntryTestUtil.addObjectEntry(
			_objectDefinition2);

		LaunchEntryManager.Item item = launchEntryManager.fetchItem(
			objectEntry2.getObjectEntryId());

		Group companyGroup = _groupLocalService.getCompanyGroup(
			TestPropsValues.getCompanyId());

		Assert.assertEquals(companyGroup.getGroupId(), item.getGroupId());

		List<LaunchEntryManager> launchEntryManagers =
			_launchEntryManagerRegistry.getLaunchEntryManagers();

		Assert.assertTrue(launchEntryManagers.contains(launchEntryManager));

		try (SafeCloseable safeCloseable =
				CompanyThreadLocal.setCompanyIdWithSafeCloseable(
					RandomTestUtil.nextLong())) {

			launchEntryManagers =
				_launchEntryManagerRegistry.getLaunchEntryManagers();

			Assert.assertFalse(
				launchEntryManagers.contains(launchEntryManager));
		}
	}

	private ObjectDefinition _publishObjectDefinition(
			boolean enableObjectEntryDraft)
		throws Exception {

		return ObjectDefinitionTestUtil.publishObjectDefinition(
			enableObjectEntryDraft, false, true,
			Collections.singletonList(
				new TextObjectFieldBuilder(
				).labelMap(
					RandomTestUtil.randomLocaleStringMap()
				).name(
					"text"
				).build()),
			ObjectDefinitionConstants.SCOPE_COMPANY);
	}

	@Inject
	private GroupLocalService _groupLocalService;

	@Inject
	private LaunchEntryManagerRegistry _launchEntryManagerRegistry;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition1;

	@DeleteAfterTestRun
	private ObjectDefinition _objectDefinition2;

}