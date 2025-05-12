export const screenSizes = {
  mobile: 468,
  tablet: 1025,
  desktop: 1366,
};

export const mediaQueries = {
  mobileQuery: `(max-width: ${screenSizes.mobile}px)`,
  tabletQuery: `(min-width: ${screenSizes.mobile}px) and (max-width: ${screenSizes.tablet}px)`,
  desktopQuery: `(min-width: ${screenSizes.tablet}px)`,
};
