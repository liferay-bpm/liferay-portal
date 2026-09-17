/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.dynamic.data.mapping.service.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.dao.db.DBType;
import com.liferay.portal.kernel.dao.jdbc.AutoBatchPreparedStatementUtil;
import com.liferay.portal.kernel.dao.jdbc.DataAccess;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.rule.AssumeTestRule;
import com.liferay.portal.kernel.test.util.TestPropsValues;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Types;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.After;
import org.junit.Assert;
import org.junit.Assume;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Alberto Sousa
 */
@RunWith(Arquillian.class)
public class DDMFieldAttributeDBIndexTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new AssumeTestRule("assume"), new LiferayIntegrationTestRule());

	public static void assume() {
		Assume.assumeTrue(DBManagerUtil.getDBType() == DBType.POSTGRESQL);
	}

	@Before
	public void setUp() throws Exception {
		_addDDMFieldAttributes();
	}

	@After
	public void tearDown() throws Exception {
		_deleteDDMFieldAttributes();
	}

	@Test
	public void testFetchByF_AN_L() throws Exception {
		int blockCount = _getBlockCount();

		Assert.assertTrue(
			StringBundler.concat(
				"The lookup read ", blockCount,
				" blocks, but it should read no more than ", _MAX_BLOCK_COUNT),
			blockCount <= _MAX_BLOCK_COUNT);
	}

	private void _addDDMFieldAttributes() throws Exception {
		try (Connection connection = DataAccess.getConnection();

			PreparedStatement preparedStatement =
				AutoBatchPreparedStatementUtil.autoBatch(
					connection,
					StringBundler.concat(
						"insert into DDMFieldAttribute (mvccVersion, ",
						"ctCollectionId, fieldAttributeId, companyId, ",
						"fieldId, storageId, attributeName, languageId) ",
						"values (0, 0, ?, ?, ?, ?, ?, ?)"))) {

			long companyId = TestPropsValues.getCompanyId();

			for (int i = 0; i < _ROW_COUNT; i++) {
				long fieldAttributeId = _FIELD_ATTRIBUTE_ID_OFFSET + i;

				preparedStatement.setLong(1, fieldAttributeId);
				preparedStatement.setLong(3, fieldAttributeId);
				preparedStatement.setLong(4, fieldAttributeId);

				preparedStatement.setLong(2, companyId);

				if ((i % 5) == 0) {
					preparedStatement.setString(5, "attribute" + (i % 97));
					preparedStatement.setString(6, "en_US");
				}
				else {
					preparedStatement.setNull(5, Types.VARCHAR);
					preparedStatement.setNull(6, Types.VARCHAR);
				}

				preparedStatement.addBatch();
			}

			preparedStatement.executeBatch();
		}

		_analyzeTable();
	}

	private void _analyzeTable() throws Exception {
		try (Connection connection = DataAccess.getConnection();

			Statement statement = connection.createStatement()) {

			statement.execute("analyze DDMFieldAttribute");
		}
	}

	private void _deleteDDMFieldAttributes() throws Exception {
		try (Connection connection = DataAccess.getConnection();

			PreparedStatement preparedStatement = connection.prepareStatement(
				"delete from DDMFieldAttribute where fieldAttributeId >= ?")) {

			preparedStatement.setLong(1, _FIELD_ATTRIBUTE_ID_OFFSET);

			preparedStatement.executeUpdate();
		}

		_analyzeTable();
	}

	private int _getBlockCount() throws Exception {
		try (Connection connection = DataAccess.getConnection();

			PreparedStatement preparedStatement = connection.prepareStatement(
				StringBundler.concat(
					"explain (analyze, buffers) select * from ",
					"DDMFieldAttribute where fieldId = ? and (attributeName ",
					"is null or attributeName = '') and (languageId is null ",
					"or languageId = '') and ctCollectionId = 0"))) {

			preparedStatement.setLong(
				1, _FIELD_ATTRIBUTE_ID_OFFSET + (_ROW_COUNT / 2) + 1);

			try (ResultSet resultSet = preparedStatement.executeQuery()) {
				while (resultSet.next()) {
					Matcher matcher = _bufferPattern.matcher(
						resultSet.getString("QUERY PLAN"));

					if (!matcher.find()) {
						continue;
					}

					int blockCount = GetterUtil.getInteger(matcher.group(1));

					String read = matcher.group(2);

					if (read != null) {
						blockCount += GetterUtil.getInteger(read);
					}

					return blockCount;
				}
			}
		}

		throw new IllegalStateException("Unable to read the query plan");
	}

	private static final long _FIELD_ATTRIBUTE_ID_OFFSET = 900000000;

	private static final int _MAX_BLOCK_COUNT = 100;

	private static final int _ROW_COUNT = 50000;

	private static final Pattern _bufferPattern = Pattern.compile(
		"shared hit=(\\d+)(?: read=(\\d+))?");

}