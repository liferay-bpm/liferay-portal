/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.object.definitions.display.context;

import com.liferay.notification.service.NotificationTemplateLocalService;
import com.liferay.object.action.executor.ObjectActionExecutorRegistry;
import com.liferay.object.action.trigger.ObjectActionTrigger;
import com.liferay.object.action.trigger.ObjectActionTriggerRegistry;
import com.liferay.object.constants.ObjectActionTriggerConstants;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.constants.ObjectWebKeys;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectFolderLocalService;
import com.liferay.portal.json.JSONFactoryImpl;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.model.Organization;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.module.util.SystemBundleUtil;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.test.TestInfo;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.security.script.management.configuration.helper.ScriptManagementConfigurationHelper;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceRegistration;

import org.springframework.mock.web.MockHttpServletRequest;

/**
 * @author Nathaly Gomes
 */
public class ObjectDefinitionsActionsDisplayContextTest {

	@ClassRule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@AfterClass
	public static void tearDownClass() {
		_frameworkUtilMockedStatic.close();
	}

	@Before
	public void setUp() throws Exception {
		_setUpLanguageUtil();
	}

	@Test
	@TestInfo("LPD-82766")
	public void testGetObjectActionCodeEditorElements() throws Exception {
		BundleContext bundleContext = SystemBundleUtil.getBundleContext();

		_frameworkUtilMockedStatic.when(
			() -> FrameworkUtil.getBundle(Mockito.any())
		).thenReturn(
			bundleContext.getBundle()
		);

		ObjectField objectField = Mockito.mock(ObjectField.class);

		Mockito.when(
			objectField.compareBusinessType(
				ObjectFieldConstants.BUSINESS_TYPE_AGGREGATION)
		).thenReturn(
			false
		);

		Mockito.when(
			objectField.getName()
		).thenReturn(
			"externalReferenceCode"
		);

		Mockito.when(
			_objectFieldLocalService.getObjectFields(1L)
		).thenReturn(
			Arrays.asList(objectField)
		);

		_objectFieldLocalServiceServiceRegistration =
			bundleContext.registerService(
				ObjectFieldLocalService.class, _objectFieldLocalService, null);

		Mockito.when(
			_objectDefinition.getObjectDefinitionId()
		).thenReturn(
			1L
		);

		ObjectDefinitionsActionsDisplayContext
			objectDefinitionsActionsDisplayContext =
				new ObjectDefinitionsActionsDisplayContext(
					_getHttpServletRequest(), new JSONFactoryImpl(),
					Mockito.mock(NotificationTemplateLocalService.class),
					Mockito.mock(ObjectActionExecutorRegistry.class),
					Mockito.mock(ObjectActionTriggerRegistry.class),
					Mockito.mock(ObjectDefinitionLocalService.class),
					Mockito.mock(ModelResourcePermission.class),
					_objectFieldLocalService,
					Mockito.mock(ObjectFolderLocalService.class),
					Mockito.mock(ScriptManagementConfigurationHelper.class));

		List<Map<String, Object>> elements =
			objectDefinitionsActionsDisplayContext.
				getObjectActionCodeEditorElements();

		Map<String, List<Map<String, String>>> groups = new HashMap<>();

		for (Map<String, Object> element : elements) {
			groups.put(
				(String)element.get("key"),
				(List<Map<String, String>>)element.get("items"));
		}

		Assert.assertEquals(groups.toString(), 4, groups.size());
		Assert.assertTrue(groups.containsKey("fields"));
		Assert.assertTrue(groups.containsKey("general-variables"));
		Assert.assertTrue(groups.containsKey("operators"));
		Assert.assertTrue(groups.containsKey("functions"));

		Assert.assertTrue(
			_containsContent(groups.get("fields"), "externalReferenceCode"));

		Assert.assertEquals(
			new HashSet<>(Arrays.asList("currentDate", "currentUserId")),
			_getContents(groups.get("general-variables")));

		Assert.assertEquals(
			new HashSet<>(
				Arrays.asList(
					"AND", "OR", "field_name1 / field_name2",
					"field_name1 - field_name2", "field_name1 + field_name2",
					"field_name1 * field_name2")),
			_getContents(groups.get("operators")));

		Assert.assertEquals(
			new HashSet<>(
				Arrays.asList(
					"addDays(field_name, parameter)",
					"addMonths(field_name, parameter)",
					"addYears(field_name, parameter)",
					"compareDates(field_name, parameter)",
					"concat(parameter1, parameter2, parameterN)",
					"condition(condition, parameter1, parameter2)",
					"contains(field_name, parameter)",
					"NOT(contains(field_name, parameter))",
					"futureDates(field_name, parameter)", "isURL(field_name)",
					"isEmailAddress(field_name)", "isDecimal(parameter)",
					"isEmpty(parameter)", "field_name == parameter",
					"field_name > parameter", "field_name >= parameter",
					"isInteger(parameter)", "field_name < parameter",
					"field_name <= parameter", "field_name != parameter",
					"match(field_name, parameter)", "oldValue(\"field_name\")",
					"pastDates(field_name, parameter)",
					"futureDates(field_name, parameter) AND pastDates(" +
						"field_name, parameter)",
					"sum(parameter1, parameter2, parameterN)")),
			_getContents(groups.get("functions")));

		_objectFieldLocalServiceServiceRegistration.unregister();
	}

	@Test
	public void testGetObjectActionTriggersJSONArray() {
		ObjectActionTriggerRegistry objectActionTriggerRegistry = Mockito.mock(
			ObjectActionTriggerRegistry.class);

		ObjectActionTrigger objectActionTrigger1 = Mockito.mock(
			ObjectActionTrigger.class);
		ObjectActionTrigger objectActionTrigger2 = Mockito.mock(
			ObjectActionTrigger.class);

		Mockito.when(
			_objectDefinition.getClassName()
		).thenReturn(
			User.class.getName()
		);

		Mockito.when(
			objectActionTriggerRegistry.getObjectActionTriggers(
				_objectDefinition.getClassName())
		).thenReturn(
			Arrays.asList(objectActionTrigger1, objectActionTrigger2)
		);

		Mockito.when(
			objectActionTrigger1.getKey()
		).thenReturn(
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD
		);

		Mockito.when(
			objectActionTrigger2.getKey()
		).thenReturn(
			ObjectActionTriggerConstants.KEY_ON_AFTER_LOGIN
		);

		ObjectDefinitionsActionsDisplayContext
			objectDefinitionsActionsDisplayContext =
				new ObjectDefinitionsActionsDisplayContext(
					_getHttpServletRequest(), new JSONFactoryImpl(),
					Mockito.mock(NotificationTemplateLocalService.class),
					Mockito.mock(ObjectActionExecutorRegistry.class),
					objectActionTriggerRegistry,
					Mockito.mock(ObjectDefinitionLocalService.class),
					Mockito.mock(ModelResourcePermission.class),
					Mockito.mock(ObjectFieldLocalService.class),
					Mockito.mock(ObjectFolderLocalService.class),
					Mockito.mock(ScriptManagementConfigurationHelper.class));

		JSONArray jsonArray =
			objectDefinitionsActionsDisplayContext.
				getObjectActionTriggersJSONArray();

		Assert.assertEquals(
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			JSONUtil.getValue(jsonArray, "JSONObject/0", "Object/value"));
		Assert.assertEquals(
			ObjectActionTriggerConstants.KEY_ON_AFTER_LOGIN,
			JSONUtil.getValue(jsonArray, "JSONObject/1", "Object/value"));

		Mockito.when(
			_objectDefinition.getClassName()
		).thenReturn(
			Organization.class.getName()
		);

		Mockito.when(
			objectActionTriggerRegistry.getObjectActionTriggers(
				_objectDefinition.getClassName())
		).thenReturn(
			Arrays.asList(objectActionTrigger1, objectActionTrigger2)
		);

		jsonArray =
			objectDefinitionsActionsDisplayContext.
				getObjectActionTriggersJSONArray();

		Assert.assertEquals(
			ObjectActionTriggerConstants.KEY_ON_AFTER_ADD,
			JSONUtil.getValue(jsonArray, "JSONObject/0", "Object/value"));
		Assert.assertNull(
			JSONUtil.getValue(jsonArray, "JSONObject/1", "Object/value"));
	}

	private boolean _containsContent(
		List<Map<String, String>> items, String content) {

		for (Map<String, String> item : items) {
			if (content.equals(item.get("content"))) {
				return true;
			}
		}

		return false;
	}

	private Set<String> _getContents(List<Map<String, String>> items) {
		Set<String> contents = new HashSet<>();

		for (Map<String, String> item : items) {
			contents.add(item.get("content"));
		}

		return contents;
	}

	private HttpServletRequest _getHttpServletRequest() {
		HttpServletRequest httpServletRequest = new MockHttpServletRequest();

		httpServletRequest.setAttribute(
			ObjectWebKeys.OBJECT_DEFINITION, _objectDefinition);

		ThemeDisplay themeDisplay = new ThemeDisplay();

		themeDisplay.setLocale(LocaleUtil.US);

		httpServletRequest.setAttribute(WebKeys.THEME_DISPLAY, themeDisplay);

		return httpServletRequest;
	}

	private void _setUpLanguageUtil() {
		LanguageUtil languageUtil = new LanguageUtil();

		languageUtil.setLanguage(Mockito.mock(Language.class));
	}

	private static final MockedStatic<FrameworkUtil>
		_frameworkUtilMockedStatic = Mockito.mockStatic(FrameworkUtil.class);

	private final ObjectDefinition _objectDefinition = Mockito.mock(
		ObjectDefinition.class);
	private final ObjectFieldLocalService _objectFieldLocalService =
		Mockito.mock(ObjectFieldLocalService.class);
	private ServiceRegistration<ObjectFieldLocalService>
		_objectFieldLocalServiceServiceRegistration;

}