import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { BLOG } from "@consts";

interface Context {
  site: URL; // Use URL type for better compatibility
}

export async function GET({ site }: Context) {
  const blogPosts = (await getCollection("blog")).filter((post) => !post.data.draft);

  // Sort blog posts by date, newest first
  const sortedPosts = blogPosts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  // Generate RSS feed
  return rss({
    title: BLOG.TITLE,
    description: BLOG.DESCRIPTION,
    site: site.toString(),
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
    },
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.slug}/`,
      
      customData: `<media:content
          type="image/${post.data.cover?.format == "jpg" ? "jpeg" : "png"}"
          medium="image"
          url="${post.data.cover?.src}" />
      `,
    })),
  });
}
