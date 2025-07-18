/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom/extend-expect';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {SubscriptionsContainer} from '../../components/ObjectDetails/SubscriptionsContainer';

describe('The SubscriptionsContainer component should', () => {
	const notificationButton = 'go-to-notification-templates';
	const subscriptionsDescription =
		'when-enabled-this-feature-notifies-users-who-are-subscribed-to-entries-or-folders-whenever-content-is-added-updated-deleted-or-moved';

	it('does not show description and notification button if enableObjectEntrySubscription is false', () => {
		render(
			<SubscriptionsContainer
				setValues={jest.fn()}
				values={{enableObjectEntrySubscription: false}}
			/>
		);

		const description = screen.queryByText(subscriptionsDescription);

		expect(description).not.toBeInTheDocument();

		const button = screen.queryByText(notificationButton);

		expect(button).not.toBeInTheDocument();
	});

	it('shows description and notification button if enableObjectEntrySubscription is true', () => {
		render(
			<SubscriptionsContainer
				setValues={jest.fn()}
				values={{enableObjectEntrySubscription: true}}
			/>
		);

		expect(screen.getByText(subscriptionsDescription)).toBeVisible();

		expect(
			screen.getByRole('button', {name: notificationButton})
		).toBeVisible();
	});
});
