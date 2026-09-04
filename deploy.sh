#!/bin/bash
VERSION=$(jq <package.json -r '.version')
git tag v$VERSION -m "$VERSION" &&
    docker build --push -t babymotte/worterbuch-explorer:latest -t babymotte/worterbuch-explorer:$VERSION . &&
    git push && git push --tags &&
    helm upgrade -n worterbuch worterbuch-explorer chart/
