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


var assetsDir = './assets/',
    publicDir = './public/';


/**
 * LANDINGPAGE TASKS
 *
 */
gulp.task( 'styles', function () {
  gulp.src( assetsDir + 'styles/main.less' )
    .pipe( less() )
    .pipe( minifyCSS() )
    .pipe( rev() )
    .pipe( gulp.dest( publicDir + 'styles/' ) )
    .pipe( rev.manifest() )
    .pipe( gulp.dest(  assetsDir + 'styles/'  ) );

  gulp.run( 'template' );
});


gulp.task( 'scripts' , function () {
  gulp.src( assetsDir + 'scripts/**.js' )
    .pipe( concat( 'main.js' ) )
    /**
     * uncomment the next line, if you want to strip out
     * console, alert, and debugger statements
     */
    //.pipe( stripDebug() )
    .pipe( uglify( {outSourceMaps: true} ) )
    .pipe( rev() )
    .pipe( gulp.dest( publicDir + 'scripts/' ) )
    .pipe( rev.manifest() )
    .pipe( gulp.dest(  assetsDir + 'scripts/'  ) );

  gulp.run( 'template' );
});


gulp.task( 'template', function() {
  var opts = {comments:false,spare:false};

  gulp.src( assetsDir + 'index.html' )
    .pipe( template( {
      styles  : 'styles/' + stylesRev['main.css'],
      scripts : 'scripts/' + scriptsRev['main.js']
    }
    ) )
    .pipe( minifyHTML( opts ) )
    .pipe( gulp.dest( publicDir ) );
});


gulp.task( 'images', function () {
    gulp.src( assetsDir + 'images/**/*' )
      .pipe(imagemin())
      .pipe(gulp.dest( publicDir + 'images' ));
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

    gulp.watch( assetsDir + 'styles/**/*.less', function() {
      gulp.run( 'styles' );
    });

    gulp.watch( assetsDir + 'scriptss/**/*.js', function() {
      gulp.run( 'scripts' );
    });

    gulp.watch( assetsDir + 'index.html', function() {
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