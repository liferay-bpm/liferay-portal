/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.object.web.internal.object.definitions.display.context;

import com.liferay.object.web.internal.display.context.helper.ObjectRequestHelper;
import com.liferay.portal.kernel.portlet.PortletURLUtil;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;

import javax.servlet.http.HttpServletRequest;

/**
 * @author Igor Franca
 */
public class ObjectFolderDisplayContext {

	public ObjectFolderDisplayContext(HttpServletRequest httpServletRequest) {
		_objectRequestHelper = new ObjectRequestHelper(httpServletRequest);
	}

	public String getEditObjectFolderURL() throws Exception {
		return PortletURLBuilder.create(
			PortletURLUtil.clone(
				PortletURLUtil.getCurrent(
					_objectRequestHelper.getLiferayPortletRequest(),
					_objectRequestHelper.getLiferayPortletResponse()),
				_objectRequestHelper.getLiferayPortletResponse())
		).setMVCRenderCommandName(
			"/object_folders/edit_object_folder"
		).buildString();
	}

	private final ObjectRequestHelper _objectRequestHelper;

}