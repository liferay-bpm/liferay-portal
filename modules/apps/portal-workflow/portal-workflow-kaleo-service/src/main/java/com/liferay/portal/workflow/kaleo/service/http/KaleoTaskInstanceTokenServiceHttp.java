/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.kaleo.service.http;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.security.auth.HttpPrincipal;
import com.liferay.portal.kernel.service.http.TunnelUtil;
import com.liferay.portal.kernel.util.MethodHandler;
import com.liferay.portal.kernel.util.MethodKey;
import com.liferay.portal.workflow.kaleo.service.KaleoTaskInstanceTokenServiceUtil;

/**
 * Provides the HTTP utility for the
 * <code>KaleoTaskInstanceTokenServiceUtil</code> service
 * utility. The
 * static methods of this class calls the same methods of the service utility.
 * However, the signatures are different because it requires an additional
 * <code>HttpPrincipal</code> parameter.
 *
 * <p>
 * The benefits of using the HTTP utility is that it is fast and allows for
 * tunneling without the cost of serializing to text. The drawback is that it
 * only works with Java.
 * </p>
 *
 * <p>
 * Set the property <b>tunnel.servlet.hosts.allowed</b> in portal.properties to
 * configure security.
 * </p>
 *
 * <p>
 * The HTTP utility is only generated for remote services.
 * </p>
 *
 * @author Brian Wing Shun Chan
 * @generated
 */
public class KaleoTaskInstanceTokenServiceHttp {

	public static com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken
			getKaleoTaskInstanceToken(
				HttpPrincipal httpPrincipal, long workflowTaskId)
		throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getKaleoTaskInstanceToken",
				_getKaleoTaskInstanceTokenParameterTypes0);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, workflowTaskId);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return (com.liferay.portal.workflow.kaleo.model.
				KaleoTaskInstanceToken)returnObj;
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static java.util.List
		<com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken>
				getKaleoTaskInstanceTokens(
					HttpPrincipal httpPrincipal, long kaleoInstanceId,
					Long userId, Boolean completed, int start, int end,
					com.liferay.portal.kernel.util.OrderByComparator
						<com.liferay.portal.workflow.kaleo.model.
							KaleoTaskInstanceToken> orderByComparator)
			throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getKaleoTaskInstanceTokens",
				_getKaleoTaskInstanceTokensParameterTypes1);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, kaleoInstanceId, userId, completed, start, end,
				orderByComparator);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return (java.util.List
				<com.liferay.portal.workflow.kaleo.model.
					KaleoTaskInstanceToken>)returnObj;
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static java.util.List
		<com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken>
				getKaleoTaskInstanceTokens(
					HttpPrincipal httpPrincipal, String assigneeClassName,
					long assigneeClassPK, Boolean completed, int start, int end,
					com.liferay.portal.kernel.util.OrderByComparator
						<com.liferay.portal.workflow.kaleo.model.
							KaleoTaskInstanceToken> orderByComparator)
			throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getKaleoTaskInstanceTokens",
				_getKaleoTaskInstanceTokensParameterTypes2);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, assigneeClassName, assigneeClassPK, completed, start,
				end, orderByComparator);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return (java.util.List
				<com.liferay.portal.workflow.kaleo.model.
					KaleoTaskInstanceToken>)returnObj;
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static int getKaleoTaskInstanceTokensCount(
			HttpPrincipal httpPrincipal, long kaleoInstanceId, Long userId,
			Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getKaleoTaskInstanceTokensCount",
				_getKaleoTaskInstanceTokensCountParameterTypes3);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, kaleoInstanceId, userId, completed);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return ((Integer)returnObj).intValue();
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static int getKaleoTaskInstanceTokensCount(
			HttpPrincipal httpPrincipal, String assigneeClassName,
			long assigneeClassPK, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getKaleoTaskInstanceTokensCount",
				_getKaleoTaskInstanceTokensCountParameterTypes4);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, assigneeClassName, assigneeClassPK, completed);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return ((Integer)returnObj).intValue();
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static java.util.List
		<com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken>
				getSubmittingUserKaleoTaskInstanceTokens(
					HttpPrincipal httpPrincipal, long userId, Boolean completed,
					int start, int end,
					com.liferay.portal.kernel.util.OrderByComparator
						<com.liferay.portal.workflow.kaleo.model.
							KaleoTaskInstanceToken> orderByComparator)
			throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getSubmittingUserKaleoTaskInstanceTokens",
				_getSubmittingUserKaleoTaskInstanceTokensParameterTypes5);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, userId, completed, start, end, orderByComparator);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return (java.util.List
				<com.liferay.portal.workflow.kaleo.model.
					KaleoTaskInstanceToken>)returnObj;
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static int getSubmittingUserKaleoTaskInstanceTokensCount(
			HttpPrincipal httpPrincipal, long userId, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getSubmittingUserKaleoTaskInstanceTokensCount",
				_getSubmittingUserKaleoTaskInstanceTokensCountParameterTypes6);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, userId, completed);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return ((Integer)returnObj).intValue();
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static java.util.List
		<com.liferay.portal.workflow.kaleo.model.KaleoTaskInstanceToken>
				getUserRolesKaleoTaskInstanceTokens(
					HttpPrincipal httpPrincipal, long userId, Boolean completed,
					int start, int end,
					com.liferay.portal.kernel.util.OrderByComparator
						<com.liferay.portal.workflow.kaleo.model.
							KaleoTaskInstanceToken> orderByComparator)
			throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getUserRolesKaleoTaskInstanceTokens",
				_getUserRolesKaleoTaskInstanceTokensParameterTypes7);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, userId, completed, start, end, orderByComparator);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return (java.util.List
				<com.liferay.portal.workflow.kaleo.model.
					KaleoTaskInstanceToken>)returnObj;
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	public static int getUserRolesKaleoTaskInstanceTokensCount(
			HttpPrincipal httpPrincipal, long userId, Boolean completed)
		throws com.liferay.portal.kernel.exception.PortalException {

		try {
			MethodKey methodKey = new MethodKey(
				KaleoTaskInstanceTokenServiceUtil.class,
				"getUserRolesKaleoTaskInstanceTokensCount",
				_getUserRolesKaleoTaskInstanceTokensCountParameterTypes8);

			MethodHandler methodHandler = new MethodHandler(
				methodKey, userId, completed);

			Object returnObj = null;

			try {
				returnObj = TunnelUtil.invoke(httpPrincipal, methodHandler);
			}
			catch (Exception exception) {
				if (exception instanceof
						com.liferay.portal.kernel.exception.PortalException) {

					throw (com.liferay.portal.kernel.exception.PortalException)
						exception;
				}

				throw new com.liferay.portal.kernel.exception.SystemException(
					exception);
			}

			return ((Integer)returnObj).intValue();
		}
		catch (com.liferay.portal.kernel.exception.SystemException
					systemException) {

			_log.error(systemException, systemException);

			throw systemException;
		}
	}

	private static Log _log = LogFactoryUtil.getLog(
		KaleoTaskInstanceTokenServiceHttp.class);

	private static final Class<?>[] _getKaleoTaskInstanceTokenParameterTypes0 =
		new Class[] {long.class};
	private static final Class<?>[] _getKaleoTaskInstanceTokensParameterTypes1 =
		new Class[] {
			long.class, Long.class, Boolean.class, int.class, int.class,
			com.liferay.portal.kernel.util.OrderByComparator.class
		};
	private static final Class<?>[] _getKaleoTaskInstanceTokensParameterTypes2 =
		new Class[] {
			String.class, long.class, Boolean.class, int.class, int.class,
			com.liferay.portal.kernel.util.OrderByComparator.class
		};
	private static final Class<?>[]
		_getKaleoTaskInstanceTokensCountParameterTypes3 = new Class[] {
			long.class, Long.class, Boolean.class
		};
	private static final Class<?>[]
		_getKaleoTaskInstanceTokensCountParameterTypes4 = new Class[] {
			String.class, long.class, Boolean.class
		};
	private static final Class<?>[]
		_getSubmittingUserKaleoTaskInstanceTokensParameterTypes5 = new Class[] {
			long.class, Boolean.class, int.class, int.class,
			com.liferay.portal.kernel.util.OrderByComparator.class
		};
	private static final Class<?>[]
		_getSubmittingUserKaleoTaskInstanceTokensCountParameterTypes6 =
			new Class[] {long.class, Boolean.class};
	private static final Class<?>[]
		_getUserRolesKaleoTaskInstanceTokensParameterTypes7 = new Class[] {
			long.class, Boolean.class, int.class, int.class,
			com.liferay.portal.kernel.util.OrderByComparator.class
		};
	private static final Class<?>[]
		_getUserRolesKaleoTaskInstanceTokensCountParameterTypes8 = new Class[] {
			long.class, Boolean.class
		};

}
// LIFERAY-SERVICE-BUILDER-HASH:-578524733