/*
  Warnings:

  - Added the required column `slug` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" REAL,
    "images" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_properties" ("address", "area", "bathrooms", "bedrooms", "category", "city", "createdAt", "description", "featured", "id", "images", "price", "state", "title", "type", "updatedAt", "slug") SELECT "address", "area", "bathrooms", "bedrooms", "category", "city", "createdAt", "description", "featured", "id", "images", "price", "state", "title", "type", "updatedAt", 
  lower(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(
                          replace(
                            "type" || '-' || "title" || '-' || "city" || '-' || "state",
                            ' ', '-'
                          ),
                          'ã', 'a'
                        ),
                        'ç', 'c'
                      ),
                      'ê', 'e'
                    ),
                    'é', 'e'
                  ),
                  'ô', 'o'
                ),
                'ó', 'o'
              ),
              'á', 'a'
            ),
            'í', 'i'
          ),
          'ú', 'u'
        ),
        'ão', 'ao'
      ),
      '--', '-'
    )
  ) as slug
FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
