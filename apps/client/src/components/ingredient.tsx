import React from "react";

type IngredientProps = {
  item: string;
  onClick?: () => void;
  isSelected?: boolean;
  isValid?: boolean;
  count?: number | string;
};

const Ingredient = ({ isValid, count, item, onClick, isSelected }: IngredientProps) => {
  return (
    <div
      className={`flex items-center space-x-2 border-primary mb-2 p-2 border ${
        isValid ? "" : "bg-gray-200 text-gray-700"
      }`}
    >
      <input type="checkbox" id={item} checked={isSelected} onChange={onClick} disabled={!isValid} />
      <label
        htmlFor={item}
        className="flex-1 peer-disabled:opacity-70 font-medium text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed"
      >
        {item} ({`${count}`})
      </label>
    </div>
  );
};

export default Ingredient;
