'use strict';

let isProd = false;
const gulp = require('gulp');
const bump = require('gulp-bump');
const del = require('del');
const license = require('gulp-license');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const zip = require('gulp-zip');
const ts = require('gulp-typescript');

const stylesSourcePath = './src/contentScript.scss';
const scriptsSourcePath = './src/*.ts';
const manifestPath = './src/manifest.json';
const assetsPath = './src/assets/**/*';

const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
  return gulp
    .src(scriptsSourcePath)
    .pipe(tsProject())
    .pipe(license('MIT', {
      organization: 'Benoit Quenaudon',
      tiny: true
    })).pipe(gulp.dest('./target'));
});

gulp.task('clean', (done) => {
  return del(['./target'], done);
});

gulp.task('styles', () => {
  return gulp
    .src(stylesSourcePath)
    .pipe(sass({
      outputStyle: isProd ? 'compressed' : 'expanded'
    }).on('error', sass.logError))
    .pipe(license('MIT', {
      organization: 'Benoit Quenaudon',
      tiny: true
    }))
    .pipe(gulp.dest('./target'));
});

gulp.task('watch', function () {
  gulp.watch(stylesSourcePath, function () {
    return runSequence('styles');
  });
  gulp.watch(scriptsSourcePath, function () {
    return runSequence('scripts');
  });
  gulp.watch(manifestPath, function () {
    return runSequence('manifest');
  });
  gulp.watch(assetsPath, function () {
    return runSequence('assets');
  });
});

gulp.task('assets', () => {
  gulp.src(assetsPath)
    .pipe(gulp.dest('./target/assets'));
});

gulp.task('manifest', () => {
  return gulp
    .src(manifestPath)
    .pipe(gulp.dest('./target'));
});

var allTasks = ['styles', 'scripts', 'manifest', 'assets'];

gulp.task('build', allTasks, () => {
  gulp.src('./target/**')
    .pipe(zip('target.zip'))
    .pipe(gulp.dest('./target'));
});

gulp.task('bump', () => {
  gulp
    .src('./package.json')
    .pipe(bump({
      type: 'patch'
    }))
    .pipe(gulp.dest('./'));

  return gulp
    .src('./src/manifest.json')
    .pipe(bump({
      type: 'patch'
    }))
    .pipe(gulp.dest('./src'));
});

gulp.task('default', cb => {
  return runSequence('clean', allTasks, 'watch', cb);
});

gulp.task('prod', cb => {
  isProd = true;
  return runSequence('clean', 'bump', 'build', cb);
});
