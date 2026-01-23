/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import Card from '@clayui/card/src/Card';
import Label from '@clayui/label';
import React from 'react';

import {mapLabelToLabelDisplayType} from '../../../../../utils/constants';
import {ITask} from '../../../../../utils/types';

export default function Task(props: ITask) {
	return (
		<Card>
			<Card.Body>
				<Card.Row>
					<div className="autofit-col autofit-col-expand">
						<section className="autofit-section">
							<Card.Description displayType="title">
								{props.embedded.title}
							</Card.Description>

							<Card.Description displayType="subtitle">
								{props.embedded.cmpProjectToCMPTasks.title}
							</Card.Description>

							<Card.Caption>
								<Label
									displayType={
										mapLabelToLabelDisplayType[
											props.embedded.state.name
										]
									}
								>
									{props.embedded.state.name}
								</Label>
							</Card.Caption>
						</section>
					</div>
				</Card.Row>
			</Card.Body>
		</Card>
	);
}
