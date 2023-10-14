import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (req.method === 'POST') {
    const { slug, id } = req.body
    try {
      const queryBy = slug ? 'url_slug' : 'id'
      const query = slug ? slug : id
      const { data: charItem, error: fetchDataError } = await supabaseAdmin
        .from('characters')
        .select('id, image_url, created_by, description, page_name, name, preview_images, character_config, banner_image, price_tags, free_content_grant, url_slug, bio, under_review')
        .eq(queryBy, query).single()
      if (charItem == null || fetchDataError) {
        return res
          .status(500)
          .json({ error: { statusCode: 500, message: "Not Valid char ID" } });
      }

      return res.status(200).json({
        id: charItem.id,
        image_url: charItem.image_url,
        created_by: charItem.created_by,
        name: charItem.name,
        page_name: charItem.page_name,
        url_slug: charItem.url_slug,
        description: charItem.description,
        preview_images: charItem.preview_images,
        banner_image: charItem.banner_image,
        price_tags: charItem.price_tags,
        free_content_grant: charItem.free_content_grant,
        bio: charItem.bio,
        under_review: charItem.under_review
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { statusCode: 500, message: JSON.stringify(error) } });
    }
  }
}