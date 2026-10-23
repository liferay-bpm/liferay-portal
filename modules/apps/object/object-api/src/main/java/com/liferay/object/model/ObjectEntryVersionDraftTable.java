/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.model;

import com.liferay.petra.sql.dsl.Column;
import com.liferay.petra.sql.dsl.base.BaseTable;

import java.sql.Clob;
import java.sql.Types;

import java.util.Date;

/**
 * The table class for the &quot;ObjectEntryVersionDraft&quot; database table.
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraft
 * @generated
 */
public class ObjectEntryVersionDraftTable
	extends BaseTable<ObjectEntryVersionDraftTable> {

	public static final ObjectEntryVersionDraftTable INSTANCE =
		new ObjectEntryVersionDraftTable();

	public final Column<ObjectEntryVersionDraftTable, Long> mvccVersion =
		createColumn(
			"mvccVersion", Long.class, Types.BIGINT, Column.FLAG_NULLITY);
	public final Column<ObjectEntryVersionDraftTable, Long>
		objectEntryVersionDraftId = createColumn(
			"objectEntryVersionDraftId", Long.class, Types.BIGINT,
			Column.FLAG_PRIMARY);
	public final Column<ObjectEntryVersionDraftTable, Long> companyId =
		createColumn(
			"companyId", Long.class, Types.BIGINT, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Long> userId =
		createColumn("userId", Long.class, Types.BIGINT, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, String> userName =
		createColumn(
			"userName", String.class, Types.VARCHAR, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Date> createDate =
		createColumn(
			"createDate", Date.class, Types.TIMESTAMP, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Date> modifiedDate =
		createColumn(
			"modifiedDate", Date.class, Types.TIMESTAMP, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Long> objectDefinitionId =
		createColumn(
			"objectDefinitionId", Long.class, Types.BIGINT,
			Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Long> objectEntryId =
		createColumn(
			"objectEntryId", Long.class, Types.BIGINT, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Clob> content =
		createColumn("content", Clob.class, Types.CLOB, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Integer> version =
		createColumn(
			"version", Integer.class, Types.INTEGER, Column.FLAG_DEFAULT);
	public final Column<ObjectEntryVersionDraftTable, Integer> status =
		createColumn(
			"status", Integer.class, Types.INTEGER, Column.FLAG_DEFAULT);

	private ObjectEntryVersionDraftTable() {
		super("ObjectEntryVersionDraft", ObjectEntryVersionDraftTable::new);
	}

}
// LIFERAY-SERVICE-BUILDER-HASH:-1968731481