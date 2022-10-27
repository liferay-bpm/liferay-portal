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

package com.liferay.object.rest.internal.odata.filter.expression;

import com.liferay.object.constants.ObjectFieldSettingConstants;
import com.liferay.object.constants.ObjectRelationshipConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.ObjectRelationship;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.persistence.ObjectDefinitionPersistence;
import com.liferay.object.service.persistence.ObjectEntryPersistence;
import com.liferay.object.service.persistence.ObjectRelationshipPersistence;
import com.liferay.object.system.SystemObjectDefinitionMetadata;
import com.liferay.object.system.SystemObjectDefinitionMetadataTracker;
import com.liferay.object.util.ObjectFieldSettingValueUtil;
import com.liferay.petra.function.transform.TransformUtil;
import com.liferay.petra.sql.dsl.Column;
import com.liferay.petra.sql.dsl.expression.Predicate;
import com.liferay.petra.sql.dsl.spi.expression.DefaultPredicate;
import com.liferay.petra.sql.dsl.spi.expression.Operand;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.BaseModel;
import com.liferay.portal.kernel.util.DateFormatFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.odata.entity.EntityField;
import com.liferay.portal.odata.entity.EntityModel;
import com.liferay.portal.odata.filter.expression.BinaryExpression;
import com.liferay.portal.odata.filter.expression.CollectionPropertyExpression;
import com.liferay.portal.odata.filter.expression.Expression;
import com.liferay.portal.odata.filter.expression.ExpressionVisitException;
import com.liferay.portal.odata.filter.expression.ExpressionVisitor;
import com.liferay.portal.odata.filter.expression.LambdaFunctionExpression;
import com.liferay.portal.odata.filter.expression.LambdaVariableExpression;
import com.liferay.portal.odata.filter.expression.ListExpression;
import com.liferay.portal.odata.filter.expression.LiteralExpression;
import com.liferay.portal.odata.filter.expression.MemberExpression;
import com.liferay.portal.odata.filter.expression.MethodExpression;
import com.liferay.portal.odata.filter.expression.PrimitivePropertyExpression;
import com.liferay.portal.odata.filter.expression.UnaryExpression;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * @author Marco Leo
 */
public class PredicateExpressionVisitorImpl
	implements ExpressionVisitor<Object> {

	public PredicateExpressionVisitorImpl(
		EntityModel entityModel, long objectDefinitionId,
		ObjectDefinitionPersistence objectDefinitionPersistence,
		ObjectEntryPersistence objectEntryPersistence,
		ObjectFieldLocalService objectFieldLocalService,
		ObjectRelationshipPersistence objectRelationshipPersistence,
		SystemObjectDefinitionMetadataTracker
			systemObjectDefinitionMetadataTracker) {

		this(
			entityModel, new HashMap<>(), objectDefinitionId,
			objectDefinitionPersistence, objectEntryPersistence,
			objectFieldLocalService, objectRelationshipPersistence,
			systemObjectDefinitionMetadataTracker);
	}

	@Override
	public Predicate visitBinaryExpressionOperation(
		BinaryExpression.Operation operation, Object left, Object right) {

		Optional<Predicate> predicateOptional = _getPredicateOptional(
			operation, left, right);

		return predicateOptional.orElseThrow(
			() -> new UnsupportedOperationException(
				"Unsupported method visitBinaryExpressionOperation with " +
					"operation " + operation));
	}

	@Override
	public Predicate visitCollectionPropertyExpression(
			CollectionPropertyExpression collectionPropertyExpression)
		throws ExpressionVisitException {

		LambdaFunctionExpression lambdaFunctionExpression =
			collectionPropertyExpression.getLambdaFunctionExpression();

		return (Predicate)lambdaFunctionExpression.accept(
			new PredicateExpressionVisitorImpl(
				_entityModel,
				Collections.singletonMap(
					lambdaFunctionExpression.getVariableName(),
					collectionPropertyExpression.getName()),
				_objectDefinitionId, _objectDefinitionPersistence,
				_objectEntryPersistence, _objectFieldLocalService,
				_objectRelationshipPersistence,
				_systemObjectDefinitionMetadataTracker));
	}

	@Override
	public Object visitLambdaFunctionExpression(
			LambdaFunctionExpression.Type type, String variableName,
			Expression expression)
		throws ExpressionVisitException {

		return expression.accept(this);
	}

	@Override
	public Object visitLambdaVariableExpression(
		LambdaVariableExpression lambdaVariableExpression) {

		return _lambdaVariableExpressionFieldNames.get(
			lambdaVariableExpression.getVariableName());
	}

	@Override
	public Predicate visitListExpressionOperation(
			ListExpression.Operation operation, Object left, List<Object> right)
		throws ExpressionVisitException {

		if (Objects.equals(ListExpression.Operation.IN, operation)) {
			Column<?, Object> column = _getColumn(left);

			return column.in(
				TransformUtil.transformToArray(
					right, fieldValue -> _convertFieldValue(left, fieldValue),
					Object.class));
		}

		throw new UnsupportedOperationException(
			"Unsupported method visitListExpressionOperation with operation " +
				operation);
	}

	@Override
	public Object visitLiteralExpression(LiteralExpression literalExpression) {
		if (Objects.equals(
				LiteralExpression.Type.BOOLEAN, literalExpression.getType())) {

			return GetterUtil.getBoolean(literalExpression.getText());
		}
		else if (Objects.equals(
					LiteralExpression.Type.DATE, literalExpression.getType())) {

			return GetterUtil.getDate(
				literalExpression.getText(),
				DateFormatFactoryUtil.getSimpleDateFormat("yyyy-MM-dd"));
		}
		else if (Objects.equals(
					LiteralExpression.Type.DOUBLE,
					literalExpression.getType())) {

			return GetterUtil.getDouble(literalExpression.getText());
		}
		else if (Objects.equals(
					LiteralExpression.Type.INTEGER,
					literalExpression.getType())) {

			return GetterUtil.getInteger(literalExpression.getText());
		}
		else if (Objects.equals(
					LiteralExpression.Type.NULL, literalExpression.getType())) {

			return null;
		}
		else if (Objects.equals(
					LiteralExpression.Type.STRING,
					literalExpression.getType())) {

			return StringUtil.unquote(literalExpression.getText());
		}

		return literalExpression.getText();
	}

	@Override
	public Object visitMemberExpression(MemberExpression memberExpression)
		throws ExpressionVisitException {

		Expression expression = memberExpression.getExpression();

		return expression.accept(this);
	}

	@Override
	public Object visitMethodExpression(
		List<Object> expressions, MethodExpression.Type type) {

		if (type == MethodExpression.Type.CONTAINS) {
			if (expressions.size() != 2) {
				throw new UnsupportedOperationException(
					StringBundler.concat(
						"Unsupported method visitMethodExpression with method ",
						"type ", type, " and ", expressions.size(), "params"));
			}

			return _contains(expressions.get(0), expressions.get(1));
		}

		if (type == MethodExpression.Type.STARTS_WITH) {
			if (expressions.size() != 2) {
				throw new UnsupportedOperationException(
					StringBundler.concat(
						"Unsupported method visitMethodExpression with method",
						"type ", type, " and ", expressions.size(), "params"));
			}

			return _startsWith(expressions.get(0), expressions.get(1));
		}

		throw new UnsupportedOperationException(
			"Unsupported method visitMethodExpression with method type " +
				type);
	}

	@Override
	public Object visitPrimitivePropertyExpression(
		PrimitivePropertyExpression primitivePropertyExpression) {

		return primitivePropertyExpression.getName();
	}

	@Override
	public Predicate visitUnaryExpressionOperation(
		UnaryExpression.Operation operation, Object operand) {

		if (!Objects.equals(UnaryExpression.Operation.NOT, operation)) {
			throw new UnsupportedOperationException(
				"Unsupported method visitUnaryExpressionOperation with " +
					"operation " + operation);
		}

		DefaultPredicate defaultPredicate = (DefaultPredicate)operand;

		if (Objects.equals(Operand.IN, defaultPredicate.getOperand())) {
			return new DefaultPredicate(
				defaultPredicate.getLeftExpression(), Operand.NOT_IN,
				defaultPredicate.getRightExpression());
		}

		return Predicate.not(defaultPredicate);
	}

	private PredicateExpressionVisitorImpl(
		EntityModel entityModel,
		Map<String, String> lambdaVariableExpressionFieldNames,
		long objectDefinitionId,
		ObjectDefinitionPersistence objectDefinitionPersistence,
		ObjectEntryPersistence objectEntryPersistence,
		ObjectFieldLocalService objectFieldLocalService,
		ObjectRelationshipPersistence objectRelationshipPersistence,
		SystemObjectDefinitionMetadataTracker
			systemObjectDefinitionMetadataTracker) {

		_entityModel = entityModel;
		_lambdaVariableExpressionFieldNames =
			lambdaVariableExpressionFieldNames;
		_objectDefinitionId = objectDefinitionId;
		_objectDefinitionPersistence = objectDefinitionPersistence;
		_objectEntryPersistence = objectEntryPersistence;
		_objectFieldLocalService = objectFieldLocalService;
		_objectRelationshipPersistence = objectRelationshipPersistence;
		_systemObjectDefinitionMetadataTracker =
			systemObjectDefinitionMetadataTracker;
	}

	private Predicate _contains(Object fieldName, Object fieldValue) {
		Column<?, Object> column = _getColumn(fieldName);

		return column.like(
			StringPool.PERCENT + _convertFieldValue(fieldName, fieldValue) +
				StringPool.PERCENT);
	}

	private Object _convertFieldValue(Object fieldName, Object fieldValue) {
		EntityField entityField = _getEntityField(fieldName);

		String entityFieldFilterableName = entityField.getFilterableName(null);
		String entityFieldName = entityField.getName();

		if (Objects.equals(entityFieldFilterableName, entityFieldName)) {
			return fieldValue;
		}

		try {
			ObjectField objectField = _objectFieldLocalService.getObjectField(
				_objectDefinitionId, entityFieldFilterableName);

			if (!Objects.equals(
					objectField.getRelationshipType(),
					ObjectRelationshipConstants.TYPE_ONE_TO_MANY)) {

				return fieldValue;
			}

			String objectRelationshipERCFieldName =
				ObjectFieldSettingValueUtil.getObjectFieldSettingValue(
					objectField,
					ObjectFieldSettingConstants.
						OBJECT_RELATIONSHIP_ERC_FIELD_NAME);

			if (!Objects.equals(
					entityFieldName, objectRelationshipERCFieldName)) {

				return fieldValue;
			}

			ObjectRelationship objectRelationship =
				_objectRelationshipPersistence.findByObjectFieldId2(
					objectField.getObjectFieldId());

			ObjectDefinition objectDefinition =
				_objectDefinitionPersistence.findByPrimaryKey(
					objectRelationship.getObjectDefinitionId1());

			if (objectDefinition.isSystem()) {
				SystemObjectDefinitionMetadata systemObjectDefinitionMetadata =
					_systemObjectDefinitionMetadataTracker.
						getSystemObjectDefinitionMetadata(
							objectDefinition.getName());

				BaseModel<?> baseModel =
					systemObjectDefinitionMetadata.
						getBaseModelByExternalReferenceCode(
							String.valueOf(fieldValue),
							objectDefinition.getCompanyId());

				return baseModel.getPrimaryKeyObj();
			}

			ObjectEntry objectEntry = _objectEntryPersistence.findByERC_C_ODI(
				String.valueOf(fieldValue), objectDefinition.getCompanyId(),
				objectDefinition.getObjectDefinitionId());

			return objectEntry.getObjectEntryId();
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(portalException);
			}

			return fieldValue;
		}
	}

	private Column<?, Object> _getColumn(Object fieldName) {
		EntityField entityField = _getEntityField(fieldName);

		return (Column<?, Object>)_objectFieldLocalService.getColumn(
			_objectDefinitionId, entityField.getFilterableName(null));
	}

	private EntityField _getEntityField(Object fieldName) {
		Map<String, EntityField> entityFieldsMap =
			_entityModel.getEntityFieldsMap();

		return entityFieldsMap.get(GetterUtil.getString(fieldName));
	}

	private Optional<Predicate> _getPredicateOptional(
		BinaryExpression.Operation operation, Object left, Object right) {

		Predicate predicate = null;

		if (Objects.equals(BinaryExpression.Operation.AND, operation)) {
			predicate = Predicate.and((Predicate)left, (Predicate)right);
		}
		else if (Objects.equals(BinaryExpression.Operation.OR, operation)) {
			predicate = Predicate.or((Predicate)left, (Predicate)right);
		}

		if (predicate != null) {
			return Optional.of(predicate);
		}

		Column<?, Object> column = _getColumn(left);

		right = _convertFieldValue(left, right);

		if (Objects.equals(BinaryExpression.Operation.EQ, operation)) {
			predicate = column.eq(right);
		}
		else if (Objects.equals(BinaryExpression.Operation.GE, operation)) {
			predicate = column.gte(right);
		}
		else if (Objects.equals(BinaryExpression.Operation.GT, operation)) {
			predicate = column.gt(right);
		}
		else if (Objects.equals(BinaryExpression.Operation.LE, operation)) {
			predicate = column.lte(right);
		}
		else if (Objects.equals(BinaryExpression.Operation.LT, operation)) {
			predicate = column.lt(right);
		}
		else if (Objects.equals(BinaryExpression.Operation.NE, operation)) {
			predicate = column.neq(right);
		}
		else {
			return Optional.empty();
		}

		return Optional.of(predicate);
	}

	private Predicate _startsWith(Object fieldName, Object fieldValue) {
		Column<?, Object> column = _getColumn(fieldName);

		return column.like(
			_convertFieldValue(fieldName, fieldValue) + StringPool.PERCENT);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		PredicateExpressionVisitorImpl.class);

	private final EntityModel _entityModel;
	private Map<String, String> _lambdaVariableExpressionFieldNames;
	private final long _objectDefinitionId;
	private ObjectDefinitionPersistence _objectDefinitionPersistence;
	private ObjectEntryPersistence _objectEntryPersistence;
	private final ObjectFieldLocalService _objectFieldLocalService;
	private ObjectRelationshipPersistence _objectRelationshipPersistence;
	private final SystemObjectDefinitionMetadataTracker
		_systemObjectDefinitionMetadataTracker;

}