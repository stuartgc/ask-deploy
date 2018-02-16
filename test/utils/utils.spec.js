"use strict";

const env = require( "../env" )();

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

        after( function() {
            delete this.option;
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

    describe( "utils.set", function() {
        beforeEach( function() {
            this.BAR = "bar";

            this.option = {
                foo: this.BAR,
                bar: {},
                baz: undefined,
            };
        } );

        after( function() {
            delete this.BAR;

            delete this.option;
        } );

        it( "verify we can set values with and without dot syntax", function() {
            utils.set( "foo", this.option, this.BAR );

            expect( this.option.foo ).to.equal( this.BAR );

            utils.set( "bar.baz", this.option, this.BAR );

            expect( this.option.bar.baz ).to.equal( this.BAR );

            utils.set( "baz.baz", this.option, this.BAR );

            expect( this.option.baz.baz ).to.equal( this.BAR );
        } );

        it( "verify we can set undefined values with and without dot syntax", function() {
            utils.set( "foo", this.option, undefined );

            expect( this.option.foo ).to.be.undefined;

            utils.set( "bar.baz", this.option, undefined );

            expect( this.option.bar.baz ).to.be.undefined;;

            utils.set( "baz.baz", this.option, undefined );

            expect( this.option.baz.baz ).to.be.undefined;;
        } );

        it( "verify we can set null values with and without dot syntax", function() {
            utils.set( "foo", this.option, null );

            expect( this.option.foo ).to.be.null;

            utils.set( "bar.baz", this.option, null );

            expect( this.option.bar.baz ).to.be.null;

            utils.set( "baz.baz", this.option, null );

            expect( this.option.baz.baz ).to.be.null;
        } );

        it( "fail gracefully when key does not exist", function() {
            const func = () => {
                utils.set( null, this.option, this.BAR );
            };

            expect( func ).to.not.throw();
        } );

        it( "fail gracefully when source does not exist", function() {
            const func = () => {
                utils.set( "baz", null, this.BAR );
            };

            expect( func ).to.not.throw();
        } );

        it( "do not overwrite existing values", function() {
            utils.set( "foo.baz", this.option, this.BAR );

            expect( this.option.foo ).to.equal( this.BAR );
        } );
    } );

    describe( "utils.replaceAll", function() {
        beforeEach( function() {
            this.templateStr = "foo {foo} baz {foo}";
            this.replacedStr = "foo bar baz bar";

            this.mapObj = {
                "{foo}": "bar"
            };
        } );

        after( function() {
            delete this.templateStr;
            delete this.replacedStr;
            delete this.mapObj;
        } );

        it( "verify that all instances are replaced", function() {
            expect( utils.replaceAll( this.templateStr, this.mapObj ) ).to.equal( this.replacedStr );
        } );

        it( "fail gracefully when string arg does not exist", function() {
            const func = () => {
                expect( utils.replaceAll( null, this.mapObj ) ).to.be.null;
            };

            expect( func ).to.not.throw();
        } );

        it( "fail gracefully when string arg is not a string", function() {
            const func = () => {
                expect( typeof utils.replaceAll( {}, this.mapObj ) ).to.equal( "object" );
            };

            expect( func ).to.not.throw();
        } );

        it( "fail gracefully when mapObj does not exist", function() {
            const func = () => {
                expect( utils.replaceAll( this.templateStr ) ).to.equal( this.templateStr );
            };

            expect( func ).to.not.throw();
        } );

        it( "fail gracefully when mapObj is not an object", function() {
            const func = () => {
                expect( utils.replaceAll( this.templateStr, this.replacedStr ) ).to.equal( this.templateStr );
            };

            expect( func ).to.not.throw();
        } );
    } );
} );
