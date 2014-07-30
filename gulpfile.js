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
    clean       = require( 'gulp-clean' ),
    concat      = require( 'gulp-concat' ),
    uglify      = require( 'gulp-uglify' ),
    minifyHTML  = require( 'gulp-minify-html' ),
    minifyCSS   = require( 'gulp-minify-css' ),
    imagemin    = require( 'gulp-imagemin' ),
    rev         = require( 'gulp-rev' ),
    runSequence = require( 'run-sequence' ),
    template    = require( 'gulp-template' ),
    stripDebug  = require( 'gulp-strip-debug' ),
    watch       = require( 'gulp-watch' ),
    livereload  = require( 'gulp-livereload' ),

    // put all your source files into this folder:
    ASSETS_DIR = './assets/',
    // we will serve the optimized files from this folder:
    PUBLIC_DIR = './public/',

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
gulp.task( 'styles', function () {
  // trigger task to cleanup old generated style/css files
  gulp.run( 'clean-styles' );

  return gulp.src( ASSETS_DIR + 'styles/main.less' )
    .pipe( less() )
    .pipe( minifyCSS() )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'styles/' ) )
    .pipe( gutil.buffer( function ( err, files ) {
      stylesHash = files.map( function ( file ) {
        return file.path.replace( file.base, '' );
      }).join( '' );
    }));

});


gulp.task( 'clean-styles' , function () {
  // delete old generated stlye/css files
  gulp.src( PUBLIC_DIR + 'styles/' )
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
gulp.task( 'scripts' , function () {
  gulp.run( 'clean-scripts' );

  return gulp.src( ASSETS_DIR + 'scripts/**.js' )
    .pipe( concat( 'main.js' ) )
    /**
     * uncomment the next line, if you want to strip out
     * console, alert, and debugger statements
     */
    //.pipe( stripDebug() )
    .pipe( uglify( {outSourceMaps: true} ) )
    .pipe( rev() )
    .pipe( gulp.dest( PUBLIC_DIR + 'scripts/' ) )
    .pipe( gutil.buffer( function ( err, files ) {
      scriptsHash = files.map( function ( file ) {
        return file.path.replace( file.base, '' );
      }).join( '' );
    }));

});


gulp.task( 'clean-scripts' , function () {
  // delete old generated script files
  gulp.src( PUBLIC_DIR + 'scripts/' )
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
  var opts = {comments:false,spare:false};

  gulp.src( 'templates/**/*.html' )
    .pipe( template( {
      styles  : 'styles/' + stylesHash,
      scripts : 'scripts/' + scriptsHash
    }
    ) )
    .pipe( minifyHTML( opts ) )
    .pipe( gulp.dest( PUBLIC_DIR ) )
    .pipe( livereload() );
});


/*******************************************************************************
 * IMAGE TASK
 *
 * this task is responsible for image optimization
 *  - it will optimize all images in the assets folder and move them to
 *    the public folder
 */
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
gulp.task( 'landingpage', function() {
  runSequence( [ 'scripts', 'styles', 'images' ], 'template' );

  gulp.watch( ASSETS_DIR + 'styles/**/*.less', function() {
    runSequence( 'styles', 'template' );
  });

  gulp.watch( ASSETS_DIR + 'scripts/**/*.js', function() {
    runSequence( 'scripts', 'template' );
  });

  gulp.watch( 'templates/**/*.html', function() {
    gulp.run( 'template' );
  });
});


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
