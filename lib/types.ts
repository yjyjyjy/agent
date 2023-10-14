export type FunctionCall = {
  channel_id: string;
  content: string;
}

export type Message = {
  id: string;
  createdAt?: Date;
  like?: boolean;
  blur?: boolean;
  imgId?: string;
  tier?: number;
  content: string;
  nsfw?: boolean;
  role: '<user>' | '<character>' | 'function' | 'image_link';
  // function_call?: ;
};


// posts/[char_id]/posts/[doc_id]
// for Paginate, use startAt/startAfter on query
// during query time, full page filter by user paid IDs
// during query time, pravity page do a 'where in' user paid IDs
export type Post = {
  postId: string; // doc_id
  image: string | string[];
  cover: string | string[];
  timestamp: Date;
  caption: string;
  price: number; //token
  paid?: boolean;
  like?: number;
};

// paid/[user_id]/[char_id]/[doc_id]
export type PaidPost = {
  postId: string; // doc_id of the post
  timestamp: Date;
  price: number; //token
};

export type Character = {
  id: string;
  image_url: string;
  description: string;
  name: string;
  url_slug: string;
  preview_images: string[],
  banner_image: string,
  price_tags: any,
  free_content_grant: number, 
  phase_ckpt: number[]
};

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  charId : string
  tempChat?: boolean
}



export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>