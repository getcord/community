import { NavButton } from '@/app/components/NavButton';
import { Category } from '@/app/types';
import { mapCategoryEndpointsToTitles } from '@/utils';

export function CategoryPills({ categories }: { categories: Category[] }) {
  {
    return (
      <>
        {categories &&
          categories.map((category) => (
            <NavButton
              key={category}
              isActive={false}
              value={mapCategoryEndpointsToTitles(category)}
              linkTo={`/category/${category}`}
              type="category"
            />
          ))}
      </>
    );
  }
}
