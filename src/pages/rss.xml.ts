import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { BLOG } from "@consts";
import { marked } from "marked";

interface Context {
  site: URL; // Use URL type for better compatibility
}

// Function to extract the first image in Markdown content
function getFirstImageFromMarkdown(content: string): string | null {
  // Regex to match ![alt text](image-path)
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);
  return match ? match[1] : null; // Return the captured group with the image path
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
      content: "http://purl.org/rss/1.0/modules/content/",
    },
    items: sortedPosts.map((post) => {
      let imageUrl: string | null = null;

      // Rule 1: Use cover image if available
      if (post.data.cover?.src) {
        imageUrl = post.data.cover.src;
      } 
      // Rule 2: Fallback to first image in content
      else if (post.body) {
        imageUrl = getFirstImageFromMarkdown(post.body);
      }

      // Convert Markdown to HTML for RSS content
      const htmlContent = post.body
        ? marked(post.body) // Convert Markdown to HTML
        : post.data.description;

      // Return RSS item with or without the image
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/${post.collection}/${post.slug}/`,
        customData: `
          ${imageUrl ? `<media:content type="image/${imageUrl.endsWith(".jpg") ? "jpeg" : "png"}" medium="image" url="${imageUrl}" />` : ""}
          <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
        `,
      };
    }),
  });
}
