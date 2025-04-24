#!/bin/bash
#
# This script publishes API configurations to Kong
#
# Usage:
#   ./publish-api.sh --name <api-name> --patches <patches-file> --spec <openapi-file>
#
# Arguments:
#   --name      Required. The name of the API (e.g. "customer-api", "product-api")
#   --patches   Optional. Path to a YAML file containing Kong-specific configuration patches
#   --spec      Required. Path to the OpenAPI/Swagger specification file
#
# Example:
#   ./publish-api.sh \
#     --name customer-api \
#     --patches ./kong/patches.yaml \
#     --spec ./openapi.yaml
#
# The script will:
# 1. Validate the required arguments are provided
# 2. Generate Kong configuration from the OpenAPI spec
# 3. Apply any Kong-specific patches if provided
# 4. Output the final configuration to kong/apis/kong-{api-name}-config.yaml

# Exit on error
set -e

# Default values
API_NAME=""
PATCHES_FILE=""
OPENAPI_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            API_NAME="$2"
            shift 2
            ;;
        --patches)
            PATCHES_FILE="$2"
            shift 2
            ;;
        --spec)
            OPENAPI_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --name <api-name> --patches <patches-file> --spec <openapi-file>"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$API_NAME" ]; then
    echo "Error: --name argument is required"
    echo "Usage: $0 --name <api-name> --patches <patches-file> --spec <openapi-file>"
    exit 1
fi

if [ -z "$OPENAPI_FILE" ]; then
    echo "Error: --spec argument is required"
    echo "Usage: $0 --name <api-name> --patches <patches-file> --spec <openapi-file>"
    exit 1
fi

# Get the /kong directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
KONG_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_ROOT="$(dirname "$KONG_DIR")"

OUTPUT_FILE="${KONG_DIR}/apis/kong-${API_NAME}-config.yaml"
LINTING_RULES="${WORKSPACE_ROOT}/kong/linting-rules.yaml"
# Check if OpenAPI file exists
if [ ! -f "$OPENAPI_FILE" ]; then
    echo "Error: OpenAPI file not found at $OPENAPI_FILE"
    exit 1
fi

# Check if patches file exists
if [ -n "$PATCHES_FILE" ]; then
    if [ ! -f "$PATCHES_FILE" ]; then
        echo "Error: Patches file not found at $PATCHES_FILE"
        exit 1
    fi
    PATCHES_CMD="deck file patch $PATCHES_FILE"
else
    echo "No patches file specified, continuing without patches..."
    PATCHES_CMD=""
fi

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Run deck commands
echo "Generating Kong configuration for $API_NAME..."
deck file openapi2kong -s "$OPENAPI_FILE" | \
$PATCHES_CMD -o "$OUTPUT_FILE"

echo "Linting Kong configuration for $API_NAME..."
deck file lint -s "$OUTPUT_FILE" "$LINTING_RULES"

echo "Successfully generated Kong configuration at $OUTPUT_FILE"
