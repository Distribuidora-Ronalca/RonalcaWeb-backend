import { Generated } from "kysely";
import { Insertable, Selectable, Updateable } from "kysely";
import { ColumnType } from "kysely";

export interface Database {
  Subsidiaries: SubsidiaryTable;
  Brands: BrandTable;
  Models: ModelTable;
  Spaces: SpaceTable;
  Products: ProductTable;
  ProductsInSpaces: ProductsInSpacesTable;
  Projects: ProjectTable;
}

export interface SubsidiaryTable {
  id: Generated<number>;
  email: string;
  logo: string;
  phone_number: string;
  location: string;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Subsidiary = Selectable<SubsidiaryTable>;
export type NewSubsidiary = Insertable<SubsidiaryTable>;
export type SubsidiaryUpdate = Updateable<SubsidiaryTable>;

export interface BrandTable {
  id: Generated<number>;
  name: string;
  description: string;
  logo_image: string;
  is_active: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Brand = Selectable<BrandTable>;
export type NewBrand = Insertable<BrandTable>;
export type BrandUpdate = Updateable<BrandTable>;

export interface ModelTable {
  id: Generated<number>;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Model = Selectable<ModelTable>;
export type NewModel = Insertable<ModelTable>;
export type ModelUpdate = Updateable<ModelTable>;

export interface SpaceTable {
  id: Generated<number>;
  name: string;
  description: string;
  image: string;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Space = Selectable<SpaceTable>;
export type NewSpace = Insertable<SpaceTable>;
export type SpaceUpdate = Updateable<SpaceTable>;

export interface ProductTable {
  id: Generated<number>;
  name: string;
  description: string;
  is_active: boolean;
  images: string[];
  model_id: number;
  brand_id: number | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Product = Selectable<ProductTable>;
export type NewProduct = Insertable<ProductTable>;
export type ProductUpdate = Updateable<ProductTable>;

export interface ProductsInSpacesTable {
  product_id: number;
  space_id: number;
}

export type ProductsInSpaces = Selectable<ProductsInSpacesTable>;
export type NewProductsInSpaces = Insertable<ProductsInSpacesTable>;
export type ProductsInSpacesUpdate = Updateable<ProductsInSpacesTable>;

export interface ProjectTable {
  id: Generated<number>;
  name: string;
  location: string;
  description: string;
  image: string;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;
