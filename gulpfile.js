/**
 *
 *  how to speedup a landingpage with gulp.
 *
 */

'use strict';

// Require the needed packages
var gulp       = require( 'gulp' ),
    less       = require( 'gulp-less' ),
    clean      = require( 'gulp-clean' ),
    concat     = require( 'gulp-concat' ),
    uglify     = require( 'gulp-uglify' ),
    minifyHTML = require( 'gulp-minify-html' ),
    minifyCSS  = require( 'gulp-minify-css' ),
    imagemin   = require( 'gulp-imagemin' ),
    rev        = require( 'gulp-rev' ),
    template   = require( 'gulp-template' ),
    stripDebug = require( 'gulp-strip-debug' ),
    watch      = require( 'gulp-watch' ),

// require mapping of original paths to the revisioned paths
    scriptsRev = require( './assets/scripts/rev-manifest.json' ),
    stylesRev  = require( './assets/styles/rev-manifest.json' );


var ASSETS_DIR = './assets/',
    PUBLIC_DIR = './public/';


/**
 * LANDINGPAGE TASKS
 *
 */
gulp.task( 'styles', function () {
  gulp.src( ASSETS_DIR + 'styles/main.less' )
    .pipe( less() )
    .pipe( minifyCSS() )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'styles/' ) )
    .pipe( rev.manifest() )
    .pipe( function( manifest ) {
      console.log( '!!! ', manifest );
    })
    .pipe( gulp.dest(  ASSETS_DIR + 'styles/'  ) );
  gulp.run( 'template' );
});


gulp.task( 'scripts' , function () {
  gulp.run( 'clean-scripts' );

  gulp.src( ASSETS_DIR + 'scripts/**.js' )
    .pipe( concat( 'main.js' ) )
    /**
     * uncomment the next line, if you want to strip out
     * console, alert, and debugger statements
     */
    //.pipe( stripDebug() )
    .pipe( uglify( {outSourceMaps: true} ) )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'scripts/' ) )
    .pipe( rev.manifest() )
    .pipe( gulp.dest(  ASSETS_DIR + 'scripts/'  ) );

  gulp.run( 'template' );
});


gulp.task( 'clean-scripts' , function () {
  gulp.src( PUBLIC_DIR + 'scripts/' )
    .pipe( clean() );
});



gulp.task( 'template', function() {
  var opts = {comments:false,spare:false};

  gulp.src( ASSETS_DIR + 'index.html' )
    .pipe( template( {
      styles  : 'styles/' + stylesRev['main.css'],
      scripts : 'scripts/' + scriptsRev['main.js']
    }
    ) )
    .pipe( minifyHTML( opts ) )
    .pipe( gulp.dest( PUBLIC_DIR ) );
});


gulp.task( 'images', function () {
    gulp.src( ASSETS_DIR + 'images/**/*' )
      .pipe(imagemin())
      .pipe(gulp.dest( PUBLIC_DIR + 'images' ));
  });


/**
 * LANDINGPAGE
 *
 *  run all landingpage related tasks with:
 *
 *  $ gulp landingpage
 *
 */
gulp.task( 'landingpage', function(){
    gulp.run( 'scripts' );
    gulp.run( 'styles' );
    gulp.run( 'template' );
    gulp.run( 'images' );

    gulp.watch( ASSETS_DIR + 'styles/**/*.less', function() {
      gulp.run( 'styles' );
    });

    gulp.watch( ASSETS_DIR + 'scripts/**/*.js', function() {
      gulp.run( 'scripts' );
    });

    gulp.watch( ASSETS_DIR + 'index.html', function() {
      gulp.run( 'template' );
    });
  }
);


/**
 * Default gulp task will run all landingpage task.
 * This is just a shorcut for $ gulp landingpage
 *
 *  $ gulp
 *
 */
gulp.task( 'default', function(){
    gulp.run( 'landingpage' );
  }
);