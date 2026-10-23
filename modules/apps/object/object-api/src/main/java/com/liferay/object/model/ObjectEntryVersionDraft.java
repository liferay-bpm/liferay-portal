/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.model;

import com.liferay.portal.kernel.annotation.ImplementationClassName;
import com.liferay.portal.kernel.model.PersistedModel;
import com.liferay.portal.kernel.util.Accessor;

import org.osgi.annotation.versioning.ProviderType;

/**
 * The extended model interface for the ObjectEntryVersionDraft service. Represents a row in the &quot;ObjectEntryVersionDraft&quot; database table, with each column mapped to a property of this class.
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraftModel
 * @generated
 */
@ImplementationClassName(
	"com.liferay.object.model.impl.ObjectEntryVersionDraftImpl"
)
@ProviderType
public interface ObjectEntryVersionDraft
	extends ObjectEntryVersionDraftModel, PersistedModel {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify this interface directly. Add methods to <code>com.liferay.object.model.impl.ObjectEntryVersionDraftImpl</code> and rerun ServiceBuilder to automatically copy the method declarations to this interface.
	 */
	public static final Accessor<ObjectEntryVersionDraft, Long>
		OBJECT_ENTRY_VERSION_DRAFT_ID_ACCESSOR =
			new Accessor<ObjectEntryVersionDraft, Long>() {

				@Override
				public Long get(
					ObjectEntryVersionDraft objectEntryVersionDraft) {

					return objectEntryVersionDraft.
						getObjectEntryVersionDraftId();
				}

				@Override
				public Class<Long> getAttributeClass() {
					return Long.class;
				}

				@Override
				public Class<ObjectEntryVersionDraft> getTypeClass() {
					return ObjectEntryVersionDraft.class;
				}

			};

}
// LIFERAY-SERVICE-BUILDER-HASH:-1539812690