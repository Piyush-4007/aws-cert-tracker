# AWS Certification Roadmap — Study Checklist

Order: **CLF-C02 → AIF-C01 → SAA-C03 → DVA-C02**

Hard constraint: **all four vouchers expire 29-Jan-2027.** Every exam date must fall before that. Voucher expiry cannot be extended.

SAA-C03 is the graded one for the Cloud Solutions Architect course (5 marks for attempting, 35 for passing).

---

## Exam facts

| | CLF-C02 | AIF-C01 | SAA-C03 | DVA-C02 |
|---|---|---|---|---|
| Level | Foundational | Foundational | Associate | Associate |
| Questions | 65 (50 scored) | 65 (50 scored) | 65 (50 scored) | 65 (50 scored) |
| Time | 90 min | 90 min | 130 min | 130 min |
| Pass score | 700 / 1000 | 700 / 1000 | 720 / 1000 | 720 / 1000 |
| List price | $100 | $100 | $150 | $150 |
| Retake wait | 14 days | 14 days | 14 days | 14 days |
| Validity | 3 years | 3 years | 3 years | 3 years |

Scoring is compensatory — you don't need to pass each domain individually, only the total. No penalty for guessing, so never leave a question blank.

---

# 1. CLF-C02 — Cloud Practitioner

Domains: Cloud Concepts 24% · Security & Compliance 30% · Cloud Technology & Services 34% · Billing, Pricing & Support 12%

This is your foundation layer. Everything here gets reused by all three later exams, so learn it properly rather than cramming it.

## D1. Cloud Concepts (24%)

### 1.1 Value proposition of the AWS Cloud
- [ ] Benefits: agility, elasticity, scalability, high availability, global reach, economies of scale
- [ ] Cost benefits: CapEx → OpEx, pay-as-you-go, stop guessing capacity
- [ ] Automation and speed of provisioning as a business benefit

### 1.2 AWS Well-Architected Framework
- [ ] Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
- [ ] Core design principles: design for failure, decouple components, implement elasticity, think parallel
- [ ] AWS Well-Architected Tool (what it does)

### 1.3 Cloud migration and the CAF
- [ ] AWS Cloud Adoption Framework (CAF) — six perspectives: Business, People, Governance, Platform, Security, Operations
- [ ] The 7 Rs of migration: Rehost, Replatform, Refactor, Repurchase, Retire, Retain, Relocate
- [ ] AWS Snow Family for data migration (Snowcone, Snowball Edge, Snowmobile)
- [ ] AWS DataSync, AWS Transfer Family, AWS Migration Hub, AWS Application Migration Service

### 1.4 Cloud economics
- [ ] Fixed vs variable cost
- [ ] Licensing strategies: BYOL vs included licences
- [ ] Right-sizing concept
- [ ] Managed services reducing operational overhead (TCO argument)

### 1.5 Deployment and connectivity models
- [ ] Cloud, hybrid, on-premises deployment models
- [ ] Connectivity options: VPN, AWS Direct Connect, public internet
- [ ] AWS Outposts, AWS Local Zones, AWS Wavelength

## D2. Security and Compliance (30%)

### 2.1 Shared Responsibility Model
- [ ] Security **of** the cloud vs security **in** the cloud
- [ ] How responsibility shifts across EC2 vs RDS vs Lambda vs S3
- [ ] Patching responsibility by service type

### 2.2 Compliance and governance
- [ ] AWS Artifact — on-demand compliance reports
- [ ] AWS Compliance programs (SOC, PCI DSS, ISO, HIPAA, GDPR at awareness level)
- [ ] Data residency and geographic compliance
- [ ] AWS Config — resource configuration recording and compliance rules
- [ ] AWS Audit Manager
- [ ] AWS CloudTrail — API activity logging and auditing
- [ ] Amazon GuardDuty — threat detection
- [ ] Amazon Inspector — vulnerability scanning
- [ ] AWS Security Hub — aggregated security posture
- [ ] Amazon Macie — sensitive data discovery in S3
- [ ] AWS Trusted Advisor (security pillar checks)

### 2.3 Identity and access management
- [ ] IAM users, groups, roles, policies
- [ ] Principle of least privilege
- [ ] Root user — what it is, why to lock it down, MFA on root
- [ ] MFA types
- [ ] IAM Identity Center (successor to AWS SSO)
- [ ] AWS Organizations, Organizational Units (OUs), Service Control Policies (SCPs)
- [ ] Consolidated billing under Organizations
- [ ] Amazon Cognito (awareness level: user auth for apps)
- [ ] AWS Directory Service, AWS RAM (Resource Access Manager)

### 2.4 Security support resources
- [ ] AWS Knowledge Center, Security Center, Security Blog
- [ ] AWS Shield (Standard vs Advanced) — DDoS protection
- [ ] AWS WAF — web application firewall
- [ ] AWS KMS — key management, customer managed vs AWS managed keys
- [ ] AWS CloudHSM
- [ ] AWS Secrets Manager
- [ ] AWS Certificate Manager (ACM)
- [ ] Encryption at rest vs encryption in transit
- [ ] Security groups vs network ACLs (stateful vs stateless)
- [ ] AWS Network Firewall
- [ ] Penetration testing policy (what's allowed without approval)

## D3. Cloud Technology and Services (34%)

### 3.1 Methods of deploying and operating
- [ ] AWS Management Console, AWS CLI, SDKs
- [ ] Infrastructure as Code concept
- [ ] AWS CloudFormation
- [ ] Deployment models: one-time, IaC, APIs

### 3.2 Global infrastructure
- [ ] Regions, Availability Zones, Edge Locations
- [ ] Why multi-AZ matters (high availability) vs multi-Region (disaster recovery, latency, compliance)
- [ ] How to choose a Region: latency, price, compliance, service availability
- [ ] Amazon CloudFront and edge caching
- [ ] AWS Global Accelerator

### 3.3 Compute services
- [ ] Amazon EC2 — instance types and families at a high level
- [ ] EC2 Auto Scaling and Elastic Load Balancing (ALB, NLB, GWLB, CLB)
- [ ] AWS Lambda — serverless, event-driven
- [ ] Container services: Amazon ECS, Amazon EKS, AWS Fargate, Amazon ECR
- [ ] AWS Elastic Beanstalk
- [ ] AWS Batch, AWS Lightsail
- [ ] When to pick EC2 vs Lambda vs containers

### 3.4 Database services
- [ ] Amazon RDS (engines, Multi-AZ, read replicas)
- [ ] Amazon Aurora
- [ ] Amazon DynamoDB — NoSQL key-value
- [ ] Amazon Redshift — data warehousing
- [ ] Amazon ElastiCache (Redis, Memcached)
- [ ] Amazon DocumentDB, Amazon Neptune, Amazon MemoryDB, Amazon Timestream, Amazon Keyspaces
- [ ] AWS Database Migration Service (DMS), AWS Schema Conversion Tool
- [ ] Relational vs non-relational — when to use which

### 3.5 Network services
- [ ] Amazon VPC — subnets, route tables, internet gateway, NAT gateway
- [ ] Public vs private subnets
- [ ] AWS Direct Connect vs Site-to-Site VPN
- [ ] Amazon Route 53 — DNS, routing policies at awareness level
- [ ] VPC peering, AWS Transit Gateway, VPC endpoints (Gateway vs Interface / PrivateLink)

### 3.6 Storage services
- [ ] Amazon S3 — buckets, objects, durability, versioning
- [ ] S3 storage classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive
- [ ] S3 Lifecycle policies
- [ ] Amazon EBS — volume types, snapshots
- [ ] Instance store (ephemeral) vs EBS (persistent)
- [ ] Amazon EFS, Amazon FSx
- [ ] AWS Storage Gateway
- [ ] AWS Backup
- [ ] Object vs block vs file storage — the core distinction

### 3.7 AI/ML, analytics, and other services
- [ ] Amazon SageMaker (awareness)
- [ ] Amazon Comprehend, Rekognition, Polly, Transcribe, Translate, Textract, Lex, Kendra
- [ ] Amazon Q, Amazon Bedrock (awareness)
- [ ] Amazon Athena, AWS Glue, Amazon EMR, Amazon Kinesis, AWS Lake Formation, Amazon QuickSight, Amazon MSK
- [ ] Application integration: Amazon SQS, Amazon SNS, Amazon EventBridge, AWS Step Functions
- [ ] Developer tools: AWS CodeBuild, CodeDeploy, CodePipeline, AWS CodeArtifact
- [ ] Monitoring: Amazon CloudWatch, AWS Health Dashboard, AWS X-Ray
- [ ] AWS Systems Manager
- [ ] AWS Amplify, AWS AppSync, AWS Device Farm
- [ ] IoT and end-user compute at name-recognition level only

## D4. Billing, Pricing, and Support (12%)

### 4.1 Pricing models
- [ ] On-Demand
- [ ] Reserved Instances (Standard vs Convertible, payment options)
- [ ] Savings Plans (Compute, EC2 Instance, SageMaker)
- [ ] Spot Instances — and when they're appropriate
- [ ] Dedicated Hosts vs Dedicated Instances
- [ ] AWS Free Tier — the three types (always free, 12-month, trials)
- [ ] Data transfer costs: in vs out vs cross-AZ vs cross-Region

### 4.2 Billing and cost management
- [ ] Consolidated billing and volume discounts
- [ ] AWS Cost Explorer — analyse historical spend
- [ ] AWS Budgets — alerts on thresholds
- [ ] AWS Pricing Calculator — estimate before you build
- [ ] AWS Cost and Usage Report
- [ ] Cost allocation tags
- [ ] AWS Billing Conductor
- [ ] **Know which tool for which scenario** — this is the classic trap. "Alert me when spend exceeds X" = Budgets, not Cost Explorer.

### 4.3 Support and resources
- [ ] Support plans: Basic, Developer, Business, Enterprise On-Ramp, Enterprise — features and price tiers
- [ ] Technical Account Manager (TAM) — which plans include one
- [ ] AWS Trusted Advisor — the five check categories, and which are limited on Basic/Developer
- [ ] AWS Support Center, AWS re:Post, AWS Marketplace
- [ ] AWS Partner Network, AWS Professional Services, AWS IQ
- [ ] AWS Documentation, whitepapers, AWS Prescriptive Guidance

---

# 2. AIF-C01 — AI Practitioner

Domains: Fundamentals of AI & ML 20% · Fundamentals of GenAI 24% · Applications of Foundation Models 28% · Responsible AI 14% · Security, Compliance & Governance for AI 14%

> **Revise from CLF-C02 before starting:** Shared Responsibility Model · IAM (users, roles, policies, least privilege) · S3 and storage classes · KMS and encryption at rest/in transit · CloudTrail, CloudWatch, AWS Config · AWS Organizations and SCPs · the AI/ML service name list from D3.7 (SageMaker, Comprehend, Rekognition, Polly, Transcribe, Translate, Textract, Lex, Kendra, Bedrock, Amazon Q). CLF gave you names only — here you need what each actually does and when to choose it.

## D1. Fundamentals of AI and ML (20%)

### 1.1 Basic AI concepts and terminology
- [ ] AI vs ML vs deep learning vs generative AI vs agentic AI — the nesting relationship
- [ ] Core terms: model, algorithm, training, inferencing, neural network, computer vision, NLP
- [ ] Bias, fairness, variance, overfitting, underfitting, fit
- [ ] Large language model (LLM), embedding, tokens
- [ ] Types of inferencing: batch, real-time, asynchronous, serverless

### 1.2 Practical use cases for AI
- [ ] When AI is appropriate vs when a rules-based system is better (cost, interpretability, data availability)
- [ ] Use case categories: forecasting, recommendation, anomaly/fraud detection, computer vision, speech, translation, document processing, personalisation
- [ ] Mapping a business problem to a technique: classification vs regression vs clustering
- [ ] AWS managed AI services and what each solves

### 1.3 ML development lifecycle
- [ ] Stages: business goal → data collection → preprocessing → feature engineering → training → tuning → evaluation → deployment → monitoring
- [ ] Supervised, unsupervised, reinforcement learning
- [ ] Training data concepts: labelled vs unlabelled, training/validation/test splits
- [ ] SageMaker components at conceptual level: Data Wrangler, Feature Store, Model Monitor, Clarify, JumpStart, Canvas, Ground Truth, Pipelines
- [ ] Model evaluation metrics: accuracy, precision, recall, F1, AUC-ROC, confusion matrix
- [ ] Business metrics: cost per inference, ROI, customer satisfaction
- [ ] MLOps concept — experimentation, retraining, versioning, monitoring

## D2. Fundamentals of Generative AI (24%)

### 2.1 Core GenAI concepts
- [ ] Foundation models — what they are, why pretraining matters
- [ ] Tokens, embeddings, vectors, chunking
- [ ] Transformer architecture at conceptual level
- [ ] Diffusion models, multimodal models
- [ ] Prompt engineering basics
- [ ] Single-shot / few-shot / zero-shot
- [ ] Use cases: summarisation, translation, code generation, chatbots, image and audio generation, search

### 2.2 Capabilities and limitations
- [ ] Advantages: adaptability, responsiveness, simplicity of getting started
- [ ] Limitations: hallucination, nondeterminism, interpretability, inaccuracy
- [ ] Selecting the right model for a use case
- [ ] Business metrics for GenAI: cross-domain performance, efficiency, conversion rate, average revenue per user, customer lifetime value

### 2.3 AWS infrastructure for GenAI
- [ ] Amazon Bedrock — managed foundation models
- [ ] Amazon SageMaker JumpStart
- [ ] Amazon Q Developer, Amazon Q Business
- [ ] PartyRock
- [ ] AWS Trainium and AWS Inferentia (cost/performance of custom silicon)
- [ ] Benefits of building on AWS: security, compliance, responsibility, speed to market
- [ ] Cost trade-offs: token-based pricing, provisioned throughput, on-demand, model size vs latency vs cost

## D3. Applications of Foundation Models (28%)

*Largest domain. Also the most technical.*

### 3.1 Design considerations for FM applications
- [ ] Model selection criteria: cost, modality, latency, multilingual, model size, complexity, customisation, input/output length
- [ ] Inference parameters: temperature, top-k, top-p, response length — and what changing each does
- [ ] Retrieval Augmented Generation (RAG) — the full pattern
- [ ] Vector databases on AWS: Amazon OpenSearch Service, Amazon Aurora with pgvector, Amazon Neptune, Amazon DocumentDB, Amazon RDS for PostgreSQL
- [ ] Embeddings storage and similarity search
- [ ] Cost trade-offs of customisation approaches: prompt engineering < RAG < fine-tuning < continued pretraining < training from scratch
- [ ] Agents — Amazon Bedrock Agents for multi-step tasks

### 3.2 Prompt engineering
- [ ] Prompt components: instruction, context, negative prompts, model input/output indicators
- [ ] Techniques: zero-shot, few-shot, chain-of-thought, prompt templates
- [ ] Best practices: specificity, guardrails, experimentation, multiple comments
- [ ] Risks: prompt injection, jailbreaking, hijacking, poisoning, exposure

### 3.3 Training and fine-tuning
- [ ] Pretraining vs fine-tuning vs continued pretraining
- [ ] Instruction tuning, domain adaptation, transfer learning
- [ ] Data preparation for fine-tuning: curation, labelling, governance, size, representativeness
- [ ] Continuous pretraining vs RLHF (reinforcement learning from human feedback)

### 3.4 Evaluating FM performance
- [ ] Human evaluation and benchmark datasets
- [ ] Metrics: ROUGE, BLEU, BERTScore, perplexity
- [ ] Aligning evaluation to business objectives

## D4. Guidelines for Responsible AI (14%)

- [ ] Responsible AI dimensions: fairness, explainability, robustness, privacy and security, transparency, veracity, governance, controllability, safety
- [ ] Amazon Bedrock Guardrails
- [ ] Dataset bias: representation, curation, balanced datasets
- [ ] Effects of bias: legal risk, customer harm, reputational damage
- [ ] Amazon SageMaker Clarify — bias detection and feature importance
- [ ] SageMaker Model Monitor
- [ ] Amazon Augmented AI (A2I) — human review workflows
- [ ] Transparent models: model cards, AI Service Cards, open source vs proprietary trade-offs
- [ ] Interpretability vs explainability, and the accuracy trade-off

## D5. Security, Compliance, and Governance for AI (14%)

- [ ] Securing AI systems: IAM roles and policies applied to AI services, encryption, data quality
- [ ] SageMaker Role Manager
- [ ] Source citation and data lineage / provenance
- [ ] Data cataloguing: AWS Glue Data Catalog, SageMaker Feature Store
- [ ] Amazon Macie for sensitive training data
- [ ] Governance protocols: policies, review cadences, transparency standards
- [ ] Compliance standards for AI: ISO, SOC, algorithm accountability laws
- [ ] AWS Config, AWS Audit Manager, AWS Artifact, AWS CloudTrail, AWS Trusted Advisor in an AI context
- [ ] Data governance: lifecycle, retention, monitoring, residency

---

# 3. SAA-C03 — Solutions Architect Associate

Domains: Design Secure Architectures 30% · Design Resilient Architectures 26% · Design High-Performing Architectures 24% · Design Cost-Optimized Architectures 20%

**This is the one your college grades.** It is a large step up from the two foundational exams — CLF asks "what is this service", SAA asks "which of these four valid-looking architectures is correct given these constraints".

> **Revise from CLF-C02 before starting (now at depth, not awareness):** Well-Architected pillars · Regions/AZs/Edge Locations · Shared Responsibility Model · IAM users/roles/policies · VPC basics, subnets, route tables, IGW, NAT · security groups vs NACLs · S3 and all storage classes · EBS vs EFS vs instance store · EC2 families, ELB types, Auto Scaling · RDS, Aurora, DynamoDB, ElastiCache, Redshift · Route 53 · CloudFront · SQS, SNS, EventBridge, Step Functions · Lambda, ECS, EKS, Fargate · CloudWatch, CloudTrail, AWS Config · KMS, ACM, Secrets Manager, WAF, Shield · pricing models (On-Demand, Reserved, Savings Plans, Spot) · Cost Explorer, Budgets. You'll now need the *limits and trade-offs* of each, not just the description.

## D1. Design Secure Architectures (30%)

### 1.1 Secure access to AWS resources
- [ ] IAM policy structure: effect, action, resource, condition — and reading a policy document
- [ ] Policy evaluation logic: explicit deny > explicit allow > implicit deny
- [ ] Identity-based vs resource-based policies
- [ ] IAM roles for EC2 (instance profiles), cross-account roles, service roles
- [ ] AWS STS and temporary credentials, role assumption, external ID
- [ ] Federation: SAML, IAM Identity Center, Cognito user pools vs identity pools
- [ ] AWS Organizations, SCPs, multi-account strategy, AWS Control Tower
- [ ] Root account protection, credential rotation, access keys vs roles
- [ ] AWS RAM for cross-account resource sharing
- [ ] IAM Access Analyzer

### 1.2 Secure workloads and applications
- [ ] VPC design for security: public/private/isolated subnet tiers
- [ ] Security groups (stateful) vs NACLs (stateless) — layered defence
- [ ] NAT gateway vs NAT instance vs egress-only internet gateway
- [ ] VPC endpoints: Gateway (S3, DynamoDB) vs Interface (PrivateLink)
- [ ] VPC peering vs Transit Gateway — and the limits of each
- [ ] AWS WAF rules, rate limiting, managed rule groups
- [ ] AWS Shield Standard vs Advanced
- [ ] AWS Network Firewall, AWS Firewall Manager
- [ ] Bastion hosts vs Systems Manager Session Manager
- [ ] Amazon GuardDuty, Amazon Inspector, AWS Security Hub in an architecture
- [ ] VPC Flow Logs
- [ ] Amazon Cognito for application-level auth

### 1.3 Data security controls
- [ ] Encryption at rest: S3 (SSE-S3, SSE-KMS, SSE-C, DSSE-KMS), EBS, RDS, DynamoDB
- [ ] Encryption in transit: TLS, ACM, VPN, certificate management
- [ ] AWS KMS: customer managed keys vs AWS managed keys, key policies, grants, key rotation, multi-Region keys
- [ ] AWS CloudHSM — when it's required over KMS
- [ ] AWS Secrets Manager vs Systems Manager Parameter Store — rotation, cost, size limits
- [ ] S3 features: bucket policies, Block Public Access, Object Lock, versioning, MFA Delete, access points, presigned URLs
- [ ] Amazon Macie for data classification
- [ ] Data retention, backup, and compliance requirements

## D2. Design Resilient Architectures (26%)

### 2.1 Scalable and loosely coupled architectures
- [ ] Multi-tier architecture design
- [ ] Decoupling with SQS (standard vs FIFO, visibility timeout, DLQ, long polling)
- [ ] SNS (fan-out, filter policies, FIFO topics)
- [ ] Amazon MQ — when to use over SQS/SNS
- [ ] EventBridge (event bus, rules, schedules) vs SNS vs SQS — the distinction is heavily tested
- [ ] AWS Step Functions — Standard vs Express workflows
- [ ] Auto Scaling: target tracking, step, simple, scheduled, predictive policies
- [ ] Load balancer selection: ALB (Layer 7) vs NLB (Layer 4) vs GWLB — sticky sessions, target groups, health checks
- [ ] API Gateway (REST vs HTTP vs WebSocket) and throttling
- [ ] Serverless architecture patterns
- [ ] Container orchestration: ECS vs EKS, EC2 launch type vs Fargate
- [ ] Microservices, event-driven, and stateless design principles
- [ ] Read replicas, caching layers, database sharding

### 2.2 Highly available and fault-tolerant architectures
- [ ] High availability vs fault tolerance vs disaster recovery — precise definitions
- [ ] Multi-AZ deployments: RDS Multi-AZ, ELB across AZs, ASG across AZs
- [ ] Multi-Region architectures: Aurora Global Database, DynamoDB Global Tables, S3 Cross-Region Replication, Route 53 failover
- [ ] DR strategies and their RTO/RPO: Backup & Restore, Pilot Light, Warm Standby, Multi-Site Active/Active
- [ ] Route 53 routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multivalue — plus health checks
- [ ] AWS Backup, snapshots, AMI strategy
- [ ] Amazon S3 durability and availability by storage class
- [ ] EFS vs FSx availability characteristics
- [ ] Storage Gateway for hybrid resilience
- [ ] AWS Elastic Disaster Recovery
- [ ] Failure isolation, cell-based architecture, circuit breakers

## D3. Design High-Performing Architectures (24%)

### 3.1 High-performing storage
- [ ] S3 performance: prefix design, multipart upload, Transfer Acceleration, byte-range fetches
- [ ] S3 storage class selection by access pattern, Intelligent-Tiering, lifecycle transitions
- [ ] EBS volume types: gp2, gp3, io1, io2, io2 Block Express, st1, sc1 — IOPS and throughput characteristics
- [ ] EBS Multi-Attach, encryption, snapshot performance
- [ ] Instance store use cases
- [ ] EFS performance modes and throughput modes
- [ ] Amazon FSx variants: Windows File Server, Lustre, NetApp ONTAP, OpenZFS — pick the right one
- [ ] AWS Storage Gateway modes: File, Volume (cached vs stored), Tape

### 3.2 High-performing compute
- [ ] EC2 instance family selection: general purpose, compute optimised, memory optimised, storage optimised, accelerated
- [ ] Placement groups: cluster, spread, partition
- [ ] Enhanced networking, ENA, EFA
- [ ] Lambda performance: memory/CPU coupling, cold starts, provisioned concurrency, reserved concurrency, timeouts, layers
- [ ] Containers on ECS/EKS/Fargate for performance
- [ ] Auto Scaling for performance vs for cost
- [ ] AWS Batch for high-throughput jobs
- [ ] Graviton instances

### 3.3 High-performing databases
- [ ] RDS: instance sizing, read replicas (cross-Region), Multi-AZ vs read replica distinction
- [ ] Aurora: cluster architecture, replicas, Aurora Serverless v2, Global Database
- [ ] DynamoDB: partition key design, hot partitions, LSI vs GSI, on-demand vs provisioned capacity, auto scaling, DAX
- [ ] DynamoDB Streams, TTL
- [ ] ElastiCache Redis vs Memcached, caching strategies (lazy loading, write-through)
- [ ] Redshift: distribution styles, sort keys, Redshift Spectrum, Concurrency Scaling
- [ ] Purpose-built database selection: Neptune, Timestream, DocumentDB, Keyspaces, QLDB
- [ ] Database caching and connection pooling (RDS Proxy)

### 3.4 High-performing network
- [ ] CloudFront: origins, behaviours, cache policies, TTL, invalidations, signed URLs and cookies, OAC
- [ ] AWS Global Accelerator vs CloudFront — the distinction
- [ ] Direct Connect (dedicated vs hosted), Direct Connect Gateway, VPN as backup
- [ ] Transit Gateway for hub-and-spoke at scale
- [ ] PrivateLink for private service exposure
- [ ] Route 53 latency-based routing
- [ ] Bandwidth and latency considerations, edge network optimisation

### 3.5 High-performing data ingestion and transformation
- [ ] Amazon Kinesis Data Streams, Data Firehose, Managed Service for Apache Flink
- [ ] Amazon MSK
- [ ] AWS Glue — ETL, crawlers, Data Catalog
- [ ] Amazon EMR
- [ ] Amazon Athena, AWS Lake Formation
- [ ] Amazon OpenSearch Service
- [ ] Amazon QuickSight
- [ ] Data lake architecture on S3
- [ ] Batch vs streaming ingestion patterns

## D4. Design Cost-Optimized Architectures (20%)

### 4.1 Cost-optimised storage
- [ ] S3 storage class cost comparison and lifecycle policy design
- [ ] S3 Intelligent-Tiering vs manual lifecycle rules
- [ ] Glacier retrieval tiers and their costs
- [ ] EBS snapshot management, gp3 over gp2 as a default cost win
- [ ] Data transfer costs: same-AZ, cross-AZ, cross-Region, internet egress, CloudFront egress
- [ ] S3 Requester Pays

### 4.2 Cost-optimised compute
- [ ] Spot Instances, Spot Fleet, interruption handling
- [ ] Reserved Instances vs Savings Plans — which fits which workload
- [ ] Right-sizing with Compute Optimizer
- [ ] Serverless as a cost strategy
- [ ] Instance scheduling, scaling policies to reduce idle spend
- [ ] Graviton for price/performance

### 4.3 Cost-optimised databases
- [ ] RDS Reserved Instances
- [ ] Aurora Serverless for variable workloads
- [ ] DynamoDB on-demand vs provisioned — the cost crossover point
- [ ] Read replica cost implications
- [ ] Database right-sizing and storage auto scaling

### 4.4 Cost-optimised network
- [ ] NAT gateway cost — and when VPC endpoints are cheaper
- [ ] CloudFront for reducing origin egress cost
- [ ] Direct Connect vs VPN cost profiles
- [ ] Load balancer type cost differences
- [ ] Cost tools in architecture decisions: Cost Explorer, Budgets, Cost and Usage Report, cost allocation tags, AWS Compute Optimizer, Trusted Advisor cost checks

---

# 4. DVA-C02 — Developer Associate

Domains: Development with AWS Services 32% · Security 26% · Deployment 24% · Troubleshooting & Optimization 18%

> **Revise from SAA-C03 before starting:** IAM policy structure and evaluation logic · STS and roles · KMS, Secrets Manager, Parameter Store · Cognito user pools vs identity pools · S3 features (versioning, presigned URLs, encryption options) · DynamoDB (partition keys, GSI/LSI, capacity modes, DAX, Streams) · Lambda (concurrency, cold starts, layers) · SQS/SNS/EventBridge/Step Functions · API Gateway · CloudWatch, CloudTrail, X-Ray · ECS/ECR/Fargate · CloudFormation. SAA covered these architecturally — DVA covers them at the API, SDK, and error-code level.

> **Also revise from AIF-C01:** Amazon Bedrock basics and Amazon Q Developer — the DVA-C02 guide now includes Amazon Q Developer and event-driven patterns.

## D1. Development with AWS Services (32%)

### 1.1 Applications with event-driven and serverless architectures
- [ ] Lambda: handler structure, event object, context object, environment variables
- [ ] Lambda configuration: memory, timeout, ephemeral storage, VPC access, layers, versions and aliases
- [ ] Lambda concurrency: reserved vs provisioned, throttling behaviour, scaling limits
- [ ] Lambda event source mappings: SQS, Kinesis, DynamoDB Streams — batch size, batch window, error handling
- [ ] Lambda destinations and DLQs
- [ ] Stateful vs stateless design, idempotency
- [ ] SQS message lifecycle: visibility timeout, long vs short polling, message retention, DLQ redrive
- [ ] SQS FIFO: message group ID, deduplication ID
- [ ] SNS message filtering, delivery retry, FIFO topics
- [ ] EventBridge: event patterns, rules, targets, schema registry, archive and replay, EventBridge Pipes
- [ ] Step Functions: state types (Task, Choice, Parallel, Map, Wait), error handling, retry/catch, Standard vs Express
- [ ] Fan-out and orchestration patterns

### 1.2 Applications using AWS SDKs and APIs
- [ ] AWS SDK usage patterns (boto3 or equivalent) — client creation, credential chain
- [ ] Credential precedence order: environment variables → shared config → instance profile
- [ ] AWS CLI configuration, profiles, named credentials
- [ ] Retry behaviour: exponential backoff, jitter, SDK default retries
- [ ] Pagination in SDK calls
- [ ] Handling API throttling and `ThrottlingException`
- [ ] AWS SAM (Serverless Application Model) — templates, local testing, `sam build`/`deploy`
- [ ] AWS CDK basics
- [ ] Amazon Q Developer for code generation and review

### 1.3 Data stores in application development
- [ ] DynamoDB API: PutItem, GetItem, UpdateItem, Query vs Scan, BatchGetItem, BatchWriteItem, TransactWriteItems
- [ ] DynamoDB conditional writes, optimistic locking, atomic counters
- [ ] DynamoDB consistency: eventually consistent vs strongly consistent reads
- [ ] RCU/WCU calculation
- [ ] DynamoDB single-table design basics, key design to avoid hot partitions
- [ ] DynamoDB Streams and Lambda triggers
- [ ] S3 API: multipart upload, presigned URLs, S3 Select, event notifications
- [ ] S3 consistency model
- [ ] RDS Proxy for connection pooling from Lambda
- [ ] ElastiCache caching patterns in code: lazy loading, write-through, TTL strategy
- [ ] Data lifecycle, ephemeral vs persistent storage in application context
- [ ] Serialization, schema evolution, data format choice

## D2. Security (26%)

*Larger than Deployment. Routinely under-studied.*

### 2.1 Authentication and authorization
- [ ] Amazon Cognito user pools (authentication) vs identity pools (authorization to AWS resources)
- [ ] Cognito flows, hosted UI, tokens (ID, access, refresh), JWT validation
- [ ] IAM roles for applications, instance profiles, Lambda execution roles
- [ ] AWS STS: AssumeRole, AssumeRoleWithWebIdentity, session duration
- [ ] Resource-based policies: S3 bucket policies, Lambda resource policies, SQS/SNS policies
- [ ] API Gateway authorizers: IAM, Lambda authorizer, Cognito authorizer
- [ ] API keys and usage plans
- [ ] Cross-origin resource sharing (CORS)
- [ ] Least privilege for application roles

### 2.2 Encryption in application code
- [ ] KMS in code: Encrypt, Decrypt, GenerateDataKey, envelope encryption
- [ ] Client-side vs server-side encryption
- [ ] S3 encryption options in SDK calls
- [ ] Certificate management with ACM
- [ ] Key rotation and key policies from a developer's view

### 2.3 Sensitive data management
- [ ] Secrets Manager: retrieval in code, automatic rotation, cross-account access, caching
- [ ] Systems Manager Parameter Store: String, StringList, SecureString, standard vs advanced tiers
- [ ] Secrets Manager vs Parameter Store — cost, rotation, size, the decision criteria
- [ ] Environment variable encryption in Lambda
- [ ] Avoiding credentials in code and logs, sanitising logs
- [ ] Data classification and PII handling

## D3. Deployment (24%)

### 3.1 Preparing artifacts
- [ ] Application configuration and secrets separated from code
- [ ] Lambda deployment packages, container images for Lambda
- [ ] Docker images, Dockerfile basics, Amazon ECR (push, pull, lifecycle policies, image scanning)
- [ ] Dependency management, packaging for target runtime

### 3.2 Testing in development environments
- [ ] AWS SAM local invocation and local testing
- [ ] Mocking AWS services
- [ ] API Gateway stages and stage variables
- [ ] Lambda versions, aliases, and weighted alias routing
- [ ] Integration testing against a dev account

### 3.3 Automating deployment testing
- [ ] AWS CodeBuild: buildspec.yml structure, phases, artifacts, environment variables
- [ ] AWS CodePipeline: stages, actions, source/build/deploy, approval actions
- [ ] AWS CodeDeploy: appspec.yml, deployment groups, lifecycle hooks
- [ ] AWS CodeArtifact
- [ ] Unit vs integration vs load testing in a pipeline

### 3.4 Deploying code
- [ ] Deployment strategies: in-place, rolling, rolling with additional batch, blue/green, canary, linear, all-at-once — and their trade-offs
- [ ] CodeDeploy deployment configurations for Lambda, ECS, EC2/on-premises
- [ ] Rollback and automatic rollback triggers
- [ ] CloudFormation: template anatomy, parameters, mappings, conditions, outputs, intrinsic functions (Ref, GetAtt, Sub, Join), change sets, stack policies, nested stacks, drift detection
- [ ] CloudFormation deletion policy and stack update behaviour
- [ ] AWS SAM as a CloudFormation transform
- [ ] Elastic Beanstalk deployment policies and environment types
- [ ] AWS Amplify for frontend deployment

## D4. Troubleshooting and Optimization (18%)

### 4.1 Root cause analysis
- [ ] CloudWatch Logs: log groups, streams, retention, Logs Insights queries, metric filters
- [ ] CloudWatch metrics, custom metrics, embedded metric format
- [ ] CloudWatch alarms, composite alarms
- [ ] AWS X-Ray: traces, segments, subsegments, annotations vs metadata, service map, sampling rules
- [ ] Structured logging and correlation IDs
- [ ] Common AWS error codes and HTTP status codes — 4xx vs 5xx, `AccessDenied`, `ThrottlingException`, `ProvisionedThroughputExceededException`, `ConditionalCheckFailedException`
- [ ] Lambda-specific failures: timeout, out of memory, permission errors, VPC ENI exhaustion
- [ ] API Gateway errors: 429, 502, 504, integration timeouts

### 4.2 Instrumentation for observability
- [ ] Instrumenting code with X-Ray SDK
- [ ] Distributed tracing across services
- [ ] CloudWatch Application Insights, CloudWatch Synthetics canaries
- [ ] AWS Health Dashboard
- [ ] Alerting design — actionable alarms vs noise

### 4.3 Optimizing applications
- [ ] Caching at every layer: CloudFront, API Gateway caching, ElastiCache, DAX
- [ ] Reducing Lambda cold starts, right-sizing Lambda memory
- [ ] Connection reuse and SDK client reuse outside the handler
- [ ] Query optimisation, avoiding Scan in DynamoDB
- [ ] Concurrency tuning and backpressure
- [ ] Cost optimisation in application design

---

## Post-exam checklist (repeat per certification)

- [ ] Score report downloaded (SOP requires this as evidence)
- [ ] Digital badge claimed on Credly
- [ ] Certificate PDF downloaded
- [ ] For SAA specifically: registration proof + score report + digital badge submitted to the faculty coordinator
- [ ] 50% discount voucher for the next exam noted (issued on passing any AWS cert)

## Resources

- AWS Skill Builder — official learning paths, plus a free exam prep course with practice questions per certification
- AWS Academy LMS — required for the course regardless
- Official exam guides at `docs.aws.amazon.com/aws-certification/` — the authoritative source for everything above
- Service FAQ pages — written by the same teams that write exam questions; read them for your top 15 services
- Practice exams — aim for consistent 80%+ with no domain below 70% before sitting

---

*Exam versions verified current as of 29 Aug 2026: CLF-C02, AIF-C01, SAA-C03, DVA-C02. Re-check the official exam guide before each attempt in case AWS ships a new version.*
