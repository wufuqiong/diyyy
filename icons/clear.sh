#!/bin/bash

echo "PNG File Cleanup Script"
echo "======================="

# Count files before deletion
count=$(find . -maxdepth 3 -name "*.png" -type f -size -1k | wc -l)

if [ $count -eq 0 ]; then
    echo "No .png files smaller than 1KB found."
    exit 0
fi

echo "Found $count .png file(s) smaller than 1KB:"
find . -maxdepth 3 name "*.png" -type f -size -1k -ls

echo
read -p "Do you want to delete these files? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    find . -maxdepth 3 -name "*.png" -type f -size -1k -delete
    echo "Deleted $count file(s)."
else
    echo "Deletion cancelled."
fi
