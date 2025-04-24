#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CustomerApiStack } from '../lib/customer-api-stack';

const app = new cdk.App();

new CustomerApiStack(app, 'CustomerApiStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  vpcId: 'vpc-0cec8cf9870f78af6'
}); 