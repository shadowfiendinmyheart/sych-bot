export interface ErrorResponse {
  error: any;
}

export interface GetWallResponse {
  items: VkPost[];
  count: number;
}

export type GetByIdResponse = VkPost[];

export interface VkPost {
  id: number;
  date: number;
  text: string;
  marked_as_ads: 0 | 1;
  post_type: "post" | "repost";
  views: {
    count: number;
  };
  likes: {
    count: number;
  };
  attachments: VkAttachment[];
  copyright?: object;
}

interface VkAttachment {
  type: "photo" | "link";
  photo: VkPhoto;
}

interface VkPhoto {
  date: number;
  id: number;
  owner_id: number;
  sizes: Array<{
    type: "s" | "m" | "x" | "y" | "w" | "o" | "p" | "q" | "r";
    height: number;
    width: number;
    url: string;
  }>;
}
