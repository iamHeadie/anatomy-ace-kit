# Master Skeleton Atlas Image

Place the master exploded-skeleton image here as:

```
public/images/master_skeleton.jpg
```

This image is used by the CSS Sprite system (`src/data/boneStyles.ts`) to render
individual bone views in the Quiz and Flashcard components via `background-position`.

## Requirements
- File name: `master_skeleton.jpg`
- Format: JPEG (or change the path in `src/data/boneStyles.ts` if using PNG/WEBP)
- Orientation: Front (anterior) view, anatomical position
- The coordinate map in `boneStyles.ts` assumes:
  - Patient's LEFT side appears on the RIGHT side of the image (viewer's right)
  - Patient's RIGHT side appears on the LEFT side of the image (viewer's left)
  - Top of image = top of skull (y ≈ 0%)
  - Bottom of image = tips of toes (y ≈ 100%)
