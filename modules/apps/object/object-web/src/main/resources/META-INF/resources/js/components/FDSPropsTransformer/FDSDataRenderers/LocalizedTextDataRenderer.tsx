/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

interface LocalizedTextDataRendererProps {
	itemData: {[key: string]: any};
	options: {fieldName: string};
}

export default function LocalizedTextDataRenderer({
	itemData,
	options,
}: LocalizedTextDataRendererProps) {

	// Render the value the REST layer already resolved for the request locale
	// (which falls back to the site default language and then to nothing),
	// rather than letting the data set fall back to any available translation.

	return itemData?.[options?.fieldName] ?? '';
}
