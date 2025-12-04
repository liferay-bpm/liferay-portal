/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.instance.lifecycle;

import com.liferay.object.constants.ObjectDefinitionConstants;
import com.liferay.object.constants.ObjectPortletKeys;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.dao.orm.common.SQLTransformer;
import com.liferay.portal.instance.lifecycle.BasePortalInstanceLifecycleListener;
import com.liferay.portal.instance.lifecycle.PortalInstanceLifecycleListener;
import com.liferay.portal.kernel.dao.jdbc.CurrentConnection;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.InfrastructureUtil;
import com.liferay.portal.kernel.util.PropsValues;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.language.override.service.PLOEntryLocalService;
import com.liferay.portal.util.PortalInstances;

import java.sql.Connection;
import java.sql.PreparedStatement;

import java.util.List;
import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author István András Dézsi
 */
@Component(service = PortalInstanceLifecycleListener.class)
public class CompanyObjectDefinitionPortalInstanceLifecycleListener
	extends BasePortalInstanceLifecycleListener {

	@Override
	public void portalInstancePreregistered(Company company) throws Exception {
		if (!PropsValues.DATABASE_PARTITION_ENABLED ||
			!PortalInstances.isCompanyInCopyProcess()) {

			return;
		}

		Connection connection = _currentConnection.getConnection(
			InfrastructureUtil.getDataSource());

		for (ObjectDefinition objectDefinition :
				_objectDefinitionLocalService.getObjectDefinitions(
					company.getCompanyId(),
					WorkflowConstants.STATUS_APPROVED)) {

			if (objectDefinition.isUnmodifiableSystemObject()) {
				continue;
			}

			String className = objectDefinition.getClassName();

			objectDefinition = _objectDefinitionLocalService.updateClassName(
				objectDefinition.getObjectDefinitionId());

			if (StringUtil.equals(objectDefinition.getClassName(), className)) {
				continue;
			}

			try (AutoCloseable autoCloseable = _disableAutoCommit(connection)) {
				_executeUpdates(
					_classNameColumnNamesMap, company.getCompanyId(),
					connection, objectDefinition.getClassName(), className);
				_executeUpdates(
					_portletIdColumnNamesMap, company.getCompanyId(),
					connection, _getPortletId(objectDefinition.getClassName()),
					_getPortletId(className));

				connection.commit();
			}

			_ploEntryLocalService.deletePLOEntries(
				company.getCompanyId(), "model.resource." + className);

			_objectDefinitionLocalService.addOrUpdateObjectDefinitionPLOEntries(
				objectDefinition);
		}
	}

	@Override
	public void portalInstancePreunregistered(Company company)
		throws Exception {

		if (!PropsValues.DATABASE_PARTITION_ENABLED) {
			return;
		}

		List<ObjectDefinition> objectDefinitions =
			_objectDefinitionLocalService.getObjectDefinitions(
				company.getCompanyId(), WorkflowConstants.STATUS_APPROVED);

		for (ObjectDefinition objectDefinition : objectDefinitions) {
			_objectDefinitionLocalService.undeployObjectDefinition(
				objectDefinition);
		}
	}

	@Override
	public void portalInstanceRegistered(Company company) throws Exception {
		if (!PropsValues.DATABASE_PARTITION_ENABLED ||
			!PortalInstances.isCompanyInCopyProcess()) {

			return;
		}

		List<ObjectDefinition> objectDefinitions =
			_objectDefinitionLocalService.getObjectDefinitions(
				company.getCompanyId(), WorkflowConstants.STATUS_APPROVED);

		for (ObjectDefinition objectDefinition : objectDefinitions) {
			if (objectDefinition.isActive()) {
				_objectDefinitionLocalService.deployObjectDefinition(
					objectDefinition);
			}
			else {
				_objectDefinitionLocalService.deployInactiveObjectDefinition(
					objectDefinition);
			}
		}
	}

	private AutoCloseable _disableAutoCommit(Connection connection)
		throws Exception {

		boolean autoCommit = connection.getAutoCommit();

		connection.setAutoCommit(false);

		return () -> connection.setAutoCommit(autoCommit);
	}

	private void _executeUpdates(
			Map<String, String> columnNamesMap, long companyId,
			Connection connection, String newData, String oldData)
		throws Exception {

		for (Map.Entry<String, String> entry : columnNamesMap.entrySet()) {
			String[] columnNames = StringUtil.split(entry.getValue());

			try (PreparedStatement preparedStatement =
					connection.prepareStatement(
						SQLTransformer.transform(
							_getUpdateSQL(
								columnNames, companyId, entry.getKey())))) {

				int parameterIndex = 1;

				for (int i = 0; i < columnNames.length; i++) {
					preparedStatement.setString(parameterIndex++, oldData);
					preparedStatement.setString(parameterIndex++, newData);
				}

				for (int i = 0; i < columnNames.length; i++) {
					preparedStatement.setString(
						parameterIndex++, "%" + oldData + "%");
				}

				preparedStatement.executeUpdate();
			}
		}
	}

	private String _getPortletId(String className) {
		return StringUtil.replace(
			className,
			ObjectDefinitionConstants.
				CLASS_NAME_PREFIX_CUSTOM_OBJECT_DEFINITION,
			ObjectPortletKeys.OBJECT_DEFINITIONS + StringPool.UNDERLINE);
	}

	private String _getUpdateSQL(
		String[] columnNames, long companyId, String tableName) {

		StringBundler sb = new StringBundler();

		sb.append("update ");
		sb.append(PropsValues.DATABASE_PARTITION_SCHEMA_NAME_PREFIX);
		sb.append(companyId);
		sb.append(StringPool.PERIOD);
		sb.append(tableName);
		sb.append(" set ");

		for (int i = 0; i < columnNames.length; i++) {
			if (i > 0) {
				sb.append(", ");
			}

			sb.append(columnNames[i]);
			sb.append(" = replace(");
			sb.append(columnNames[i]);
			sb.append(", ?, ?)");
		}

		sb.append(" where ");

		for (int i = 0; i < columnNames.length; i++) {
			if (i > 0) {
				sb.append(" or ");
			}

			sb.append(columnNames[i]);
			sb.append(" like ?");
		}

		return sb.toString();
	}

	private final Map<String, String> _classNameColumnNamesMap =
		HashMapBuilder.put(
			"AssetListEntry", "assetEntryType"
		).put(
			"ClassName_", "value"
		).put(
			"Configuration_", "dictionary"
		).put(
			"FragmentComposition", "data_"
		).put(
			"FragmentEntryLink", "editableValues"
		).put(
			"KaleoInstance", "className,workflowContext"
		).put(
			"KaleoInstanceToken", "className"
		).put(
			"KaleoLog", "workflowContext"
		).put(
			"KaleoTaskInstanceToken", "className,workflowContext"
		).put(
			"LayoutPageTemplateStructureRel", "data_"
		).put(
			"ResourceAction", "name"
		).put(
			"ResourcePermission", "name,primKey"
		).put(
			"SiteNavigationMenuItem", "type_,typeSettings"
		).put(
			"TemplateEntry", "infoItemClassName"
		).put(
			"UserNotificationEvent", "payload"
		).build();

	@Reference
	private CurrentConnection _currentConnection;

	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;

	@Reference
	private PLOEntryLocalService _ploEntryLocalService;

	private final Map<String, String> _portletIdColumnNamesMap =
		HashMapBuilder.put(
			"FragmentComposition", "data_"
		).put(
			"FragmentEntryLink", "editableValues"
		).put(
			"LayoutPageTemplateStructureRel", "data_"
		).put(
			"Portlet", "portletId"
		).put(
			"PortletPreferences", "portletId"
		).put(
			"ResourceAction", "name"
		).put(
			"ResourcePermission", "name,primKey"
		).build();

}