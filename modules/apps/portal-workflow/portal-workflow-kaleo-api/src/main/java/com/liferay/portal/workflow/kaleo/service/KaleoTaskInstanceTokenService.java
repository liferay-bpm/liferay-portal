/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.service;

import com.liferay.portal.kernel.change.tracking.CTAware;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.jsonwebservice.JSONWebService;
import com.liferay.portal.kernel.security.access.control.AccessControlled;
import com.liferay.portal.kernel.service.BaseService;
import com.liferay.portal.kernel.transaction.Isolation;
import com.liferay.portal.kernel.transaction.Propagation;
import com.liferay.portal.kernel.transaction.Transactional;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken;

import java.util.List;

import org.osgi.annotation.versioning.ProviderType;

/**
 * Provides the remote service interface for KaleoTaskInstanceToken. Methods of this
 * service are expected to have security checks based on the propagated JAAS
 * credentials because this service can be accessed remotely.
 *
 * @author Brian Wing Shun Chan
 * @see KaleoTaskInstanceTokenServiceUtil
 * @generated
 */
@AccessControlled
@CTAware
@JSONWebService
@ProviderType
@Transactional(
	isolation = Isolation.PORTAL,
	rollbackFor = {PortalException.class, SystemException.class}
)
public interface KaleoTaskInstanceTokenService extends BaseService {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify this interface directly. Add custom service methods to <code>com.liferay.portal.workflow.kaleo.service.impl.KaleoTaskInstanceTokenServiceImpl</code> and rerun ServiceBuilder to automatically copy the method declarations to this interface. Consume the kaleo task instance token remote service via injection or a <code>org.osgi.util.tracker.ServiceTracker</code>. Use {@link KaleoTaskInstanceTokenServiceUtil} if injection and service tracking are not available.
	 */
	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public KaleoTaskInstanceToken getKaleoTaskInstanceToken(long workflowTaskId)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			long kaleoInstanceId, Long userId, Boolean completed, int start,
			int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			String assigneeClassName, long assigneeClassPK, Boolean completed,
			int start, int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public int getKaleoTaskInstanceTokensCount(
			long kaleoInstanceId, Long userId, Boolean completed)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public int getKaleoTaskInstanceTokensCount(
			String assigneeClassName, long assigneeClassPK, Boolean completed)
		throws PortalException;

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	public String getOSGiServiceIdentifier();

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public List<KaleoTaskInstanceToken>
			getSubmittingUserKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public int getSubmittingUserKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public List<KaleoTaskInstanceToken> getUserRolesKaleoTaskInstanceTokens(
			long userId, Boolean completed, int start, int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException;

	@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
	public int getUserRolesKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException;

}
// LIFERAY-SERVICE-BUILDER-HASH:783448222