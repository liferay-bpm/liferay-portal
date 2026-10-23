/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.persistence;

import com.liferay.object.exception.NoSuchObjectEntryVersionDraftException;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.portal.kernel.service.persistence.BasePersistence;

import org.osgi.annotation.versioning.ProviderType;

/**
 * The persistence interface for the object entry version draft service.
 *
 * <p>
 * Caching information and settings can be found in <code>portal.properties</code>
 * </p>
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraftUtil
 * @generated
 */
@ProviderType
public interface ObjectEntryVersionDraftPersistence
	extends BasePersistence<ObjectEntryVersionDraft> {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify or reference this interface directly. Always use {@link ObjectEntryVersionDraftUtil} to access the object entry version draft persistence. Modify <code>service.xml</code> and rerun ServiceBuilder to regenerate this interface.
	 */

	/**
	 * Returns an ordered range of all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	public java.util.List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId, int start, int end,
		com.liferay.portal.kernel.util.OrderByComparator
			<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache);

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	public ObjectEntryVersionDraft findByObjectDefinitionId_First(
			long objectDefinitionId,
			com.liferay.portal.kernel.util.OrderByComparator
				<ObjectEntryVersionDraft> orderByComparator)
		throws NoSuchObjectEntryVersionDraftException;

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	public ObjectEntryVersionDraft fetchByObjectDefinitionId_First(
		long objectDefinitionId,
		com.liferay.portal.kernel.util.OrderByComparator
			<ObjectEntryVersionDraft> orderByComparator);

	/**
	 * Removes all the object entry version drafts where objectDefinitionId = &#63; from the database.
	 *
	 * @param objectDefinitionId the object definition ID
	 */
	public void removeByObjectDefinitionId(long objectDefinitionId);

	/**
	 * Returns the number of object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @return the number of matching object entry version drafts
	 */
	public int countByObjectDefinitionId(long objectDefinitionId);

	/**
	 * Returns an ordered range of all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectEntryId the object entry ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	public java.util.List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end,
		com.liferay.portal.kernel.util.OrderByComparator
			<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache);

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	public ObjectEntryVersionDraft findByObjectEntryId_First(
			long objectEntryId,
			com.liferay.portal.kernel.util.OrderByComparator
				<ObjectEntryVersionDraft> orderByComparator)
		throws NoSuchObjectEntryVersionDraftException;

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	public ObjectEntryVersionDraft fetchByObjectEntryId_First(
		long objectEntryId,
		com.liferay.portal.kernel.util.OrderByComparator
			<ObjectEntryVersionDraft> orderByComparator);

	/**
	 * Removes all the object entry version drafts where objectEntryId = &#63; from the database.
	 *
	 * @param objectEntryId the object entry ID
	 */
	public void removeByObjectEntryId(long objectEntryId);

	/**
	 * Returns the number of object entry version drafts where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @return the number of matching object entry version drafts
	 */
	public int countByObjectEntryId(long objectEntryId);

	/**
	 * Creates a new object entry version draft with the primary key. Does not add the object entry version draft to the database.
	 *
	 * @param objectEntryVersionDraftId the primary key for the new object entry version draft
	 * @return the new object entry version draft
	 */
	public ObjectEntryVersionDraft create(long objectEntryVersionDraftId);

	/**
	 * Removes the object entry version draft with the primary key from the database. Also notifies the appropriate model listeners.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft that was removed
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	public ObjectEntryVersionDraft remove(long objectEntryVersionDraftId)
		throws NoSuchObjectEntryVersionDraftException;

	public ObjectEntryVersionDraft updateImpl(
		ObjectEntryVersionDraft objectEntryVersionDraft);

	/**
	 * Returns the object entry version draft with the primary key or throws a <code>NoSuchObjectEntryVersionDraftException</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	public ObjectEntryVersionDraft findByPrimaryKey(
			long objectEntryVersionDraftId)
		throws NoSuchObjectEntryVersionDraftException;

	/**
	 * Returns the object entry version draft with the primary key or returns <code>null</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft, or <code>null</code> if a object entry version draft with the primary key could not be found
	 */
	public ObjectEntryVersionDraft fetchByPrimaryKey(
		long objectEntryVersionDraftId);

	/**
	 * Returns all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @return the matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft>
		findByObjectDefinitionId(long objectDefinitionId) {

		return findByObjectDefinitionId(
			objectDefinitionId,
			com.liferay.portal.kernel.dao.orm.QueryUtil.ALL_POS,
			com.liferay.portal.kernel.dao.orm.QueryUtil.ALL_POS, null, true);
	}

	/**
	 * Returns a range of all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @return the range of matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft>
		findByObjectDefinitionId(long objectDefinitionId, int start, int end) {

		return findByObjectDefinitionId(
			objectDefinitionId, start, end, null, true);
	}

	/**
	 * Returns an ordered range of all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @return the ordered range of matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft>
		findByObjectDefinitionId(
			long objectDefinitionId, int start, int end,
			com.liferay.portal.kernel.util.OrderByComparator
				<ObjectEntryVersionDraft> orderByComparator) {

		return findByObjectDefinitionId(
			objectDefinitionId, start, end, orderByComparator, true);
	}

	/**
	 * Returns all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @return the matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId) {

		return findByObjectEntryId(
			objectEntryId, com.liferay.portal.kernel.dao.orm.QueryUtil.ALL_POS,
			com.liferay.portal.kernel.dao.orm.QueryUtil.ALL_POS, null, true);
	}

	/**
	 * Returns a range of all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectEntryId the object entry ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @return the range of matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end) {

		return findByObjectEntryId(objectEntryId, start, end, null, true);
	}

	/**
	 * Returns an ordered range of all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectEntryId the object entry ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @return the ordered range of matching object entry version drafts
	 */
	public default java.util.List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end,
		com.liferay.portal.kernel.util.OrderByComparator
			<ObjectEntryVersionDraft> orderByComparator) {

		return findByObjectEntryId(
			objectEntryId, start, end, orderByComparator, true);
	}

}
// LIFERAY-SERVICE-BUILDER-HASH:1054891303