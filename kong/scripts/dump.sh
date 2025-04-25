#!/bin/bash

deck gateway dump --konnect-control-plane-name $KONG_CONTROL_PLANE \
        --konnect-token $KONG_TOKEN \
        --konnect-addr $KONG_ADDR