import { ExecArgs } from "@medusajs/framework/types";
import { 
  createShippingOptionsWorkflow 
} from "@medusajs/medusa/core-flows";

export default async function seedCustomShippingOptions({ container }: ExecArgs) {
  const query = container.resolve("query");

  console.log("Seeding custom shipping options...");

  // 1. Get region
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id"],
  });
  if (regions.length === 0) {
    throw new Error("No region found in database");
  }
  const region = regions[0];

  // 2. Get service zone
  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: ["id"],
  });
  if (serviceZones.length === 0) {
    throw new Error("No service zone found in database");
  }
  const serviceZone = serviceZones[0];

  // 3. Get shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  if (shippingProfiles.length === 0) {
    throw new Error("No shipping profile found in database");
  }
  const shippingProfile = shippingProfiles[0];

  // 4. Check existing shipping options
  const { data: existingShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  });

  console.log("Existing shipping options:", existingShippingOptions);

  const optionsToCreate: any[] = [];

  // Check if "Pickup From Store" exists
  const hasPickup = existingShippingOptions.some(o => o.name.toLowerCase().includes("pickup"));
  if (!hasPickup) {
    optionsToCreate.push({
      name: "Pickup From Store",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Pickup",
        description: "Pickup item from our store (Lumi Lighting, 14 Kijabe Street Nairobi, Kenya).",
        code: "pickup",
      },
      prices: [
        {
          currency_code: "kes",
          amount: 0,
        },
        {
          region_id: region.id,
          amount: 0,
        },
      ],
      rules: [
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    });
  }

  // Check if "Delivery Outside Nairobi" exists
  const hasOutside = existingShippingOptions.some(o => o.name.toLowerCase().includes("outside nairobi"));
  if (!hasOutside) {
    optionsToCreate.push({
      name: "Delivery Outside Nairobi",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Outside Nairobi",
        description: "Delivery outside Nairobi.",
        code: "outside_nairobi",
      },
      prices: [
        {
          currency_code: "kes",
          amount: 1500,
        },
        {
          region_id: region.id,
          amount: 1500,
        },
      ],
      rules: [
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    });
  }

  if (optionsToCreate.length > 0) {
    console.log(`Creating ${optionsToCreate.length} shipping options...`);
    await createShippingOptionsWorkflow(container).run({
      input: optionsToCreate,
    });
    console.log("Custom shipping options created successfully!");
  } else {
    console.log("Custom shipping options already exist.");
  }
}
