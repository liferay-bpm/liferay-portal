/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.rest.internal.jaxrs.exception.mapper;

import com.liferay.object.exception.ObjectEntryStatusException;
import com.liferay.portal.vulcan.jaxrs.exception.mapper.BaseExceptionMapper;
import com.liferay.portal.vulcan.jaxrs.exception.mapper.Problem;

/**
 * @author Pedro Tavares
 */
public class ObjectEntryStatusExceptionMapper
	extends BaseExceptionMapper<ObjectEntryStatusException> {

	@Override
	protected Problem getProblem(
		ObjectEntryStatusException objectEntryStatusException) {

		return new Problem(objectEntryStatusException);
	}

}