"use server";

import { dataset } from "./dataset";

export const getDataset = async (id: number) => {
  return dataset[id];
};
