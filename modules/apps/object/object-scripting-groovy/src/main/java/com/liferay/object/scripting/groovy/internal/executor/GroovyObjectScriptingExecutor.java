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

package com.liferay.object.scripting.groovy.internal.executor;

import com.liferay.object.scripting.executor.ObjectScriptingExecutor;
import com.liferay.object.scripting.groovy.internal.util.GroovyObjectScriptingUtil;

import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import groovy.lang.Script;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.osgi.service.component.annotations.Component;

/**
 * @author Alberto Montero
 * @author Brian Wing Shun Chan
 */
@Component(immediate = true, service = ObjectScriptingExecutor.class)
public class GroovyObjectScriptingExecutor implements ObjectScriptingExecutor {

	@Override
	public Map<String, Object> execute(
			Map<String, Object> inputObjects, Set<String> outputNames,
			String script)
		throws Exception {

		if (outputNames == null) {
			return Collections.emptyMap();
		}

		GroovyShell groovyShell = new GroovyShell(
			GroovyObjectScriptingUtil.getClassLoader(getClass()));

		Script compiledScript = groovyShell.parse(script);

		Binding binding = new Binding(inputObjects);

		compiledScript.setBinding(binding);

		compiledScript.run();

		Map<String, Object> outputObjects = new HashMap<>();

		for (String outputName : outputNames) {
			outputObjects.put(outputName, binding.getVariable(outputName));
		}

		return outputObjects;
	}

	@Override
	public String getLanguage() {
		return "groovy";
	}

}