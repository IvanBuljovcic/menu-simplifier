'use client';

import { useGetUniqueIngredients } from '../hooks';
import React, { useEffect, useMemo, useState } from 'react';
import Ingredient from './ingredient';

export type Item = {
  name: string;
  ingredients: string[];
  price: {
    isDiscounted: boolean;
    amount: string;
  };
  image?: string;
  id: string;
};

const List = () => {
  const [data, setData] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query) {
      return null;
    }

    const res = await fetch(`http://localhost:3000/api/scrape?url=${query}`);
    const data = await res.json();

    setData(data.cards);
  };

  const uniqueIngredients = useGetUniqueIngredients(data);

  const filteredMenuItems = useMemo(() => {
    if (selected.length === 0) return data;
    return data.filter((item) =>
      selected.every((ing) => item.ingredients.includes(ing))
    );
  }, [selected, data]);

  const ingredientCounts = useMemo(() => {
    return uniqueIngredients.reduce<Record<string, number>>(
      (acc, ingredient) => {
        const source = selected?.length > 0 ? filteredMenuItems : data;

        const count = source.filter((item) =>
          item.ingredients.includes(ingredient)
        ).length;

        acc[ingredient] = count;

        return acc;
      },
      {}
    );
  }, [filteredMenuItems, selected, data, uniqueIngredients]);

  // Calculate which ingredients appear together with selected ones
  const validCombinations = useMemo(() => {
    if (selected.length === 0) return uniqueIngredients;

    const matchingItems = data.filter((item) =>
      selected.every((ing) => item.ingredients.includes(ing))
    );

    const validIngredients = new Set<string>();
    matchingItems.forEach((item) => {
      item.ingredients.forEach((ing) => validIngredients.add(ing));
    });

    return Array.from(validIngredients);
  }, [selected, data, uniqueIngredients]);

  const renderEmpty = () => <h1>No items</h1>;

  const handleItemClick = (item: string) => {
    setSelected((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  const renderMenuItem = (item: Item) => (
    <div key={item.id} className="bg-white shadow-md p-4 rounded-lg w-52">
      {item.image && <img srcSet={item.image} alt={item.name} />}

      <h3 className="mb-2 font-semibold text-lg">{item.name}</h3>
      <p className={`mb-2 text-gray-600 ${item.price.isDiscounted ? 'text-red' : ''}`}>Price: {item.price.amount.replace(/&nbsp;/g, ' ')}</p>
      <div className="flex flex-wrap gap-1">
        {item.ingredients.map((ing) => (
          <button
            key={ing}
            className={`text-xs px-2 py-1 rounded ${
              selected.includes(ing)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleItemClick(ing)}
          >
            {ing}
          </button>
        ))}
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="mb-5 text-5xl">Items total: {data.length}</h1>

      <div className="columns-4">
        {uniqueIngredients.map((item) => {
          return (
            <Ingredient
              key={item}
              item={item}
              onClick={() => handleItemClick(item)}
              isSelected={selected.includes(item)}
              isValid={validCombinations.includes(item)}
              count={ingredientCounts[item]}
            />
          );
        })}
      </div>
    </div>
  );

  const handleUrlChange = (val: string) => setQuery(val);

  return (
    <div className="container">
      <div className="flex gap-2">
        <input
          className="flex-1 border"
          type="text"
          onChange={(e) => handleUrlChange(e.target.value)}
          defaultValue={query}
        />
        <button className="bg-blue-500 py-2 rounded min-w-40 text-white" onClick={() => handleSearch()}>
          Search
        </button>
      </div>

      {(!data || !data?.length) && renderEmpty()}

      {data && renderItems()}

      <div className="flex flex-wrap gap-4">
        {filteredMenuItems.map(renderMenuItem)}
      </div>
    </div>
  );
};

export default List;
