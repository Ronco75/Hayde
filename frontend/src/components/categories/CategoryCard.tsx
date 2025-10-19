import { useNavigate } from 'react-router-dom';
import type { Category } from '../../types';

interface CategoryCardProps {
    category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/categories/${category.id}/expenses`)}
            className="
                bg-white
                rounded-xl
                shadow-lg
                hover:shadow-2xl
                p-8
                cursor-pointer
                transition-all
                duration-300
                ease-in-out
                transform
                hover:scale-105
                hover:border-purple-400
                border-2
                border-transparent
                group
            "
        >
            <h2 className="text-2xl font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors">
                {category.name}
            </h2>
            <p className="text-gray-500 text-sm font-medium group-hover:text-purple-600 transition-colors">
                 לצפייה בהוצאות ←
            </p>
        </div>
    );
}

export default CategoryCard;