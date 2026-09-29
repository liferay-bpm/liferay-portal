/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.service;

import com.liferay.portal.kernel.service.ServiceWrapper;
import com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken;

/**
 * Provides a wrapper for {@link KaleoTaskInstanceTokenService}.
 *
 * @author Brian Wing Shun Chan
 * @see KaleoTaskInstanceTokenService
 * @generated
 */
public class KaleoTaskInstanceTokenServiceWrapper
	implements KaleoTaskInstanceTokenService,
			   ServiceWrapper<KaleoTaskInstanceTokenService> {

	public KaleoTaskInstanceTokenServiceWrapper() {
		this(null);
	}

	public KaleoTaskInstanceTokenServiceWrapper(
		KaleoTaskInstanceTokenService kaleoTaskInstanceTokenService) {

		_kaleoTaskInstanceTokenService = kaleoTaskInstanceTokenService;
	}

	@Override
	public KaleoTaskInstanceToken getKaleoTaskInstanceToken(long workflowTaskId)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.getKaleoTaskInstanceToken(
			workflowTaskId);
	}

	@Override
	public java.util.List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			long kaleoInstanceId, Long userId, Boolean completed, int start,
			int end,
			com.liferay.portal.kernel.util.OrderByComparator
				<KaleoTaskInstanceToken> orderByComparator)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.getKaleoTaskInstanceTokens(
			kaleoInstanceId, userId, completed, start, end, orderByComparator);
	}

	@Override
	public java.util.List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			String assigneeClassName, long assigneeClassPK, Boolean completed,
			int start, int end,
			com.liferay.portal.kernel.util.OrderByComparator
				<KaleoTaskInstanceToken> orderByComparator)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.getKaleoTaskInstanceTokens(
			assigneeClassName, assigneeClassPK, completed, start, end,
			orderByComparator);
	}

	@Override
	public int getKaleoTaskInstanceTokensCount(
			long kaleoInstanceId, Long userId, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.getKaleoTaskInstanceTokensCount(
			kaleoInstanceId, userId, completed);
	}

	@Override
	public int getKaleoTaskInstanceTokensCount(
			String assigneeClassName, long assigneeClassPK, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.getKaleoTaskInstanceTokensCount(
			assigneeClassName, assigneeClassPK, completed);
	}

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	@Override
	public String getOSGiServiceIdentifier() {
		return _kaleoTaskInstanceTokenService.getOSGiServiceIdentifier();
	}

	@Override
	public java.util.List<KaleoTaskInstanceToken>
			getSubmittingUserKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				com.liferay.portal.kernel.util.OrderByComparator
					<KaleoTaskInstanceToken> orderByComparator)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.
			getSubmittingUserKaleoTaskInstanceTokens(
				userId, completed, start, end, orderByComparator);
	}

	@Override
	public int getSubmittingUserKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.
			getSubmittingUserKaleoTaskInstanceTokensCount(userId, completed);
	}

	@Override
	public java.util.List<KaleoTaskInstanceToken>
			getUserRolesKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				com.liferay.portal.kernel.util.OrderByComparator
					<KaleoTaskInstanceToken> orderByComparator)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.
			getUserRolesKaleoTaskInstanceTokens(
				userId, completed, start, end, orderByComparator);
	}

	@Override
	public int getUserRolesKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _kaleoTaskInstanceTokenService.
			getUserRolesKaleoTaskInstanceTokensCount(userId, completed);
	}

	@Override
	public KaleoTaskInstanceTokenService getWrappedService() {
		return _kaleoTaskInstanceTokenService;
	}

	@Override
	public void setWrappedService(
		KaleoTaskInstanceTokenService kaleoTaskInstanceTokenService) {

		_kaleoTaskInstanceTokenService = kaleoTaskInstanceTokenService;
	}

	private KaleoTaskInstanceTokenService _kaleoTaskInstanceTokenService;

}
// LIFERAY-SERVICE-BUILDER-HASH:1081490940