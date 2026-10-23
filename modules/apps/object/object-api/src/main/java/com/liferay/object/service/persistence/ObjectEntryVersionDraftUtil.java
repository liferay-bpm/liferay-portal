/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.persistence;

import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.portal.kernel.dao.orm.DynamicQuery;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.util.OrderByComparator;

import java.io.Serializable;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The persistence utility for the object entry version draft service. This utility wraps <code>com.liferay.object.service.persistence.impl.ObjectEntryVersionDraftPersistenceImpl</code> and provides direct access to the database for CRUD operations. This utility should only be used by the service layer, as it must operate within a transaction. Never access this utility in a JSP, controller, model, or other front-end class.
 *
 * <p>
 * Caching information and settings can be found in <code>portal.properties</code>
 * </p>
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraftPersistence
 * @generated
 */
public class ObjectEntryVersionDraftUtil {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify this class directly. Modify <code>service.xml</code> and rerun ServiceBuilder to regenerate this class.
	 */

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#cacheResult(List)
	 */
	public static void cacheResult(
		List<ObjectEntryVersionDraft> objectEntryVersionDrafts) {

		getPersistence().cacheResult(objectEntryVersionDrafts);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#cacheResult(com.liferay.portal.kernel.model.BaseModel)
	 */
	public static void cacheResult(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		getPersistence().cacheResult(objectEntryVersionDraft);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#clearCache()
	 */
	public static void clearCache() {
		getPersistence().clearCache();
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#clearCache(com.liferay.portal.kernel.model.BaseModel)
	 */
	public static void clearCache(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		getPersistence().clearCache(objectEntryVersionDraft);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#countWithDynamicQuery(DynamicQuery)
	 */
	public static long countWithDynamicQuery(DynamicQuery dynamicQuery) {
		return getPersistence().countWithDynamicQuery(dynamicQuery);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#fetchByPrimaryKeys(Set)
	 */
	public static Map<Serializable, ObjectEntryVersionDraft> fetchByPrimaryKeys(
		Set<Serializable> primaryKeys) {

		return getPersistence().fetchByPrimaryKeys(primaryKeys);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#findWithDynamicQuery(DynamicQuery)
	 */
	public static List<ObjectEntryVersionDraft> findWithDynamicQuery(
		DynamicQuery dynamicQuery) {

		return getPersistence().findWithDynamicQuery(dynamicQuery);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#findWithDynamicQuery(DynamicQuery, int, int)
	 */
	public static List<ObjectEntryVersionDraft> findWithDynamicQuery(
		DynamicQuery dynamicQuery, int start, int end) {

		return getPersistence().findWithDynamicQuery(dynamicQuery, start, end);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#findWithDynamicQuery(DynamicQuery, int, int, OrderByComparator)
	 */
	public static List<ObjectEntryVersionDraft> findWithDynamicQuery(
		DynamicQuery dynamicQuery, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return getPersistence().findWithDynamicQuery(
			dynamicQuery, start, end, orderByComparator);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#update(com.liferay.portal.kernel.model.BaseModel)
	 */
	public static ObjectEntryVersionDraft update(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		return getPersistence().update(objectEntryVersionDraft);
	}

	/**
	 * @see com.liferay.portal.kernel.service.persistence.BasePersistence#update(com.liferay.portal.kernel.model.BaseModel, ServiceContext)
	 */
	public static ObjectEntryVersionDraft update(
		ObjectEntryVersionDraft objectEntryVersionDraft,
		ServiceContext serviceContext) {

		return getPersistence().update(objectEntryVersionDraft, serviceContext);
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
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	public static List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache) {

		return getPersistence().findByObjectDefinitionId(
			objectDefinitionId, start, end, orderByComparator, useFinderCache);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	public static ObjectEntryVersionDraft findByObjectDefinitionId_First(
			long objectDefinitionId,
			OrderByComparator<ObjectEntryVersionDraft> orderByComparator)
		throws com.liferay.object.exception.
			NoSuchObjectEntryVersionDraftException {

		return getPersistence().findByObjectDefinitionId_First(
			objectDefinitionId, orderByComparator);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	public static ObjectEntryVersionDraft fetchByObjectDefinitionId_First(
		long objectDefinitionId,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return getPersistence().fetchByObjectDefinitionId_First(
			objectDefinitionId, orderByComparator);
	}

	/**
	 * Removes all the object entry version drafts where objectDefinitionId = &#63; from the database.
	 *
	 * @param objectDefinitionId the object definition ID
	 */
	public static void removeByObjectDefinitionId(long objectDefinitionId) {
		getPersistence().removeByObjectDefinitionId(objectDefinitionId);
	}

	/**
	 * Returns the number of object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @return the number of matching object entry version drafts
	 */
	public static int countByObjectDefinitionId(long objectDefinitionId) {
		return getPersistence().countByObjectDefinitionId(objectDefinitionId);
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
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	public static List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache) {

		return getPersistence().findByObjectEntryId(
			objectEntryId, start, end, orderByComparator, useFinderCache);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	public static ObjectEntryVersionDraft findByObjectEntryId_First(
			long objectEntryId,
			OrderByComparator<ObjectEntryVersionDraft> orderByComparator)
		throws com.liferay.object.exception.
			NoSuchObjectEntryVersionDraftException {

		return getPersistence().findByObjectEntryId_First(
			objectEntryId, orderByComparator);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	public static ObjectEntryVersionDraft fetchByObjectEntryId_First(
		long objectEntryId,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return getPersistence().fetchByObjectEntryId_First(
			objectEntryId, orderByComparator);
	}

	/**
	 * Removes all the object entry version drafts where objectEntryId = &#63; from the database.
	 *
	 * @param objectEntryId the object entry ID
	 */
	public static void removeByObjectEntryId(long objectEntryId) {
		getPersistence().removeByObjectEntryId(objectEntryId);
	}

	/**
	 * Returns the number of object entry version drafts where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @return the number of matching object entry version drafts
	 */
	public static int countByObjectEntryId(long objectEntryId) {
		return getPersistence().countByObjectEntryId(objectEntryId);
	}

	/**
	 * Creates a new object entry version draft with the primary key. Does not add the object entry version draft to the database.
	 *
	 * @param objectEntryVersionDraftId the primary key for the new object entry version draft
	 * @return the new object entry version draft
	 */
	public static ObjectEntryVersionDraft create(
		long objectEntryVersionDraftId) {

		return getPersistence().create(objectEntryVersionDraftId);
	}

	/**
	 * Removes the object entry version draft with the primary key from the database. Also notifies the appropriate model listeners.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft that was removed
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	public static ObjectEntryVersionDraft remove(long objectEntryVersionDraftId)
		throws com.liferay.object.exception.
			NoSuchObjectEntryVersionDraftException {

		return getPersistence().remove(objectEntryVersionDraftId);
	}

	public static ObjectEntryVersionDraft updateImpl(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		return getPersistence().updateImpl(objectEntryVersionDraft);
	}

	/**
	 * Returns the object entry version draft with the primary key or throws a <code>NoSuchObjectEntryVersionDraftException</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	public static ObjectEntryVersionDraft findByPrimaryKey(
			long objectEntryVersionDraftId)
		throws com.liferay.object.exception.
			NoSuchObjectEntryVersionDraftException {

		return getPersistence().findByPrimaryKey(objectEntryVersionDraftId);
	}

	/**
	 * Returns the object entry version draft with the primary key or returns <code>null</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft, or <code>null</code> if a object entry version draft with the primary key could not be found
	 */
	public static ObjectEntryVersionDraft fetchByPrimaryKey(
		long objectEntryVersionDraftId) {

		return getPersistence().fetchByPrimaryKey(objectEntryVersionDraftId);
	}

	/**
	 * Returns all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @return the matching object entry version drafts
	 */
	public static List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId) {

		return getPersistence().findByObjectDefinitionId(objectDefinitionId);
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
	public static List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId, int start, int end) {

		return getPersistence().findByObjectDefinitionId(
			objectDefinitionId, start, end);
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
	public static List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return getPersistence().findByObjectDefinitionId(
			objectDefinitionId, start, end, orderByComparator);
	}

	/**
	 * Returns all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @return the matching object entry version drafts
	 */
	public static List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId) {

		return getPersistence().findByObjectEntryId(objectEntryId);
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
	public static List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end) {

		return getPersistence().findByObjectEntryId(objectEntryId, start, end);
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
	public static List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return getPersistence().findByObjectEntryId(
			objectEntryId, start, end, orderByComparator);
	}

	public static ObjectEntryVersionDraftPersistence getPersistence() {
		return _persistence;
	}

	public static void setPersistence(
		ObjectEntryVersionDraftPersistence persistence) {

		_persistence = persistence;
	}

	private static volatile ObjectEntryVersionDraftPersistence _persistence;

}
// LIFERAY-SERVICE-BUILDER-HASH:-1127282142