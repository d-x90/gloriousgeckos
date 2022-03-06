#!/bin/bash

psql -d ggeckos -h localhost -p 5432 -U admin -W password -c "update "Nft" set score = 0, "isOnCooldown" = false;"