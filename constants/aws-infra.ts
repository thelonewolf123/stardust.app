export const EC2_INSTANCE_TYPE = 't2.micro'
export const EC2_INSTANCE_NAME = 'soulForgeBaseInstance'
export const EC2_PRIVATE_KEY_NAME = 'ec2-privateKey.pem'
export const EC2_PUBLIC_KEY_NAME = 'ec2-publicKey.pub'
export const SSH_KEY_NAME = 'infra-soulbound-keypair'
export const EC2_AMI_NAME = 'soulForgeBaseAmi'
export const EC2_SECURITY_GROUP_NAME = 'soulForgeSecurityGroup'

export const EC2_EXPOSED_PORTS = [22, 80, 443, 2375]

export const SSM_PARAMETER_KEYS = {
    baseAmiId: 'base-ami-id',
    baseSecurityGroup: 'base-security-group',
    baseKeyParName: 'base-key-pair-name',
    dockerSnapshotBucket: 'docker-snapshot-bucket',
    dockerRemotePassword: 'docker-remote-host-password'
}

export const MAX_CONTAINER_PER_INSTANCE = 2
export const MAX_INSTANCE_STATUS_ATTEMPTS = 300
export const INSTANCE_SCHEDULE_KEY = 'instance-schedule'

export const ERROR_CODES = {
    INSTANCE_PROVISION_FAILED: 'Instance provision failed',
    INSTANCE_NOT_FOUND: 'Instance not found',
    CONTAINER_DELETE_FAILED: 'Container delete failed'
}
