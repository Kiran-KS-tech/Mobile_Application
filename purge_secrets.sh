#!/bin/bash

# Script to purge backend/.env from git history to resolve GH013 error
# This will rewrite the entire history!

set -e

# 1. Back up the current .env file (just in case)
echo "Backing up backend/.env to backend/.env.bak..."
cp backend/.env backend/.env.bak || echo "backend/.env not found, skipping backup."

# 2. Check for git-filter-repo (modern tool)
if command -v git-filter-repo &> /dev/null
then
    echo "Using git-filter-repo to purge backend/.env from history..."
    git-filter-repo --path backend/.env --invert-paths --force
else
    # 3. Fallback to git filter-branch (included with git)
    echo "git-filter-repo not found. Using git filter-branch fallback..."
    git filter-branch --force --index-filter \
      "git rm --cached --ignore-unmatch backend/.env" \
      --prune-empty --tag-name-filter cat -- --all
fi

# 4. Clean up
echo "Cleaning up local git references..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "History purge complete!"
echo "-------------------------------------------------------"
echo "Next steps:"
echo "1. Verify your local backend/.env.bak is safe."
echo "2. Rename it back to .env: cp backend/.env.bak backend/.env"
echo "3. Run: git push origin main --force"
echo "4. IMPORTATNT: Create a NEW Groq API key and update your .env."
echo "-------------------------------------------------------"
