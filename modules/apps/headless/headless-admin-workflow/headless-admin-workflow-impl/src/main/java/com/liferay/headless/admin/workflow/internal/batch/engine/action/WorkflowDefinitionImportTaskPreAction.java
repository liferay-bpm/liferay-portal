/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.headless.admin.workflow.internal.batch.engine.action;

import com.liferay.batch.engine.BatchEngineTaskItemDelegate;
import com.liferay.batch.engine.action.ImportTaskPreAction;
import com.liferay.batch.engine.context.ImportTaskContext;
import com.liferay.batch.engine.model.BatchEngineImportTask;
import com.liferay.exportimport.kernel.lar.ExportImportThreadLocal;
import com.liferay.exportimport.report.constants.ExportImportReportEntryConstants;
import com.liferay.exportimport.report.service.ExportImportReportEntryLocalService;
import com.liferay.headless.admin.workflow.dto.v1_0.WorkflowDefinition;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.xml.Document;
import com.liferay.portal.kernel.xml.Element;
import com.liferay.portal.kernel.xml.SAXReaderUtil;
import com.liferay.portal.workflow.kaleo.definition.util.WorkflowDefinitionContentUtil;
import com.liferay.portal.workflow.kaleo.model.KaleoDefinition;

import java.util.LinkedHashSet;
import java.util.Set;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Pedro Leite
 */
@Component(service = ImportTaskPreAction.class)
public class WorkflowDefinitionImportTaskPreAction
	implements ImportTaskPreAction {

	@Override
	public void run(
			BatchEngineImportTask batchEngineImportTask,
			BatchEngineTaskItemDelegate<?> batchEngineTaskItemDelegate,
			ImportTaskContext importTaskContext, Object item)
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled(
				batchEngineImportTask.getCompanyId(), "LPD-49856") ||
			!ExportImportThreadLocal.isImportInProcess() ||
			!(item instanceof WorkflowDefinition)) {

			return;
		}

		WorkflowDefinition workflowDefinition = (WorkflowDefinition)item;

		if (!GetterUtil.getBoolean(workflowDefinition.getActive())) {
			return;
		}

		String content = workflowDefinition.getContent();

		Document document = SAXReaderUtil.read(
			WorkflowDefinitionContentUtil.toXML(content));

		Set<String> missingUserExternalReferenceCodes = new LinkedHashSet<>();

		_removeMissingUserNotificationRecipients(
			batchEngineImportTask.getCompanyId(), document, "notification",
			missingUserExternalReferenceCodes);
		_removeMissingUserNotificationRecipients(
			batchEngineImportTask.getCompanyId(), document,
			"timer-notification", missingUserExternalReferenceCodes);

		_removeMissingUserTaskAssignees(
			batchEngineImportTask.getCompanyId(), document, "assignments",
			missingUserExternalReferenceCodes);
		_removeMissingUserTaskAssignees(
			batchEngineImportTask.getCompanyId(), document, "reassignments",
			missingUserExternalReferenceCodes);

		if (missingUserExternalReferenceCodes.isEmpty()) {
			return;
		}

		_exportImportReportEntryLocalService.getOrAddExportImportReportEntry(
			0, batchEngineImportTask.getCompanyId(),
			workflowDefinition.getExternalReferenceCode(),
			_portal.getClassNameId(KaleoDefinition.class), 0,
			GetterUtil.getLong(
				ExportImportThreadLocal.getExportImportConfigurationId()),
			ExportImportReportEntryConstants.TYPE_MISSING_REFERENCE,
			_language.format(
				LocaleUtil.getDefault(),
				"the-following-users-do-not-exist-and-were-removed-from-" +
					"workflow-definition-x-x",
				new Object[] {
					StringUtil.merge(
						missingUserExternalReferenceCodes,
						StringPool.COMMA_AND_SPACE),
					workflowDefinition.getName()
				}),
			null, "workflow-definitions");

		if (content.startsWith(StringPool.OPEN_CURLY_BRACE)) {
			workflowDefinition.setContent(
				() -> WorkflowDefinitionContentUtil.toJSON(document.asXML()));
		}
		else {
			workflowDefinition.setContent(document::asXML);
		}
	}

	private void _removeMissingUser(
		long companyId, Element element,
		Set<String> missingUserExternalReferenceCodes) {

		String externalReferenceCode = element.elementTextTrim(
			"user-external-reference-code");

		if (Validator.isNull(externalReferenceCode)) {
			return;
		}

		User user = _userLocalService.fetchUserByExternalReferenceCode(
			externalReferenceCode, companyId);

		if (user != null) {
			return;
		}

		element.detach();

		missingUserExternalReferenceCodes.add(externalReferenceCode);
	}

	private void _removeMissingUserNotificationRecipients(
		long companyId, Document document, String elementName,
		Set<String> missingUserExternalReferenceCodes) {

		for (Element element :
				TransformUtil.transform(
					document.selectNodes(
						"//*[local-name()='" + elementName + "']"),
					node -> (Element)node)) {

			for (Element userElement :
					TransformUtil.transform(
						element.selectNodes(
							"*[local-name()='recipients']/*[local-name()=" +
								"'user']"),
						node -> (Element)node)) {

				_removeMissingUser(
					companyId, userElement, missingUserExternalReferenceCodes);
			}
		}
	}

	private void _removeMissingUserTaskAssignees(
		long companyId, Document document, String elementName,
		Set<String> missingUserExternalReferenceCodes) {

		for (Element element :
				TransformUtil.transform(
					document.selectNodes(
						"//*[local-name()='" + elementName + "']"),
					node -> (Element)node)) {

			for (Element userElement :
					TransformUtil.transform(
						element.selectNodes("*[local-name()='user']"),
						node -> (Element)node)) {

				_removeMissingUser(
					companyId, userElement, missingUserExternalReferenceCodes);
			}
		}
	}

	@Reference
	private ExportImportReportEntryLocalService
		_exportImportReportEntryLocalService;

	@Reference
	private Language _language;

	@Reference
	private Portal _portal;

	@Reference
	private UserLocalService _userLocalService;

}