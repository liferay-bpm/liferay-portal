/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayLink from '@clayui/link';
import {isCtrlOrMeta} from '@liferay/layout-js-components-web';
import {sub} from 'frontend-js-web';
import React, {useEffect, useId, useState} from 'react';

import Toolbar from '../../common/components/Toolbar';

export default function ProjectEditorToolbar({backURL}: {backURL: string}) {
	const [formId, setFormId] = useState<string | undefined>();

	const submitLabelId = useId();
	const submitTitle = getSubmitTitle(
		sub(Liferay.Language.get('publish-x'), Liferay.Language.get('project'))
	);

	useEffect(() => {
		let form = document.querySelector('.lfr-main-form-container');

		if (!form) {
			form = document.querySelector('.lfr-layout-structure-item-form');
		}

		if (form) {
			setFormId(form.id);

			const handlePublishShortcut = (event: KeyboardEvent) => {
				if (
					event.altKey &&
					event.key === 'Enter' &&
					isCtrlOrMeta(event)
				) {
					(form as HTMLFormElement).submit();
				}
			};

			window.addEventListener('keydown', handlePublishShortcut);

			return () =>
				window.removeEventListener('keydown', handlePublishShortcut);
		}
	}, []);

	return (
		<Toolbar
			backURL={backURL}
			className="content-editor__toolbar position-fixed"
			title={Liferay.Language.get('new-project')}
		>
			<Toolbar.Item>
				<ClayLink
					aria-label={Liferay.Language.get('cancel')}
					borderless
					button
					displayType="secondary"
					href={backURL}
					small
				>
					{Liferay.Language.get('cancel')}
				</ClayLink>
			</Toolbar.Item>

			<Toolbar.Item>
				<ClayButton
					aria-labelledby={submitLabelId}
					data-title={submitTitle}
					data-title-set-as-html
					form={formId}
					size="sm"
					type="submit"
				>
					{Liferay.Language.get('publish')}
				</ClayButton>

				<span
					className="sr-only"
					dangerouslySetInnerHTML={{__html: submitTitle}}
					id={submitLabelId}
				/>

				<ClayInput
					form={formId}
					name="redirect"
					type="hidden"
					value={backURL}
				/>
			</Toolbar.Item>
		</Toolbar>
	);
}

function getSubmitTitle(title: string) {
	const isMac = Liferay.Browser?.isMac();

	return `
        <span class="d-block">
            ${title}
        </span>
        <kbd class="c-kbd c-kbd-dark mt-1">
            <kbd class="c-kbd">${isMac ? '⌘' : 'Ctrl'}</kbd>
            <span class="c-kbd-separator"> + </span>
            <kbd class="c-kbd">${isMac ? '⌥' : 'Alt'}</kbd>
            <span class="c-kbd-separator"> + </span>
            <kbd class="c-kbd">${Liferay.Language.get('enter')}</kbd>
        </kbd>`
		.replaceAll('\n', '')
		.replaceAll('\t', '');
}
