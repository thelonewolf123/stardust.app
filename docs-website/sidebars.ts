import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview',
    'architecture',
    {
      type: 'category',
      label: 'Frontend',
      link: {type: 'doc', id: 'frontend/overview'},
      items: [
        'frontend/routing',
        'frontend/data-flow',
        'frontend/components',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      link: {type: 'doc', id: 'backend/overview'},
      items: [
        'backend/graphql-schema',
        'backend/middleware',
        'backend/routes',
      ],
    },
    {
      type: 'category',
      label: 'Database',
      link: {type: 'doc', id: 'database/schema'},
      items: [
        'database/connections',
      ],
    },
    {
      type: 'category',
      label: 'Services',
      link: {type: 'doc', id: 'services/scheduler'},
      items: [
        'services/cron',
        'services/logger',
        'services/docker-proxy',
      ],
    },
    {
      type: 'category',
      label: 'Infrastructure',
      link: {type: 'doc', id: 'infrastructure/overview'},
      items: [
        'infrastructure/ecs-fargate',
        'infrastructure/ec2-instances',
        'infrastructure/networking',
        'infrastructure/eventing',
      ],
    },
    {
      type: 'category',
      label: 'Messaging & Real-time',
      link: {type: 'doc', id: 'messaging/rabbitmq'},
      items: [
        'messaging/redis',
        'messaging/real-time',
      ],
    },
    'container-lifecycle',
    'authentication',
    'cli-tool',
    'deployment',
  ],
};

export default sidebars;
