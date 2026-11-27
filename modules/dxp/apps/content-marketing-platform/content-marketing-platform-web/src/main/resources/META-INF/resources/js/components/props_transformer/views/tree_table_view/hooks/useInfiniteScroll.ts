/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useEffect, useRef, useState} from 'react';

/**
 * Calls `onLoadMore` when the returned sentinel scrolls into view, until
 * there is nothing more to load or a request fails. A failed request stops
 * the scroll until the items change.
 */
export default function useInfiniteScroll({
	hasMore,
	items,
	onLoadMore,
}: {
	hasMore: boolean;
	items: unknown[];
	onLoadMore: () => Promise<void>;
}) {
	const [failed, setFailed] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setFailed(false);
	}, [items]);

	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasMore || failed || loading) {
			return;
		}

		const intersectionObserver = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) {
				return;
			}

			intersectionObserver.disconnect();

			setLoading(true);

			onLoadMore()
				.catch(() => setFailed(true))
				.finally(() => setLoading(false));
		});

		intersectionObserver.observe(sentinel);

		return () => intersectionObserver.disconnect();
	}, [failed, hasMore, loading, onLoadMore]);

	return {loading, sentinelRef};
}
