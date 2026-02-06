/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.admin.site.internal.dto.v1_0.util;

import com.liferay.exportimport.kernel.lar.ExportImportThreadLocal;
import com.liferay.headless.admin.site.dto.v1_0.ClassNameReference;
import com.liferay.info.collection.provider.InfoCollectionProvider;
import com.liferay.info.collection.provider.RelatedInfoItemCollectionProvider;
import com.liferay.info.item.InfoItemServiceRegistry;
import com.liferay.info.list.provider.item.selector.criterion.InfoListProviderItemSelectorReturnType;
import com.liferay.object.constants.ObjectDefinitionSettingConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectDefinitionSetting;
import com.liferay.object.service.ObjectDefinitionLocalServiceUtil;
import com.liferay.object.service.ObjectDefinitionSettingLocalServiceUtil;
import com.liferay.portal.json.JSONFactoryImpl;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Jhosseph Gonzalez
 */
public class CollectionUtilTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@BeforeClass
	public static void setUpClass() {
		JSONFactoryUtil jsonFactoryUtil = new JSONFactoryUtil();

		jsonFactoryUtil.setJSONFactory(new JSONFactoryImpl());
	}

	@Test
	public void testGetCollectionJSONObjectResolveUpdatedClassNameDuringImport()
		throws Exception {

		String className1 = "com.liferay.object.model.ObjectDefinition#A1B2";

		ClassNameReference classNameReference = _createClassNameReference(
			className1);

		InfoItemServiceRegistry infoItemServiceRegistry = Mockito.mock(
			InfoItemServiceRegistry.class);

		InfoCollectionProvider infoCollectionProvider = Mockito.mock(
			InfoCollectionProvider.class);

		ObjectDefinition objectDefinition = Mockito.mock(
			ObjectDefinition.class);

		ObjectDefinitionSetting objectDefinitionSetting = Mockito.mock(
			ObjectDefinitionSetting.class);

		String className2 = "com.liferay.object.model.ObjectDefinition#C3D4";

		Mockito.when(
			objectDefinition.getClassName()
		).thenReturn(
			className2
		);

		long objectDefinitionId = RandomTestUtil.randomLong();

		Mockito.when(
			objectDefinitionSetting.getObjectDefinitionId()
		).thenReturn(
			objectDefinitionId
		);

		String key = RandomTestUtil.randomString();
		String label = RandomTestUtil.randomString();
		String modelClassName = RandomTestUtil.randomString();

		_mockInfoCollectionProvider(
			infoItemServiceRegistry, infoCollectionProvider, className2, key,
			modelClassName, label);

		try (MockedStatic<CompanyThreadLocal> companyThreadLocalMockedStatic =
				Mockito.mockStatic(CompanyThreadLocal.class);
			MockedStatic<ExportImportThreadLocal>
				exportImportThreadLocalMockedStatic = Mockito.mockStatic(
					ExportImportThreadLocal.class);
			MockedStatic<ObjectDefinitionLocalServiceUtil>
				objectDefinitionLocalServiceUtilMockedStatic =
					Mockito.mockStatic(ObjectDefinitionLocalServiceUtil.class);
			MockedStatic<ObjectDefinitionSettingLocalServiceUtil>
				objectDefinitionSettingLocalServiceUtilMockedStatic =
					Mockito.mockStatic(
						ObjectDefinitionSettingLocalServiceUtil.class)) {

			long companyId = RandomTestUtil.randomLong();

			companyThreadLocalMockedStatic.when(
				CompanyThreadLocal::getCompanyId
			).thenReturn(
				companyId
			);

			exportImportThreadLocalMockedStatic.when(
				ExportImportThreadLocal::isImportInProcess
			).thenReturn(
				true
			);

			objectDefinitionSettingLocalServiceUtilMockedStatic.when(
				() ->
					ObjectDefinitionSettingLocalServiceUtil.
						fetchObjectDefinitionSetting(
							companyId,
							ObjectDefinitionSettingConstants.
								NAME_OLD_CLASS_NAME,
							className1)
			).thenReturn(
				objectDefinitionSetting
			);

			objectDefinitionLocalServiceUtilMockedStatic.when(
				() -> ObjectDefinitionLocalServiceUtil.fetchObjectDefinition(
					objectDefinitionId)
			).thenReturn(
				objectDefinition
			);

			JSONObject jsonObject = CollectionUtil.getCollectionJSONObject(
				classNameReference, companyId, infoItemServiceRegistry,
				RandomTestUtil.randomLong());

			_assertCollectionJSONObject(jsonObject, key, modelClassName, label);

			objectDefinitionSettingLocalServiceUtilMockedStatic.verify(
				() ->
					ObjectDefinitionSettingLocalServiceUtil.
						fetchObjectDefinitionSetting(
							companyId,
							ObjectDefinitionSettingConstants.
								NAME_OLD_CLASS_NAME,
							className1));

			objectDefinitionLocalServiceUtilMockedStatic.verify(
				() -> ObjectDefinitionLocalServiceUtil.fetchObjectDefinition(
					objectDefinitionId));
		}

		Mockito.verify(
			infoItemServiceRegistry
		).getInfoItemService(
			InfoCollectionProvider.class, className2
		);

		Mockito.verify(
			infoItemServiceRegistry, Mockito.never()
		).getInfoItemService(
			RelatedInfoItemCollectionProvider.class, className2
		);
	}

	@Test
	public void testGetCollectionJSONObjectUsesRelatedInfoItemCollectionProvider()
		throws Exception {

		String className = RandomTestUtil.randomString();

		ClassNameReference classNameReference = _createClassNameReference(
			className);

		InfoItemServiceRegistry infoItemServiceRegistry = Mockito.mock(
			InfoItemServiceRegistry.class);
		RelatedInfoItemCollectionProvider relatedInfoItemCollectionProvider =
			Mockito.mock(RelatedInfoItemCollectionProvider.class);

		Mockito.when(
			infoItemServiceRegistry.getInfoItemService(
				InfoCollectionProvider.class, className)
		).thenReturn(
			null
		);

		Mockito.when(
			infoItemServiceRegistry.getInfoItemService(
				RelatedInfoItemCollectionProvider.class, className)
		).thenReturn(
			relatedInfoItemCollectionProvider
		);

		String key = RandomTestUtil.randomString();

		Mockito.when(
			relatedInfoItemCollectionProvider.getKey()
		).thenReturn(
			key
		);

		String modelClassName = RandomTestUtil.randomString();

		Mockito.when(
			relatedInfoItemCollectionProvider.getCollectionItemClassName()
		).thenReturn(
			modelClassName
		);

		String label = RandomTestUtil.randomString();

		Mockito.when(
			relatedInfoItemCollectionProvider.getLabel(LocaleUtil.getDefault())
		).thenReturn(
			label
		);

		JSONObject jsonObject = CollectionUtil.getCollectionJSONObject(
			classNameReference, RandomTestUtil.randomLong(),
			infoItemServiceRegistry, RandomTestUtil.randomLong());

		_assertCollectionJSONObject(jsonObject, key, modelClassName, label);

		Mockito.verify(
			infoItemServiceRegistry
		).getInfoItemService(
			InfoCollectionProvider.class, className
		);

		Mockito.verify(
			infoItemServiceRegistry
		).getInfoItemService(
			RelatedInfoItemCollectionProvider.class, className
		);
	}

	private void _assertCollectionJSONObject(
		JSONObject jsonObject, String key, String modelClassName,
		String label) {

		Assert.assertEquals(key, jsonObject.getString("key"));
		Assert.assertEquals(modelClassName, jsonObject.getString("itemType"));
		Assert.assertEquals(label, jsonObject.getString("title"));
		Assert.assertEquals(
			InfoListProviderItemSelectorReturnType.class.getName(),
			jsonObject.getString("type"));
	}

	private ClassNameReference _createClassNameReference(String className) {
		ClassNameReference classNameReference = new ClassNameReference();

		classNameReference.setClassName(() -> className);

		return classNameReference;
	}

	private void _mockInfoCollectionProvider(
		InfoItemServiceRegistry infoItemServiceRegistry,
		InfoCollectionProvider infoCollectionProvider, String className,
		String key, String modelClassName, String label) {

		Mockito.when(
			infoItemServiceRegistry.getInfoItemService(
				InfoCollectionProvider.class, className)
		).thenReturn(
			infoCollectionProvider
		);

		Mockito.when(
			infoCollectionProvider.getKey()
		).thenReturn(
			key
		);

		Mockito.when(
			infoCollectionProvider.getCollectionItemClassName()
		).thenReturn(
			modelClassName
		);

		Mockito.when(
			infoCollectionProvider.getLabel(LocaleUtil.getDefault())
		).thenReturn(
			label
		);
	}

}