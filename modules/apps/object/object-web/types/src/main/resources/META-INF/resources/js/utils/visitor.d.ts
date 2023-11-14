/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

declare class TabsVisitor {
	private _layout;
	constructor(layout: ObjectLayout);
	dispose(): void;
	setLayout(layout: ObjectLayout): void;
	mapFields(
		mapper: (field: ObjectLayoutColumn) => void
	): void[][][][] | undefined;
}
declare class BoxesVisitor {
	private _tab;
	constructor(tab: ObjectLayoutTab);
	dispose(): void;
	setTab(tab: ObjectLayoutTab): void;
	mapFields(
		mapper: (field: ObjectLayoutColumn) => void
	): void[][][] | undefined;
}
declare class RowsVisitor {
	private _box;
	constructor(box: ObjectLayoutBox);
	dispose(): void;
	setBox(box: ObjectLayoutBox): void;
	mapFields(
		mapper: (field: ObjectLayoutColumn) => void
	): void[][] | undefined;
}
export {BoxesVisitor, RowsVisitor, TabsVisitor};
