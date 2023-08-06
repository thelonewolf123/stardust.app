export const EC2_INSTANCE_TYPE = 't2.micro'
export const EC2_INSTANCE_NAME = 'soulForgeBaseInstance'
export const EC2_PRIVATE_KEY_NAME = 'ec2-privateKey.pem'
export const EC2_PUBLIC_KEY_NAME = 'ec2-publicKey.pub'
export const SSH_KEY_NAME = 'infra-soulbound-keypair'
export const EC2_AMI_NAME = 'soulForgeBaseAmi'
export const EC2_SECURITY_GROUP_NAME = 'soulForgeSecurityGroup'

export const REMOTE_DOCKER_BUCKET_NAME = 'docker-remote-keys'
export const CONTAINER_SNAPSHOT_BUCKET_NAME = 'ec2-docker-snapshot'
export const PRIVATE_KEY_BUCKET_NAME = 'ec2-private-keys'

export const EC2_EXPOSED_PORTS = [22, 80, 443, 2376]

export const REMOTE_DOCKER_CRED = {
    ca: 'ca-key.pem',
    key: 'client-docker-key.pem',
    cert: 'client-docker-cert.pem'
}

export const SSM_PARAMETER_KEYS = {
    baseAmiId: 'base-ami-id',
    baseSecurityGroup: 'base-security-group',
    baseKeyParName: 'base-key-pair-name'
}
