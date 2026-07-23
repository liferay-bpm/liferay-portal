/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cmp.site.initializer.internal.search.spi.model.index.contributor;

import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectEntryFolderConstants;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectEntryFolder;
import com.liferay.object.rest.filter.factory.FilterFactory;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryFolderLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.petra.sql.dsl.expression.Predicate;
import com.liferay.petra.string.CharPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.search.spi.model.index.contributor.ModelDocumentContributor;
import com.liferay.site.cmp.site.initializer.internal.search.spi.model.index.contributor.helper.CMPLinkedObjectEntryUtil;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Pedro Leite
 */
@Component(
	property = "indexer.class.name=com.liferay.object.model.ObjectEntry",
	service = ModelDocumentContributor.class
)
public class CMPObjectEntryModelDocumentContributor
	implements ModelDocumentContributor<ObjectEntry> {

	@Override
	public void contribute(Document document, ObjectEntry objectEntry) {
		try {
			_contribute(document, objectEntry);
		}
		catch (PortalException portalException) {
			_log.error(portalException);
		}
	}

	private void _addLinkedObjectEntryIds(
			Document document, String documentFieldName,
			String linkObjectDefinitionExternalReferenceCode,
			ObjectEntry objectEntry, String relationshipFieldName)
		throws PortalException {

		long[] linkedObjectEntryIds =
			CMPLinkedObjectEntryUtil.getLinkedObjectEntryIds(
				_filterFactory, _groupLocalService,
				_objectDefinitionLocalService, objectEntry,
				_objectEntryLocalService,
				linkObjectDefinitionExternalReferenceCode,
				relationshipFieldName);

		if (linkedObjectEntryIds.length == 0) {
			return;
		}

		document.addKeyword(documentFieldName, linkedObjectEntryIds);
	}

	private void _contribute(Document document, ObjectEntry objectEntry)
		throws PortalException {

		ObjectEntryFolder rootObjectEntryFolder = _getRootObjectEntryFolder(
			_objectEntryFolderLocalService.fetchObjectEntryFolder(
				objectEntry.getObjectEntryFolderId()));

		if (rootObjectEntryFolder == null) {
			return;
		}

		String externalReferenceCode =
			rootObjectEntryFolder.getExternalReferenceCode();

		if (!StringUtil.equals(
				externalReferenceCode,
				ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_CONTENTS) &&
			!StringUtil.equals(
				externalReferenceCode,
				ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_FILES)) {

			return;
		}

		_addLinkedObjectEntryIds(
			document, "cmpProjectIds", "L_CMP_PROJECT_ASSET_RELATIONSHIP",
			objectEntry,
			"r_cmpProjectToCMPProjectAssetRelationships_c_cmpProjectId");
		_addLinkedObjectEntryIds(
			document, "cmpTaskIds", "L_CMP_TASK_ASSET_RELATIONSHIP",
			objectEntry, "r_cmpTaskToCMPTaskAssetRelationships_c_cmpTaskId");
	}

	private ObjectEntryFolder _getRootObjectEntryFolder(
		ObjectEntryFolder objectEntryFolder) {

		if (objectEntryFolder == null) {
			return null;
		}

		if (StringUtil.equals(
				objectEntryFolder.getExternalReferenceCode(),
				ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_CONTENTS) ||
			StringUtil.equals(
				objectEntryFolder.getExternalReferenceCode(),
				ObjectEntryFolderConstants.EXTERNAL_REFERENCE_CODE_FILES)) {

			return objectEntryFolder;
		}

		String[] parts = StringUtil.split(
			objectEntryFolder.getTreePath(), CharPool.SLASH);

		if (parts.length <= 2) {
			return null;
		}

		return _objectEntryFolderLocalService.fetchObjectEntryFolder(
			GetterUtil.getLong(parts[1]));
	}

	private static final Log _log = LogFactoryUtil.getLog(
		CMPObjectEntryModelDocumentContributor.class);

	@Reference(
		target = "(filter.factory.key=" + ObjectDefinitionConstants.STORAGE_TYPE_DEFAULT + ")"
	)
	private FilterFactory<Predicate> _filterFactory;

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private ObjectEntryFolderLocalService _objectEntryFolderLocalService;

	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;

}