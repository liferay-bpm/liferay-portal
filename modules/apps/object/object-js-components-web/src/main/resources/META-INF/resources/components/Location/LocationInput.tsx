/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAutocomplete from '@clayui/autocomplete';
import {ClayInput} from '@clayui/form';
import {debounce} from 'frontend-js-web';
import React, {useEffect, useMemo, useState} from 'react';

import {
	LocationValue,
	MAP_PROVIDER,
	MapProviderKey,
	parseLocationValue,
} from './locationUtil';
import {useLocationMap} from './useLocationMap';

import './LocationInput.scss';

interface LocationInputProps {
	children?: React.ReactNode;
	disabled?: boolean;
	googleMapsAPIKey?: string;
	id: string;
	mapProviderKey?: MapProviderKey;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onLocationChange: (locationValue: LocationValue | null) => void;
	serializedValue?: string;
}

/**
 * Renders the map with its draggable pin. On Google Maps, an address input
 * below the map offers Places suggestions, with `children` placed next to the
 * input. OpenStreetMap shows only the map, since Nominatim forbids
 * autocomplete, so `children` are placed next to the map.
 */
export function LocationInput({
	children,
	disabled,
	googleMapsAPIKey,
	id,
	mapProviderKey = MAP_PROVIDER.openStreetMap,
	onBlur,
	onFocus,
	onLocationChange,
	serializedValue,
}: LocationInputProps) {

	// DDM field ids contain "$", which is not valid in a CSS id selector, and
	// the map looks its container up with querySelector. The map element id is
	// taken from the `id` prop once on mount and never updates, so the map is
	// not destroyed and recreated when the prop changes with the editing
	// language. The address input keeps using the current `id` prop.

	const [mapElementId] = useState(() => `${id}_map`.replace(/[^\w-]/g, '_'));

	const locationValue = useMemo(
		() => parseLocationValue(serializedValue),
		[serializedValue]
	);

	const [address, setAddress] = useState(locationValue?.address ?? '');
	const [suggestions, setSuggestions] = useState<any[]>([]);

	useEffect(() => {
		setAddress(locationValue?.address ?? '');
	}, [locationValue]);

	const debouncedFetchPlaceSuggestions = useMemo(
		() =>
			debounce(async (input: string) => {
				try {
					const {fetchPlaceSuggestions} = await import(
						'@liferay/map-google-maps'
					);

					setSuggestions(await fetchPlaceSuggestions(input));
				}
				catch {
					setSuggestions([]);
				}
			}, 300),
		[]
	);

	const handleAddressChange = (newAddress: string) => {
		setAddress(newAddress);

		if (!newAddress) {
			setSuggestions([]);

			onLocationChange(null);

			return;
		}

		debouncedFetchPlaceSuggestions(newAddress);
	};

	const handlePositionChange = (newLocationValue: LocationValue) => {
		setAddress(newLocationValue.address);

		onLocationChange(newLocationValue);
	};

	const {setPosition} = useLocationMap({
		disabled,
		googleMapsAPIKey,
		mapElementId,
		mapProviderKey,
		onPositionChange: handlePositionChange,
		value: locationValue,
	});

	const handleSuggestionClick = async (
		event: React.MouseEvent,
		placePrediction: any
	) => {

		// Keeps Clay from writing the suggestion text into the input, which
		// would fetch suggestions for it again. The address comes from the
		// picked place instead.

		event.preventDefault();

		setSuggestions([]);

		const {fetchPlace} = await import('@liferay/map-google-maps');

		const position = await fetchPlace(placePrediction);

		setPosition(position);
	};

	const hasAddressInput = mapProviderKey === MAP_PROVIDER.googleMaps;

	return (
		<>
			<ClayInput.Group className="align-items-start">
				<ClayInput.GroupItem>
					<div
						className="object-field__location-map w-100"
						id={mapElementId}
					/>
				</ClayInput.GroupItem>

				{!hasAddressInput && children}
			</ClayInput.Group>

			{hasAddressInput && (
				<ClayInput.Group className="mt-3">
					<ClayInput.GroupItem>
						<ClayAutocomplete
							active={!!suggestions.length}
							disabled={disabled}
							id={id}
							items={suggestions}
							onActiveChange={(active: boolean) => {
								if (!active) {
									setSuggestions([]);
								}
							}}
							onBlur={onBlur}
							onChange={handleAddressChange}
							onFocus={onFocus}
							onItemsChange={(newSuggestions: any[] | null) =>
								setSuggestions(newSuggestions ?? [])
							}
							value={address}
						>
							{(placePrediction: any) => (
								<ClayAutocomplete.Item
									key={placePrediction.placeId}
									onClick={(event: React.MouseEvent) =>
										handleSuggestionClick(
											event,
											placePrediction
										)
									}
								>
									{String(placePrediction.text)}
								</ClayAutocomplete.Item>
							)}
						</ClayAutocomplete>
					</ClayInput.GroupItem>

					{children}
				</ClayInput.Group>
			)}
		</>
	);
}
