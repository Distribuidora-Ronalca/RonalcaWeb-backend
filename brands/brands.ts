import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getAllBrands = api(
  { method: "GET", path: "/brands/all", expose: true },
  async (): Promise<GetBrandsResponse> => {
    const brands = await db.selectFrom("Brands").selectAll().execute();
    const formattedBrands = brands.map((brand) => ({
      id: brand.id,
      description: brand.description,
      logoImage: brand.logo_image,
      isActive: brand.is_active,
      name: brand.name,
    }));
    return { message: "Brands obtained successfully", brands: formattedBrands };
  }
);

export const createBrand = api(
  { method: "POST", path: "/brands", expose: true },
  async ({
    description,
    logo_image,
    is_active,
    name,
  }: {
    description: string;
    logo_image: string;
    is_active: boolean;
    name: string;
  }): Promise<CreateBrandResponse> => {
    await db
      .insertInto("Brands")
      .values({
        description,
        logo_image,
        is_active,
        name,
      })
      .executeTakeFirst();
    const formattedBrand = {
      description,
      logo_image,
      is_active,
      name,
    };
    return { message: "Brand created successfully", brand: formattedBrand };
  }
);

interface GetBrandsResponse {
  message: string;
  brands: {
    id: number;
    description: string;
    logoImage: string;
    isActive: boolean;
    name: string;
  }[];
}

interface CreateBrandResponse {
  message: string;
  brand: {
    description: string;
    logo_image: string;
    is_active: boolean;
    name: string;
  };
}
