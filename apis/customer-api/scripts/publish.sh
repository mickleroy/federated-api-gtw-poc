#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Construct absolute paths
PATCHES_FILE="$SCRIPT_DIR/../kong/patches.yaml"
OPENAPI_FILE="$SCRIPT_DIR/../openapi.yaml"

# Publish to Kong
../../../kong/scripts/publish-api.sh --name customer-api --spec "$OPENAPI_FILE" --patches "$PATCHES_FILE" 

# Publish to API Gateway
../../../api-gateway/scripts/publish-api.sh --name customer-api --spec "$OPENAPI_FILE"