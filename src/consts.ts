import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Dada's Sketchbook",
  AUTHOR: "Ayan Choudhury",
  EMAIL: "mail[at]ayanchoudhury[dot]in",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Dada's blog, but online.",
};

export const BLOG: Metadata = {
  TITLE: "Dada's Sketchbook",
  DESCRIPTION: "A collection of musings I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  // {
  //   NAME: 'twitter-x',
  //   HREF: 'https://twitter.com/markhorn_dev',
  // },
  // {
  //   NAME: 'github',
  //   HREF: 'https://github.com/markhorn-dev',
  // },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/ayan26",
  },
];
