/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.definition.builder;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectDefinitionSetting;
import com.liferay.object.service.ObjectDefinitionLocalServiceUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.User;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author Jhosseph Gonzalez
 */
public class ObjectDefinitionBuilder {

	public ObjectDefinition build() throws PortalException {
		return objectDefinition;
	}

	public ObjectDefinitionBuilder className(String className) {
		objectDefinition.setClassName(className);

		return this;
	}

	public ObjectDefinitionBuilder enableComments(boolean enableComments) {
		objectDefinition.setEnableComments(enableComments);

		return this;
	}

	public ObjectDefinitionBuilder enableFormContainer(
		boolean enableFormContainer) {

		objectDefinition.setEnableFormContainer(enableFormContainer);

		return this;
	}

	public ObjectDefinitionBuilder enableFriendlyURLCustomization(
		boolean enableFriendlyURLCustomization) {

		objectDefinition.setEnableFriendlyURLCustomization(
			enableFriendlyURLCustomization);

		return this;
	}

	public ObjectDefinitionBuilder enableIndexSearch(
		boolean enableIndexSearch) {

		objectDefinition.setEnableIndexSearch(enableIndexSearch);

		return this;
	}

	public ObjectDefinitionBuilder enableLocalization(
		boolean enableLocalization) {

		objectDefinition.setEnableLocalization(enableLocalization);

		return this;
	}

	public ObjectDefinitionBuilder enableObjectEntryDraft(
		boolean enableObjectEntryDraft) {

		objectDefinition.setEnableObjectEntryDraft(enableObjectEntryDraft);

		return this;
	}

	public ObjectDefinitionBuilder enableObjectEntrySchedule(
		boolean enableObjectEntrySchedule) {

		objectDefinition.setEnableObjectEntrySchedule(
			enableObjectEntrySchedule);

		return this;
	}

	public ObjectDefinitionBuilder enableObjectEntrySubscription(
		boolean enableObjectEntrySubscription) {

		objectDefinition.setEnableObjectEntrySubscription(
			enableObjectEntrySubscription);

		return this;
	}

	public ObjectDefinitionBuilder enableObjectEntryVersioning(
		boolean enableObjectEntryVersioning) {

		objectDefinition.setEnableObjectEntryVersioning(
			enableObjectEntryVersioning);

		return this;
	}

	public ObjectDefinitionBuilder friendlyURLSeparator(
		String friendlyURLSeparator) {

		objectDefinition.setFriendlyURLSeparator(friendlyURLSeparator);

		return this;
	}

	public ObjectDefinitionBuilder labelMap(Map<Locale, String> labelMap) {
		objectDefinition.setLabelMap(labelMap);

		return this;
	}

	public ObjectDefinitionBuilder name(String name) {
		objectDefinition.setName(name);

		return this;
	}

	public ObjectDefinitionBuilder objectDefinitionSettings(
		List<ObjectDefinitionSetting> objectDefinitionSettings) {

		objectDefinition.setObjectDefinitionSettings(objectDefinitionSettings);

		return this;
	}

	public ObjectDefinitionBuilder objectFolderId(long objectFolderId) {
		objectDefinition.setObjectFolderId(objectFolderId);

		return this;
	}

	public ObjectDefinitionBuilder panelAppOrder(String panelAppOrder) {
		objectDefinition.setPanelAppOrder(panelAppOrder);

		return this;
	}

	public ObjectDefinitionBuilder panelCategoryKey(String panelCategoryKey) {
		objectDefinition.setPanelAppOrder(panelCategoryKey);

		return this;
	}

	public ObjectDefinitionBuilder pluralLabelMap(
		Map<Locale, String> pluralLabelMap) {

		objectDefinition.setPluralLabelMap(pluralLabelMap);

		return this;
	}

	public ObjectDefinitionBuilder portlet(boolean portlet) {
		objectDefinition.setPortlet(portlet);

		return this;
	}

	public ObjectDefinitionBuilder scope(String scope) {
		objectDefinition.setScope(scope);

		return this;
	}

	public ObjectDefinitionBuilder storageType(String storageType) {
		objectDefinition.setStorageType(storageType);

		return this;
	}

	public ObjectDefinitionBuilder userId(long userId) {
		objectDefinition.setUserId(userId);

		return this;
	}

	protected User contextUser;
	protected final ObjectDefinition objectDefinition =
		ObjectDefinitionLocalServiceUtil.createObjectDefinition(0);

}