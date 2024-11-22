import { Item } from "./list";

type MenuItemProps = {
  item: Item;
  handleItemClick: (ing: string) => void;
  selected: string[]
}

export const MenuItem = ({ item, handleItemClick, selected }: MenuItemProps) => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-52">
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
  )
}