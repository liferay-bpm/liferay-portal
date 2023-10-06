/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.internal.relationship;

import com.liferay.portal.test.rule.LiferayUnitTestRule;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Thalles Montenegro
 */
public class ObjectRelationshipDBTableNameSuffixGeneratorTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testGenerateChangingFirstDigit() {
		Assert.assertEquals(
			"A1A0",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(260));
	}

	@Test
	public void testGenerateChangingFirstLetter() {
		Assert.assertEquals(
			"B0A0",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(2600));
	}

	@Test
	public void testGenerateChangingLastDigit() {
		Assert.assertEquals(
			"A0A1",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(1));
	}

	@Test
	public void testGenerateChangingLastLetter() {
		Assert.assertEquals(
			"A0B0",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(10));
	}

	@Test
	public void testGenerateFailsGeneratingBeyondMaximumCapacity() {
		try {
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(67600);
			Assert.fail();
		}
		catch (UnsupportedOperationException unsupportedOperationException) {
			Assert.assertEquals(
				"Maximum number of relationship reached.",
				unsupportedOperationException.getMessage());
		}
	}

	@Test
	public void testGenerateFirstSequence() {
		Assert.assertEquals(
			"A0A0",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(0));
	}

	@Test
	public void testGenerateMaximumNumberOfRelationship() {
		Assert.assertEquals(
			"Z9Z9",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(67599));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingFirstDigit() {
		Assert.assertEquals(
			"A1A1",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(261));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingFirstLetter() {
		Assert.assertEquals(
			"B0A1",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(2601));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingLastLetter() {
		Assert.assertEquals(
			"A0B1",
			_objectRelationshipDBTableNameSuffixGeneratorImpl.generate(11));
	}

	private final ObjectRelationshipDBTableNameSuffixGeneratorImpl
		_objectRelationshipDBTableNameSuffixGeneratorImpl =
			new ObjectRelationshipDBTableNameSuffixGeneratorImpl();

}