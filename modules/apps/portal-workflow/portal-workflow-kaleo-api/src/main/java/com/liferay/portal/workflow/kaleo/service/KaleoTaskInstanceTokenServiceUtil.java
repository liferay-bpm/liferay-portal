/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.service;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.module.service.Snapshot;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken;

import java.util.List;

/**
 * Provides the remote service utility for KaleoTaskInstanceToken. This utility wraps
 * <code>com.liferay.portal.workflow.kaleo.service.impl.KaleoTaskInstanceTokenServiceImpl</code> and is an
 * access point for service operations in application layer code running on a
 * remote server. Methods of this service are expected to have security checks
 * based on the propagated JAAS credentials because this service can be
 * accessed remotely.
 *
 * @author Brian Wing Shun Chan
 * @see KaleoTaskInstanceTokenService
 * @generated
 */
public class KaleoTaskInstanceTokenServiceUtil {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify this class directly. Add custom service methods to <code>com.liferay.portal.workflow.kaleo.service.impl.KaleoTaskInstanceTokenServiceImpl</code> and rerun ServiceBuilder to regenerate this class.
	 */
	public static KaleoTaskInstanceToken getKaleoTaskInstanceToken(
			long workflowTaskId)
		throws PortalException {

		return getService().getKaleoTaskInstanceToken(workflowTaskId);
	}

	public static List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			long kaleoInstanceId, Long userId, Boolean completed, int start,
			int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		return getService().getKaleoTaskInstanceTokens(
			kaleoInstanceId, userId, completed, start, end, orderByComparator);
	}

	public static List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			String assigneeClassName, long assigneeClassPK, Boolean completed,
			int start, int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		return getService().getKaleoTaskInstanceTokens(
			assigneeClassName, assigneeClassPK, completed, start, end,
			orderByComparator);
	}

	public static int getKaleoTaskInstanceTokensCount(
			long kaleoInstanceId, Long userId, Boolean completed)
		throws PortalException {

		return getService().getKaleoTaskInstanceTokensCount(
			kaleoInstanceId, userId, completed);
	}

	public static int getKaleoTaskInstanceTokensCount(
			String assigneeClassName, long assigneeClassPK, Boolean completed)
		throws PortalException {

		return getService().getKaleoTaskInstanceTokensCount(
			assigneeClassName, assigneeClassPK, completed);
	}

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	public static String getOSGiServiceIdentifier() {
		return getService().getOSGiServiceIdentifier();
	}

	public static List<KaleoTaskInstanceToken>
			getSubmittingUserKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		return getService().getSubmittingUserKaleoTaskInstanceTokens(
			userId, completed, start, end, orderByComparator);
	}

	public static int getSubmittingUserKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException {

		return getService().getSubmittingUserKaleoTaskInstanceTokensCount(
			userId, completed);
	}

	public static List<KaleoTaskInstanceToken>
			getUserRolesKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		return getService().getUserRolesKaleoTaskInstanceTokens(
			userId, completed, start, end, orderByComparator);
	}

	public static int getUserRolesKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException {

		return getService().getUserRolesKaleoTaskInstanceTokensCount(
			userId, completed);
	}

	public static KaleoTaskInstanceTokenService getService() {
		return _serviceSnapshot.get();
	}

	private static final Snapshot<KaleoTaskInstanceTokenService>
		_serviceSnapshot = new Snapshot<>(
			KaleoTaskInstanceTokenServiceUtil.class,
			KaleoTaskInstanceTokenService.class);

}
// LIFERAY-SERVICE-BUILDER-HASH:-752395126