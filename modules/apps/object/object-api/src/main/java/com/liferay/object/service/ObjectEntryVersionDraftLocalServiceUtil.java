/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service;

import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.petra.sql.dsl.query.DSLQuery;
import com.liferay.portal.kernel.dao.orm.DynamicQuery;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.PersistedModel;
import com.liferay.portal.kernel.module.service.Snapshot;
import com.liferay.portal.kernel.util.OrderByComparator;

import java.io.Serializable;

import java.util.List;

/**
 * Provides the local service utility for ObjectEntryVersionDraft. This utility wraps
 * <code>com.liferay.object.service.impl.ObjectEntryVersionDraftLocalServiceImpl</code> and
 * is an access point for service operations in application layer code running
 * on the local server. Methods of this service will not have security checks
 * based on the propagated JAAS credentials because this service can only be
 * accessed from within the same VM.
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraftLocalService
 * @generated
 */
public class ObjectEntryVersionDraftLocalServiceUtil {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify this class directly. Add custom service methods to <code>com.liferay.object.service.impl.ObjectEntryVersionDraftLocalServiceImpl</code> and rerun ServiceBuilder to regenerate this class.
	 */
	public static ObjectEntryVersionDraft addObjectEntryVersionDraft(
			long userId, long objectEntryId, int version)
		throws PortalException {

		return getService().addObjectEntryVersionDraft(
			userId, objectEntryId, version);
	}

	/**
	 * Adds the object entry version draft to the database. Also notifies the appropriate model listeners.
	 *
	 * <p>
	 * <strong>Important:</strong> Inspect ObjectEntryVersionDraftLocalServiceImpl for overloaded versions of the method. If provided, use these entry points to the API, as the implementation logic may require the additional parameters defined there.
	 * </p>
	 *
	 * @param objectEntryVersionDraft the object entry version draft
	 * @return the object entry version draft that was added
	 */
	public static ObjectEntryVersionDraft addObjectEntryVersionDraft(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		return getService().addObjectEntryVersionDraft(objectEntryVersionDraft);
	}

	/**
	 * Creates a new object entry version draft with the primary key. Does not add the object entry version draft to the database.
	 *
	 * @param objectEntryVersionDraftId the primary key for the new object entry version draft
	 * @return the new object entry version draft
	 */
	public static ObjectEntryVersionDraft createObjectEntryVersionDraft(
		long objectEntryVersionDraftId) {

		return getService().createObjectEntryVersionDraft(
			objectEntryVersionDraftId);
	}

	/**
	 * @throws PortalException
	 */
	public static PersistedModel createPersistedModel(
			Serializable primaryKeyObj)
		throws PortalException {

		return getService().createPersistedModel(primaryKeyObj);
	}

	/**
	 * Deletes the object entry version draft with the primary key from the database. Also notifies the appropriate model listeners.
	 *
	 * <p>
	 * <strong>Important:</strong> Inspect ObjectEntryVersionDraftLocalServiceImpl for overloaded versions of the method. If provided, use these entry points to the API, as the implementation logic may require the additional parameters defined there.
	 * </p>
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft that was removed
	 * @throws PortalException if a object entry version draft with the primary key could not be found
	 */
	public static ObjectEntryVersionDraft deleteObjectEntryVersionDraft(
			long objectEntryVersionDraftId)
		throws PortalException {

		return getService().deleteObjectEntryVersionDraft(
			objectEntryVersionDraftId);
	}

	/**
	 * Deletes the object entry version draft from the database. Also notifies the appropriate model listeners.
	 *
	 * <p>
	 * <strong>Important:</strong> Inspect ObjectEntryVersionDraftLocalServiceImpl for overloaded versions of the method. If provided, use these entry points to the API, as the implementation logic may require the additional parameters defined there.
	 * </p>
	 *
	 * @param objectEntryVersionDraft the object entry version draft
	 * @return the object entry version draft that was removed
	 */
	public static ObjectEntryVersionDraft deleteObjectEntryVersionDraft(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		return getService().deleteObjectEntryVersionDraft(
			objectEntryVersionDraft);
	}

	public static void deleteObjectEntryVersionDraftByObjectDefinitionId(
		long objectDefinitionId) {

		getService().deleteObjectEntryVersionDraftByObjectDefinitionId(
			objectDefinitionId);
	}

	public static void deleteObjectEntryVersionDrafts(long objectEntryId) {
		getService().deleteObjectEntryVersionDrafts(objectEntryId);
	}

	/**
	 * @throws PortalException
	 */
	public static PersistedModel deletePersistedModel(
			PersistedModel persistedModel)
		throws PortalException {

		return getService().deletePersistedModel(persistedModel);
	}

	public static <T> T dslQuery(DSLQuery dslQuery) {
		return getService().dslQuery(dslQuery);
	}

	public static int dslQueryCount(DSLQuery dslQuery) {
		return getService().dslQueryCount(dslQuery);
	}

	public static DynamicQuery dynamicQuery() {
		return getService().dynamicQuery();
	}

	/**
	 * Performs a dynamic query on the database and returns the matching rows.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the matching rows
	 */
	public static <T> List<T> dynamicQuery(DynamicQuery dynamicQuery) {
		return getService().dynamicQuery(dynamicQuery);
	}

	/**
	 * Performs a dynamic query on the database and returns a range of the matching rows.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param dynamicQuery the dynamic query
	 * @param start the lower bound of the range of model instances
	 * @param end the upper bound of the range of model instances (not inclusive)
	 * @return the range of matching rows
	 */
	public static <T> List<T> dynamicQuery(
		DynamicQuery dynamicQuery, int start, int end) {

		return getService().dynamicQuery(dynamicQuery, start, end);
	}

	/**
	 * Performs a dynamic query on the database and returns an ordered range of the matching rows.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param dynamicQuery the dynamic query
	 * @param start the lower bound of the range of model instances
	 * @param end the upper bound of the range of model instances (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @return the ordered range of matching rows
	 */
	public static <T> List<T> dynamicQuery(
		DynamicQuery dynamicQuery, int start, int end,
		OrderByComparator<T> orderByComparator) {

		return getService().dynamicQuery(
			dynamicQuery, start, end, orderByComparator);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the number of rows matching the dynamic query
	 */
	public static long dynamicQueryCount(DynamicQuery dynamicQuery) {
		return getService().dynamicQueryCount(dynamicQuery);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @param projection the projection to apply to the query
	 * @return the number of rows matching the dynamic query
	 */
	public static long dynamicQueryCount(
		DynamicQuery dynamicQuery,
		com.liferay.portal.kernel.dao.orm.Projection projection) {

		return getService().dynamicQueryCount(dynamicQuery, projection);
	}

	public static ObjectEntryVersionDraft fetchObjectEntryVersionDraft(
		long objectEntryVersionDraftId) {

		return getService().fetchObjectEntryVersionDraft(
			objectEntryVersionDraftId);
	}

	public static com.liferay.portal.kernel.dao.orm.ActionableDynamicQuery
		getActionableDynamicQuery() {

		return getService().getActionableDynamicQuery();
	}

	public static
		com.liferay.portal.kernel.dao.orm.IndexableActionableDynamicQuery
			getIndexableActionableDynamicQuery() {

		return getService().getIndexableActionableDynamicQuery();
	}

	/**
	 * Returns the object entry version draft with the primary key.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft
	 * @throws PortalException if a object entry version draft with the primary key could not be found
	 */
	public static ObjectEntryVersionDraft getObjectEntryVersionDraft(
			long objectEntryVersionDraftId)
		throws PortalException {

		return getService().getObjectEntryVersionDraft(
			objectEntryVersionDraftId);
	}

	/**
	 * Returns a range of all the object entry version drafts.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @return the range of object entry version drafts
	 */
	public static List<ObjectEntryVersionDraft> getObjectEntryVersionDrafts(
		int start, int end) {

		return getService().getObjectEntryVersionDrafts(start, end);
	}

	/**
	 * Returns the number of object entry version drafts.
	 *
	 * @return the number of object entry version drafts
	 */
	public static int getObjectEntryVersionDraftsCount() {
		return getService().getObjectEntryVersionDraftsCount();
	}

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	public static String getOSGiServiceIdentifier() {
		return getService().getOSGiServiceIdentifier();
	}

	/**
	 * @throws PortalException
	 */
	public static PersistedModel getPersistedModel(Serializable primaryKeyObj)
		throws PortalException {

		return getService().getPersistedModel(primaryKeyObj);
	}

	/**
	 * Updates the object entry version draft in the database or adds it if it does not yet exist. Also notifies the appropriate model listeners.
	 *
	 * <p>
	 * <strong>Important:</strong> Inspect ObjectEntryVersionDraftLocalServiceImpl for overloaded versions of the method. If provided, use these entry points to the API, as the implementation logic may require the additional parameters defined there.
	 * </p>
	 *
	 * @param objectEntryVersionDraft the object entry version draft
	 * @return the object entry version draft that was updated
	 */
	public static ObjectEntryVersionDraft updateObjectEntryVersionDraft(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		return getService().updateObjectEntryVersionDraft(
			objectEntryVersionDraft);
	}

	public static ObjectEntryVersionDraftLocalService getService() {
		return _serviceSnapshot.get();
	}

	private static final Snapshot<ObjectEntryVersionDraftLocalService>
		_serviceSnapshot = new Snapshot<>(
			ObjectEntryVersionDraftLocalServiceUtil.class,
			ObjectEntryVersionDraftLocalService.class);

}
// LIFERAY-SERVICE-BUILDER-HASH:433091941