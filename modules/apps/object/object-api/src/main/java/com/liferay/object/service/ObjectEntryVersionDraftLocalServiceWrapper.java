/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service;

import com.liferay.portal.kernel.service.ServiceWrapper;
import com.liferay.portal.kernel.service.persistence.BasePersistence;

/**
 * Provides a wrapper for {@link ObjectEntryVersionDraftLocalService}.
 *
 * @author Marco Leo
 * @see ObjectEntryVersionDraftLocalService
 * @generated
 */
public class ObjectEntryVersionDraftLocalServiceWrapper
	implements ObjectEntryVersionDraftLocalService,
			   ServiceWrapper<ObjectEntryVersionDraftLocalService> {

	public ObjectEntryVersionDraftLocalServiceWrapper() {
		this(null);
	}

	public ObjectEntryVersionDraftLocalServiceWrapper(
		ObjectEntryVersionDraftLocalService
			objectEntryVersionDraftLocalService) {

		_objectEntryVersionDraftLocalService =
			objectEntryVersionDraftLocalService;
	}

	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
			addObjectEntryVersionDraft(
				long userId, long objectEntryId, int version)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.addObjectEntryVersionDraft(
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
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
		addObjectEntryVersionDraft(
			com.liferay.object.model.ObjectEntryVersionDraft
				objectEntryVersionDraft) {

		return _objectEntryVersionDraftLocalService.addObjectEntryVersionDraft(
			objectEntryVersionDraft);
	}

	/**
	 * Creates a new object entry version draft with the primary key. Does not add the object entry version draft to the database.
	 *
	 * @param objectEntryVersionDraftId the primary key for the new object entry version draft
	 * @return the new object entry version draft
	 */
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
		createObjectEntryVersionDraft(long objectEntryVersionDraftId) {

		return _objectEntryVersionDraftLocalService.
			createObjectEntryVersionDraft(objectEntryVersionDraftId);
	}

	/**
	 * @throws PortalException
	 */
	@Override
	public com.liferay.portal.kernel.model.PersistedModel createPersistedModel(
			java.io.Serializable primaryKeyObj)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.createPersistedModel(
			primaryKeyObj);
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
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
			deleteObjectEntryVersionDraft(long objectEntryVersionDraftId)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.
			deleteObjectEntryVersionDraft(objectEntryVersionDraftId);
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
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
		deleteObjectEntryVersionDraft(
			com.liferay.object.model.ObjectEntryVersionDraft
				objectEntryVersionDraft) {

		return _objectEntryVersionDraftLocalService.
			deleteObjectEntryVersionDraft(objectEntryVersionDraft);
	}

	@Override
	public void deleteObjectEntryVersionDraftByObjectDefinitionId(
		long objectDefinitionId) {

		_objectEntryVersionDraftLocalService.
			deleteObjectEntryVersionDraftByObjectDefinitionId(
				objectDefinitionId);
	}

	@Override
	public void deleteObjectEntryVersionDrafts(long objectEntryId) {
		_objectEntryVersionDraftLocalService.deleteObjectEntryVersionDrafts(
			objectEntryId);
	}

	/**
	 * @throws PortalException
	 */
	@Override
	public com.liferay.portal.kernel.model.PersistedModel deletePersistedModel(
			com.liferay.portal.kernel.model.PersistedModel persistedModel)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.deletePersistedModel(
			persistedModel);
	}

	@Override
	public <T> T dslQuery(com.liferay.petra.sql.dsl.query.DSLQuery dslQuery) {
		return _objectEntryVersionDraftLocalService.dslQuery(dslQuery);
	}

	@Override
	public int dslQueryCount(
		com.liferay.petra.sql.dsl.query.DSLQuery dslQuery) {

		return _objectEntryVersionDraftLocalService.dslQueryCount(dslQuery);
	}

	@Override
	public com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery() {
		return _objectEntryVersionDraftLocalService.dynamicQuery();
	}

	/**
	 * Performs a dynamic query on the database and returns the matching rows.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the matching rows
	 */
	@Override
	public <T> java.util.List<T> dynamicQuery(
		com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery) {

		return _objectEntryVersionDraftLocalService.dynamicQuery(dynamicQuery);
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
	@Override
	public <T> java.util.List<T> dynamicQuery(
		com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery, int start,
		int end) {

		return _objectEntryVersionDraftLocalService.dynamicQuery(
			dynamicQuery, start, end);
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
	@Override
	public <T> java.util.List<T> dynamicQuery(
		com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery, int start,
		int end,
		com.liferay.portal.kernel.util.OrderByComparator<T> orderByComparator) {

		return _objectEntryVersionDraftLocalService.dynamicQuery(
			dynamicQuery, start, end, orderByComparator);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the number of rows matching the dynamic query
	 */
	@Override
	public long dynamicQueryCount(
		com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery) {

		return _objectEntryVersionDraftLocalService.dynamicQueryCount(
			dynamicQuery);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @param projection the projection to apply to the query
	 * @return the number of rows matching the dynamic query
	 */
	@Override
	public long dynamicQueryCount(
		com.liferay.portal.kernel.dao.orm.DynamicQuery dynamicQuery,
		com.liferay.portal.kernel.dao.orm.Projection projection) {

		return _objectEntryVersionDraftLocalService.dynamicQueryCount(
			dynamicQuery, projection);
	}

	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
		fetchObjectEntryVersionDraft(long objectEntryVersionDraftId) {

		return _objectEntryVersionDraftLocalService.
			fetchObjectEntryVersionDraft(objectEntryVersionDraftId);
	}

	@Override
	public com.liferay.portal.kernel.dao.orm.ActionableDynamicQuery
		getActionableDynamicQuery() {

		return _objectEntryVersionDraftLocalService.getActionableDynamicQuery();
	}

	@Override
	public com.liferay.portal.kernel.dao.orm.IndexableActionableDynamicQuery
		getIndexableActionableDynamicQuery() {

		return _objectEntryVersionDraftLocalService.
			getIndexableActionableDynamicQuery();
	}

	/**
	 * Returns the object entry version draft with the primary key.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft
	 * @throws PortalException if a object entry version draft with the primary key could not be found
	 */
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
			getObjectEntryVersionDraft(long objectEntryVersionDraftId)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.getObjectEntryVersionDraft(
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
	@Override
	public java.util.List<com.liferay.object.model.ObjectEntryVersionDraft>
		getObjectEntryVersionDrafts(int start, int end) {

		return _objectEntryVersionDraftLocalService.getObjectEntryVersionDrafts(
			start, end);
	}

	/**
	 * Returns the number of object entry version drafts.
	 *
	 * @return the number of object entry version drafts
	 */
	@Override
	public int getObjectEntryVersionDraftsCount() {
		return _objectEntryVersionDraftLocalService.
			getObjectEntryVersionDraftsCount();
	}

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	@Override
	public String getOSGiServiceIdentifier() {
		return _objectEntryVersionDraftLocalService.getOSGiServiceIdentifier();
	}

	/**
	 * @throws PortalException
	 */
	@Override
	public com.liferay.portal.kernel.model.PersistedModel getPersistedModel(
			java.io.Serializable primaryKeyObj)
		throws com.liferay.portal.kernel.exception.PortalException {

		return _objectEntryVersionDraftLocalService.getPersistedModel(
			primaryKeyObj);
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
	@Override
	public com.liferay.object.model.ObjectEntryVersionDraft
		updateObjectEntryVersionDraft(
			com.liferay.object.model.ObjectEntryVersionDraft
				objectEntryVersionDraft) {

		return _objectEntryVersionDraftLocalService.
			updateObjectEntryVersionDraft(objectEntryVersionDraft);
	}

	@Override
	public BasePersistence<?> getBasePersistence() {
		return _objectEntryVersionDraftLocalService.getBasePersistence();
	}

	@Override
	public ObjectEntryVersionDraftLocalService getWrappedService() {
		return _objectEntryVersionDraftLocalService;
	}

	@Override
	public void setWrappedService(
		ObjectEntryVersionDraftLocalService
			objectEntryVersionDraftLocalService) {

		_objectEntryVersionDraftLocalService =
			objectEntryVersionDraftLocalService;
	}

	private ObjectEntryVersionDraftLocalService
		_objectEntryVersionDraftLocalService;

}
// LIFERAY-SERVICE-BUILDER-HASH:135859530