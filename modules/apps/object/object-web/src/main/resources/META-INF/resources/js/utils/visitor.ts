/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

class TabsVisitor {
	private _layout: ObjectLayout | null = null;

	constructor(layout: ObjectLayout) {
		this.setLayout(layout);
	}

	dispose() {
		this._layout = null;
	}

	setLayout(layout: ObjectLayout) {
		this._layout = {...layout};
	}

	mapFields(mapper: (field: ObjectLayoutColumn) => void) {
		return this._layout?.objectLayoutTabs.map(
			({objectLayoutBoxes}: ObjectLayoutTab) => {
				return objectLayoutBoxes.map(({objectLayoutRows}) => {
					return objectLayoutRows.map(({objectLayoutColumns}) => {
						return objectLayoutColumns.map((field) => {
							return field && mapper(field);
						});
					});
				});
			}
		);
	}
}

class BoxesVisitor {
	private _tab: ObjectLayoutTab | null = null;

	constructor(tab: ObjectLayoutTab) {
		this.setTab(tab);
	}

	dispose() {
		this._tab = null;
	}

	setTab(tab: ObjectLayoutTab) {
		this._tab = {...tab};
	}

	mapFields(mapper: (field: ObjectLayoutColumn) => void) {
		return this._tab?.objectLayoutBoxes.map(
			({objectLayoutRows}: ObjectLayoutBox) => {
				return objectLayoutRows.map(({objectLayoutColumns}) => {
					return objectLayoutColumns.map((field) => {
						return field && mapper(field);
					});
				});
			}
		);
	}
}

class RowsVisitor {
	private _box: ObjectLayoutBox | null = null;

	constructor(box: ObjectLayoutBox) {
		this.setBox(box);
	}

	dispose() {
		this._box = null;
	}

	setBox(box: ObjectLayoutBox) {
		this._box = {...box};
	}

	mapFields(mapper: (field: ObjectLayoutColumn) => void) {
		return this._box?.objectLayoutRows.map(
			({objectLayoutColumns}: ObjectLayoutRow) => {
				return objectLayoutColumns.map((field) => {
					return field && mapper(field);
				});
			}
		);
	}
}

export {BoxesVisitor, RowsVisitor, TabsVisitor};
