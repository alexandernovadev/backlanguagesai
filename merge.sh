echo "Merging develop into main and pushing to origin and returning to develop"

git checkout develop
git pull

git checkout main
git pull


git merge develop

git push origin main

git checkout develop

echo "Merged develop into main and pushed to origin"