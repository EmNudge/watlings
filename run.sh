#!/bin/bash

node build.mjs $1
npm run test -- $1