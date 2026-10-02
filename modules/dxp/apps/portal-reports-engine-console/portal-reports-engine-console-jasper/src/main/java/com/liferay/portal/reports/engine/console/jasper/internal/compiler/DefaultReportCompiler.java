/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.reports.engine.console.jasper.internal.compiler;

import com.liferay.petra.lang.SafeCloseable;
import com.liferay.petra.lang.ThreadContextClassLoaderUtil;
import com.liferay.portal.reports.engine.ReportDesignRetriever;

import java.util.List;

import net.sf.jasperreports.engine.DefaultJasperReportsContext;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRExpression;
import net.sf.jasperreports.engine.JRExpressionCollector;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.xml.JRXmlLoader;

/**
 * @author Michael C. Han
 * @author Brian Wing Shun Chan
 */
public class DefaultReportCompiler implements ReportCompiler {

	@Override
	public JasperReport compile(ReportDesignRetriever reportDesignRetriever)
		throws JRException {

		return compile(reportDesignRetriever, false);
	}

	@Override
	public JasperReport compile(
			ReportDesignRetriever reportDesignRetriever, boolean force)
		throws JRException {

		try (SafeCloseable safeCloseable = ThreadContextClassLoaderUtil.swap(
				DefaultReportCompiler.class.getClassLoader())) {

			JasperDesign jasperDesign = JRXmlLoader.load(
				reportDesignRetriever.getInputStream());

			validateJasperDesign(jasperDesign);

			return JasperCompileManager.compileReport(jasperDesign);
		}
	}

	@Override
	public void flush() {
	}

	protected void validateJasperDesign(JasperDesign jasperDesign)
		throws JRException {

		String[] imports = jasperDesign.getImports();

		if (imports != null) {
			for (String importName : imports) {
				_validateReportExpression(importName);
			}
		}

		JRExpressionCollector jrExpressionCollector =
			JRExpressionCollector.collector(
				DefaultJasperReportsContext.getInstance(), jasperDesign);

		List<JRExpression> jrExpressions =
			jrExpressionCollector.getExpressions();

		for (JRExpression jrExpression : jrExpressions) {
			_validateReportExpression(jrExpression.getText());
		}
	}

	private void _validateReportExpression(String reportExpression)
		throws JRException {

		if (reportExpression == null) {
			return;
		}

		for (String restrictedClassName : _RESTRICTED_CLASS_NAMES) {
			if (reportExpression.contains(restrictedClassName)) {
				throw new JRException(
					"Restricted class is not allowed in a report expression: " +
						restrictedClassName);
			}
		}
	}

	private static final String[] _RESTRICTED_CLASS_NAMES = {
		"java.lang.Class", "java.lang.ClassLoader", "java.lang.Process",
		"java.lang.ProcessBuilder", "java.lang.Runtime",
		"java.lang.RuntimePermission", "java.lang.SecurityManager",
		"java.lang.Thread", "java.lang.ThreadGroup", "java.lang.ThreadLocal",
		"java.lang.reflect."
	};

}