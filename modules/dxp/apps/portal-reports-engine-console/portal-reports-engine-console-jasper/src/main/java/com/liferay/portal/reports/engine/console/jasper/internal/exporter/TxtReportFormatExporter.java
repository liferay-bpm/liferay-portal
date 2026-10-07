/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.reports.engine.console.jasper.internal.exporter;

import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.reports.engine.ReportExportException;
import com.liferay.portal.reports.engine.ReportFormatExporter;
import com.liferay.portal.reports.engine.ReportRequest;
import com.liferay.portal.reports.engine.ReportResultContainer;

import java.util.Map;

import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.JRTextExporter;
import net.sf.jasperreports.export.Exporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleTextReportConfiguration;
import net.sf.jasperreports.export.SimpleWriterExporterOutput;

import org.osgi.service.component.annotations.Component;

/**
 * @author Michael C. Han
 * @author Brian Wing Shun Chan
 */
@Component(property = "reportFormat=txt", service = ReportFormatExporter.class)
public class TxtReportFormatExporter implements ReportFormatExporter {

	@Override
	public void format(
			Object report, ReportRequest reportRequest,
			ReportResultContainer reportResultContainer)
		throws ReportExportException {

		try {
			Exporter exporter = new JRTextExporter();

			Map<String, String> reportParameters =
				reportRequest.getReportParameters();

			SimpleTextReportConfiguration simpleTextReportConfiguration =
				new SimpleTextReportConfiguration();

			simpleTextReportConfiguration.setCharHeight(
				GetterUtil.getFloat(
					reportParameters.get("Character Height"), 11.9F));
			simpleTextReportConfiguration.setCharWidth(
				GetterUtil.getFloat(
					reportParameters.get("Character Width"), 6.55F));

			exporter.setConfiguration(simpleTextReportConfiguration);

			exporter.setExporterInput(
				new SimpleExporterInput((JasperPrint)report));
			exporter.setExporterOutput(
				new SimpleWriterExporterOutput(
					reportResultContainer.getOutputStream(),
					GetterUtil.getString(
						reportParameters.get("Character Encoding"), "UTF-8")));

			exporter.exportReport();
		}
		catch (Exception exception) {
			throw new ReportExportException(exception);
		}
	}

}