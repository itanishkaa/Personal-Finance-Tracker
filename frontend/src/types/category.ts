export type CategoryType = "income" | "expense";

// Matches the backend's CategoryOut schema exactly - note there's no
// user_id in the response; ownership is implicit (every list is already
// scoped to the authenticated user).
export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon: string | null;
}

export type CategoryInput = Omit<Category, "id">;
