/**
 * Where the project's conversations happen. URLs taken from the app repo's README
 * Community section, which is the canonical list.
 *
 * Note for anyone running the link checker: reddit.com answers automated requests with
 * 403 (bot protection), so it shows up as an external warning. The subreddit is live —
 * old.reddit.com/r/EverythingBox returns 200. Not a broken link.
 */
export interface CommunityLink {
  id: string;
  name: string;
  href: string;
  /** One line on what this place is actually for. */
  blurb: string;
}

export const community: CommunityLink[] = [
  {
    id: 'discord',
    name: 'Discord',
    href: 'https://discord.gg/bW7KMVhgwH',
    blurb:
      'Setup problems, "is this supposed to happen?", which core to use, help writing an addon or theme. Ask in #support; #announcements carries every release.',
  },
  {
    id: 'reddit',
    name: 'r/EverythingBox',
    href: 'https://www.reddit.com/r/EverythingBox/',
    blurb:
      'The same conversations, slower and searchable — better for a question whose answer the next person should find, and for showing off a setup, a theme or an addon.',
  },
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/cubman3134/EverythingBox',
    blurb: 'Reproducible bugs and feature proposals. The source, and every release.',
  },
];

export const discordUrl = community[0]!.href;
export const redditUrl = community[1]!.href;
export const githubUrl = community[2]!.href;

/**
 * Deliberately NOT part of `community` above. That array drives the home page's
 * "Somewhere to ask" cards, and a funding link is not somewhere you ask a question —
 * dropping it in there would make the section mean two things at once. It gets its own
 * slot in the nav and the footer instead.
 */
export const supporter = {
  label: 'Become a supporter',
  href: 'https://www.patreon.com/c/TheEverythingBox',
} as const;
