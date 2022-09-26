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

package com.liferay.object.scripting.internal;

import com.liferay.object.scripting.ObjectScripting;
import com.liferay.object.scripting.exception.ObjectScriptingException;
import com.liferay.object.scripting.executor.ObjectScriptingExecutor;
import com.liferay.object.scripting.validator.ObjectScriptingValidator;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.StringUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;

/**
 * @author Feliphe Marinho
 */
@Component(immediate = true, service = ObjectScripting.class)
public class ObjectScriptingImpl implements ObjectScripting {

	@Override
	public Map<String, Object> execute(
		Map<String, Object> inputObjects, String language,
		Set<String> outputNames, String script) {

		Map<String, Object> results = new HashMap<>();

		Thread currentThread = Thread.currentThread();

		ClassLoader contextClassLoader = _getContextClassLoader(currentThread);

		try {
			ObjectScriptingExecutor objectScriptingExecutor =
				_objectScriptingExecutors.get(language);

			results = objectScriptingExecutor.execute(
				inputObjects, outputNames, script);

			results.put("invalidScript", false);
		}
		catch (Exception exception) {
			_log.error(exception);

			results.put("invalidScript", true);
		}
		finally {
			currentThread.setContextClassLoader(contextClassLoader);
		}

		return results;
	}

	@Override
	public void validate(String language, String script)
		throws ObjectScriptingException {

		if (StringUtil.count(script, _NEW_LINE) > _MAXIMUM_NUMBER_OF_LINES) {
			throw new ObjectScriptingException(
				"the-maximum-number-of-lines-available-is-2987");
		}

		Thread currentThread = Thread.currentThread();

		ClassLoader contextClassLoader = _getContextClassLoader(currentThread);

		try {
			ObjectScriptingValidator objectScriptingValidator =
				_objectScriptingValidators.get(language);

			objectScriptingValidator.validate(script);
		}
		catch (Exception exception) {
			if (_log.isDebugEnabled()) {
				_log.debug(exception);
			}

			throw new ObjectScriptingException("syntax-error");
		}
		finally {
			currentThread.setContextClassLoader(contextClassLoader);
		}
	}

	@Reference(
		cardinality = ReferenceCardinality.MULTIPLE,
		policy = ReferencePolicy.DYNAMIC,
		policyOption = ReferencePolicyOption.GREEDY
	)
	protected void setObjectScriptingExecutor(
		ObjectScriptingExecutor objectScriptingExecutor) {

		_objectScriptingExecutors.put(
			objectScriptingExecutor.getLanguage(), objectScriptingExecutor);
	}

	@Reference(
		cardinality = ReferenceCardinality.MULTIPLE,
		policy = ReferencePolicy.DYNAMIC,
		policyOption = ReferencePolicyOption.GREEDY
	)
	protected void setObjectScriptingValidator(
		ObjectScriptingValidator objectScriptingValidator) {

		_objectScriptingValidators.put(
			objectScriptingValidator.getLanguage(), objectScriptingValidator);
	}

	protected void unsetObjectScriptingExecutor(
		ObjectScriptingExecutor objectScriptingExecutor) {

		_objectScriptingExecutors.remove(objectScriptingExecutor.getLanguage());
	}

	protected void unsetObjectScriptingValidator(
		ObjectScriptingValidator objectScriptingValidator) {

		_objectScriptingValidators.remove(
			objectScriptingValidator.getLanguage());
	}

	private ClassLoader _getContextClassLoader(Thread currentThread) {
		ClassLoader contextClassLoader = currentThread.getContextClassLoader();

		Class<?> clazz = getClass();

		currentThread.setContextClassLoader(clazz.getClassLoader());

		return contextClassLoader;
	}

	private static final int _MAXIMUM_NUMBER_OF_LINES = 2987;

	private static final String _NEW_LINE = "\n";

	private static final Log _log = LogFactoryUtil.getLog(
		ObjectScriptingImpl.class);

	private final Map<String, ObjectScriptingExecutor>
		_objectScriptingExecutors = new ConcurrentHashMap<>();
	private final Map<String, ObjectScriptingValidator>
		_objectScriptingValidators = new ConcurrentHashMap<>();

}