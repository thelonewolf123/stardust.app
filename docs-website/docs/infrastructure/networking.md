---
sidebar_position: 4
---

# Networking & DNS

## Network Architecture

```mermaid
graph TB
    subgraph "Internet"
        User[User Browser]
    end
    
    subgraph "Cloudflare"
        DNS[DNS Records]
        CF[CDN / Proxy]
    end
    
    subgraph "AWS VPC"
        subgraph "Public Subnet"
            ALB[Application<br/>Load Balancer]
            NAT[NAT Gateway]
        end
        
        subgraph "Private Subnet"
            ECS[ECS Fargate<br/>App Service]
            EC2P[EC2 Proxy<br/>Instance]
            EC2B[EC2 Builder<br/>Instance]
        end
        
        subgraph "Container Subnet"
            EC2C[EC2 Spot<br/>Instances]
        end
    end
    
    User -->|HTTPS| DNS
    DNS --> CF
    CF -->|:443| ALB
    ALB -->|:4000| ECS
    ECS -->|SSH| EC2B
    ECS -->|SSH| EC2C
    ECS -->|Redis| EC2P
    
    EC2P -->|HTTP| EC2C
    User -->|Custom Domain| CF
    CF -->|:443| EC2P
```

## Security Groups

| Group | Rules |
|-------|-------|
| ALB SG | Inbound: 443 (HTTPS), Outbound: 4000 to ECS |
| EC2 SG | Inbound: 22 (SSH) from ECS, Outbound: all |
| ECS SG | Inbound: 4000 from ALB, Outbound: all |

## Cloudflare DNS

Records managed via Pulumi (`infra/resource/cloudflare.ts`):

| Type | Name | Target |
|------|------|--------|
| A | `@` | ALB DNS |
| A | `www` | ALB DNS |
| CNAME | `*` | Proxy instance (wildcard for user subdomains) |
