#!/usr/bin/env node
"use strict";

if ( !require( "semver" ).gte( process.version, "6.10.2")) {
    console.log( "Version of node.js doesn't meet minimum requirement.") ;
    console.log( "Please ensure system has node.js version 6.10.2 or higher." );

    return;
}

const c = require( "./../lib/utils/constants" ),
      deploy = require( "./../lib/deploy/deploy" ),
      program = require( "commander" ),
      utils = require( "./../lib/utils/utils" );

let configEnv = null,
    options = null;

//TODO: add support for debug flag
program
.usage( 'ask-deploy <env> [options]' )
.description( "Deploy wrapper for Command Line Interface for Alexa Skill Management API" )
.option( '-t, --' + c.OPTIONS.TARGET + ' <target>', 'deploy "lambda", "model", "skill" or "all"', /^(lambda|model|skill|all)$/i, 'all' )
.option( '-P, --' + c.OPTIONS.PERSIST_FILES, 'do not delete generated files' )
.option( "-v, --version", "output the version number of ask-deploy" , () => {
    console.log( require( "../package.json" ).version );

    process.exit( 0 );
} )
.action( function( env, opts ) {
    configEnv = env;

    options = {
        persist: utils.get( c.OPTIONS.PERSIST_FILES, opts ),
        target: utils.get( c.OPTIONS.TARGET, opts )
    };
} )
.parse( process.argv );

if ( configEnv && options.target ) {
    deploy.deploy( configEnv, options );
} else {
    program.outputHelp();

    process.exit( 1 );
}
