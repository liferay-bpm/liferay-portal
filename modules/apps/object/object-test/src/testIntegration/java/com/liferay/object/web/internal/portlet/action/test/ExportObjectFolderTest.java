/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.portlet.action.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.admin.rest.dto.v1_0.ObjectFolder;
import com.liferay.object.admin.rest.resource.v1_0.ObjectFolderResource;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.LayoutConstants;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceRequest;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceResponse;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.model.impl.LayoutImpl;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.io.ByteArrayOutputStream;

import java.util.List;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Guilherme Sa
 */
@RunWith(Arquillian.class)
public class ExportObjectFolderTest {

	@ClassRule
	@Rule
	public static final LiferayIntegrationTestRule liferayIntegrationTestRule =
		new LiferayIntegrationTestRule();

	@Before
	public void setUp() throws Exception {
		_user = TestPropsValues.getUser();

		ObjectFolderResource.Builder builder =
			_objectFolderResourceFactory.create();

		_objectFolderResource = builder.user(
			_user
		).build();
	}

	@Test
	public void testExportObjectFolder() throws Exception {
		ObjectFolder uncategorizedObjectFolder = _getObjectFolder(
			"Uncategorized");

		_getObjectFolderJSONObject(uncategorizedObjectFolder.getId());
	}

	private ObjectFolder _getObjectFolder(String name) throws Exception {
		Page<ObjectFolder> page = _objectFolderResource.getObjectFoldersPage(
			name, Pagination.of(1, 1));

		List<ObjectFolder> items = (List<ObjectFolder>)page.getItems();

		return items.get(0);
	}

	private JSONObject _getObjectFolderJSONObject(long objectFolderId)
		throws Exception {

		MockLiferayResourceRequest mockLiferayResourceRequest =
			new MockLiferayResourceRequest();

		mockLiferayResourceRequest.addParameter(
			"objectFolderId", String.valueOf(objectFolderId));
		mockLiferayResourceRequest.setAttribute(
			WebKeys.THEME_DISPLAY, _getThemeDisplay());

		MockLiferayResourceResponse mockLiferayResourceResponse =
			new MockLiferayResourceResponse();

		_mvcResourceCommand.serveResource(
			mockLiferayResourceRequest, mockLiferayResourceResponse);

		ByteArrayOutputStream byteArrayOutputStream =
			(ByteArrayOutputStream)
				mockLiferayResourceResponse.getPortletOutputStream();

		return JSONFactoryUtil.createJSONObject(
			byteArrayOutputStream.toString());
	}

	private ThemeDisplay _getThemeDisplay() throws Exception {
		ThemeDisplay themeDisplay = new ThemeDisplay();

		Layout layout = new LayoutImpl();

		layout.setType(LayoutConstants.TYPE_CONTROL_PANEL);

		themeDisplay.setLayout(layout);

		themeDisplay.setScopeGroupId(TestPropsValues.getGroupId());
		themeDisplay.setSiteDefaultLocale(LocaleUtil.US);
		themeDisplay.setUser(_user);

		return themeDisplay;
	}

	@Inject
	private JSONFactory _jsonFactory;

	@Inject(filter = "mvc.command.name=/object_folders/export_object_folder")
	private MVCResourceCommand _mvcResourceCommand;

	private ObjectFolderResource _objectFolderResource;

	@Inject
	private ObjectFolderResource.Factory _objectFolderResourceFactory;

	private User _user;

}