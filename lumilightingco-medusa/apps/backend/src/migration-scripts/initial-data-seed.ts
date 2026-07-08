import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  );

  const countries = ["ke"];

  logger.info("Seeding store data...");

  // 1. Sales Channel (idempotent)
  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  let defaultSalesChannel: any = existingSalesChannels.find(
    (sc) => sc.name === "Default Sales Channel",
  );
  if (!defaultSalesChannel) {
    const {
      result: [channel],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
            description: "Created by Medusa",
          },
        ],
      },
    });
    defaultSalesChannel = channel;
  }

  // 2. Publishable API Key (idempotent)
  const { data: existingApiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title"],
  });
  let publishableApiKey: any = existingApiKeys.find(
    (key) => key.title === "Default Publishable API Key",
  );
  if (!publishableApiKey) {
    const {
      result: [key],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Default Publishable API Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = key;
  }

  // Always ensure the publishable API key is linked to the default sales channel
  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    });
    logger.info("Successfully linked default sales channel to publishable API key.");
  } catch (err: any) {
    logger.info(`Link to sales channel skipped or already exists: ${err.message}`);
  }

  // 3. Store (idempotent - Medusa creates default store on db:setup)
  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });
  let store: any = existingStores[0];
  if (!store) {
    const {
      result: [newStore],
    } = await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "LUMI Lighting.",
            supported_currencies: [
              {
                currency_code: "kes",
                is_default: true,
              },
            ],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    });
    store = newStore;
  }

  // 4. Region (idempotent)
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });
  let region: any = existingRegions.find((r) => r.name === "Kenya");
  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run(
      {
        input: {
          regions: [
            {
              name: "Kenya",
              currency_code: "kes",
              countries,
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      },
    );
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  // 5. Tax Regions (idempotent: try-catch wrapped to ignore duplicates)
  logger.info("Seeding tax regions...");
  for (const country_code of countries) {
    try {
      await createTaxRegionsWorkflow(container).run({
        input: [
          {
            country_code,
            provider_id: "tp_system",
          },
        ],
      });
    } catch (err) {
      logger.info(
        `Tax region for country ${country_code} already exists or skipped.`,
      );
    }
  }
  logger.info("Finished seeding tax regions.");

  // 6. Stock Location (idempotent)
  const { data: existingStockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  let stockLocation: any = existingStockLocations.find(
    (sl) => sl.name === "LUMI Lighting Showroom",
  );
  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container,
    ).run({
      input: {
        locations: [
          {
            name: "LUMI Lighting Showroom",
            address: {
              city: "Nairobi",
              country_code: "KE",
              address_1: "14 Kijabe Street",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  }

  // 7. Fulfillment Set (idempotent)
  const { data: existingFulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name"],
  });
  let fulfillmentSet: any = existingFulfillmentSets.find(
    (fs) => fs.name === "LUMI Delivery Service",
  );
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "LUMI Delivery Service",
      type: "shipping",
      service_zones: [
        {
          name: "East Africa & EU",
          geo_zones: countries.map((c) => ({
            country_code: c,
            type: "country",
          })) as any,
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  }

  // 8. Shipping Profile & Options (idempotent)
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const { data: existingShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  });
  if (existingShippingOptions.length === 0) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Delivery in 2-3 business days.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "kes",
              amount: 650,
            },
            {
              region_id: region.id,
              amount: 650,
            },
          ],
          rules: [
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Delivery within 24 hours.",
            code: "express",
          },
          prices: [
            {
              currency_code: "kes",
              amount: 1300,
            },
            {
              region_id: region.id,
              amount: 1300,
            },
          ],
          rules: [
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  }
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  // 9. Categories Seeding (idempotent)
  logger.info("Seeding product categories...");
  const desiredCategories = [
    "LED Bulbs",
    "LED Panels",
    "Chandeliers",
    "Floodlights",
    "Switches & Sockets",
    "Lighting Accessories",
  ];

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  const categoriesToCreate = desiredCategories.filter(
    (name) => !existingCategories.some((cat) => cat.name === name),
  );

  if (categoriesToCreate.length > 0) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
  }

  // Refetch categories to get all IDs
  const { data: finalCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  // 10. Products Seeding (idempotent)
  logger.info("Seeding product data...");
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });

  const lumiProducts = [
    {
      title: "Vintage Edison Filament Bulb (4W)",
      category_name: "LED Bulbs",
      description:
        "Bring vintage charm to your space with this energy-efficient 4W LED Edison filament bulb. Warm amber glow, dimmable, and built to last.",
      handle: "vintage-edison-bulb-4w",
      price_kes: 45000,
      image:
        "https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const productsToCreate = lumiProducts.filter(
    (lp) => !existingProducts.some((p) => p.handle === lp.handle),
  );

  if (productsToCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate.map((lp) => {
          const category = finalCategories.find(
            (cat) => cat.name === lp.category_name,
          );
          return {
            title: lp.title,
            category_ids: category ? [category.id] : [],
            description: lp.description,
            handle: lp.handle,
            weight: 500,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [{ url: lp.image }],
            options: [
              {
                title: "Standard Option",
                values: ["Default"],
              },
            ],
            variants: [
              {
                title: "Default Variant",
                sku: `${lp.handle.toUpperCase()}-DEFAULT`,
                options: {
                  "Standard Option": "Default",
                },
                prices: [
                  {
                    amount: lp.price_kes,
                    currency_code: "kes",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel!.id,
              },
            ],
          };
        }),
      },
    });
  }
  logger.info("Finished seeding product data.");

  // 11. Inventory (idempotent)
  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id"],
  });

  const itemsToLevel = inventoryItems.filter(
    (item) => !existingLevels.some((el) => el.inventory_item_id === item.id),
  );

  if (itemsToLevel.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: itemsToLevel.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 1000,
          inventory_item_id: item.id,
        })),
      },
    });
  }

  logger.info("Finished seeding inventory levels data.");
}
