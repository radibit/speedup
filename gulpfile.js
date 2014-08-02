/**
 *
 *  how to speedup a landingpage with gulp.
 *
 */

'use strict';

// Require the needed packages
var gulp        = require( 'gulp' ),
    gutil       = require( 'gulp-util'),
    less        = require( 'gulp-less' ),
    prefix      = require( 'gulp-autoprefixer' ),
    clean       = require( 'gulp-clean' ),
    concat      = require( 'gulp-concat' ),
    uglify      = require( 'gulp-uglify' ),
    minifyHTML  = require( 'gulp-minify-html' ),
    minifyCSS   = require( 'gulp-minify-css' ),
    jshint      = require( 'gulp-jshint' ),
    imagemin    = require( 'gulp-imagemin' ),
    rev         = require( 'gulp-rev' ),
    runSequence = require( 'run-sequence' ),
    template    = require( 'gulp-template' ),
    stripDebug  = require( 'gulp-strip-debug' ),
    size        = require( 'gulp-size' ),
    watch       = require( 'gulp-watch' ),
    connect     = require( 'gulp-connect' ),

    // put all your source files into this folder:
    ASSETS_DIR = './assets/',
    // we will serve the optimized files from this folder:
    PUBLIC_DIR = './public/',
    // all paths for watching and regeneration
    PATHS      = {
      template : 'templates/**/*.html',
      jshint   : [ 'gulpfile.js', ASSETS_DIR + 'js/**/*.js' ],
      less     : ASSETS_DIR + 'css/**/*.less',
      scripts  : ASSETS_DIR + 'js/**/*.js'
    },

    scriptsHash = '',
    stylesHash = '';


/*******************************************************************************
 * STYLE TASK
 *
 * this task is responsible for the style files
 * - it will delete old generated css files
 * - we will compile the less files to css
 * - we will minify the css files
 * - hash the files
 * - and save the new file name in the 'stylesHash' variable
 */
gulp.task( 'styles', [ 'clean-styles' ], function () {
  return gulp.src( ASSETS_DIR + 'css/main.less' )
    .pipe( less() )
    .pipe( minifyCSS() )
    .pipe( prefix( 'last 1 version', '> 1%', 'ie 8', 'ie 7' ) )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'css/' ) )
    .pipe( gutil.buffer( function ( err, files ) {
      stylesHash = files.map( function ( file ) {
        return file.path.replace( file.base, '' );
      }).join( '' );
    }));
});


gulp.task( 'clean-styles' , function () {
  // delete old generated stlye/css files
  gulp.src( PUBLIC_DIR + 'css/' )
    .pipe( clean() );
});



/*******************************************************************************
 * SCRIPT TASKS
 *
 * this task is responsible for the JavaScript files
 * - it will delete old generated files
 * - concatenate all file in as ASSETS_DIR + 'scripts/
 * - hash the files
 * - and save the new file name in the 'scriptsHash' variable
 */
gulp.task( 'scripts', [ 'clean-scripts'], function () {
  return gulp.src( PATHS.scripts )
    .pipe( concat( 'main.js' ) )
    /**
     * uncomment the next line, if you want to strip out
     * console, alert, and debugger statements
     */
    //.pipe( stripDebug() )
    .pipe( uglify( {outSourceMaps: true} ) )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'js/' ) )
    .pipe( gutil.buffer( function ( err, files ) {
      scriptsHash = files.map( function ( file ) {
        return file.path.replace( file.base, '' );
      }).join( '' );
    }));
});


/*******************************************************************************
 * JSHINT TASK
 *
 * this task will validate gulpfile and all JS in assets for JSHINT errors
 */
gulp.task( 'jshint', function() {
  return gulp.src( PATHS.jshint )
    .pipe( jshint() )
    .pipe( jshint.reporter( 'jshint-stylish' ) );
});


/*******************************************************************************
 * CLEAN-SCRIPT TASK
 *
 * this task will remove all generated JavaScript files in public directory
 */
gulp.task( 'clean-scripts' , function () {
  // delete old generated script files
  gulp.src( PUBLIC_DIR + 'js/' )
    .pipe( clean() );
});


/*******************************************************************************
 * TEMPLATE TASK
 *
 * this task is responsible for the HTML template
 *  - it will populate the placeholders for the optimized script & style file names
 *  - and it will minify the HTML template file to save some bits
 */
gulp.task( 'template', function() {
  var opts = { comments : false, spare : false };

  gulp.src( PATHS.template )
    .pipe( template( {
      styles  : 'css/' + stylesHash,
      scripts : 'js/' + scriptsHash
    }
    ) )
    .pipe( minifyHTML( opts ) )
    .pipe( gulp.dest( PUBLIC_DIR ) )
    .pipe( connect.reload() );
});


/*******************************************************************************
 * IMAGE TASK
 *
 * this task is responsible for image optimization
 *  - it will optimize all images in the assets folder and move them to
 *    the public folder
 */
gulp.task( 'images', function () {
  return gulp.src( ASSETS_DIR + 'images/**/*' )
    .pipe(imagemin())
    .pipe(gulp.dest( PUBLIC_DIR + 'images' ));
});


/*******************************************************************************
 * SIZE
 *
 * this task will show you file sizes after build process
 */
gulp.task( 'size' , function() {
  gutil.log( '********************************' );
  gutil.log( '--> current file sizes not gzipped: ' );

  return gulp.src( PUBLIC_DIR + '/**/*' )
    .pipe( size( { showFiles : true } ) )
    .pipe( gulp.dest( PUBLIC_DIR ) );
});


/*******************************************************************************
 * this task will start connect server including livereload
 */
gulp.task( 'connect', function() {
  connect.server( {
    root       : 'public',
    livereload : true
  });
});


/*******************************************************************************
 * BUILD
 *
 * run all build related tasks with:
 *
 *  $ gulp build
 *
 */
gulp.task( 'build', function() {
  runSequence(
    [ 'scripts', 'styles', 'images' ],
    'template',
    'size'
  );
});


/*******************************************************************************
 * this task will kick off the watcher for JS, CSS, HTML files
 * for easy and instant development
 */
gulp.task( 'watch', function() {
  gulp.watch( PATHS.less, function() {
    runSequence( 'styles', 'template' );
  });

  // minify JS
  gulp.watch( PATHS.scripts, function() {
    runSequence( 'scripts', 'template' );
  });

  // check JS for JSHINT errors
  gulp.watch( PATHS.jshint, [ 'jshint' ] );

  // generate HTML
  gulp.watch( PATHS.template, function() {
    gulp.run( 'template' );
  });
});


/*******************************************************************************
 * DEV
 *
 * run all build related tasks, kick of server at 8080
 * and enable file watcher with:
 *
 * $ gulp dev
 *
 */
gulp.task( 'dev', [ 'build', 'connect', 'watch' ] );


/**
 * Default gulp task will run all landingpage task.
 * This is just a shorcut for $ gulp landingpage
 *
 *  $ gulp
 *
 */
gulp.task( 'default', [ 'build' ] );
