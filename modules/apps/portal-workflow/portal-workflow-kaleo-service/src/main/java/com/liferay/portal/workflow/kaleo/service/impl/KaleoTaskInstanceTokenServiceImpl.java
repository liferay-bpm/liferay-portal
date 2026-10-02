/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.service.impl;

import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.permission.UserPermissionUtil;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.workflow.kaleo.exception.NoSuchInstanceException;
import com.liferay.portal.workflow.kaleo.model.KaleoInstance;
import com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken;
import com.liferay.portal.workflow.kaleo.service.base.KaleoTaskInstanceTokenServiceBaseImpl;
import com.liferay.portal.workflow.kaleo.service.persistence.KaleoInstancePersistence;

import java.util.List;
import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Victor Kammerer
 */
@Component(
	property = {
		"json.web.service.context.name=kaleo",
		"json.web.service.context.path=KaleoTaskInstanceToken"
	},
	service = AopService.class
)
public class KaleoTaskInstanceTokenServiceImpl
	extends KaleoTaskInstanceTokenServiceBaseImpl {

	@Override
	public KaleoTaskInstanceToken getKaleoTaskInstanceToken(long workflowTaskId)
		throws PortalException {

		_kaleoTaskInstanceTokenModelResourcePermission.check(
			getPermissionChecker(), workflowTaskId, null);

		return kaleoTaskInstanceTokenPersistence.findByPrimaryKey(
			workflowTaskId);
	}

	@Override
	public List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			long kaleoInstanceId, Long userId, Boolean completed, int start,
			int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		_checkKaleoInstancePermission(kaleoInstanceId, userId);

		List<KaleoTaskInstanceToken> kaleoTaskInstanceTokens =
			kaleoTaskInstanceTokenLocalService.getKaleoTaskInstanceTokens(
				kaleoInstanceId, completed, start, end, orderByComparator,
				_getServiceContext(userId));

		_checkKaleoTaskInstanceTokensPermission(kaleoTaskInstanceTokens);

		return kaleoTaskInstanceTokens;
	}

	@Override
	public List<KaleoTaskInstanceToken> getKaleoTaskInstanceTokens(
			String assigneeClassName, long assigneeClassPK, Boolean completed,
			int start, int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		_checkAssigneePermission(assigneeClassName, assigneeClassPK);

		List<KaleoTaskInstanceToken> kaleoTaskInstanceTokens =
			kaleoTaskInstanceTokenLocalService.getKaleoTaskInstanceTokens(
				assigneeClassName, assigneeClassPK, completed, start, end,
				orderByComparator, _getServiceContext(null));

		_checkKaleoTaskInstanceTokensPermission(kaleoTaskInstanceTokens);

		return kaleoTaskInstanceTokens;
	}

	@Override
	public int getKaleoTaskInstanceTokensCount(
			long kaleoInstanceId, Long userId, Boolean completed)
		throws PortalException {

		_checkKaleoInstancePermission(kaleoInstanceId, userId);

		return kaleoTaskInstanceTokenLocalService.
			getKaleoTaskInstanceTokensCount(
				kaleoInstanceId, completed, _getServiceContext(userId));
	}

	@Override
	public int getKaleoTaskInstanceTokensCount(
			String assigneeClassName, long assigneeClassPK, Boolean completed)
		throws PortalException {

		_checkAssigneePermission(assigneeClassName, assigneeClassPK);

		return kaleoTaskInstanceTokenLocalService.
			getKaleoTaskInstanceTokensCount(
				assigneeClassName, assigneeClassPK, completed,
				_getServiceContext(null));
	}

	@Override
	public List<KaleoTaskInstanceToken>
			getSubmittingUserKaleoTaskInstanceTokens(
				long userId, Boolean completed, int start, int end,
				OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		UserPermissionUtil.check(
			getPermissionChecker(), userId, ActionKeys.VIEW);

		List<KaleoTaskInstanceToken> kaleoTaskInstanceTokens =
			kaleoTaskInstanceTokenLocalService.
				getSubmittingUserKaleoTaskInstanceTokens(
					userId, completed, start, end, orderByComparator,
					_getServiceContext(null));

		_checkKaleoTaskInstanceTokensPermission(kaleoTaskInstanceTokens);

		return kaleoTaskInstanceTokens;
	}

	@Override
	public int getSubmittingUserKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException {

		UserPermissionUtil.check(
			getPermissionChecker(), userId, ActionKeys.VIEW);

		return kaleoTaskInstanceTokenLocalService.
			getSubmittingUserKaleoTaskInstanceTokensCount(
				userId, completed, _getServiceContext(null));
	}

	@Override
	public List<KaleoTaskInstanceToken> getUserRolesKaleoTaskInstanceTokens(
			long userId, Boolean completed, int start, int end,
			OrderByComparator<KaleoTaskInstanceToken> orderByComparator)
		throws PortalException {

		UserPermissionUtil.check(
			getPermissionChecker(), userId, ActionKeys.VIEW);

		List<KaleoTaskInstanceToken> kaleoTaskInstanceTokens =
			kaleoTaskInstanceTokenLocalService.search(
				null, completed, Boolean.TRUE, start, end, orderByComparator,
				_getServiceContext(userId));

		_checkKaleoTaskInstanceTokensPermission(kaleoTaskInstanceTokens);

		return kaleoTaskInstanceTokens;
	}

	@Override
	public int getUserRolesKaleoTaskInstanceTokensCount(
			long userId, Boolean completed)
		throws PortalException {

		UserPermissionUtil.check(
			getPermissionChecker(), userId, ActionKeys.VIEW);

		return kaleoTaskInstanceTokenLocalService.searchCount(
			null, completed, Boolean.TRUE, _getServiceContext(userId));
	}

	private void _checkAssigneePermission(
			String assigneeClassName, long assigneeClassPK)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		if (Objects.equals(assigneeClassName, User.class.getName())) {
			UserPermissionUtil.check(
				permissionChecker, assigneeClassPK, ActionKeys.VIEW);

			return;
		}

		if (!permissionChecker.isCompanyAdmin()) {
			throw new PrincipalException.MustBeCompanyAdmin(permissionChecker);
		}
	}

	private void _checkKaleoInstancePermission(
			long kaleoInstanceId, Long userId)
		throws PortalException {

		KaleoInstance kaleoInstance =
			_kaleoInstancePersistence.findByPrimaryKey(kaleoInstanceId);

		PermissionChecker permissionChecker = getPermissionChecker();

		if (kaleoInstance.getCompanyId() != permissionChecker.getCompanyId()) {
			throw new NoSuchInstanceException(
				"No Kaleo instance exists with the primary key " +
					kaleoInstanceId);
		}

		if (userId != null) {
			UserPermissionUtil.check(
				permissionChecker, userId, ActionKeys.VIEW);

			return;
		}

		_kaleoInstanceModelResourcePermission.check(
			permissionChecker, kaleoInstance, ActionKeys.VIEW);
	}

	private void _checkKaleoTaskInstanceTokensPermission(
			List<KaleoTaskInstanceToken> kaleoTaskInstanceTokens)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		for (KaleoTaskInstanceToken kaleoTaskInstanceToken :
				kaleoTaskInstanceTokens) {

			_kaleoTaskInstanceTokenModelResourcePermission.check(
				permissionChecker, kaleoTaskInstanceToken, null);
		}
	}

	private ServiceContext _getServiceContext(Long userId)
		throws PortalException {

		ServiceContext serviceContext = new ServiceContext();

		PermissionChecker permissionChecker = getPermissionChecker();

		serviceContext.setCompanyId(permissionChecker.getCompanyId());

		if (userId != null) {
			serviceContext.setUserId(userId);
		}

		return serviceContext;
	}

	@Reference(
		target = "(model.class.name=com.liferay.portal.workflow.kaleo.model.KaleoInstance)"
	)
	private ModelResourcePermission<KaleoInstance>
		_kaleoInstanceModelResourcePermission;

	@Reference
	private KaleoInstancePersistence _kaleoInstancePersistence;

	@Reference(
		target = "(model.class.name=com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken)"
	)
	private ModelResourcePermission<KaleoTaskInstanceToken>
		_kaleoTaskInstanceTokenModelResourcePermission;

}