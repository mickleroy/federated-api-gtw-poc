#!/bin/bash
#
# This script deploys Kong API Gateway configuration by:
# 1. Merging all API config files (*.yaml) from the apis/ directory into a single file
# 2. Merging the combined API configs with platform base templates
# 3. Applying any patches defined in patches.yaml
# 4. Previewing changes that would be made to Kong
# 5. Syncing the final configuration to Kong Gateway
#
# Required environment variables:
# - KONG_CONTROL_PLANE: Name of the Kong control plane
# - KONG_TOKEN: Authentication token for Kong
# - KONG_ADDR: Address of the Kong Gateway instance

# Combine API config files into a single file
deck file merge ../apis/*.yaml -o ../generated/kong-apis-combined.yaml

# Merge platform templates into a single file
deck file merge ../kong-base.yaml ../generated/kong-apis-combined.yaml | \
# Apply patches
deck file patch ../patches.yaml -o ../generated/kong.yaml

# Preview the changes
deck gateway diff ../generated/kong.yaml --konnect-control-plane-name $KONG_CONTROL_PLANE \
    --konnect-token $KONG_TOKEN \
    --konnect-addr $KONG_ADDR

# Deploy to Kong
deck gateway sync ../generated/kong.yaml --konnect-control-plane-name $KONG_CONTROL_PLANE \
    --konnect-token $KONG_TOKEN \
    --konnect-addr $KONG_ADDR
