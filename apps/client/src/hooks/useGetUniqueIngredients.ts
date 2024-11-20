"use client";

import { Item } from "../components/list";

export const useGetUniqueIngredients = (items: Item[]) => {
  console.log('ITEMS: ', items)
  const allIngredients = items?.flatMap((item) => item.ingredients);
  const uniqueIngredients = [...new Set(allIngredients)].filter((ingredient) => ingredient !== "").sort();

  return uniqueIngredients;
};
