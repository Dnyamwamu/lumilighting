import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "title", "type"],
  });

  return res.json({ keys });
};
