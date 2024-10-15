/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

const keepCheckingAfterFound = async ({duration, selector}) => {
	let isElementAttached = !!document.querySelector(selector);

	if (!isElementAttached) {
		return false;
	}

	const startTime = Date.now();

	const checkForElement = async (): Promise<boolean> => {
		const elapsedTime = Date.now() - startTime;

		isElementAttached = !!document.querySelector(selector);

		if (elapsedTime < duration && isElementAttached) {
			await new Promise((resolve) => setTimeout(resolve, 50));

			checkForElement();
		}

		return isElementAttached;
	};

	return checkForElement();
};

export default keepCheckingAfterFound;
