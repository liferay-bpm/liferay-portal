/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.portlet.action.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.admin.rest.dto.v1_0.ObjectFolder;
import com.liferay.object.admin.rest.dto.v1_0.ObjectFolderItem;
import com.liferay.object.admin.rest.resource.v1_0.ObjectFolderResource;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCActionCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Guilherme Sa
 */
@RunWith(Arquillian.class)
public class ObjectFolderExportImportTest extends BaseExportImportTestCase {

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
	public void testExportImportObjectFolder() throws Exception {

		// Import and export an empty object folder

		testExportImport(
			"empty_object_folder.json", "EMPTY_OBJECT_FOLDER",
			"EmptyObjectFolder", "empty_object_folder.json");

		_assertObjectFolder("EmptyObjectFolder", 0, false);

		// Import and export an object folder that has a linked object that
		// doesn't exist

		testExportImport(
			"object_folder.json", "OBJECT_FOLDER", "ObjectFolder",
			"object_folder.json");

		_assertObjectFolder("ObjectFolder", 2, true);

		// Import and export an object folder that moves an ObjectDefinition
		// during import

		testExportImport(
			"linked_object_folder.json", "LINKED_OBJECT_FOLDER",
			"LinkedObjectFolder", "linked_object_folder.json");

		_assertObjectFolder("LinkedObjectFolder", 2, false);

		// Import and export an object folder with conflicting ERC, but with
		// less ObjectDefinitions

		testExportImport(
			"empty_object_folder.json", "LINKED_OBJECT_FOLDER",
			"EmptyObjectFolder", "empty_object_folder.json");

		_assertObjectFolder("EmptyObjectFolder", 0, true);

		// Import and export an object folder with invalid folder items

		testExportImport(
			"object_folder_invalid_items.json", "EMPTY_OBJECT_FOLDER",
			"EmptyObjectFolder", "empty_object_folder.json");

		_assertObjectFolder("EmptyObjectFolder", 0, true);
	}

	@Override
	protected ClassLoader getClassLoader() {
		return ObjectFolderExportImportTest.class.getClassLoader();
	}

	@Override
	protected Class<?> getClazz() {
		return getClass();
	}

	@Override
	protected long getId(String name) throws Exception {
		ObjectFolder importedFolder = _getObjectFolder(name);

		return importedFolder.getId();
	}

	@Override
	protected String getIdentifierName() {
		return "objectFolderId";
	}

	@Override
	protected String getJsonName() {
		return "objectFolderJSON";
	}

	@Override
	protected MVCActionCommand getMvcActionCommand() {
		return _mvcActionCommand;
	}

	@Override
	protected MVCResourceCommand getMvcResourceCommand() {
		return _mvcResourceCommand;
	}

	@Override
	protected User getUser() {
		return _user;
	}

	private void _assertObjectFolder(
			String name, long expectedLength, boolean linkedObjectFolder)
		throws Exception {

		ObjectFolder uncategorizedObjectFolder = _getObjectFolder(
			"Uncategorized");

		List<String> uncategorizedObjectFolderItemsERCs =
			TransformUtil.transform(
				ListUtil.fromArray(
					uncategorizedObjectFolder.getObjectFolderItems()),
				ObjectFolderItem::getObjectDefinitionExternalReferenceCode);

		ObjectFolder objectFolder = _getObjectFolder(name);

		ObjectFolderItem[] objectFolderItems =
			objectFolder.getObjectFolderItems();

		Assert.assertEquals(
			Arrays.toString(objectFolderItems), expectedLength,
			objectFolderItems.length);

		if (linkedObjectFolder) {
			Assert.assertTrue(
				uncategorizedObjectFolderItemsERCs.contains("linkedERC"));
			Assert.assertTrue(
				uncategorizedObjectFolderItemsERCs.contains("customERC"));
		}
		else {
			Assert.assertFalse(
				uncategorizedObjectFolderItemsERCs.contains("linkedERC"));
			Assert.assertFalse(
				uncategorizedObjectFolderItemsERCs.contains("customERC"));
		}
	}

	private ObjectFolder _getObjectFolder(String name) throws Exception {
		Page<ObjectFolder> page = _objectFolderResource.getObjectFoldersPage(
			name, Pagination.of(1, 1));

		List<ObjectFolder> items = (List<ObjectFolder>)page.getItems();

		return items.get(0);
	}

	@Inject
	private JSONFactory _jsonFactory;

	@Inject(
		filter = "mvc.command.name=/object_definitions/import_object_folder"
	)
	private MVCActionCommand _mvcActionCommand;

	@Inject(
		filter = "mvc.command.name=/object_definitions/export_object_folder"
	)
	private MVCResourceCommand _mvcResourceCommand;

	private ObjectFolderResource _objectFolderResource;

	@Inject
	private ObjectFolderResource.Factory _objectFolderResourceFactory;

	private User _user;

}