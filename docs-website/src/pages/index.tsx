import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/overview">
            Read the Architecture →
          </Link>
          <Link className="button button--outline button--lg" to="/docs/architecture" style={{marginLeft: '1rem'}}>
            View Diagrams
          </Link>
        </div>
      </div>
    </header>
  );
}

const highlights = [
  {
    title: 'Full-Stack Cloud Platform',
    description: 'Next.js frontend, Express + Apollo GraphQL backend, MongoDB, Redis, and RabbitMQ working together.',
  },
  {
    title: 'Infrastructure as Code',
    description: 'Entire AWS stack provisioned via Pulumi — EC2, ECS Fargate, ECR, S3, CloudWatch, Lambda, Cloudflare DNS.',
  },
  {
    title: 'Async Microservices',
    description: 'RabbitMQ-powered scheduler with Strategy pattern for container build, deploy, destroy, and spot termination.',
  },
  {
    title: 'Real-time Everything',
    description: 'WebSocket SSH terminals, SSE log streaming, Redis pub/sub — live container interaction from the browser.',
  },
  {
    title: 'Multi-Cloud Ready',
    description: 'Strategy pattern abstracts cloud providers. Currently AWS on-demand + AWS Spot, extensible to others.',
  },
  {
    title: 'GitHub-Native DX',
    description: 'Deploy any GitHub repo with one click. Webhook-triggered rebuilds, branch selection, build args.',
  },
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Technical architecture documentation for Stardust.app — a container provisioning engine built with Node.js, AWS, and microservices.">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {highlights.map((item, idx) => (
                <div key={idx} className="col col--4 margin-vert--md">
                  <div className="card shadow--md">
                    <div className="card__body">
                      <Heading as="h3">{item.title}</Heading>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
