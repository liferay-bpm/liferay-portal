/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.reports.engine.console.jasper.internal.exporter;

import com.liferay.portal.reports.engine.ReportExportException;
import com.liferay.portal.reports.engine.ReportFormatExporter;
import com.liferay.portal.reports.engine.ReportRequest;
import com.liferay.portal.reports.engine.ReportResultContainer;

import java.io.OutputStream;

import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.export.Exporter;
import net.sf.jasperreports.export.ExporterOutput;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;

/**
 * @author Michael C. Han
 * @author Brian Wing Shun Chan
 */
public abstract class BaseReportFormatExporter implements ReportFormatExporter {

	@Override
	public void format(
			Object report, ReportRequest reportRequest,
			ReportResultContainer reportResultContainer)
		throws ReportExportException {

		Exporter exporter = getExporter();

		try {
			exporter.setExporterInput(
				new SimpleExporterInput((JasperPrint)report));
			exporter.setExporterOutput(
				getExporterOutput(reportResultContainer.getOutputStream()));

			exporter.exportReport();
		}
		catch (Exception exception) {
			throw new ReportExportException(
				"Unable to export report using " + exporter.getClass(),
				exception);
		}
	}

	protected abstract Exporter getExporter();

	protected ExporterOutput getExporterOutput(OutputStream outputStream) {
		return new SimpleOutputStreamExporterOutput(outputStream);
	}

}