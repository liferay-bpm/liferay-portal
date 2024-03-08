/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/// <reference types="react" />

import {GroovyScriptUseItem} from './ScriptManagementContainer';
import './GroovyScriptUsesModal.scss';
interface GroovyScriptUsesModalProps {
	groovyScriptUsesItems: GroovyScriptUseItem[];
	handleOnClose: (value: boolean) => void;
}
export declare function GroovyScriptUsesModal({
	groovyScriptUsesItems,
	handleOnClose,
}: GroovyScriptUsesModalProps): JSX.Element;
export {};
