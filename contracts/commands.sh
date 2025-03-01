#!/bin/bash
build-image() {
  docker build . -t algokit-builder
}
build-artifacts() {
  docker run -v $(pwd):/src -v $(pwd)/artifacts:/artifacts algokit-builder
}
build-all() {
  build-image && build-artifacts
}
cli() {
  (
    cd src/scripts
    npx tsc
    node main.js ${@}
  )
}
pytest() {
  (
    cd src
    pytest
  )
}
demo() {
  (
    cd src/scripts
    npx tsc
    case ${1} in
      *) {
        echo "demo not found"
        false
      } ;;
    esac
  )
}
mocha() {
  (
    set -e
    cd src/scripts
    npx tsc
    test ${#} -eq 0 && {
      npm test
      true
    } || {
      npm run test-${1}
    }
  )
}
