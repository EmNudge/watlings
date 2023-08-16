#!/bin/bash

node build.mjs "$@" && npm run test -- "$@"