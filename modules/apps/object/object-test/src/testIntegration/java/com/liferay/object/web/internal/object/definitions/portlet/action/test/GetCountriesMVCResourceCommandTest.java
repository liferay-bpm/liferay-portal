/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.object.web.internal.object.definitions.portlet.action.test;

import com.liferay.arquillian.extension.junit.bridge.junit.Arquillian;
import com.liferay.object.constants.ObjectPortletKeys;
import com.liferay.object.field.phone.number.util.PhoneNumberCountryUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.portlet.PortletConfigFactoryUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.service.PortletLocalService;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceRequest;
import com.liferay.portal.kernel.test.portlet.MockLiferayResourceResponse;
import com.liferay.portal.kernel.test.rule.AggregateTestRule;
import com.liferay.portal.kernel.test.util.ServiceContextTestUtil;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.test.rule.Inject;
import com.liferay.portal.test.rule.LiferayIntegrationTestRule;
import com.liferay.portal.test.rule.PermissionCheckerMethodTestRule;

import java.io.ByteArrayOutputStream;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * @author Yuri Monteiro
 */
@RunWith(Arquillian.class)
public class GetCountriesMVCResourceCommandTest {

	@ClassRule
	@Rule
	public static final AggregateTestRule aggregateTestRule =
		new AggregateTestRule(
			new LiferayIntegrationTestRule(),
			PermissionCheckerMethodTestRule.INSTANCE);

	@Test
	public void testGetCountries() throws Exception {
		MockLiferayResourceRequest mockLiferayResourceRequest =
			new MockLiferayResourceRequest();

		mockLiferayResourceRequest.setAttribute(
			JavaConstants.JAKARTA_PORTLET_CONFIG,
			PortletConfigFactoryUtil.create(
				_portletLocalService.getPortletById(
					ObjectPortletKeys.OBJECT_DEFINITIONS),
				null));

		MockLiferayResourceResponse mockLiferayResourceResponse =
			new MockLiferayResourceResponse();

		try {
			ServiceContextThreadLocal.pushServiceContext(
				ServiceContextTestUtil.getServiceContext());

			_mvcResourceCommand.serveResource(
				mockLiferayResourceRequest, mockLiferayResourceResponse);
		}
		finally {
			ServiceContextThreadLocal.popServiceContext();
		}

		ByteArrayOutputStream byteArrayOutputStream =
			(ByteArrayOutputStream)
				mockLiferayResourceResponse.getPortletOutputStream();

		JSONArray jsonArray = JSONFactoryUtil.createJSONArray(
			byteArrayOutputStream.toString());

		Assert.assertTrue(jsonArray.length() > 0);

		String previousName = null;

		for (int i = 0; i < jsonArray.length(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);

			Assert.assertNotNull(
				jsonObject.getString(PhoneNumberCountryUtil.KEY_A2));
			Assert.assertNotNull(
				jsonObject.getString(PhoneNumberCountryUtil.KEY_IDD));

			String name = jsonObject.getString(PhoneNumberCountryUtil.KEY_NAME);

			Assert.assertNotNull(name);

			if (previousName != null) {
				Assert.assertTrue(
					"Countries must be sorted alphabetically by name",
					previousName.compareTo(name) <= 0);
			}

			previousName = name;
		}
	}

	@Inject(filter = "mvc.command.name=/object_definitions/get_countries")
	private MVCResourceCommand _mvcResourceCommand;

	@Inject
	private PortletLocalService _portletLocalService;

}