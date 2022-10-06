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

package com.liferay.object.internal.aggregation.odata.filter.parser;

import com.liferay.object.aggregation.odata.filter.parser.ObjectODataFilterParser;
import com.liferay.object.model.ObjectFilter;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.StringBundler;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.vulcan.util.ObjectMapperUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.osgi.service.component.annotations.Component;

/**
 * @author Selton Guedes
 */
@Component(immediate = true, service = ObjectODataFilterParser.class)
public class ObjectODataFilterParserImpl implements ObjectODataFilterParser {

	@Override
	public List<String> parse(List<ObjectFilter> objectFilters) {
		return ListUtil.toList(objectFilters, this::parse);
	}

	@Override
	public String parse(ObjectFilter objectFilter) {
		Map<String, Object> map = ObjectMapperUtil.readValue(
			Map.class, objectFilter.getJSON());

		if (map == null) {
			return null;
		}

		return objectFilter.getFilterBy() + _buildExpressionFilterString(map);
	}

	private String _buildExpressionFilterString(Object value) {
		if (value instanceof Map) {
			Map<String, Object> map = (Map<String, Object>)value;

			Set<String> operators = map.keySet();

			StringBuilder result = new StringBuilder();

			for (String operator : operators) {
				result.append(
					_buildOperatorFilterString(operator, map.get(operator)));
			}

			return result.toString();
		}

		return value.toString();
	}

	private String _buildInExpressionFilterString(Object[] values) {
		List<String> valuesList = new ArrayList<>();

		for (Object value : values) {
			valuesList.add(StringUtil.quote(String.valueOf(value)));
		}

		return StringBundler.concat(
			" in (", StringUtil.merge(valuesList, StringPool.COMMA_AND_SPACE),
			")");
	}

	private String _buildOperatorFilterString(String operator, Object value) {
		if (StringUtil.equals(operator, "not")) {
			return StringBundler.concat(
				" not (", _buildExpressionFilterString(value), ")");
		}

		if (StringUtil.equals(operator, "in")) {
			return _buildInExpressionFilterString((Object[])value);
		}

		return null;
	}

}