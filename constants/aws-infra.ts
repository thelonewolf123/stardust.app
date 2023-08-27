export const EC2_INSTANCE_TYPE = 't2.micro'
export const EC2_INSTANCE_NAME = 'soulForgeBaseInstance'
export const SSH_KEY_NAME = 'infra-soulbound-keypair'
export const EC2_AMI_NAME = 'soulForgeBaseAmi'
export const EC2_SECURITY_GROUP_NAME = 'soulForgeSecurityGroup'
export const EC2_USER_NAME = 'ubuntu'

export const EC2_EXPOSED_PORTS = [22, 80, 443, 2375]

export const SSM_PARAMETER_KEYS = {
    baseAmiId: 'base-ami-id',
    baseSecurityGroup: 'base-security-group',
    baseKeyParName: 'base-key-pair-name',
    dockerSnapshotBucket: 'docker-snapshot-bucket',
    dockerRemotePassword: 'docker-remote-host-password',
    ec2PublicKey: 'ec2-public-key.pem',
    ec2PrivateKey: 'ec2-private-key.pem',
    dockerBuildInstanceId: 'docker-build-instance-id'
}

export const MAX_CONTAINER_PER_INSTANCE = 2
export const MAX_INSTANCE_STATUS_ATTEMPTS = 300
export const MAX_CONTAINER_SCHEDULE_ATTEMPTS = 300
export const MAX_CONTAINER_BUILD_ATTEMPTS = 300

export const LOCK = {
    BUILDER_INSTANCE: 'builder-instance',
    CONTAINER_INSTANCE: 'container-instance'
}

export const ERROR_CODES = {
    INSTANCE_PROVISION_FAILED: 'Instance provision failed',
    INSTANCE_NOT_FOUND: 'Instance not found',
    INSTANCE_PUBLIC_IP_NOT_FOUND: 'Instance public ip not found',
    CONTAINER_DELETE_FAILED: 'Container delete failed',
    CONTAINER_SCHEDULE_FAILED: 'Container schedule failed',
    CONTAINER_BUILD_FAILED: 'Container build failed',
    CONTAINER_BUILD_HAS_CANCELED: 'Container build has canceled'
} as const

export const EC2_INSTANCE_USERNAMES = 'ubuntu'
