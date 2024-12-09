import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { BLOG } from "@consts";
import { marked } from "marked";

// Function to extract the first image in Markdown content and format the URL
function getFirstImageFromMarkdown(content: string, siteOrigin: string): string | null {
  // Regex to match ![alt text](image-path)
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);

  if (match && match[1]) {
    const imagePath = match[1];

    // Resolve "@assets" path to final URL
    if (imagePath.startsWith("@assets/")) {
      return `${siteOrigin}/_astro/${imagePath.replace("@assets/", "")}`;
    }

    // Return the image path as is for non-@assets paths
    return `${siteOrigin}${imagePath}`;
  }
  return null;
}

export async function GET({ site }: { site: URL }) {
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
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: `<atom:link href="${site}rss.xml" rel="self" type="application/rss+xml" />`,
    items: sortedPosts.map((post) => {
      let imageUrl: string | null = null;

      // Rule 1: Use cover image if available
      if (post.data.cover?.src) {
        imageUrl = `${site.origin}${post.data.cover.src}`;
      } 
      // Rule 2: Fallback to first image in content
      else if (post.body) {
        imageUrl = getFirstImageFromMarkdown(post.body, site.origin);
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
          ${
            imageUrl
              ? `<media:content type="image/${
                  imageUrl.endsWith(".jpg") ? "jpeg" : "png"
                }" medium="image" url="${imageUrl}" />`
              : ""
          }
          <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
        `,
      };
    }),
  });
}
