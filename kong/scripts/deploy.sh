#!/bin/bash
#
# Kong API Gateway Deployment Script
# ==================================
#
# This script automates the deployment of Kong API Gateway configurations by following
# a structured process of merging configurations, applying patches, and syncing with
# the Kong Gateway instance.
#
# Usage:
#   ./deploy.sh [--preview]
#
# Options:
#   --preview    Only show the diff without syncing to the gateway
#
# Environment Variables:
#   Required:
#   - KONG_CONTROL_PLANE    Name of the Kong control plane
#   - KONG_TOKEN            Authentication token for Kong
#   - KONG_ADDR             Address of the Kong Gateway instance
#
# Process:
# 1. Merges all API config files (*.yaml) from the apis/ directory into a single file
# 2. Merges the combined API configs with platform base templates
# 3. Applies any patches defined in patches.yaml
# 4. Previews changes that would be made to Kong
# 5. Syncs the final configuration to Kong Gateway (unless --preview is specified)
#
# Example:
#   export KONG_CONTROL_PLANE="my-control-plane"
#   export KONG_TOKEN="your-auth-token"
#   export KONG_ADDR="https://your-kong-address"
#   ./deploy.sh --preview  # To preview changes
#   ./deploy.sh            # To deploy changes
#
# Dependencies:
#   - deck (Kong's declarative configuration tool)
#   - bash
#
# Output:
#   - Generated files are stored in the ../generated/ directory
#   - kong-apis-combined.yaml: Combined API configurations
#   - kong.yaml: Final configuration after all merges and patches

# Parse command line arguments
PREVIEW_MODE=false
for arg in "$@"; do
    case $arg in
        --preview)
        PREVIEW_MODE=true
        shift
        ;;
    esac
done

# Combine API config files into a single file
deck file merge ../apis/*.yaml -o ../generated/kong-apis-combined.yaml

# Merge platform templates into a single file
deck file merge \
    ../generated/kong-apis-combined.yaml \
    ../kong-base.yaml \
    ../plugins/plugins.yaml \
    ../consumers/*.yaml | \
deck file patch \
    ../patches.yaml \
    -o ../generated/kong.yaml

# Preview the changes
deck gateway diff ../generated/kong.yaml --konnect-control-plane-name $KONG_CONTROL_PLANE \
    --konnect-token $KONG_TOKEN \
    --konnect-addr $KONG_ADDR

# Deploy to Kong if not in preview mode
if [ "$PREVIEW_MODE" = false ]; then
    deck gateway sync ../generated/kong.yaml --konnect-control-plane-name $KONG_CONTROL_PLANE \
        --konnect-token $KONG_TOKEN \
        --konnect-addr $KONG_ADDR
else
    echo "Preview mode: Skipping sync to gateway"
fi
