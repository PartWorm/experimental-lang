#!/bin/bash

tsc-bundle src/index.ts --outFile index.js && node index.js
