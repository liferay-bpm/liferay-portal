/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.site.cmp.site.initializer.internal.util;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.rest.filter.factory.FilterFactory;
import com.liferay.object.service.ObjectEntryLocalServiceUtil;
import com.liferay.petra.sql.dsl.expression.Predicate;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.util.HashMapBuilder;
import com.liferay.portal.kernel.util.MapUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;

import java.io.Serializable;

import java.util.Objects;

/**
 * @author Pedro Leite
 */
public class CMPProjectCompletionRateUtil {

	public static void updateProjectCompletionRate(
			FilterFactory<Predicate> filterFactory,
			ObjectDefinition objectDefinition, ObjectEntry objectEntry)
		throws PortalException {

		ObjectEntry parentObjectEntry =
			ObjectEntryLocalServiceUtil.fetchObjectEntry(
				MapUtil.getLong(
					objectEntry.getValues(),
					"r_cmpProjectToCMPTasks_c_cmpProjectId"));

		if (parentObjectEntry == null) {
			return;
		}

		int completionRate = 0;

		int totalCount = _getCount(
			filterFactory, StringPool.BLANK, objectDefinition, objectEntry);

		if (totalCount != 0) {
			int filteredCount = _getCount(
				filterFactory, " and state eq 'done'", objectDefinition,
				objectEntry);

			completionRate = (filteredCount * 100) / totalCount;
		}

		if (Objects.equals(
				MapUtil.getInteger(
					parentObjectEntry.getValues(), "completionRate"),
				completionRate)) {

			return;
		}

		ObjectEntryLocalServiceUtil.partialUpdateObjectEntry(
			parentObjectEntry.getUserId(), parentObjectEntry.getObjectEntryId(),
			parentObjectEntry.getObjectEntryFolderId(),
			HashMapBuilder.<String, Serializable>put(
				"completionRate", completionRate
			).build(),
			new ServiceContext());
	}

	private static int _getCount(
			FilterFactory<Predicate> filterFactory, String filterString,
			ObjectDefinition objectDefinition, ObjectEntry objectEntry)
		throws PortalException {

		return ObjectEntryLocalServiceUtil.getValuesListCount(
			new Long[] {objectEntry.getGroupId()}, 0, 0,
			objectEntry.getObjectDefinitionId(),
			filterFactory.create(
				"status ne " + WorkflowConstants.STATUS_DRAFT + filterString,
				objectDefinition),
			false, null);
	}

}