# Master Skeleton Atlas Images

## master_skeleton.jpg

Place the high-resolution **Exploded Skeleton** master image here as:

```
public/images/master_skeleton.jpg
```

This image is used by the CSS sprite system (`src/data/boneStyles.ts`) to render
individual bone views across Quiz and Flashcard components via `background-position`.

## master_skeleton_hd.jpg (optional)

For the Senior/Black Diamond rank unlock, you can provide a higher-resolution version:

```
public/images/master_skeleton_hd.jpg
```

If this file does not exist, the standard `master_skeleton.jpg` is used as fallback.

## Coordinate Calibration

After placing the image, open `src/data/boneStyles.ts` to fine-tune the `x`, `y`,
and `zoom` values for each bone ID so they align with the actual image layout.

- `x`: horizontal center of the bone in the image (0 = far left, 100 = far right)
- `y`: vertical center of the bone in the image (0 = top, 100 = bottom)
- `zoom`: how much to zoom in (1 = full image, 4 = 4× zoom, etc.)
