/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.form.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.model.LocalizedValue;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceLocalService;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMFormTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMStructureTestUtil;
import com.liferay.dynamic.data.mapping.util.DDMUtil;
import com.liferay.headless.form.client.dto.v1_0.Form;
import com.liferay.headless.form.client.dto.v1_0.FormContext;
import com.liferay.headless.form.client.dto.v1_0.FormField;
import com.liferay.headless.form.client.dto.v1_0.FormFieldContext;
import com.liferay.headless.form.client.dto.v1_0.FormFieldValue;
import com.liferay.headless.form.client.dto.v1_0.FormPage;
import com.liferay.headless.form.client.dto.v1_0.FormPageContext;
import com.liferay.headless.form.client.dto.v1_0.FormStructure;
import com.liferay.headless.form.dto.v1_0.util.FormUtil;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.test.rule.Inject;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Javier Gamarra
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class FormResourceTest extends BaseFormResourceTestCase {

	@Override
	@Test
	public void testGetForm() throws Exception {
		super.testGetForm();

		_testGetFormWithDraftFormInstanceVersion();
		_testGetFormWithStructureNameInOtherDefaultLanguage();
	}

	@Override
	@Test
	public void testPostFormEvaluateContext() throws Exception {
		super.testPostFormEvaluateContext();

		_testPostFormEvaluateContextWithDraftFormInstanceVersion();
	}

	@Override
	protected void assertValid(Form form) {
		boolean valid = true;

		if (Validator.isNull(form.getDateCreated()) ||
			Validator.isNull(form.getDateModified()) ||
			Validator.isNull(form.getId())) {

			valid = false;
		}

		Assert.assertTrue(valid);
	}

	@Override
	protected Form testGetForm_addForm() throws Exception {
		return _addForm(testGroup.getGroupId());
	}

	@Override
	protected Form testGetSiteFormsPage_addForm(Long siteId, Form form)
		throws Exception {

		return _addForm(siteId);
	}

	@Override
	protected Form testGraphQLForm_addForm() throws Exception {
		return _addForm(testGroup.getGroupId());
	}

	private Form _addForm(Long groupId) throws Exception {
		DDMFormInstance ddmFormInstance =
			DDMFormInstanceTestUtil.addDDMFormInstance(
				_groupLocalService.getGroup(groupId),
				TestPropsValues.getUserId());

		com.liferay.headless.form.dto.v1_0.Form form = FormUtil.toForm(
			true, ddmFormInstance, _portal,
			LocaleUtil.fromLanguageId(ddmFormInstance.getDefaultLanguageId()),
			_userLocalService);

		return Form.toDTO(form.toString());
	}

	private void _testGetFormWithDraftFormInstanceVersion() throws Exception {
		DDMFormInstance ddmFormInstance =
			DDMFormInstanceTestUtil.addDDMFormInstance(
				_groupLocalService.getGroup(testGroup.getGroupId()),
				TestPropsValues.getUserId());

		DDMForm ddmForm = DDMFormTestUtil.createDDMForm(
			RandomTestUtil.randomString());

		ServiceContext serviceContext =
			ServiceContextTestUtil.getServiceContext(testGroup.getGroupId());

		serviceContext.setAttribute("status", WorkflowConstants.STATUS_DRAFT);

		_ddmFormInstanceLocalService.updateFormInstance(
			TestPropsValues.getUserId(), ddmFormInstance.getFormInstanceId(),
			HashMapBuilder.put(
				LocaleUtil.SPAIN, RandomTestUtil.randomString()
			).put(
				LocaleUtil.US, RandomTestUtil.randomString()
			).build(),
			ddmFormInstance.getDescriptionMap(), ddmForm,
			DDMUtil.getDefaultDDMFormLayout(ddmForm),
			ddmFormInstance.getSettingsDDMFormValues(), serviceContext);

		Form form = formResource.getForm(ddmFormInstance.getFormInstanceId());

		Assert.assertArrayEquals(
			LocaleUtil.toW3cLanguageIds(
				ddmFormInstance.getAvailableLanguageIds()),
			form.getAvailableLanguages());
		Assert.assertEquals(
			ddmFormInstance.getDefaultLanguageId(), form.getDefaultLanguage());
		Assert.assertEquals(
			ddmFormInstance.getName(LocaleUtil.US), form.getName());

		FormStructure formStructure = form.getStructure();

		DDMStructure ddmStructure = ddmFormInstance.getStructure();

		Assert.assertEquals(
			ddmStructure.getName(LocaleUtil.US), formStructure.getName());

		FormPage[] formPages = formStructure.getFormPages();

		FormField[] formFields = formPages[0].getFormFields();

		Assert.assertEquals("text", formFields[0].getName());
	}

	private void _testGetFormWithStructureNameInOtherDefaultLanguage()
		throws Exception {

		DDMForm ddmForm = DDMFormTestUtil.createDDMForm(
			DDMFormTestUtil.createAvailableLocales(LocaleUtil.BRAZIL),
			LocaleUtil.BRAZIL);

		DDMFormField ddmFormField = DDMFormTestUtil.createDDMFormField(
			"text", RandomTestUtil.randomString(), "text", "string", true,
			false, false, LocaleUtil.BRAZIL);

		LocalizedValue localizedValue = ddmFormField.getLabel();

		localizedValue.setDefaultLocale(LocaleUtil.BRAZIL);

		ddmForm.addDDMFormField(ddmFormField);

		DDMStructure ddmStructure = DDMStructureTestUtil.addStructure(
			testGroup.getGroupId(), DDMFormInstance.class.getName(), ddmForm,
			LocaleUtil.BRAZIL);

		DDMFormInstance ddmFormInstance =
			_ddmFormInstanceLocalService.addFormInstance(
				TestPropsValues.getUserId(), testGroup.getGroupId(),
				ddmStructure.getStructureId(),
				HashMapBuilder.put(
					LocaleUtil.BRAZIL, RandomTestUtil.randomString()
				).build(),
				HashMapBuilder.put(
					LocaleUtil.BRAZIL, RandomTestUtil.randomString()
				).build(),
				DDMFormInstanceTestUtil.createSettingsDDMFormValues(),
				ServiceContextTestUtil.getServiceContext(
					testGroup.getGroupId()));

		Form form = formResource.getForm(ddmFormInstance.getFormInstanceId());

		FormStructure formStructure = form.getStructure();

		Assert.assertEquals(
			ddmStructure.getName(LocaleUtil.BRAZIL), formStructure.getName());
	}

	private void _testPostFormEvaluateContextWithDraftFormInstanceVersion()
		throws Exception {

		DDMFormInstance ddmFormInstance =
			DDMFormInstanceTestUtil.addDDMFormInstance(
				_groupLocalService.getGroup(testGroup.getGroupId()),
				TestPropsValues.getUserId());

		DDMForm ddmForm = DDMFormTestUtil.createDDMForm(
			RandomTestUtil.randomString());

		ServiceContext serviceContext =
			ServiceContextTestUtil.getServiceContext(testGroup.getGroupId());

		serviceContext.setAttribute("status", WorkflowConstants.STATUS_DRAFT);

		_ddmFormInstanceLocalService.updateFormInstance(
			TestPropsValues.getUserId(), ddmFormInstance.getFormInstanceId(),
			ddmFormInstance.getNameMap(), ddmFormInstance.getDescriptionMap(),
			ddmForm, DDMUtil.getDefaultDDMFormLayout(ddmForm),
			ddmFormInstance.getSettingsDDMFormValues(), serviceContext);

		FormContext formContext = formResource.postFormEvaluateContext(
			ddmFormInstance.getFormInstanceId(),
			new FormContext() {
				{
					formFieldValues = new FormFieldValue[] {
						new FormFieldValue() {
							{
								name = "text";
								value = RandomTestUtil.randomString();
							}
						}
					};
				}
			});

		FormPageContext[] formPageContexts = formContext.getFormPageContexts();

		FormFieldContext[] formFieldContexts =
			formPageContexts[0].getFormFieldContexts();

		Assert.assertEquals("text", formFieldContexts[0].getName());
	}

	@Inject(type = DDMFormInstanceLocalService.class)
	private DDMFormInstanceLocalService _ddmFormInstanceLocalService;

	@Inject(type = GroupLocalService.class)
	private GroupLocalService _groupLocalService;

	@Inject(type = Portal.class)
	private Portal _portal;

	@Inject(type = UserLocalService.class)
	private UserLocalService _userLocalService;

}