#!/bin/bash
#
# This script deploys Kong API Gateway configuration by:
# 1. Merging all API config files (*.yaml) from the apis/ directory into a single file
# 2. Merging the combined API configs with platform base templates
# 3. Applying any patches defined in patches.yaml
# 4. Previewing changes that would be made to Kong
# 5. Syncing the final configuration to Kong Gateway (unless --preview is specified)
#
# Required environment variables:
# - KONG_CONTROL_PLANE: Name of the Kong control plane
# - KONG_TOKEN: Authentication token for Kong
# - KONG_ADDR: Address of the Kong Gateway instance
#
# Optional arguments:
# --preview: Only show the diff without syncing to the gateway

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
