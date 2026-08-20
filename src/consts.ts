export const SITE = {
  title: 'tundra-node',
  name: 'Elias Zeiner',
  author: 'Elias Zeiner',
  email: 'press-onyx-posted@duck.com',
  url: 'https://tundra-node.github.io',
  github: 'https://github.com/tundra-node',
  linkedin: 'https://www.linkedin.com/in/eliaszeiner',
  description:
    'Privacy tools, homelab projects, cybersecurity notes, and open source software.',
  defaultVariant: 'dark',
};

export const OG_IMAGE = `${SITE.url}/og.png`;

export function canonical(path: string) {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return `${SITE.url}${clean}/`;
}
