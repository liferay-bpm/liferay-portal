/**
 * SPDX-FileCopyrightText: (c) 2020 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.display.layout;

import com.liferay.dynamic.data.mapping.expression.DDMExpressionFactory;
import com.liferay.dynamic.data.mapping.form.renderer.DDMFormRenderer;
import com.liferay.item.selector.ItemSelector;
import com.liferay.object.constants.ObjectWebKeys;
import com.liferay.object.field.business.type.ObjectFieldBusinessType;
import com.liferay.object.field.business.type.ObjectFieldBusinessTypeRegistry;
import com.liferay.object.internal.field.business.type.DateTimeObjectFieldBusinessType;
import com.liferay.object.model.ObjectField;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.scope.ObjectScopeProviderRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectEntryService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectLayoutLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.object.web.internal.object.entries.display.context.ObjectEntryDisplayContextImpl;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Aquiles Duarte
 */
public class ObjectEntryDisplayContextImplTest {

	@ClassRule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testSystemFieldReturnsDateTimeBusinessType() {
		Mockito.when(
			_httpServletRequest.getAttribute(
				ObjectWebKeys.OBJECT_ENTRY_READ_ONLY)
		).thenReturn(
			Boolean.FALSE
		);

		ObjectField objectField = Mockito.mock(ObjectField.class);

		Mockito.when(
			objectField.getBusinessType()
		).thenReturn(
			"Date"
		);

		Mockito.when(
			objectField.getName()
		).thenReturn(
			"createDate"
		);

		DateTimeObjectFieldBusinessType dateTimeBusinessType =
			new DateTimeObjectFieldBusinessType();

		Mockito.when(
			_objectFieldBusinessTypeRegistry.getObjectFieldBusinessType(
				"DateTime")
		).thenReturn(
			dateTimeBusinessType
		);

		ObjectEntryDisplayContextImpl objectEntryDisplayContextImpl =
			new ObjectEntryDisplayContextImpl(
				_ddmExpressionFactory, _ddmFormRenderer, _httpServletRequest,
				_itemSelector, _objectDefinitionLocalService,
				_objectEntryManagerRegistry, _objectEntryLocalService,
				_objectEntryService, _objectFieldBusinessTypeRegistry,
				_objectFieldLocalService, _objectLayoutLocalService,
				_objectRelationshipLocalService, _objectScopeProviderRegistry);

		ObjectFieldBusinessType result = ReflectionTestUtil.invoke(
			objectEntryDisplayContextImpl,
			"_getEffectiveObjectFieldBusinessType",
			new Class<?>[] {ObjectField.class}, new Object[] {objectField});

		Assert.assertSame(dateTimeBusinessType, result);
	}

	private final DDMExpressionFactory _ddmExpressionFactory = Mockito.mock(
		DDMExpressionFactory.class);
	private final DDMFormRenderer _ddmFormRenderer = Mockito.mock(
		DDMFormRenderer.class);
	private final HttpServletRequest _httpServletRequest = Mockito.mock(
		HttpServletRequest.class);
	private final ItemSelector _itemSelector = Mockito.mock(ItemSelector.class);
	private final ObjectDefinitionLocalService _objectDefinitionLocalService =
		Mockito.mock(ObjectDefinitionLocalService.class);
	private final ObjectEntryLocalService _objectEntryLocalService =
		Mockito.mock(ObjectEntryLocalService.class);
	private final ObjectEntryManagerRegistry _objectEntryManagerRegistry =
		Mockito.mock(ObjectEntryManagerRegistry.class);
	private final ObjectEntryService _objectEntryService = Mockito.mock(
		ObjectEntryService.class);
	private final ObjectFieldBusinessTypeRegistry
		_objectFieldBusinessTypeRegistry = Mockito.mock(
			ObjectFieldBusinessTypeRegistry.class);
	private final ObjectFieldLocalService _objectFieldLocalService =
		Mockito.mock(ObjectFieldLocalService.class);
	private final ObjectLayoutLocalService _objectLayoutLocalService =
		Mockito.mock(ObjectLayoutLocalService.class);
	private final ObjectRelationshipLocalService
		_objectRelationshipLocalService = Mockito.mock(
			ObjectRelationshipLocalService.class);
	private final ObjectScopeProviderRegistry _objectScopeProviderRegistry =
		Mockito.mock(ObjectScopeProviderRegistry.class);

}