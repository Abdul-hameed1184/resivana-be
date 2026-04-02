#!/bin/bash

# Test Runner Script for Resivana Backend
# Usage: ./run-tests.sh [option]

echo "🧪 Resivana Backend Test Runner"
echo "================================"

case "$1" in
  all)
    echo "Running all tests..."
    npm test
    ;;
  unit)
    echo "Running unit tests..."
    npm test -- --testPathPattern="unit/"
    ;;
  api)
    echo "Running API tests..."
    npm test -- --testPathPattern="api/"
    ;;
  security)
    echo "Running security tests..."
    npm test -- --testPathPattern="security/"
    ;;
  validation)
    echo "Running validation tests..."
    npm test -- --testPathPattern="validation/"
    ;;
  error)
    echo "Running error handling tests..."
    npm test -- --testPathPattern="error/"
    ;;
  database)
    echo "Running database tests..."
    npm test -- --testPathPattern="database/"
    ;;
  e2e)
    echo "Running E2E tests..."
    npm test -- --testPathPattern="e2e/"
    ;;
  performance)
    echo "Running performance tests..."
    npm test -- --testPathPattern="performance/"
    ;;
  watch)
    echo "Running tests in watch mode..."
    npm run test:watch
    ;;
  coverage)
    echo "Generating coverage report..."
    npm run test:cov
    echo "📊 Coverage report generated in coverage/"
    ;;
  failing)
    echo "Running only failing tests..."
    npm test -- --onlyChanged
    ;;
  debug)
    echo "Running tests in debug mode..."
    node --inspect-brk node_modules/.bin/jest --runInBand
    ;;
  *)
    echo "Available options:"
    echo "  all              - Run all tests"
    echo "  unit             - Run unit tests only"
    echo "  api              - Run API tests only"
    echo "  security         - Run security tests only"
    echo "  validation       - Run validation tests only"
    echo "  error            - Run error handling tests only"
    echo "  database         - Run database tests only"
    echo "  e2e              - Run E2E tests only"
    echo "  performance      - Run performance tests only"
    echo "  watch            - Run tests in watch mode"
    echo "  coverage         - Generate coverage report"
    echo "  failing          - Run only failing tests"
    echo "  debug            - Run tests in debug mode"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh unit"
    echo "  ./run-tests.sh watch"
    ;;
esac
