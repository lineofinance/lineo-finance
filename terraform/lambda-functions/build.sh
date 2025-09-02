#!/bin/bash

# Build Lambda deployment packages

set -e

echo "Building Lambda deployment packages..."

# Build contact-form package
echo "Building contact-form..."
cd contact-form
zip -r ../contact-form.zip index.js
cd ..

# Build career-form package
echo "Building career-form..."
cd career-form
zip -r ../career-form.zip index.js
cd ..

echo "Lambda packages built successfully!"
echo "  - contact-form.zip"
echo "  - career-form.zip"