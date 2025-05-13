import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getAllProducts = api(
  { method: "GET", path: "/products/all", expose: true },
  async (): Promise<GetProductsResponse> => {
    const products = await db.selectFrom("Products").selectAll().execute();
    return { message: "Products obtained successfully", products };
  }
);

export const getProductById = api(
  { method: "GET", path: "/products/:id", expose: true },
  async ({ id }: { id: number }): Promise<GetProductByIdResponse> => {
    const product = await db
      .selectFrom("Products")
      .leftJoin("Models", "Products.model_id", "Models.id")
      .leftJoin("Brands", "Products.brand_id", "Brands.id")
      .leftJoin(
        "ProductsInSpaces",
        "Products.id",
        "ProductsInSpaces.product_id"
      )
      .leftJoin("Spaces", "ProductsInSpaces.space_id", "Spaces.id")
      .select([
        "Products.id",
        "Products.description",
        "Products.is_active",
        "Products.images",
        "Products.name",
        "Models.id as model_id",
        "Models.name as model_name",
        "Brands.id as brand_id",
        "Brands.name as brand_name",
        "Spaces.id as space_id",
        "Spaces.name as space_name",
        "Spaces.description as space_description",
        "Spaces.image as space_image",
      ])
      .where("Products.id", "=", id)
      .execute();

    if (!product || product.length === 0) {
      throw new Error("Product not found");
    }

    const spaces = product
      .filter((row) => row.space_id !== null)
      .map((row) => ({
        id: row.space_id!,
        name: row.space_name!,
        description: row.space_description!,
        image: row.space_image!,
      }));

    const formattedProduct = {
      id: product[0].id!,
      description: product[0].description!,
      isActive: product[0].is_active!,
      images: product[0].images,
      model: {
        id: product[0].model_id!,
        name: product[0].model_name!,
      },
      brand: product[0].brand_id
        ? {
            id: product[0].brand_id,
            name: product[0].brand_name!,
          }
        : null,
      name: product[0].name!,
      spaces: spaces,
    };

    return {
      message: "Product obtained successfully",
      product: formattedProduct,
    };
  }
);

export const getPaginatedProducts = api(
  { method: "GET", path: "/products", expose: true },
  async ({
    page,
    limit,
    brand,
    model,
    space,
    name,
  }: {
    page: number;
    limit: number;
    brand?: string;
    model?: string;
    space?: string;
    name?: string;
  }): Promise<PaginatedResponse<Product>> => {
    return db.transaction().execute(async (trx) => {
      let query = await db
        .selectFrom("Products")
        .leftJoin(
          "ProductsInSpaces",
          "Products.id",
          "ProductsInSpaces.product_id"
        )
        .leftJoin("Spaces", "ProductsInSpaces.space_id", "Spaces.id")
        .leftJoin("Models", "Products.model_id", "Models.id")
        .leftJoin("Brands", "Products.brand_id", "Brands.id")
        .select([
          "Products.id",
          "Products.description",
          "Products.is_active",
          "Products.images",
          "Products.model_id",
          "Products.brand_id",
          "Products.name",
          "Models.id as model_id",
          "Models.name as model_name",
          "Brands.id as brand_id",
          "Brands.name as brand_name",
          "Spaces.id as space_id",
          "Spaces.name as space_name",
          "Spaces.description as space_description",
          "Spaces.image as space_image",
        ])
        .limit(limit)
        .offset((page - 1) * limit);

      if (brand) {
        query = query.where("Brands.name", "=", brand);
      }
      if (model) {
        query = query.where("Models.name", "=", model);
      }
      if (space) {
        query = query.where("Spaces.name", "=", space);
      }
      if (name) {
        query = query.where("Products.name", "ilike", `%${name}%`);
      }

      const results = await query.execute();

      const productsMap = new Map();
      results.map((row) => {
        if (!productsMap.has(row.id)) {
          productsMap.set(row.id, {
            id: row.id,
            description: row.description,
            is_active: row.is_active,
            images: row.images,
            name: row.name,
            model: {
              id: row.model_id,
              name: row.model_name,
            },
            brand: row.brand_id
              ? {
                  id: row.brand_id,
                  name: row.brand_name,
                }
              : null,
            spaces: [],
          });
        }

        if (row.space_id) {
          productsMap.get(row.id).spaces.push({
            id: row.space_id,
            name: row.space_name,
            description: row.space_description,
            image: row.space_image,
          });
        }
      });

      const products = Array.from(productsMap.values());

      let totalItemsQuery = await db
        .selectFrom("Products")
        .leftJoin(
          "ProductsInSpaces",
          "Products.id",
          "ProductsInSpaces.product_id"
        )
        .leftJoin("Spaces", "ProductsInSpaces.space_id", "Spaces.id")
        .leftJoin("Models", "Products.model_id", "Models.id")
        .leftJoin("Brands", "Products.brand_id", "Brands.id")
        .select(({ fn }) => [fn.count<number>("Products.id").as("totalItems")]);

      if (brand) {
        query = query.where("Brands.name", "=", brand);
      }
      if (model) {
        query = query.where("Models.name", "=", model);
      }
      if (space) {
        query = query.where("Spaces.name", "=", space);
      }
      if (name) {
        query = query.where("Products.name", "ilike", `%${name}%`);
      }

      const totalItems = await totalItemsQuery.executeTakeFirst();

      const totalPages = totalItems
        ? Math.ceil(Number(totalItems.totalItems) / limit)
        : 0;

      console.log(totalItems?.totalItems);

      return {
        message: "Products obtained successfully",
        paginate: {
          totalItems: Number(totalItems?.totalItems),
          totalPages,
          limit,
          page,
        },
        items: products,
      };
    });
  }
);

export const createProduct = api(
  { method: "POST", path: "/products", expose: true },
  async ({
    description,
    is_active,
    images,
    model_id,
    brand_id,
    spacesIds,
    name,
  }: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    spacesIds: number[];
    name: string;
  }): Promise<CreateProductResponse> => {
    const product = await db
      .insertInto("Products")
      .values({
        description,
        is_active,
        images,
        model_id,
        brand_id,
        name,
      })
      .returning(["id", "name"])
      .executeTakeFirstOrThrow();

    await db
      .insertInto("ProductsInSpaces")
      .values(
        spacesIds.map((spaceId) => ({
          product_id: product.id,
          space_id: spaceId,
        }))
      )
      .returning(["product_id", "space_id"])
      .execute();

    const formattedProduct = {
      id: product.id,
      description,
      isActive: is_active,
      images,
      modelId: model_id,
      brandId: brand_id,
      name,
    };
    return {
      message: "Product created successfully",
      product: formattedProduct,
    };
  }
);

export const getRandomProducts = api(
  { method: "GET", path: "/products/random/:limit", expose: true },
  async ({ limit }: { limit: number }): Promise<GetRandomProductsResponse> => {
    // Primero obtenemos los IDs aleatorios
    const randomIds = await db
      .selectFrom("Products")
      .select("id")
      .orderBy("id")
      .limit(limit)
      .execute();

    if (randomIds.length === 0) {
      return {
        message: "No se encontraron productos",
        products: [],
      };
    }

    // Luego obtenemos los productos completos con esos IDs
    const products = await db
      .selectFrom("Products")
      .leftJoin("Models", "Products.model_id", "Models.id")
      .leftJoin("Brands", "Products.brand_id", "Brands.id")
      .leftJoin(
        "ProductsInSpaces",
        "Products.id",
        "ProductsInSpaces.product_id"
      )
      .leftJoin("Spaces", "ProductsInSpaces.space_id", "Spaces.id")
      .select([
        "Products.id",
        "Products.description",
        "Products.is_active",
        "Products.images",
        "Products.name",
        "Models.id as model_id",
        "Models.name as model_name",
        "Brands.id as brand_id",
        "Brands.name as brand_name",
        "Spaces.id as space_id",
        "Spaces.name as space_name",
        "Spaces.description as space_description",
        "Spaces.image as space_image",
      ])
      .where(
        "Products.id",
        "in",
        randomIds.map((r) => r.id)
      )
      .execute();

    const productsMap = new Map();
    products.forEach((row) => {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          description: row.description,
          isActive: row.is_active,
          images: row.images,
          name: row.name,
          model: {
            id: row.model_id!,
            name: row.model_name!,
          },
          brand: row.brand_id
            ? {
                id: row.brand_id,
                name: row.brand_name!,
              }
            : null,
          spaces: [],
        });
      }

      if (row.space_id) {
        productsMap.get(row.id).spaces.push({
          id: row.space_id,
          name: row.space_name!,
          description: row.space_description!,
          image: row.space_image!,
        });
      }
    });

    return {
      message: "Productos aleatorios obtenidos exitosamente",
      products: Array.from(productsMap.values()),
    };
  }
);

interface GetProductsResponse {
  message: string;
  products: {
    id: number;
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  }[];
}

interface Product {
  id: number;
  description: string;
  is_active: boolean;
  images: string[];
  model: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  } | null;
  name: string;
  spaces: {
    id: number;
    name: string;
    description: string;
    image: string;
  }[];
}
interface PaginatedResponse<T> {
  message: string;
  paginate: {
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
  };
  items: T[];
}

interface CreateProductResponse {
  message: string;
  product: {
    description: string;
    isActive: boolean;
    images: string[];
    modelId: number;
    brandId: number | null;
    name: string;
  };
}

interface GetProductByIdResponse {
  message: string;
  product: {
    id: number;
    description: string;
    isActive: boolean;
    images: string[];
    model: {
      id: number;
      name: string;
    };
    brand: {
      id: number;
      name: string;
    } | null;
    name: string;
    spaces: {
      id: number;
      name: string;
      description: string;
      image: string;
    }[];
  };
}

interface GetRandomProductsResponse {
  message: string;
  products: {
    id: number;
    description: string;
    isActive: boolean;
    images: string[];
    name: string;
    model: {
      id: number;
      name: string;
    };
    brand: {
      id: number;
      name: string;
    } | null;
    spaces: {
      id: number;
      name: string;
      description: string;
      image: string;
    }[];
  }[];
}
