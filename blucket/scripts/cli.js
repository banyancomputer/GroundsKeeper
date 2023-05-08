#!/usr/bin/env node
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import sade from 'sade';

import { buildCmd } from './build.js';
import { deployCmd } from './deploy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
	path: path.join(__dirname, '..', '.env'),
});

const prog = sade('block-service');

prog
	.command('build')
	.describe('Build the worker.')
	.option('--env', 'Environment', process.env.ENV)
	.action(buildCmd);

prog
    .command('deploy')
	.describe('Deploy the worker.')
	.option('--env', 'Environment', process.env.ENV)
	.option('--secrets', 'Push secrets to the worker', false)
	.action(deployCmd);

prog.parse(process.argv);
