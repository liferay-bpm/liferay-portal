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

package com.liferay.object.internal.modifiable.system;

import com.liferay.object.modifiable.system.ModifiableSystemObjectDefinitionManager;

import org.osgi.service.component.annotations.Component;

/**
 * @author Marco Leo
 * @author Gabriel Albuquerque
 */
@Component(
	service = BookmarksEntryModifiableSystemObjectDefinitionManager.class
)
public class BookmarksEntryModifiableSystemObjectDefinitionManager
	implements ModifiableSystemObjectDefinitionManager {

	@Override
	public String getResourcePath() {
		return "com/liferay/object/internal/system/dependencies" +
			"/bookmarks-entry-modifiable-system-object-definition.json";
	}

}