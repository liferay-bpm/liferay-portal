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

package com.liferay.notification.internal.configuration;

import aQute.bnd.annotation.metatype.Meta;

/**
 * @author Gustavo Lima
 */
@Meta.OCD(
	id = "com.liferay.notification.internal.configuration.NotificationQueueEntryConfiguration",
	localization = "content/Language",
	name = "notification-queue-entry-configuration-name"
)
public interface NotificationQueueEntryConfiguration {

	@Meta.AD(
		deflt = "15", name = "notification-queue-entry-check-interval",
		required = false
	)
	public int checkInterval();

	@Meta.AD(
		deflt = "43200", name = "notification-queue-entry-delete-interval",
		required = false
	)
	public int deleteInterval();

}