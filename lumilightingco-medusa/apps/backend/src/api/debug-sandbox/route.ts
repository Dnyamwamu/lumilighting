import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { model } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const keys = new Set<string>();
    
    // Get all properties of the model object
    let obj = model;
    while (obj && obj !== Object.prototype) {
      Object.getOwnPropertyNames(obj).forEach(k => keys.add(k));
      obj = Object.getPrototypeOf(obj);
    }

    const allKeys = Array.from(keys).sort();

    return res.json({
      success: true,
      all_model_properties: allKeys
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
};
