/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {act, render} from '@testing-library/react';
import React from 'react';

import Attachment from '../../js/Attachment/Attachment';

jest.mock('data-engine-js-components-web', () => ({
	...(jest.requireActual('data-engine-js-components-web') as object),
	useConfig: () => ({
		portletNamespace: '_portletNamespace1_',
	}),
}));

jest.mock('dynamic-data-mapping-form-field-type/api', () => {
	const React = require('react');

	return {
		ReactFieldBase: ({children}: any) =>
			React.createElement('div', null, children),
	};
});

const defaultDetach = (Liferay.detach as jest.Mock).getMockImplementation();

const eventHandlers = new Map<string, Array<() => void>>();

/**
 * Renders an Attachment field holding an uploaded file that is not saved yet.
 */
function AttachmentField({fileEntryId}: {fileEntryId: string}) {
	return (
		<Attachment
			acceptedFileExtensions="pdf"
			attachment={null}
			deleteURL={`/delete/${fileEntryId}`}
			error={{}}
			fieldName="attachment"
			fileEntryProperties={{
				contentURL: '',
				fileEntryId,
				title: `${fileEntryId}.pdf`,
			}}
			fileSource="userComputer"
			handleDelete={() => {}}
			localizedObjectField={false}
			maximumFileSize={100}
			onAttachmentChange={() => {}}
			onChange={() => {}}
			overallMaximumUploadRequestSize={100}
			readOnly={false}
			setError={() => {}}
			tip=""
			url=""
			value={fileEntryId}
		/>
	);
}

/**
 * Returns the IDs of the file entries deleted through the delete URL.
 */
function getDeletedFileEntryIds() {
	return (fetch as jest.Mock).mock.calls
		.map(([resource]) => String(resource))
		.filter((resource) => resource.includes('/delete/'))
		.map((resource) => resource.split('/delete/')[1]);
}

function navigateToAnotherPage() {
	Liferay.fire('beforeNavigate');
}

function unloadPage() {
	window.dispatchEvent(new Event('beforeunload'));
}

describe('Attachment', () => {
	beforeEach(() => {
		(fetch as jest.Mock).mockResolvedValue({
			json: () => Promise.resolve({items: []}),
		});

		// Match the portal, where detaching without a handler removes every
		// handler of the event.

		(Liferay.detach as jest.Mock).mockImplementation(
			(name: string, handler?: () => void) => {
				eventHandlers.set(
					name,
					handler
						? (eventHandlers.get(name) ?? []).filter(
								(eventHandler) => eventHandler !== handler
							)
						: []
				);
			}
		);
		(Liferay.fire as jest.Mock).mockImplementation((name: string) => {
			(eventHandlers.get(name) ?? []).forEach((eventHandler) =>
				eventHandler()
			);
		});
		(Liferay.on as jest.Mock).mockImplementation(
			(name: string, handler: () => void) => {
				eventHandlers.set(name, [
					...(eventHandlers.get(name) ?? []),
					handler,
				]);
			}
		);
	});

	afterEach(() => {
		eventHandlers.clear();

		(Liferay.detach as jest.Mock).mockImplementation(defaultDetach);
		(Liferay.fire as jest.Mock).mockReset();
		(Liferay.on as jest.Mock).mockReset();
	});

	it('deletes the pending upload of every Attachment field when the page unloads', () => {
		render(
			<>
				<AttachmentField fileEntryId="1" />
				<AttachmentField fileEntryId="2" />
			</>
		);

		unloadPage();

		expect(getDeletedFileEntryIds()).toEqual(['1', '2']);
	});

	it('deletes the pending upload when the user navigates to another page', () => {
		render(<AttachmentField fileEntryId="1" />);

		act(() => {
			navigateToAnotherPage();
		});

		expect(getDeletedFileEntryIds()).toEqual(['1']);
	});

	it('keeps the submitted upload of an Attachment field when another field unmounts', () => {
		const {rerender} = render(
			<>
				<AttachmentField fileEntryId="1" key="1" />
				<AttachmentField fileEntryId="2" key="2" />
			</>
		);

		rerender(
			<>
				<AttachmentField fileEntryId="2" key="2" />
			</>
		);

		act(() => {
			Liferay.fire('_portletNamespace1_submitButtonClicked');
		});

		unloadPage();

		expect(getDeletedFileEntryIds()).toEqual([]);
	});

	it('keeps the upload when its own widget submits its entry before the user navigates to another page', () => {
		render(<AttachmentField fileEntryId="1" />);

		act(() => {
			Liferay.fire('_portletNamespace1_submitButtonClicked');

			navigateToAnotherPage();
		});

		expect(getDeletedFileEntryIds()).toEqual([]);
	});
});
