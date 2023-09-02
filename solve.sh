#!/bin/bash0

# Strip the path and extension from $1
src="$1"
stripped_file="${src##*/}"
stripped_file="${stripped_file%.*}"

# Search the exercises folder for the first matching file
target_file=$(find exercises -name "*$stripped_file*" -type f -print -quit)

if [[ -z "$target_file" ]]; then
  echo "No matching file found in the exercises folder."
  return 1
fi

# Strip the path and extension from $1
stripped_target="${target_file##*/}"
stripped_target="${stripped_target%.*}"

# Apply the patch
patch "$target_file" < "patch/$stripped_target.patch"
echo "Patch applied successfully to: $target_file"