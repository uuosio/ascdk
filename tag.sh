VERSION=v0.2.0
TARGET=origin
git push $TARGET :refs/tags/$VERSION
git tag -d $VERSION
git tag $VERSION -F release.md
git push -f $TARGET $VERSION

