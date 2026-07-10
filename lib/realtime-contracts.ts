export const MENU_CONTENT_CHANNEL = "menu-content";
export const MENU_CONTENT_UPDATED_EVENT = "menu-content.updated";

export type MenuContentUpdatedMessage = {
  categorySlug: string;
  updatedAt: string;
};
