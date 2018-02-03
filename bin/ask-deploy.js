#!/usr/bin/env node
"use strict";

if ( !require( "semver" ).gte( process.version, "6.10.2")) {
    console.log( "Version of node.js doesn't meet minimum requirement.") ;
    console.log( "Please ensure system has node.js version 6.10.2 or higher." );

    return;
}

const deploy = require( "./../lib/deploy/deploy" ),
      program = require( "commander" );

let configEnv = null,
    deployTarget = null;

//TODO: add support for debug flag
program
.usage( 'ask-deploy <env> [options]' )
.description( "Deploy wrapper for Command Line Interface for Alexa Skill Management API" )
.option( '-t, --target <target>', 'deploy "lambda", "model", "skill" or "all"', /^(lambda|model|skill|all)$/i, 'all' )
.option( "-v, --version", "output the version number of ask-deploy" , () => {
    console.log( require( "../package.json" ).version );

    process.exit( 0 );
} )
.action( function( env, options ) {
    configEnv = env;

    deployTarget = options.target;// || "all";
} )
.parse( process.argv );

if ( configEnv && deployTarget ) {
    deploy.deploy( configEnv, deployTarget );
} else {
    program.outputHelp();

    process.exit( 1 );
}
