#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Construct absolute paths
PATCHES_FILE="$SCRIPT_DIR/patches.yaml"
OPENAPI_FILE="$SCRIPT_DIR/../openapi.yaml"

# Execute the publish script with absolute paths
../../../kong/scripts/publish-api.sh --name product-api --patches "$PATCHES_FILE" --spec "$OPENAPI_FILE"
