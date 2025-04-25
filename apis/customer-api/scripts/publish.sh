#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Construct absolute paths
OPENAPI_FILE="$SCRIPT_DIR/../openapi.yaml"
PLUGINS_FILE="$SCRIPT_DIR/../kong/plugins.yaml"
PATCHES_FILE="$SCRIPT_DIR/../kong/patches.yaml"

# Publish to Kong
../../../kong/scripts/publish-api.sh --name customer-api --spec "$OPENAPI_FILE" --plugins "$PLUGINS_FILE" --patches "$PATCHES_FILE" 

# Publish to API Gateway
../../../api-gateway/scripts/publish-api.sh --name customer-api --spec "$OPENAPI_FILE"