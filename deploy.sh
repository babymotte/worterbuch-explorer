#!/bin/bash
VERSION=$(jq <package.json -r '.version')
git tag v$VERSION &&
    docker build -t babymotte/worterbuch-explorer:latest -t babymotte/worterbuch-explorer:$VERSION . &&
    docker push babymotte/worterbuch-explorer:latest &&
    docker push babymotte/worterbuch-explorer:$VERSION &&
    git push && git push --tags
