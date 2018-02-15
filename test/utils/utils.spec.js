"use strict";

const utils = require( "./../../lib/utils/utils" );

describe( "UTILS", function() {


    describe( "utils.errorCheckCallback", function() {
        it( "errorCheckCallback always returns a function", function() {
            let fn = function() {
            };

            expect( utils.errorCheckCallback( fn ) ).to.equal( fn );
            expect( utils.errorCheckCallback( undefined ) ).to.be.a( "function" );

            // we need to execute the function because istanbul is annoying
            // and won't cover that code branch unless we do
            expect( utils.errorCheckCallback( "foo" )() ).not.to.throw;
        } );
    } );

    describe( "utils.get", function() {
        beforeEach( function() {
            this.option = {
                foo: "bar",
                bar: {
                    foo: "bar",
                    bar: {
                        foo: "bar"
                    }
                },
                baz: undefined,
            };
        } );

        it( "verify we can get values with and without dot syntax", function() {
            expect( utils.get( "foo", this.option ) ).to.equal( this.option.foo );
            expect( utils.get( "bar", this.option ) ).to.eql( this.option.bar );
            expect( utils.get( "bar.foo", this.option ) ).to.equal( this.option.bar.foo );
            expect( utils.get( "bar.bar.foo", this.option ) ).to.equal( this.option.bar.bar.foo );
        } );

        it( "returns fallback when fallback is set and key does not exist", function() {
            expect( utils.get( "nope", this.option, "foo" ) ).to.equal( "foo" );
        } );

        it( "returns empty when fallback is empty and key does not exist", function() {
            expect( utils.get( "nope", this.option, "" ) ).to.equal( "" );
        } );

        it( "returns null when fallback is null and key does not exist", function() {
            expect( utils.get( "nope", this.option, null ) ).to.be.null;
        } );

        it( "returns false when fallback is undefined and key does not exist", function() {
            expect( utils.get( "nope", this.option ) ).to.be.false;
        } );

        it( "returns fallback when source is undefined", function() {
            expect( utils.get( "baz", this.option, "zar" ) ).to.equal( "zar" );
        } );

        it( "returns false when source is null and key does not exist", function() {
            expect( utils.get( "nope", null ) ).to.be.false;
        } );

        it( "returns false when key empty", function() {
            expect( utils.get( "", this.option, "zar" ) ).to.equal( "zar" );
        } );

        it( "returns false when key is null", function() {
            expect( utils.get( null, this.option, "zar" ) ).to.equal( "zar" );
        } );

        it( "returns false when key and source is null", function() {
            expect( utils.get( null, null, "zar" ) ).to.equal( "zar" );
        } );

        it( "returns false when no parameters are passed", function() {
            expect( utils.get() ).to.be.false;
        } );
    } );
} );
