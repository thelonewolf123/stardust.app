import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Stardust Architecture',
  tagline: 'Container provisioning engine — from GitHub commit to deployed container on AWS',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://stardust.app',
  baseUrl: '/',

  organizationName: 'thelonewolf123',
  projectName: 'Startdust.app',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/thelonewolf123/Startdust.app/tree/main/docs-website/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/thelonewolf123/Startdust.app/tree/main/docs-website/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/stardust-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'dark',
    },
    navbar: {
      title: 'Stardust',
      hideOnScroll: true,
      logo: {
        alt: 'Stardust Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/thelonewolf123/Startdust.app',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Architecture Overview', to: '/docs/overview'},
            {label: 'Frontend', to: '/docs/frontend/overview'},
            {label: 'Backend', to: '/docs/backend/overview'},
            {label: 'Infrastructure', to: '/docs/infrastructure/overview'},
          ],
        },
        {
          title: 'Services',
          items: [
            {label: 'Scheduler', to: '/docs/services/scheduler'},
            {label: 'Messaging', to: '/docs/messaging/rabbitmq'},
            {label: 'Container Lifecycle', to: '/docs/container-lifecycle'},
            {label: 'CLI Tool', to: '/docs/cli-tool'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'GitHub', href: 'https://github.com/thelonewolf123/Startdust.app'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Stardust.app. Built with Docusaurus.`,
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
