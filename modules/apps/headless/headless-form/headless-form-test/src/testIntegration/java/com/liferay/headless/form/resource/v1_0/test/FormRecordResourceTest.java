/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.form.resource.v1_0.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.document.library.kernel.model.DLFolderConstants;
import com.liferay.document.library.kernel.service.DLAppLocalServiceUtil;
import com.liferay.dynamic.data.mapping.model.DDMForm;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.model.DDMFormInstance;
import com.liferay.dynamic.data.mapping.model.DDMFormInstanceRecord;
import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.model.LocalizedValue;
import com.liferay.dynamic.data.mapping.model.Value;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceLocalService;
import com.liferay.dynamic.data.mapping.service.DDMFormInstanceRecordLocalService;
import com.liferay.dynamic.data.mapping.storage.DDMFormFieldValue;
import com.liferay.dynamic.data.mapping.storage.DDMFormValues;
import com.liferay.dynamic.data.mapping.test.util.DDMFormInstanceTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMFormTestUtil;
import com.liferay.dynamic.data.mapping.test.util.DDMStructureTestUtil;
import com.liferay.headless.form.client.dto.v1_0.FormDocument;
import com.liferay.headless.form.client.dto.v1_0.FormFieldValue;
import com.liferay.headless.form.client.dto.v1_0.FormRecord;
import com.liferay.headless.form.client.resource.v1_0.FormRecordResource;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.test.rule.DataGuard;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.test.util.UserTestUtil;
import com.liferay.portal.kernel.util.ContentTypes;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.test.rule.Inject;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Javier Gamarra
 */
@DataGuard(scope = DataGuard.Scope.METHOD)
@RunWith(Arquillian.class)
public class FormRecordResourceTest extends BaseFormRecordResourceTestCase {

	@Before
	@Override
	public void setUp() throws Exception {
		super.setUp();

		_ddmFormInstance = DDMFormInstanceTestUtil.addDDMFormInstance(
			_groupLocalService.getGroup(testGroup.getGroupId()),
			TestPropsValues.getUserId());
	}

	@Override
	@Test
	public void testPostFormFormRecord() throws Exception {
		super.testPostFormFormRecord();

		_testPostFormFormRecordWithNondefaultLocale();
	}

	@Override
	protected String[] getAdditionalAssertFieldNames() {
		return new String[] {"draft"};
	}

	@Override
	protected FormRecord randomFormRecord() {
		return new FormRecord() {
			{
				dateCreated = RandomTestUtil.nextDate();
				dateModified = RandomTestUtil.nextDate();
				draft = true;
				formFieldValues = new FormFieldValue[] {
					new FormFieldValue() {
						{
							name = "text";
							value = RandomTestUtil.randomString();
						}
					}
				};
				formId = _ddmFormInstance.getFormInstanceId();
			}
		};
	}

	@Override
	protected FormRecord testGetFormFormRecordByLatestDraft_addFormRecord()
		throws Exception {

		FormRecord formRecord = _addFormRecord(randomFormRecord());

		formRecord.setFormId(_ddmFormInstance.getFormInstanceId());

		return formRecord;
	}

	@Override
	protected Long testGetFormFormRecordByLatestDraft_getFormId(
			FormRecord formRecord)
		throws Exception {

		return formRecord.getFormId();
	}

	@Override
	protected Map<String, Map<String, String>>
			testGetFormFormRecordsPage_getExpectedActions(Long formId)
		throws Exception {

		return Collections.emptyMap();
	}

	@Override
	protected Long testGetFormFormRecordsPage_getFormId() {
		return _ddmFormInstance.getFormInstanceId();
	}

	@Override
	protected FormRecord testGetFormRecord_addFormRecord() throws Exception {
		return _addFormRecord(randomFormRecord());
	}

	@Override
	protected FormRecord testGraphQLFormRecord_addFormRecord()
		throws Exception {

		FormRecord formRecord = _addFormRecord(randomFormRecord());

		formRecord.setFormId(_ddmFormInstance.getFormInstanceId());

		return formRecord;
	}

	@Override
	protected Long testGraphQLGetFormFormRecordByLatestDraft_getFormId(
			FormRecord formRecord)
		throws Exception {

		return formRecord.getFormId();
	}

	@Override
	protected Long testGraphQLPostFormFormRecord_getFormId(
			FormRecord formRecord)
		throws Exception {

		return formRecord.getFormId();
	}

	@Override
	protected FormRecord testPutFormRecord_addFormRecord() throws Exception {
		return _addFormRecord(randomFormRecord());
	}

	private FormRecord _addFormRecord(FormRecord formRecord) throws Exception {
		return formRecordResource.postFormFormRecord(
			_ddmFormInstance.getFormInstanceId(), formRecord);
	}

	private void _testPostFormFormRecordWithNondefaultLocale()
		throws Exception {

		DDMForm ddmForm = DDMFormTestUtil.createDDMForm(
			DDMFormTestUtil.createAvailableLocales(LocaleUtil.SPAIN),
			LocaleUtil.SPAIN);

		DDMFormField textDDMFormField =
			DDMFormTestUtil.createLocalizableTextDDMFormField("text");

		LocalizedValue label = new LocalizedValue(LocaleUtil.SPAIN);

		label.addString(LocaleUtil.SPAIN, RandomTestUtil.randomString());

		textDDMFormField.setLabel(label);

		ddmForm.addDDMFormField(textDDMFormField);

		DDMFormField documentLibraryDDMFormField =
			DDMFormTestUtil.addDocumentLibraryDDMFormField(
				ddmForm, "documentLibrary");

		documentLibraryDDMFormField.setLabel(label);

		DDMStructure ddmStructure = DDMStructureTestUtil.addStructure(
			testGroup.getGroupId(), DDMFormInstance.class.getName(), ddmForm,
			LocaleUtil.SPAIN);

		DDMFormInstance ddmFormInstance =
			_ddmFormInstanceLocalService.addFormInstance(
				TestPropsValues.getUserId(), testGroup.getGroupId(),
				ddmStructure.getStructureId(),
				Collections.singletonMap(
					LocaleUtil.SPAIN, RandomTestUtil.randomString()),
				Collections.singletonMap(
					LocaleUtil.SPAIN, RandomTestUtil.randomString()),
				DDMFormInstanceTestUtil.createSettingsDDMFormValues(),
				ServiceContextTestUtil.getServiceContext(
					testGroup.getGroupId()));

		User user = UserTestUtil.getAdminUser(testCompany.getCompanyId());

		FormRecordResource formRecordResource = FormRecordResource.builder(
		).authentication(
			user.getEmailAddress(), PropsValues.DEFAULT_ADMIN_PASSWORD
		).endpoint(
			testCompany.getVirtualHostname(),
			PortalUtil.getPortalServerPort(false), "http"
		).locale(
			LocaleUtil.SPAIN
		).build();

		FormFieldValue textFormFieldValue = new FormFieldValue() {
			{
				name = "text";
				value = RandomTestUtil.randomString();
			}
		};

		FileEntry fileEntry = DLAppLocalServiceUtil.addFileEntry(
			null, TestPropsValues.getUserId(), testGroup.getGroupId(),
			DLFolderConstants.DEFAULT_PARENT_FOLDER_ID,
			RandomTestUtil.randomString(), ContentTypes.TEXT_PLAIN,
			RandomTestUtil.randomString(), RandomTestUtil.randomString(),
			RandomTestUtil.randomString(), RandomTestUtil.randomString(),
			new byte[0], null, null, null,
			ServiceContextTestUtil.getServiceContext(testGroup.getGroupId()));

		FormRecord formRecord = formRecordResource.postFormFormRecord(
			ddmFormInstance.getFormInstanceId(),
			new FormRecord() {
				{
					draft = false;
					formFieldValues = new FormFieldValue[] {
						textFormFieldValue,
						new FormFieldValue() {
							{
								name = "documentLibrary";
								value = JSONUtil.put(
									"fileEntryId", fileEntry.getFileEntryId()
								).toString();
							}
						}
					};
				}
			});

		Map<String, FormFieldValue> formFieldValuesMap = new HashMap<>();

		for (FormFieldValue formFieldValue : formRecord.getFormFieldValues()) {
			formFieldValuesMap.put(formFieldValue.getName(), formFieldValue);
		}

		FormFieldValue documentLibraryFormFieldValue = formFieldValuesMap.get(
			"documentLibrary");

		FormDocument formDocument =
			documentLibraryFormFieldValue.getFormDocument();

		Assert.assertEquals(
			Long.valueOf(fileEntry.getFileEntryId()), formDocument.getId());

		FormFieldValue formFieldValue = formFieldValuesMap.get("text");

		Assert.assertEquals(
			textFormFieldValue.getValue(), formFieldValue.getValue());

		DDMFormInstanceRecord ddmFormInstanceRecord =
			_ddmFormInstanceRecordLocalService.getFormInstanceRecord(
				formRecord.getId());

		DDMFormValues ddmFormValues = ddmFormInstanceRecord.getDDMFormValues();

		Assert.assertEquals(LocaleUtil.SPAIN, ddmFormValues.getDefaultLocale());

		for (DDMFormFieldValue ddmFormFieldValue :
				ddmFormValues.getDDMFormFieldValues()) {

			Value value = ddmFormFieldValue.getValue();

			Assert.assertEquals(LocaleUtil.SPAIN, value.getDefaultLocale());
		}
	}

	private DDMFormInstance _ddmFormInstance;

	@Inject(type = DDMFormInstanceLocalService.class)
	private DDMFormInstanceLocalService _ddmFormInstanceLocalService;

	@Inject(type = DDMFormInstanceRecordLocalService.class)
	private DDMFormInstanceRecordLocalService
		_ddmFormInstanceRecordLocalService;

	@Inject(type = GroupLocalService.class)
	private GroupLocalService _groupLocalService;

}