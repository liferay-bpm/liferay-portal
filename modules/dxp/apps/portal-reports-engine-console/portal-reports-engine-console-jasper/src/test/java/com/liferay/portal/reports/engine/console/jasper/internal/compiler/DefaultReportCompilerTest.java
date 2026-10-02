/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.reports.engine.console.jasper.internal.compiler;

import com.liferay.portal.test.rule.LiferayUnitTestRule;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.design.JRDesignBand;
import net.sf.jasperreports.engine.design.JRDesignExpression;
import net.sf.jasperreports.engine.design.JRDesignTextField;
import net.sf.jasperreports.engine.design.JasperDesign;

import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Alberto Sousa
 */
public class DefaultReportCompilerTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test(expected = JRException.class)
	public void testValidateJasperDesignWithRestrictedExpression()
		throws Exception {

		_defaultReportCompiler.validateJasperDesign(
			_createJasperDesign(
				"\"result=\" + java.lang.reflect.Modifier.isPublic(0)"));
	}

	@Test(expected = JRException.class)
	public void testValidateJasperDesignWithRestrictedImport()
		throws Exception {

		JasperDesign jasperDesign = _createJasperDesign("\"result=\" + 1");

		jasperDesign.addImport("java.lang.Thread");

		_defaultReportCompiler.validateJasperDesign(jasperDesign);
	}

	@Test
	public void testValidateJasperDesignWithUnrestrictedExpression()
		throws Exception {

		_defaultReportCompiler.validateJasperDesign(
			_createJasperDesign(
				"\"result=\" + java.util.UUID.randomUUID().toString()"));
	}

	private JasperDesign _createJasperDesign(String expression)
		throws Exception {

		JasperDesign jasperDesign = new JasperDesign();

		JRDesignExpression jrDesignExpression = new JRDesignExpression();

		jrDesignExpression.setText(expression);

		JRDesignTextField jrDesignTextField = new JRDesignTextField();

		jrDesignTextField.setExpression(jrDesignExpression);

		JRDesignBand jrDesignBand = new JRDesignBand();

		jrDesignBand.addElement(jrDesignTextField);
		jrDesignBand.setHeight(30);

		jasperDesign.setName("test");
		jasperDesign.setTitle(jrDesignBand);

		return jasperDesign;
	}

	private final DefaultReportCompiler _defaultReportCompiler =
		new DefaultReportCompiler();

}