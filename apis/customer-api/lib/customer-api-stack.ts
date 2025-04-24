import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export class CustomerApiStack extends cdk.Stack {
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly table: dynamodb.Table;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get VPC ID from context
    const vpcId = this.node.tryGetContext('vpcId');
    if (!vpcId) {
      throw new Error('VPC ID must be provided in CDK context. Use -c vpcId=<your-vpc-id> when deploying');
    }

    // Get VPC from ID
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: vpcId
    });

    // Create DynamoDB table
    this.table = new dynamodb.Table(this, 'CustomersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    // Create Security Group for ALB
    this.securityGroup = new ec2.SecurityGroup(this, 'CustomerAlbSecurityGroup', {
      vpc: vpc,
      description: 'Security group for Customer API ALB',
      allowAllOutbound: true
    });

    // Allow inbound HTTP traffic
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    );

    // Create ALB
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'CustomerAlb', {
      vpc: vpc,
      internetFacing: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: this.securityGroup
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'CustomerCluster', {
      vpc: vpc
    });

    // Create ECS Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CustomerTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      }
    });

    // Add container to task definition
    taskDefinition.addContainer('CustomerContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../')),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'customer-api' }),
      environment: {
        TABLE_NAME: this.table.tableName,
        PORT: '3000'
      }
    }).addPortMappings({
      containerPort: 3000
    });

    // Create ECS Service
    const service = new ecs.FargateService(this, 'CustomerService', {
      cluster,
      taskDefinition,
      desiredCount: 2,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      securityGroups: [
        new ec2.SecurityGroup(this, 'CustomerServiceSecurityGroup', {
          vpc: vpc,
          description: 'Security group for Customer API ECS Service',
          allowAllOutbound: true
        })
      ]
    });

    // Create Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'CustomerTargetGroup', {
      vpc: vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30)
      }
    });

    // Add listener to ALB
    this.alb.addListener('CustomerListener', {
      port: 80,
      defaultTargetGroups: [targetGroup]
    });

    // Allow ALB to access ECS service
    service.attachToApplicationTargetGroup(targetGroup);

    // Grant ECS task permissions to access DynamoDB
    this.table.grantReadWriteData(taskDefinition.taskRole);

    // Output ALB DNS name and ARN
    new cdk.CfnOutput(this, 'CustomerAlbDns', {
      value: this.alb.loadBalancerDnsName
    });

    new cdk.CfnOutput(this, 'CustomerAlbArn', {
      value: this.alb.loadBalancerArn
    });
  }
} 