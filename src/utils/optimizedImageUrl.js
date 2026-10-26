const optimizedImagePaths = {
  '/img/tours/Italy/rome.jpg': '/img/tours/Italy/rome.webp',
  '/img/tours/Turkey/turkey.jpg': '/img/tours/Turkey/turkey.webp',
};

export function optimizedImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string') return imageUrl;

  return Object.entries(optimizedImagePaths).reduce(
    (url, [originalPath, optimizedPath]) =>
      url.replace(originalPath, optimizedPath),
    imageUrl
  );
}
