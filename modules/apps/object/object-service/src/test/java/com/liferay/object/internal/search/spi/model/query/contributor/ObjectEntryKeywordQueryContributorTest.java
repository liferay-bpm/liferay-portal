/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.search.spi.model.query.contributor;

import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.model.bag.ObjectFieldBag;
import com.liferay.object.service.ObjectFieldLocalService;
import com.liferay.object.service.ObjectViewLocalService;
import com.liferay.portal.kernel.search.BooleanClauseOccur;
import com.liferay.portal.kernel.search.BooleanQuery;
import com.liferay.portal.kernel.search.Query;
import com.liferay.portal.kernel.search.SearchContext;
import com.liferay.portal.kernel.search.generic.NestedQuery;
import com.liferay.portal.kernel.test.util.RandomTestUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.search.localization.SearchLocalizationHelper;
import com.liferay.portal.search.spi.model.query.contributor.helper.KeywordQueryContributorHelper;

import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

/**
 * @author Yuri Monteiro
 */
@RunWith(MockitoJUnitRunner.class)
public class ObjectEntryKeywordQueryContributorTest {

	@Test
	public void testContribute() throws Exception {

		// Scenario 1: modifiable system -> getIndexedObjectFields() and filter

		SearchContext searchContext = _buildSearchContext();

		BooleanQuery booleanQuery = Mockito.mock(BooleanQuery.class);

		ArgumentCaptor<Query> argumentCaptor = ArgumentCaptor.forClass(
			Query.class);

		Mockito.when(
			booleanQuery.add(
				argumentCaptor.capture(), Mockito.any(BooleanClauseOccur.class))
		).thenReturn(
			null
		);

		KeywordQueryContributorHelper helper = Mockito.mock(
			KeywordQueryContributorHelper.class);

		Mockito.when(
			helper.getSearchContext()
		).thenReturn(
			searchContext
		);

		ObjectDefinition objectDefinition = Mockito.mock(
			ObjectDefinition.class);

		ObjectFieldBag objectFieldBag = Mockito.mock(ObjectFieldBag.class);

		Mockito.when(
			objectDefinition.getObjectFieldBag()
		).thenReturn(
			objectFieldBag
		);

		Mockito.when(
			objectDefinition.isModifiableAndSystem()
		).thenReturn(
			true
		);

		String metaFieldName = RandomTestUtil.randomString();
		String normalFieldName = RandomTestUtil.randomString();

		ObjectField metadataField = _mockTextField(metaFieldName, true);
		ObjectField normalField = _mockTextField(normalFieldName, false);

		Mockito.when(
			objectFieldBag.getIndexedObjectFields()
		).thenReturn(
			Arrays.asList(metadataField, normalField)
		);

		ObjectEntryKeywordQueryContributor contributor = _createContributor(
			objectDefinition);

		contributor.contribute(
			RandomTestUtil.randomString(), booleanQuery, helper);

		Mockito.verify(
			objectFieldBag
		).getIndexedObjectFields();

		Mockito.verify(
			objectFieldBag, Mockito.never()
		).getNonsystemIndexedObjectFields();

		List<Query> queries = argumentCaptor.getAllValues();

		Assert.assertEquals(1, _countNestedQueries(queries));

		// Scenario 2: not modifiable system -> getNonsystemIndexedObjectFields

		searchContext = _buildSearchContext();

		booleanQuery = Mockito.mock(BooleanQuery.class);

		Mockito.when(
			booleanQuery.add(
				Mockito.any(Query.class), Mockito.any(BooleanClauseOccur.class))
		).thenReturn(
			null
		);

		helper = Mockito.mock(KeywordQueryContributorHelper.class);

		Mockito.when(
			helper.getSearchContext()
		).thenReturn(
			searchContext
		);

		objectDefinition = Mockito.mock(ObjectDefinition.class);

		objectFieldBag = Mockito.mock(ObjectFieldBag.class);

		Mockito.when(
			objectDefinition.getObjectFieldBag()
		).thenReturn(
			objectFieldBag
		);

		Mockito.when(
			objectDefinition.isModifiableAndSystem()
		).thenReturn(
			false
		);

		normalField = _mockTextField(normalFieldName, false);

		Mockito.when(
			objectFieldBag.getNonsystemIndexedObjectFields()
		).thenReturn(
			Arrays.asList(normalField)
		);

		contributor = _createContributor(objectDefinition);

		contributor.contribute(
			RandomTestUtil.randomString(), booleanQuery, helper);

		Mockito.verify(
			objectFieldBag
		).getNonsystemIndexedObjectFields();

		Mockito.verify(
			objectFieldBag, Mockito.never()
		).getIndexedObjectFields();
	}

	private SearchContext _buildSearchContext() {
		SearchContext searchContext = new SearchContext();

		searchContext.setAndSearch(false);
		searchContext.setAttribute("searchByObjectView", Boolean.FALSE);
		searchContext.setLocale(LocaleUtil.US);

		searchContext.getQueryConfig();

		return searchContext;
	}

	private int _countNestedQueries(List<Query> queries) {
		int count = 0;

		for (Query query : queries) {
			if (query instanceof NestedQuery) {
				count++;
			}
		}

		return count;
	}

	private ObjectEntryKeywordQueryContributor _createContributor(
		ObjectDefinition objectDefinition) {

		SearchLocalizationHelper searchLocalizationHelper = Mockito.mock(
			SearchLocalizationHelper.class);

		return new ObjectEntryKeywordQueryContributor(
			objectDefinition, Mockito.mock(ObjectFieldLocalService.class),
			Mockito.mock(ObjectViewLocalService.class),
			searchLocalizationHelper);
	}

	private ObjectField _mockTextField(String name, boolean metadata) {
		ObjectField objectField = Mockito.mock(ObjectField.class);

		Mockito.when(
			objectField.getBusinessType()
		).thenReturn(
			ObjectFieldConstants.BUSINESS_TYPE_TEXT
		);

		Mockito.when(
			objectField.getDBType()
		).thenReturn(
			ObjectFieldConstants.DB_TYPE_STRING
		);

		Mockito.when(
			objectField.getIndexedLanguageId()
		).thenReturn(
			null
		);

		Mockito.when(
			objectField.getName()
		).thenReturn(
			name
		);

		Mockito.when(
			objectField.isIndexed()
		).thenReturn(
			true
		);

		Mockito.when(
			objectField.isIndexedAsKeyword()
		).thenReturn(
			false
		);

		Mockito.when(
			objectField.isLocalized()
		).thenReturn(
			false
		);

		Mockito.when(
			objectField.isMetadata()
		).thenReturn(
			metadata
		);

		return objectField;
	}

}