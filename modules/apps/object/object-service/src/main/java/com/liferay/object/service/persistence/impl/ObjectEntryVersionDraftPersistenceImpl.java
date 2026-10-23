/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.service.persistence.impl;

import com.liferay.object.exception.NoSuchObjectEntryVersionDraftException;
import com.liferay.object.model.ObjectEntryVersionDraft;
import com.liferay.object.model.ObjectEntryVersionDraftTable;
import com.liferay.object.model.impl.ObjectEntryVersionDraftImpl;
import com.liferay.object.model.impl.ObjectEntryVersionDraftModelImpl;
import com.liferay.object.service.persistence.ObjectEntryVersionDraftPersistence;
import com.liferay.object.service.persistence.ObjectEntryVersionDraftUtil;
import com.liferay.object.service.persistence.impl.constants.ObjectPersistenceConstants;
import com.liferay.portal.kernel.configuration.Configuration;
import com.liferay.portal.kernel.dao.orm.EntityCache;
import com.liferay.portal.kernel.dao.orm.FinderCache;
import com.liferay.portal.kernel.dao.orm.FinderPath;
import com.liferay.portal.kernel.dao.orm.Session;
import com.liferay.portal.kernel.dao.orm.SessionFactory;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.persistence.impl.BasePersistenceImpl;
import com.liferay.portal.kernel.service.persistence.impl.CollectionPersistenceFinder;
import com.liferay.portal.kernel.service.persistence.impl.FinderColumn;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.kernel.util.ProxyUtil;

import java.io.Serializable;

import java.lang.reflect.InvocationHandler;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * The persistence implementation for the object entry version draft service.
 *
 * <p>
 * Caching information and settings can be found in <code>portal.properties</code>
 * </p>
 *
 * @author Marco Leo
 * @generated
 */
@Component(service = ObjectEntryVersionDraftPersistence.class)
public class ObjectEntryVersionDraftPersistenceImpl
	extends BasePersistenceImpl
		<ObjectEntryVersionDraft, NoSuchObjectEntryVersionDraftException>
	implements ObjectEntryVersionDraftPersistence {

	/*
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify or reference this class directly. Always use <code>ObjectEntryVersionDraftUtil</code> to access the object entry version draft persistence. Modify <code>service.xml</code> and rerun ServiceBuilder to regenerate this class.
	 */
	public static final String FINDER_CLASS_NAME_ENTITY =
		ObjectEntryVersionDraftImpl.class.getName();

	public static final String FINDER_CLASS_NAME_LIST_WITH_PAGINATION =
		FINDER_CLASS_NAME_ENTITY + ".List1";

	public static final String FINDER_CLASS_NAME_LIST_WITHOUT_PAGINATION =
		FINDER_CLASS_NAME_ENTITY + ".List2";

	private CollectionPersistenceFinder
		<ObjectEntryVersionDraft, NoSuchObjectEntryVersionDraftException>
			_collectionPersistenceFinderByObjectDefinitionId;

	/**
	 * Returns an ordered range of all the object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	@Override
	public List<ObjectEntryVersionDraft> findByObjectDefinitionId(
		long objectDefinitionId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache) {

		return _collectionPersistenceFinderByObjectDefinitionId.find(
			finderCache, new Object[] {objectDefinitionId}, start, end,
			orderByComparator, useFinderCache);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	@Override
	public ObjectEntryVersionDraft findByObjectDefinitionId_First(
			long objectDefinitionId,
			OrderByComparator<ObjectEntryVersionDraft> orderByComparator)
		throws NoSuchObjectEntryVersionDraftException {

		return _collectionPersistenceFinderByObjectDefinitionId.findFirst(
			finderCache, new Object[] {objectDefinitionId}, orderByComparator);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	@Override
	public ObjectEntryVersionDraft fetchByObjectDefinitionId_First(
		long objectDefinitionId,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return _collectionPersistenceFinderByObjectDefinitionId.fetchFirst(
			finderCache, new Object[] {objectDefinitionId}, orderByComparator);
	}

	/**
	 * Removes all the object entry version drafts where objectDefinitionId = &#63; from the database.
	 *
	 * @param objectDefinitionId the object definition ID
	 */
	@Override
	public void removeByObjectDefinitionId(long objectDefinitionId) {
		_collectionPersistenceFinderByObjectDefinitionId.remove(
			finderCache, new Object[] {objectDefinitionId});
	}

	/**
	 * Returns the number of object entry version drafts where objectDefinitionId = &#63;.
	 *
	 * @param objectDefinitionId the object definition ID
	 * @return the number of matching object entry version drafts
	 */
	@Override
	public int countByObjectDefinitionId(long objectDefinitionId) {
		return _collectionPersistenceFinderByObjectDefinitionId.count(
			finderCache, new Object[] {objectDefinitionId});
	}

	private CollectionPersistenceFinder
		<ObjectEntryVersionDraft, NoSuchObjectEntryVersionDraftException>
			_collectionPersistenceFinderByObjectEntryId;

	/**
	 * Returns an ordered range of all the object entry version drafts where objectEntryId = &#63;.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>ObjectEntryVersionDraftModelImpl</code>.
	 * </p>
	 *
	 * @param objectEntryId the object entry ID
	 * @param start the lower bound of the range of object entry version drafts
	 * @param end the upper bound of the range of object entry version drafts (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @param useFinderCache whether to use the finder cache
	 * @return the ordered range of matching object entry version drafts
	 */
	@Override
	public List<ObjectEntryVersionDraft> findByObjectEntryId(
		long objectEntryId, int start, int end,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator,
		boolean useFinderCache) {

		return _collectionPersistenceFinderByObjectEntryId.find(
			finderCache, new Object[] {objectEntryId}, start, end,
			orderByComparator, useFinderCache);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a matching object entry version draft could not be found
	 */
	@Override
	public ObjectEntryVersionDraft findByObjectEntryId_First(
			long objectEntryId,
			OrderByComparator<ObjectEntryVersionDraft> orderByComparator)
		throws NoSuchObjectEntryVersionDraftException {

		return _collectionPersistenceFinderByObjectEntryId.findFirst(
			finderCache, new Object[] {objectEntryId}, orderByComparator);
	}

	/**
	 * Returns the first object entry version draft in the ordered set where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @param orderByComparator the comparator to order the set by (optionally <code>null</code>)
	 * @return the first matching object entry version draft, or <code>null</code> if a matching object entry version draft could not be found
	 */
	@Override
	public ObjectEntryVersionDraft fetchByObjectEntryId_First(
		long objectEntryId,
		OrderByComparator<ObjectEntryVersionDraft> orderByComparator) {

		return _collectionPersistenceFinderByObjectEntryId.fetchFirst(
			finderCache, new Object[] {objectEntryId}, orderByComparator);
	}

	/**
	 * Removes all the object entry version drafts where objectEntryId = &#63; from the database.
	 *
	 * @param objectEntryId the object entry ID
	 */
	@Override
	public void removeByObjectEntryId(long objectEntryId) {
		_collectionPersistenceFinderByObjectEntryId.remove(
			finderCache, new Object[] {objectEntryId});
	}

	/**
	 * Returns the number of object entry version drafts where objectEntryId = &#63;.
	 *
	 * @param objectEntryId the object entry ID
	 * @return the number of matching object entry version drafts
	 */
	@Override
	public int countByObjectEntryId(long objectEntryId) {
		return _collectionPersistenceFinderByObjectEntryId.count(
			finderCache, new Object[] {objectEntryId});
	}

	public ObjectEntryVersionDraftPersistenceImpl() {
		setModelClass(ObjectEntryVersionDraft.class);

		setModelImplClass(ObjectEntryVersionDraftImpl.class);
		setModelPKClass(long.class);

		setTable(ObjectEntryVersionDraftTable.INSTANCE);
	}

	/**
	 * Creates a new object entry version draft with the primary key. Does not add the object entry version draft to the database.
	 *
	 * @param objectEntryVersionDraftId the primary key for the new object entry version draft
	 * @return the new object entry version draft
	 */
	@Override
	public ObjectEntryVersionDraft create(long objectEntryVersionDraftId) {
		ObjectEntryVersionDraft objectEntryVersionDraft =
			new ObjectEntryVersionDraftImpl();

		objectEntryVersionDraft.setNew(true);
		objectEntryVersionDraft.setPrimaryKey(objectEntryVersionDraftId);

		objectEntryVersionDraft.setCompanyId(CompanyThreadLocal.getCompanyId());

		return objectEntryVersionDraft;
	}

	/**
	 * Removes the object entry version draft with the primary key from the database. Also notifies the appropriate model listeners.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft that was removed
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	@Override
	public ObjectEntryVersionDraft remove(long objectEntryVersionDraftId)
		throws NoSuchObjectEntryVersionDraftException {

		return remove((Serializable)objectEntryVersionDraftId);
	}

	@Override
	protected ObjectEntryVersionDraft removeImpl(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		Session session = null;

		try {
			session = openSession();

			if (!session.contains(objectEntryVersionDraft)) {
				objectEntryVersionDraft = (ObjectEntryVersionDraft)session.get(
					ObjectEntryVersionDraftImpl.class,
					objectEntryVersionDraft.getPrimaryKeyObj());
			}

			if (objectEntryVersionDraft != null) {
				session.delete(objectEntryVersionDraft);
			}
		}
		catch (Exception exception) {
			throw processException(exception);
		}
		finally {
			closeSession(session);
		}

		if (objectEntryVersionDraft != null) {
			clearCache(objectEntryVersionDraft);
		}

		return objectEntryVersionDraft;
	}

	@Override
	public ObjectEntryVersionDraft updateImpl(
		ObjectEntryVersionDraft objectEntryVersionDraft) {

		boolean isNew = objectEntryVersionDraft.isNew();

		if (!(objectEntryVersionDraft instanceof
				ObjectEntryVersionDraftModelImpl)) {

			InvocationHandler invocationHandler = null;

			if (ProxyUtil.isProxyClass(objectEntryVersionDraft.getClass())) {
				invocationHandler = ProxyUtil.getInvocationHandler(
					objectEntryVersionDraft);

				throw new IllegalArgumentException(
					"Implement ModelWrapper in objectEntryVersionDraft proxy " +
						invocationHandler.getClass());
			}

			throw new IllegalArgumentException(
				"Implement ModelWrapper in custom ObjectEntryVersionDraft implementation " +
					objectEntryVersionDraft.getClass());
		}

		ObjectEntryVersionDraftModelImpl objectEntryVersionDraftModelImpl =
			(ObjectEntryVersionDraftModelImpl)objectEntryVersionDraft;

		ServiceContext serviceContext =
			ServiceContextThreadLocal.getServiceContext();

		Date date = new Date();

		if (isNew && (objectEntryVersionDraft.getCreateDate() == null)) {
			if (serviceContext == null) {
				objectEntryVersionDraft.setCreateDate(date);
			}
			else {
				objectEntryVersionDraft.setCreateDate(
					serviceContext.getCreateDate(date));
			}
		}

		if (!objectEntryVersionDraftModelImpl.hasSetModifiedDate()) {
			if (serviceContext == null) {
				objectEntryVersionDraft.setModifiedDate(date);
			}
			else {
				objectEntryVersionDraft.setModifiedDate(
					serviceContext.getModifiedDate(date));
			}
		}

		Session session = null;

		try {
			session = openSession();

			if (isNew) {
				session.save(objectEntryVersionDraft);
			}
			else {
				objectEntryVersionDraft =
					(ObjectEntryVersionDraft)session.merge(
						objectEntryVersionDraft);
			}
		}
		catch (Exception exception) {
			throw processException(exception);
		}
		finally {
			closeSession(session);
		}

		cacheUniqueFindersResult(objectEntryVersionDraft, false);

		if (isNew) {
			objectEntryVersionDraft.setNew(false);
		}

		objectEntryVersionDraft.resetOriginalValues();

		return objectEntryVersionDraft;
	}

	/**
	 * Returns the object entry version draft with the primary key or throws a <code>NoSuchObjectEntryVersionDraftException</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft
	 * @throws NoSuchObjectEntryVersionDraftException if a object entry version draft with the primary key could not be found
	 */
	@Override
	public ObjectEntryVersionDraft findByPrimaryKey(
			long objectEntryVersionDraftId)
		throws NoSuchObjectEntryVersionDraftException {

		return findByPrimaryKey((Serializable)objectEntryVersionDraftId);
	}

	/**
	 * Returns the object entry version draft with the primary key or returns <code>null</code> if it could not be found.
	 *
	 * @param objectEntryVersionDraftId the primary key of the object entry version draft
	 * @return the object entry version draft, or <code>null</code> if a object entry version draft with the primary key could not be found
	 */
	@Override
	public ObjectEntryVersionDraft fetchByPrimaryKey(
		long objectEntryVersionDraftId) {

		return fetchByPrimaryKey((Serializable)objectEntryVersionDraftId);
	}

	@Override
	protected EntityCache getEntityCache() {
		return entityCache;
	}

	@Override
	protected String getPKDBName() {
		return "objectEntryVersionDraftId";
	}

	@Override
	protected String getSelectSQL() {
		return _SQL_SELECT_OBJECTENTRYVERSIONDRAFT;
	}

	@Override
	protected Map<String, Integer> getTableColumnsMap() {
		return ObjectEntryVersionDraftModelImpl.TABLE_COLUMNS_MAP;
	}

	/**
	 * Initializes the object entry version draft persistence.
	 */
	@Activate
	public void activate() {
		_collectionPersistenceFinderByObjectDefinitionId =
			new CollectionPersistenceFinder<>(
				this,
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITH_PAGINATION,
					"findByObjectDefinitionId",
					new String[] {
						Long.class.getName(), Integer.class.getName(),
						Integer.class.getName(),
						OrderByComparator.class.getName()
					},
					new String[] {"objectDefinitionId"}, true),
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITHOUT_PAGINATION,
					"findByObjectDefinitionId",
					new String[] {Long.class.getName()},
					new String[] {"objectDefinitionId"}, true),
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITHOUT_PAGINATION,
					"countByObjectDefinitionId",
					new String[] {Long.class.getName()},
					new String[] {"objectDefinitionId"}, false),
				_SQL_SELECT_OBJECTENTRYVERSIONDRAFT_WHERE,
				_SQL_COUNT_OBJECTENTRYVERSIONDRAFT_WHERE,
				ObjectEntryVersionDraftModelImpl.ORDER_BY_JPQL,
				_ENTITY_ALIAS_PREFIX, "", "", null,
				new FinderColumn<>(
					"objectEntryVersionDraft.", "objectDefinitionId",
					FinderColumn.Type.LONG, "=", true, true,
					ObjectEntryVersionDraft::getObjectDefinitionId));

		_collectionPersistenceFinderByObjectEntryId =
			new CollectionPersistenceFinder<>(
				this,
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITH_PAGINATION,
					"findByObjectEntryId",
					new String[] {
						Long.class.getName(), Integer.class.getName(),
						Integer.class.getName(),
						OrderByComparator.class.getName()
					},
					new String[] {"objectEntryId"}, true),
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITHOUT_PAGINATION,
					"findByObjectEntryId", new String[] {Long.class.getName()},
					new String[] {"objectEntryId"}, true),
				new FinderPath(
					FINDER_CLASS_NAME_LIST_WITHOUT_PAGINATION,
					"countByObjectEntryId", new String[] {Long.class.getName()},
					new String[] {"objectEntryId"}, false),
				_SQL_SELECT_OBJECTENTRYVERSIONDRAFT_WHERE,
				_SQL_COUNT_OBJECTENTRYVERSIONDRAFT_WHERE,
				ObjectEntryVersionDraftModelImpl.ORDER_BY_JPQL,
				_ENTITY_ALIAS_PREFIX, "", "", null,
				new FinderColumn<>(
					"objectEntryVersionDraft.", "objectEntryId",
					FinderColumn.Type.LONG, "=", true, true,
					ObjectEntryVersionDraft::getObjectEntryId));

		ObjectEntryVersionDraftUtil.setPersistence(this);
	}

	@Deactivate
	public void deactivate() {
		ObjectEntryVersionDraftUtil.setPersistence(null);

		entityCache.removeCache(ObjectEntryVersionDraftImpl.class.getName());
	}

	@Override
	@Reference(
		target = ObjectPersistenceConstants.SERVICE_CONFIGURATION_FILTER,
		unbind = "-"
	)
	public void setConfiguration(Configuration configuration) {
	}

	@Override
	@Reference(
		target = ObjectPersistenceConstants.ORIGIN_BUNDLE_SYMBOLIC_NAME_FILTER,
		unbind = "-"
	)
	public void setDataSource(DataSource dataSource) {
		super.setDataSource(dataSource);
	}

	@Override
	@Reference(
		target = ObjectPersistenceConstants.ORIGIN_BUNDLE_SYMBOLIC_NAME_FILTER,
		unbind = "-"
	)
	public void setSessionFactory(SessionFactory sessionFactory) {
		super.setSessionFactory(sessionFactory);
	}

	@Reference
	protected EntityCache entityCache;

	@Reference
	protected FinderCache finderCache;

	private static final String _ENTITY_ALIAS_PREFIX =
		ObjectEntryVersionDraftModelImpl.ENTITY_ALIAS + ".";

	private static final String _SQL_SELECT_OBJECTENTRYVERSIONDRAFT =
		"SELECT objectEntryVersionDraft FROM ObjectEntryVersionDraft objectEntryVersionDraft";

	private static final String _SQL_SELECT_OBJECTENTRYVERSIONDRAFT_WHERE =
		"SELECT objectEntryVersionDraft FROM ObjectEntryVersionDraft objectEntryVersionDraft WHERE ";

	private static final String _SQL_COUNT_OBJECTENTRYVERSIONDRAFT_WHERE =
		"SELECT COUNT(objectEntryVersionDraft) FROM ObjectEntryVersionDraft objectEntryVersionDraft WHERE ";

	@Override
	protected FinderCache getFinderCache() {
		return finderCache;
	}

}
// LIFERAY-SERVICE-BUILDER-HASH:-536076884