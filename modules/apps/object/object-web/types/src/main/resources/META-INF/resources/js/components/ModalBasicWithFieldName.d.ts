/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

interface ModalBasicWithFieldNameProps {
	apiURL: string;
	inputId: string;
	label: string;
	onAfterSubmit: () => void;
	setVisibility: (value: boolean) => void;
}
export declare function ModalBasicWithFieldName({
	apiURL,
	inputId,
	label,
	onAfterSubmit,
	setVisibility,
}: ModalBasicWithFieldNameProps): JSX.Element;
export {};
