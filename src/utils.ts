function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function mapCategoryEndpointsToTitles(category: string) {
  if (category === "api") {
    return "API";
  }
  return capitalizeFirstLetter(category);
}
