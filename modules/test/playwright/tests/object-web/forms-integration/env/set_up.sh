#!/bin/bash

CURRENT_DIR_NAME=$(dirname ${BASH_SOURCE[0]})

source ${CURRENT_DIR_NAME}/../../../../env/common.sh
source ${CURRENT_DIR_NAME}/../../../../env/mockmock.sh

function main {
	default_set_up

	download_mockmock

	start_mockmock_server
}

main "${@}"