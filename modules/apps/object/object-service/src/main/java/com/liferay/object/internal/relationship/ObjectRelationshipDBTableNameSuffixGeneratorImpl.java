/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
package com.liferay.object.internal.relationship;

import com.liferay.object.relationship.ObjectRelationshipDBTableNameSuffixGenerator;
import com.liferay.petra.string.StringBundler;
import org.osgi.service.component.annotations.Component;

/**
 * @author Thalles Montenegro
 */
@Component (service = ObjectRelationshipDBTableNameSuffixGenerator.class)
public class ObjectRelationshipDBTableNameSuffixGeneratorImpl implements
	ObjectRelationshipDBTableNameSuffixGenerator {

	private final static int RELATIONSHIP_MAXIMUM_CAPACITY = 67600;

	@Override
	public String generate(int objectRelationshipCount) {

		if (objectRelationshipCount >= RELATIONSHIP_MAXIMUM_CAPACITY) {
			throw new UnsupportedOperationException("Maximum number of relationship reached.");
		}

		char character1 = 'A';
		char character2 = '0';
		char character3 = 'A';
		char character4 = '0';

		int numIterations = objectRelationshipCount;
		character4 += numIterations % 10;
		numIterations /= 10;
		character3 += numIterations % 26;
		numIterations /= 26;
		character2 += numIterations % 10;
		numIterations /= 10;
		character1 += numIterations % 26;

		return StringBundler.concat(character1, character2, character3, character4);
	}
}
