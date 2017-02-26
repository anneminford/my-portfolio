

var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var zip = require('gulp-zip');


// tasks

gulp.task('hello', function() {
  console.log('Hello Zell');
});

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('portfolio/app/pages/**/*.+(html|nunjucks)')
  // Adding data to Nunjucks
  .pipe(data(function() {
      return require('./portfolio/app/data.json')
  }))
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['portfolio/app/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('portfolio/app'))
});

gulp.task('sass', function() {
  return gulp.src('portfolio/app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass())
    .pipe(gulp.dest('portfolio/app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'portfolio/app'
    },
  })
})

// watch
gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function (){
  gulp.watch('portfolio/app/scss/**/*.scss', ['sass']); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('portfolio/app/*.html', browserSync.reload); 
  gulp.watch('portfolio/app/js/**/*.js', browserSync.reload); 
});

// minification and concatenation
gulp.task('useref', function(){
  return gulp.src('portfolio/app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('portfolio/dist'))
});

// optimise images
gulp.task('images', function(){
  return gulp.src('portfolio/app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('portfolio/dist/images'))
});

// move fonts to dist

gulp.task('fonts', function() {
  return gulp.src('portfolio/app/fonts/**/*')
  .pipe(gulp.dest('portfolio/dist/fonts'))
})

gulp.task('mail', function() {
  return gulp.src('portfolio/app/mail/**/*')
  .pipe(gulp.dest('portfolio/dist/mail'))
})

// Since we're generating files automatically, we'll want to make sure that files that are no longer used don't remain anywhere without us knowing.

// This process is called cleaning (or in simpler terms, deleting files).

// We'll have to use del to help us with cleaning.

gulp.task('clean:dist', function() {
  return del.sync('portfolio/dist');
})

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['nunjucks','sass', 'useref', 'images', 'fonts', 'mail'],
    callback
  )
})

gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
})

