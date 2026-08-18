import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

export async function GET(context: { site: string }) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const guides = (await getCollection('guides')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    ...guides.map((guide) => ({
      title: guide.data.title,
      pubDate: guide.data.pubDate,
      description: guide.data.description,
      link: `/guides/${guide.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items,
    customData: `<language>en-us</language>`,
  });
}