import {
  LoaderOptions,
  IMedusaInternalService,
} from "@medusajs/framework/types";
import { InvoiceConfig } from "../models/invoice-config";

export default async function createDefaultConfigLoader({
  container,
}: LoaderOptions) {
  const service: IMedusaInternalService<typeof InvoiceConfig> =
    container.resolve("invoiceConfigService");

  try {
    const [_, count] = await service.listAndCount();

    if (count > 0) {
      return;
    }

    await service.create({
      company_name: "LUMI Lighting",
      company_address: "Lumi Lighting, 14 Kijabe Street, Nairobi, Kenya",
      company_phone: "+254 706 504 644",
      company_email: "info@lumilighting.co.ke",
    });
  } catch (error: any) {
    if (
      error.code === "42P01" ||
      error.message?.includes("relation") ||
      error.message?.includes("does not exist")
    ) {
      console.warn(
        "InvoiceConfig table not found. Skipping default config seeding.",
      );
      return;
    }
    throw error;
  }
}
