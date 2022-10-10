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

		return _buildExpressionFilterString(map, objectFilter.getFilterBy());
	}

	private String _buildCreateDateModifiedDateExpressionFilterString(
		String filterBy, String operator, String value, String timestamp) {

		return StringBundler.concat(
			"(", filterBy, StringPool.SPACE, operator, StringPool.SPACE, value,
			timestamp, ")");
	}

	private String _buildDateExpressionFilterString(
		String filterBy, String operator, String value) {

		return StringBundler.concat(
			"(", filterBy, StringPool.SPACE, operator, StringPool.SPACE, value,
			")");
	}

	private String _buildExpressionFilterString(Object value, String filterBy) {
		if (value instanceof Map) {
			Map<String, Object> map = (Map<String, Object>)value;

			Set<String> operators = map.keySet();

			StringBuilder result = new StringBuilder();

			for (String operator : operators) {
				result.append(
					_buildOperatorFilterString(
						operator, map.get(operator), filterBy));
			}

			return result.toString();
		}

		return value.toString();
	}

	private String _buildInExpressionFilterString(
		String filterBy, Object[] values) {

		List<String> valuesList = new ArrayList<>();

		for (Object value : values) {
			valuesList.add(StringUtil.quote(String.valueOf(value)));
		}

		return StringBundler.concat(
			"(", filterBy, " in (",
			StringUtil.merge(valuesList, StringPool.COMMA_AND_SPACE), "))");
	}

	private String _buildOperatorFilterString(
		String operator, Object value, String filterBy) {

		if (StringUtil.equals(operator, "le") ||
			StringUtil.equals(operator, "ge")) {

			return _buildRangeExpressionFilterString(
				filterBy, operator, (String)value);
		}

		if (StringUtil.equals(operator, "eq") ||
			StringUtil.equals(operator, "ne")) {

			return StringBundler.concat(
				"(", filterBy, StringPool.SPACE, operator, StringPool.SPACE,
				StringUtil.removeSubstring(value.toString(), "\""), ")");
		}

		if (StringUtil.equals(filterBy, "status") &&
			StringUtil.equals(operator, "not")) {

			Map<String, Object> map = (Map<String, Object>)value;

			Object statusValues = map.get("in");

			return _buildStatusExpressionFilterString(
				"ne", statusValues, " and ");
		}

		if (StringUtil.equals(filterBy, "status") &&
			StringUtil.equals(operator, "in")) {

			return _buildStatusExpressionFilterString("eq", value, " or ");
		}

		if (StringUtil.equals(operator, "not")) {
			return "not " + _buildExpressionFilterString(value, filterBy);
		}

		if (StringUtil.equals(operator, "in")) {
			return _buildInExpressionFilterString(filterBy, (Object[])value);
		}

		return null;
	}

	private String _buildRangeExpressionFilterString(
		String filterBy, String operator, String value) {

		if (StringUtil.equals(operator, "le")) {
			if (StringUtil.equals(filterBy, "createDate")) {
				String createDateFilterExpression =
					_buildCreateDateModifiedDateExpressionFilterString(
						"dateCreated", operator, value, "T23:59:59.999Z");

				return createDateFilterExpression + " and ";
			}

			if (StringUtil.equals(filterBy, "modifiedDate")) {
				String modifiedDateFilterExpression =
					_buildCreateDateModifiedDateExpressionFilterString(
						"dateModified", operator, value, "T23:59:59.999Z");

				return modifiedDateFilterExpression + " and ";
			}

			return _buildDateExpressionFilterString(filterBy, operator, value) +
				" and ";
		}
		else if (StringUtil.equals(operator, "ge")) {
			if (StringUtil.equals(filterBy, "createDate")) {
				return _buildCreateDateModifiedDateExpressionFilterString(
					"dateCreated", operator, value, "T00:00:00.000Z");
			}

			if (StringUtil.equals(filterBy, "modifiedDate")) {
				return _buildCreateDateModifiedDateExpressionFilterString(
					"dateModified", operator, value, "T00:00:00.000Z");
			}

			return _buildDateExpressionFilterString(filterBy, operator, value);
		}

		return StringPool.BLANK;
	}

	private String _buildStatusExpressionFilterString(
		String operator, Object value, String delimiter) {

		String expressionFilterString =
			_buildStatusValuesExpressionFilterString(
				operator, delimiter, (Object[])value);

		return "(status/any(x:" + expressionFilterString + "))";
	}

	private String _buildStatusValuesExpressionFilterString(
		String operator, String delimiter, Object[] values) {

		List<String> statusValuesExpressionFilter = new ArrayList<>();

		for (Object value : values) {
			statusValuesExpressionFilter.add(
				StringBundler.concat(
					"(x ", operator, StringPool.SPACE, value.toString(), ")"));
		}

		return StringUtil.merge(statusValuesExpressionFilter, delimiter);
	}

}