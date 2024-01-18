#!/bin/bash
VERSION=$(jq <package.json -r '.version')
git tag v$VERSION &&
    docker build -t babymotte/worterbuch-explorer:latest -t babymotte/worterbuch-explorer:$VERSION . &&
    docker push babymotte/worterbuch-explorer:latest &&
    docker push babymotte/worterbuch-explorer:$VERSION &&
    CHART=$(yq <chart/Chart.yaml ".version=\"$VERSION\"|.appVersion=\"$VERSION\"") &&
    echo "$CHART" >chart/Chart.yaml && git add chart/Chart.yaml && git commit -m "updated helm chart" &&
    git push && git push --tags &&
    helm upgrade worterbuch-explorer chart/
