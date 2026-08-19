export const SITE = {
  title: 'tundra-node',
  author: 'tundra-node',
  email: 'press-onyx-posted@duck.com',
  url: 'https://tundra-node.github.io',
  github: 'https://github.com/tundra-node',
  description:
    'Privacy tools, homelab projects, cybersecurity notes, and open source software.',
  defaultVariant: 'dark',
};

export const OG_IMAGE = `${SITE.url}/og.png`;

export function canonical(path: string) {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return `${SITE.url}${clean}/`;
}
