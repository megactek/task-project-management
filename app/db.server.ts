/**
 * Dummy database file for non-auth version
 * We're using JSON files for persistence instead of Prisma
 */

// No real database client needed, but we provide this placeholder for imports
export const prisma = {
  $connect: () => {
    console.log('Using JSON-based persistence layer instead of Prisma');
  }
};
