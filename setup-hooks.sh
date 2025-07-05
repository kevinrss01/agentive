#!/bin/bash

echo "🔧 Setting up Git hooks for hackathon-lalabai..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the root of the hackathon-lalabai project"
    exit 1
fi

# Create the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

echo "🔍 Running lint check in frontend..."

# Change to frontend directory and run lint
cd frontend

# Run lint and capture the output
LINT_OUTPUT=$(pnpm run lint 2>&1)
LINT_EXIT_CODE=$?

# Check if there are actual ESLint errors
if [ $LINT_EXIT_CODE -ne 0 ]; then
    echo "❌ Lint check failed! Please fix the errors before committing."
    echo "💡 You can run 'cd frontend && pnpm run lint' to see the errors."
    exit 1
fi

echo "✅ Lint check passed!"
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 What this does:"
echo "   - Runs 'pnpm run lint' in frontend before each commit"
echo "   - Blocks commits if there are ESLint errors"
echo ""
echo "🔄 To disable temporarily: git commit --no-verify"
echo "🔍 To check lint manually: cd frontend && pnpm run lint" 