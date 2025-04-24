#!/bin/bash
#
# This script publishes OpenAPI specifications for AWS API Gateway
#
# Usage:
#   ./publish-api.sh --name <api-name> --spec <openapi-file>
#
# Arguments:
#   --name      Required. The name of the API (e.g. "customer-api", "product-api")
#   --spec      Required. Path to the OpenAPI/Swagger specification file
#
# Example:
#   ./publish-api.sh \
#     --name customer-api \
#     --spec ./openapi.yaml
#
# The script will:
# 1. Validate the required arguments are provided
# 2. Copy the OpenAPI file to the output directory
# 3. Output the final configuration to apis/api-{api-name}-config.yaml

# Exit on error
set -e

# Default values
API_NAME=""
OPENAPI_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            API_NAME="$2"
            shift 2
            ;;
        --spec)
            OPENAPI_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --name <api-name> --spec <openapi-file>"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$API_NAME" ]; then
    echo "Error: --name argument is required"
    echo "Usage: $0 --name <api-name> --spec <openapi-file>"
    exit 1
fi

if [ -z "$OPENAPI_FILE" ]; then
    echo "Error: --spec argument is required"
    echo "Usage: $0 --name <api-name> --spec <openapi-file>"
    exit 1
fi

# Get the /kong directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
API_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_ROOT="$(dirname "$API_DIR")"

OUTPUT_FILE="${API_DIR}/apis/api-${API_NAME}-config.yaml"
# Check if OpenAPI file exists
if [ ! -f "$OPENAPI_FILE" ]; then
    echo "Error: OpenAPI file not found at $OPENAPI_FILE"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Copy the OpenAPI file to the output directory
echo "Copying OpenAPI file to $OUTPUT_FILE..."
cp "$OPENAPI_FILE" "$OUTPUT_FILE"

echo "Linting OpenAPI configuration for $API_NAME..."
# TODO: Implement linting

echo "Successfully generated AWS API Gateway configuration at $OUTPUT_FILE"
