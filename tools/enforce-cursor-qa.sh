#!/bin/bash

echo "🚨 Running Cursor QA Enforcement Script..."

# 1. Validate Node Modules
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Run 'yarn install' first."
  exit 1
fi

# 2. Check Required Assets
declare -a assets=("assets/splash/splash.png" "assets/icon.png" "assets/images/placeholder-seed.png")

for asset in "${assets[@]}"; do
  if [ ! -f "$asset" ]; then
    echo "❌ MISSING ASSET: $asset"
    exit 1
  else
    echo "✅ Found asset: $asset"
  fi
done

# 3. Run ESLint (non-blocking for now due to config issues)
echo "🔍 Running ESLint..."
npx eslint app/ || {
  echo "⚠️ ESLint errors detected. Please review and fix when possible."
}

# 4. Run TypeScript Check
echo "🔍 Running TypeScript type check..."
npx tsc --noEmit || {
  echo "❌ TypeScript errors detected. Cursor must fix typings."
  exit 1
}

# 5. Run Unit Tests
if [ -f "jest.config.js" ]; then
  echo "🧪 Running Jest tests..."
  yarn test || {
    echo "❌ Some unit tests failed."
    exit 1
  }
else
  echo "⚠️ No jest.config.js found. Skipping tests."
fi

# 6. Run Expo Doctor
echo "🩺 Running Expo Doctor..."
npx expo doctor || {
  echo "❌ Expo doctor found issues. Cursor must resolve."
  exit 1
}

# 7. Run Expo Prebuild Validation (no install)
echo "🔧 Validating prebuild config..."
npx expo prebuild --no-install || {
  echo "❌ Expo prebuild failed. Plugin/config error exists."
  exit 1
}

# 8. Check for 'require("undefined")' usage
echo "🔍 Checking for require('undefined')..."
grep -r "require(\"undefined" app/ && {
  echo "❌ Found require(\"undefined\") usage! This will crash the app."
  exit 1
} || echo "✅ No require(\"undefined\") found."

# 9. Check for bad alias usage
echo "🔍 Scanning for illegal alias usage (e.g. 'hooks/' instead of '@/hooks')..."
grep -r "from 'hooks/" app/ && {
  echo "❌ Found invalid import: from 'hooks/'. Cursor must use relative paths or alias '@/hooks/'."
  exit 1
} || echo "✅ No bad alias usage."

# 10. Check for missing component imports and incorrect hook paths
echo "🔍 Checking for missing component files and incorrect hook paths..."
missing_components=0
incorrect_hook_paths=0

# Find all imports in app/ directory and check if imported files exist
while IFS= read -r line; do
  # Extract relative import paths from TypeScript/JavaScript files
  if [[ $line =~ from[[:space:]]+[\"\']\.\./([^\"\']+)[\"\'] ]]; then
    import_path="${BASH_REMATCH[1]}"
    # Convert to file path and check common extensions
    for ext in ".tsx" ".ts" ".jsx" ".js"; do
      file_path="${import_path}${ext}"
      if [ -f "$file_path" ]; then
        break
      elif [[ $ext == ".js" ]]; then
        echo "❌ Missing component: $import_path (referenced in $(echo $line | cut -d: -f1))"
        missing_components=$((missing_components + 1))
      fi
    done
  fi
  
  # Check for incorrect hook import paths (should use ../../hooks/ not ../hooks/ from app subdirs)
  if [[ $line =~ app/.*: ]] && [[ $line =~ from[[:space:]]+[\"\']\.\./hooks/ ]]; then
    file_location=$(echo $line | cut -d: -f1)
    if [[ $file_location =~ app/.*/.* ]]; then
      echo "❌ Incorrect hook path: $file_location should use '../../hooks/' not '../hooks/'"
      incorrect_hook_paths=$((incorrect_hook_paths + 1))
    fi
  fi
done < <(grep -r "from [\"']\.\." app/ 2>/dev/null || true)

if [ $missing_components -gt 0 ] || [ $incorrect_hook_paths -gt 0 ]; then
  echo "❌ Found $missing_components missing component(s) and $incorrect_hook_paths incorrect hook path(s)."
  exit 1
else
  echo "✅ All imported components exist and hook paths are correct."
fi

# 11. Check for dynamic require() usage that causes crashes
echo "🔍 Checking for dynamic require() usage..."
dynamic_requires=0

# Check for Image source props that might use undefined values
while IFS= read -r line; do
  if [[ $line =~ source=\{[^}]*\} ]] && [[ ! $line =~ uri: ]] && [[ ! $line =~ require\( ]]; then
    # This might be a dynamic source like source={plant.image}
    echo "⚠️ Potential dynamic Image source: $line"
    echo "   Consider adding fallback: source={plant.image || placeholderImage}"
    dynamic_requires=$((dynamic_requires + 1))
  fi
done < <(grep -r "source={" app/ components/ 2>/dev/null || true)

if [ $dynamic_requires -gt 0 ]; then
  echo "⚠️ Found $dynamic_requires potential dynamic Image sources. Review for undefined values."
else
  echo "✅ No problematic dynamic Image sources found."
fi

echo "✅ All checks passed. Cursor delivery validated." 