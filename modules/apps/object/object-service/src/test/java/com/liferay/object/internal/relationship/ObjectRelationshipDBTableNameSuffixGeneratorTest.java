package com.liferay.object.internal.relationship;

import com.liferay.portal.test.rule.LiferayUnitTestRule;
import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

public class ObjectRelationshipDBTableNameSuffixGeneratorTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testGenerateFirstSequence() {

		Assert.assertEquals(
			"A0A0",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(0));
	}

	@Test
	public void testGenerateChangingLastDigit() {

		Assert.assertEquals(
			"A0A1",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(1));
	}

	@Test
	public void testGenerateChangingLastLetter() {

		Assert.assertEquals(
			"A0B0",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(10));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingLastLetter() {

		Assert.assertEquals(
			"A0B1",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(11));
	}

	@Test
	public void testGenerateChangingFirstDigit() {

		Assert.assertEquals(
			"A1A0",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(260));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingFirstDigit() {

		Assert.assertEquals(
			"A1A1",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(261));
	}

	@Test
	public void testGenerateChangingFirstLetter() {

		Assert.assertEquals(
			"B0A0",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(2600));
	}

	@Test
	public void testGenerateNextSequenceAfterChangingFirstLetter() {

		Assert.assertEquals(
			"B0A1",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(2601));
	}

	@Test
	public void testGenerateMaximumNumberOfRelationship() {

		Assert.assertEquals(
			"Z9Z9",
			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(67599));
	}

	@Test
	public void testGenerateFailsGeneratingBeyondMaximumCapacity() {

		try {

			ObjectRelationshipDBTableNameSuffixGeneratorImpl.generate(67600);
			Assert.fail();

		} catch (UnsupportedOperationException unsupportedOperationException) {
			Assert.assertEquals(
				"Maximum number of relationship reached.",
				unsupportedOperationException.getMessage());
		}
	}
}
