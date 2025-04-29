import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getAllProducts = api(
  { method: "GET", path: "/products/all", expose: true },
  async (): Promise<GetProductsResponse> => {
    const products = await db.selectFrom("Products").selectAll().execute();
    return { message: "Products obtained successfully", products };
  }
);

export const getPaginatedProducts = api(
  { method: "GET", path: "/products", expose: true },
  async ({
    page,
    limit,
    brand,
    model,
  }: {
    page: number;
    limit: number;
    brand?: number;
    model?: number;
  }): Promise<PaginatedResponse<Product>> => {
    let query = await db
      .selectFrom("Products")
      .selectAll()
      .limit(limit)
      .offset((page - 1) * limit);

    if (brand) {
      query = query.where("brand_id", "=", brand);
    }
    if (model) {
      query = query.where("model_id", "=", model);
    }

    const products = await query.execute();
    const totalItems = await db
      .selectFrom("Products")
      .select(({ fn }) => [fn.count("id").as("totalItems")])
      .executeTakeFirst();
    if (!totalItems) {
      return {
        message: "No products found",
        paginate: { pages: 0, totalItems: 0, totalPages: 0, limit, page },
        items: [],
      };
    }
    const totalPages = Math.ceil(Number(totalItems.totalItems) / limit);
    const pages = Math.ceil(products.length / limit);
    return {
      message: "Products obtained successfully",
      paginate: {
        pages,
        totalItems: Number(totalItems.totalItems),
        totalPages,
        limit,
        page,
      },
      items: products,
    };
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
    name,
  }: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  }): Promise<CreateProductResponse> => {
    await db
      .insertInto("Products")
      .values({
        description,
        is_active,
        images,
        model_id,
        brand_id,
        name,
      })
      .executeTakeFirst();

    const formattedProduct = {
      description,
      is_active,
      images,
      model_id,
      brand_id,
      name,
    };
    return {
      message: "Product created successfully",
      product: formattedProduct,
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
  model_id: number;
  brand_id: number | null;
  name: string;
}
interface PaginatedResponse<T> {
  message: string;
  paginate: {
    pages: number;
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
  };
  items: T[];
}

interface GetPaginatedProductsResponse {
  message: string;
  paginate: {
    pages: number;
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
  };
  items: {
    id: number;
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  }[];
}

interface CreateProductResponse {
  message: string;
  product: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  };
}
