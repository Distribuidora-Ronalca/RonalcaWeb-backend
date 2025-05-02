DROP TABLE "ProductsInSpaces";

CREATE TABLE "ProductsInSpaces"(
    "product_id" INTEGER NOT NULL,
    "space_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("product_id", "space_id"),
    CONSTRAINT "products_in_spaces_products_id_foreign" FOREIGN KEY ("product_id") REFERENCES "Products"("id"),
    CONSTRAINT "products_in_spaces_space_id_foreign" FOREIGN KEY ("space_id") REFERENCES "Spaces"("id")
);