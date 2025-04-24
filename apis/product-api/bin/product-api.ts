#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductApiStack } from '../lib/product-api-stack';

const app = new cdk.App();

new ProductApiStack(app, 'ProductApiStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  vpcId: 'vpc-0cec8cf9870f78af6'
}); 