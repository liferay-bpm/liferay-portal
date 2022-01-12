/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import React, {createContext, useReducer} from 'react';

import {normalizeLanguageId} from '../../utils/string';

type TName = {
	[key: string]: string;
};

export type TObjectField = {
	checked?: boolean;
	filtered?: boolean | undefined;
	id: number;
	indexed: boolean;
	indexedAsKeyword: boolean;
	indexedLanguageId: string;
	inLayout?: boolean; // eslint-disable-line @typescript-eslint/member-ordering
	label: TName;
	listTypeDefinitionId: boolean;
	name: string;
	required: boolean;
	type: string;
};

type TObjectFieldName = {
	objectFieldName: string;
};

export type TObjectView = {
	defaultObjectView: boolean;
	name: TName;
	objectViewColumn: TObjectFieldName[];
};

type TState = {
	isViewOnly: boolean;
	objectFields: TObjectField[];
	objectView: TObjectView;
	objectViewId: string;
};

type TAction = {
	payload: {[key: string]: any};
	type: keyof typeof TYPES;
};

interface IViewContextProps extends Array<TState | Function> {
	0: typeof initialState;
	1: React.Dispatch<React.ReducerAction<React.Reducer<TState, TAction>>>;
}

const ViewContext = createContext({} as IViewContextProps);

export enum TYPES {
	ADD_OBJECT_FIELDS = 'ADD_OBJECT_FIELDS',
	ADD_OBJECT_VIEW = 'ADD_OBJECT_VIEW',
	ADD_OBJECT_CUSTOM_VIEW_FIELD = 'ADD_OBJECT_CUSTOM_VIEW_FIELD',
	ADD_OBJECT_VIEW_COLUMN = 'ADD_OBJECT_VIEW_COLUMN',
	DELETE_OBJECT_VIEW_COLUMN = 'DELETE_OBJECT_VIEW_COLUMN',
	DELETE_OBJECT_CUSTOM_VIEW_FIELD = 'DELETE_OBJECT_CUSTOM_VIEW_FIELD',
	SET_OBJECT_VIEW_AS_DEFAULT = 'SET_OBJECT_VIEW_AS_DEFAULT',
	SET_OBJECT_FIELD_AS_CHECKED = 'SET_OBJECT_FIELD_AS_CHECKED',
}

const initialState = {
	objectFields: [] as TObjectField[],
	objectView: {} as TObjectView,
} as TState;

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();

const viewReducer = (state: TState, action: TAction) => {
	switch (action.type) {
		case TYPES.ADD_OBJECT_VIEW: {
			const {objectView} = action.payload;

			return {
				...state,
				objectView,
			};
		}
		case TYPES.ADD_OBJECT_VIEW_COLUMN: {
			const {filteredItems} = action.payload;

			const viewColumn: any = [];

			filteredItems.map((field: TObjectField) => {
				if (field.checked === true) {
					viewColumn.push({
						objectFieldName: field.label[defaultLanguageId],
					});
				}
			});

			const newObjectView = {
				...state.objectView,
				objectViewColumn: viewColumn,
			};

			return {
				...state,
				objectView: newObjectView,
			};
		}
		case TYPES.ADD_OBJECT_FIELDS: {
			const {objectFields} = action.payload;

			return {
				...state,
				objectFields,
			};
		}
		case TYPES.DELETE_OBJECT_VIEW_COLUMN: {
			const {objectFieldName} = action.payload;

			const newState = {...state};

			const viewColumn = newState.objectView?.objectViewColumn.filter(
				(viewColumn) => viewColumn.objectFieldName !== objectFieldName
			);

			const newObjectView = {
				...state.objectView,
				objectViewColumn: viewColumn,
			};

			return {
				...state,
				objectView: newObjectView,
			};
		}
		case TYPES.SET_OBJECT_FIELD_AS_CHECKED: {
		}
		case TYPES.SET_OBJECT_VIEW_AS_DEFAULT: {
			return state;
		}
		default:
			return state;
	}
};

interface IViewContextProviderProps extends React.HTMLAttributes<HTMLElement> {
	value: {
		isViewOnly: boolean;
		objectViewId: string;
	};
}

export function ViewContextProvider({
	children,
	value,
}: IViewContextProviderProps) {
	const [state, dispatch] = useReducer<React.Reducer<TState, TAction>>(
		viewReducer,
		{
			...initialState,
			...value,
		}
	);

	return (
		<ViewContext.Provider value={[state, dispatch]}>
			{children}
		</ViewContext.Provider>
	);
}

export default ViewContext;
