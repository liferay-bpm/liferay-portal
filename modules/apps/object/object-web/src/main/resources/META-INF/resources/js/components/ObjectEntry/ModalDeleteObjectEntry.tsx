/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayModal, {useModal} from '@clayui/modal';
import {fetch, openToast} from 'frontend-js-web';
import React from 'react';

interface ModalDeleteObjectEntryProps {
	closeModal: voidReturn;
	itemData: ItemData;
	loadData: voidReturn;
}

export default function ModalDeleteObjectEntry({
	closeModal,
	itemData,
	loadData,
}: ModalDeleteObjectEntryProps) {
	const {observer, onClose} = useModal({
		onClose: () => {
			closeModal();
		},
	});

	async function handleDelete() {
		const deleteURL = itemData.actions.delete.href;

		fetch(deleteURL.replace('{id}', String(itemData.id)), {
			method: 'DELETE',
		})
			.then(({ok}) => {
				if (ok) {
					onClose();
					loadData();
					openToast({
						message: Liferay.Language.get(
							'your-request-completed-successfully'
						),
						type: 'success',
					});
				}
				else {
					throw new Error();
				}
			})
			.catch(() => {
				openToast({
					message: Liferay.Language.get(
						'an-unexpected-error-occurred'
					),
					type: 'danger',
				});
			});
	}

	return (
		<ClayModal observer={observer} status="danger">
			<ClayModal.Header>
				{Liferay.Language.get('confirm-deletion')}
			</ClayModal.Header>

			<ClayModal.Body>
				<p>
					{Liferay.Language.get(
						'are-you-sure-you-want-to-delete-this-entry'
					)}
				</p>

				<p>{Liferay.Language.get('it-may-affect-many-records')}</p>
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={closeModal}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton displayType="danger" onClick={handleDelete}>
							{Liferay.Language.get('delete')}
						</ClayButton>
					</ClayButton.Group>
				}
			></ClayModal.Footer>
		</ClayModal>
	);
}
