/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.commerce.internal.object.scope;

import com.liferay.commerce.constants.CommerceOrderConstants;
import com.liferay.commerce.model.CommerceOrder;
import com.liferay.commerce.service.CommerceOrderLocalService;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.scope.ObjectScopeProvider;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.util.GetterUtil;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Stefano Motta
 */
@Component(
	property = "object.scope.provider.key=" + CommerceOrderConstants.OBJECT_DEFINITION_SCOPE,
	service = ObjectScopeProvider.class
)
public class CommerceOrderObjectScopeProviderImpl
	implements ObjectScopeProvider {

	@Override
	public long getGroupId(HttpServletRequest httpServletRequest)
		throws PortalException {

		CommerceOrder commerceOrder =
			_commerceOrderLocalService.fetchCommerceOrder(
				_getCommerceOrderId(httpServletRequest));

		if (commerceOrder == null) {
			return 0;
		}

		return commerceOrder.getGroupId();
	}

	@Override
	public String getKey() {
		return CommerceOrderConstants.OBJECT_DEFINITION_SCOPE;
	}

	@Override
	public String getLabel(Locale locale) {
		return _language.get(locale, "commerce-order");
	}

	@Override
	public String[] getRootPanelCategoryKeys() {
		return new String[0];
	}

	@Override
	public String getScopeKey(
		GroupLocalService groupLocalService, ObjectEntry objectEntry) {

		long commerceOrderId = GetterUtil.getLong(
			objectEntry.getValues().get(
				"r_commerceOrderToCommerceOrderAttachments_commerceOrderId"));

		if (commerceOrderId > 0) {
			return String.valueOf(commerceOrderId);
		}

		return ObjectScopeProvider.super.getScopeKey(
			groupLocalService, objectEntry);
	}

	@Override
	public boolean isGroupAware() {
		return true;
	}

	@Override
	public boolean isValidGroupId(long groupId) {
		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			return false;
		}

		long commerceOrderId = GetterUtil.getLong(
			serviceContext.getAttribute("commerceOrderId"));

		if (commerceOrderId <= 0) {
			commerceOrderId = GetterUtil.getLong(
				serviceContext.getAttribute("scopeKey"));
		}

		if (commerceOrderId <= 0) {
			return false;
		}

		CommerceOrder commerceOrder =
			_commerceOrderLocalService.fetchCommerceOrder(commerceOrderId);

		if ((commerceOrder == null) ||
			(commerceOrder.getGroupId() != groupId)) {

			return false;
		}

		return true;
	}

	@Override
	public String resolveScopeKey(
			long companyId, String scopeKey,
			GroupLocalService groupLocalService)
		throws PortalException {

		CommerceOrder commerceOrder =
			_commerceOrderLocalService.fetchCommerceOrder(
				GetterUtil.getLong(scopeKey));

		if ((commerceOrder == null) ||
			(commerceOrder.getCompanyId() != companyId)) {

			return null;
		}

		return String.valueOf(commerceOrder.getGroupId());
	}

	private long _getCommerceOrderId(HttpServletRequest httpServletRequest) {
		long commerceOrderId = GetterUtil.getLong(
			httpServletRequest.getAttribute("commerceOrderId"));

		if (commerceOrderId > 0) {
			return commerceOrderId;
		}

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		if (serviceContext == null) {
			return GetterUtil.getLong(
				httpServletRequest.getParameter("commerceOrderId"));
		}

		commerceOrderId = GetterUtil.getLong(
			serviceContext.getAttribute("commerceOrderId"));

		if (commerceOrderId > 0) {
			return commerceOrderId;
		}

		commerceOrderId = GetterUtil.getLong(
			serviceContext.getAttribute("scopeKey"));

		if (commerceOrderId > 0) {
			return commerceOrderId;
		}

		return 0;
	}

	@Reference
	private CommerceOrderLocalService _commerceOrderLocalService;

	@Reference
	private Language _language;

}