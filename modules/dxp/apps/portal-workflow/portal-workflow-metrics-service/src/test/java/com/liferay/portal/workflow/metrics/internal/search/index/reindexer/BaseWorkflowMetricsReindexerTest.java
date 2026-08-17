/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.workflow.metrics.internal.search.index.reindexer;

import com.liferay.portal.kernel.module.service.Snapshot;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.search.capabilities.SearchCapabilities;
import com.liferay.portal.search.engine.adapter.SearchEngineAdapter;
import com.liferay.portal.search.engine.adapter.document.DeleteByQueryDocumentRequest;
import com.liferay.portal.search.engine.adapter.index.CreateIndexRequest;
import com.liferay.portal.search.engine.adapter.index.DeleteIndexRequest;
import com.liferay.portal.search.engine.adapter.index.IndicesExistsIndexRequest;
import com.liferay.portal.search.engine.adapter.index.IndicesExistsIndexResponse;
import com.liferay.portal.search.index.IndexNameBuilder;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Mariano Álvaro Sáiz
 */
public class BaseWorkflowMetricsReindexerTest {

	@ClassRule
	public static LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		Mockito.when(
			_indexNameBuilder.getIndexName(_COMPANY_ID)
		).thenReturn(
			_INDEX_NAME_PREFIX
		);

		Mockito.when(
			_searchCapabilities.isWorkflowMetricsSupported()
		).thenReturn(
			true
		);

		_testWorkflowMetricsReindexer.indexNameBuilder = _indexNameBuilder;
		_testWorkflowMetricsReindexer.searchCapabilities = _searchCapabilities;
		_testWorkflowMetricsReindexer.searchEngineAdapter =
			_searchEngineAdapter;

		ReflectionTestUtil.setFieldValue(
			BaseWorkflowMetricsReindexer.class, "_syncReindexManagerSnapshot",
			Mockito.mock(Snapshot.class));
	}

	@Test
	public void testReindexCreatesMissingIndex() throws Exception {
		_setUpHasIndex(false);

		_testWorkflowMetricsReindexer.reindex(_COMPANY_ID);

		Mockito.verify(
			_searchEngineAdapter, Mockito.times(1)
		).execute(
			Mockito.any(CreateIndexRequest.class)
		);
	}

	/**
	 * The workflow metrics indexers write asynchronously, so a reindex that
	 * deletes the index opens a window in which the index does not exist. Any
	 * write landing in that window fails with an
	 * <code>index_not_found_exception</code>, which surfaces as an error in the
	 * portal log. Clear the index by deleting its documents instead.
	 */
	@Test
	public void testReindexDeletesDocumentsInsteadOfIndex() throws Exception {
		_setUpHasIndex(true);

		_testWorkflowMetricsReindexer.reindex(_COMPANY_ID);

		Mockito.verify(
			_searchEngineAdapter, Mockito.times(1)
		).execute(
			Mockito.any(DeleteByQueryDocumentRequest.class)
		);

		Mockito.verify(
			_searchEngineAdapter, Mockito.never()
		).execute(
			Mockito.any(DeleteIndexRequest.class)
		);
	}

	private void _setUpHasIndex(boolean hasIndex) {
		IndicesExistsIndexResponse indicesExistsIndexResponse = Mockito.mock(
			IndicesExistsIndexResponse.class);

		Mockito.when(
			indicesExistsIndexResponse.isExists()
		).thenReturn(
			hasIndex
		);

		Mockito.when(
			_searchEngineAdapter.execute(
				Mockito.any(IndicesExistsIndexRequest.class))
		).thenReturn(
			indicesExistsIndexResponse
		);
	}

	private static final long _COMPANY_ID = RandomTestUtil.randomLong();

	private static final String _INDEX_NAME_PREFIX =
		RandomTestUtil.randomString();

	private final IndexNameBuilder _indexNameBuilder = Mockito.mock(
		IndexNameBuilder.class);
	private final SearchCapabilities _searchCapabilities = Mockito.mock(
		SearchCapabilities.class);
	private final SearchEngineAdapter _searchEngineAdapter = Mockito.mock(
		SearchEngineAdapter.class);
	private final TestWorkflowMetricsReindexer _testWorkflowMetricsReindexer =
		new TestWorkflowMetricsReindexer();

	private static class TestWorkflowMetricsReindexer
		extends BaseWorkflowMetricsReindexer {

		@Override
		public String getKey() {
			return "task";
		}

		@Override
		protected void reindexEntities(long companyId) {
		}

	}

}