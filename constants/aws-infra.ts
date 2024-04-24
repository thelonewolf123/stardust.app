export const EC2_INSTANCE_TYPE = 't2.micro'
export const EC2_INSTANCE_NAME = 'stardustBaseInstance'
export const SSH_KEY_NAME = 'stardustKeyPair'
export const EC2_AMI_NAME = 'stardustBaseAmi'
export const EC2_SECURITY_GROUP_NAME = 'stardustSecurityGroup'

export const EC2_EXPOSED_PORTS = [22, 80, 443]

export const SSM_PARAMETER_KEYS = {
    baseAmiId: 'base-ami-id',
    baseSecurityGroup: 'base-security-group',
    baseKeyParName: 'base-key-pair-name',
    dockerSnapshotBucket: 'docker-snapshot-bucket',
    dockerRemotePassword: 'docker-remote-host-password',
    ec2PublicKey: 'ec2-public-key.pem',
    ec2PrivateKey: 'ec2-private-key.pem',
    dockerBuildInstanceId: 'docker-build-instance-id',
    proxyIpAddr: 'proxy-ip-addr',
    spotFleetRole: 'spot-fleet-role',
    userInstanceSecurityGroup: 'user-instance-security-group',
    backendURL: 'backend-url'
} as const

export const MAX_CONTAINER_PER_INSTANCE = 2
export const MAX_INSTANCE_STATUS_ATTEMPTS = 300
export const MAX_CONTAINER_SCHEDULE_ATTEMPTS = 300
export const MAX_CONTAINER_BUILD_ATTEMPTS = 300

export const LOCK = {
    BUILDER_INSTANCE: 'builder-instance',
    CONTAINER_INSTANCE: 'container-instance'
} as const

export const ERROR_CODES = {
    INSTANCE_PROVISION_FAILED: 'Instance provision failed',
    INSTANCE_NOT_FOUND: 'Instance not found',
    INSTANCE_PUBLIC_IP_NOT_FOUND: 'Instance public ip not found',
    CONTAINER_DELETE_FAILED: 'Container delete failed',
    CONTAINER_SCHEDULE_FAILED: 'Container schedule failed',
    CONTAINER_BUILD_FAILED: 'Container build failed',
    CONTAINER_BUILD_HAS_CANCELED: 'Container build has canceled'
} as const

export const EC2_INSTANCE_USERNAME = 'ubuntu'
export const MAX_CONTAINER_BUILD_QUEUE_ATTEMPTS = 5
export const MAX_CONTAINER_TERMINATE_QUEUE_ATTEMPTS = 5
export const MAX_CONTAINER_DEPLOY_QUEUE_ATTEMPTS = 5

export const REPLICAS = {
    APP: 2,
    PROXY: 2,
    CRON: 1, // ! NOTE: don't change this
    LOGS: 1, // ! NOTE: don't change this
    SCHEDULER: 4
} as const
