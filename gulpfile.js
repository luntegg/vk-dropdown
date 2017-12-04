const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const concat = require("gulp-concat");

const paths = {
    assetsScripts: 'assets/scripts/src/**/*.js',
    assetsStyles: 'assets/styles/scss/**/*.scss',
    demoScripts: 'demo/build/js/**/*.js',
    demoStyles: 'demo/build/scss/**/*.scss'
};

const buildPaths = {
    assetsScripts: 'assets/scripts/dist/',
    assetsStyles: 'assets/styles/css/',
    demoScripts: 'demo/assets/js/',
    demoStyles: 'demo/assets/css/'
};

gulp.task('assets-scripts', function () {
    const fetch = './node_modules/whatwg-fetch/fetch.js';
    const polyfill = './node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.js';
    // const promise = './node_modules/es6-promise/dist/es6-promise.min.js';
    // const promiseAuto = './node_modules/es6-promise/dist/es6-promise.auto.min.js';

    return gulp.src([paths.assetsScripts, fetch, polyfill])
        .pipe(sourcemaps.init())
        .pipe(babel({
            plugins: [
                'transform-object-assign'
            ]
        }))
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(concat('vk-dropdown.min.js'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(buildPaths.assetsScripts));
});

gulp.task('assets-styles', function () {
    return gulp.src(paths.assetsStyles)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                'ie >= 10',
                'opera >= 12'
            ],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie10'
        }))
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(buildPaths.assetsStyles));
});

gulp.task('demo-scripts', function () {
    return gulp.src(paths.demoScripts)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(rename({suffix: ".min"}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(buildPaths.demoScripts));
});

gulp.task('demo-styles', function () {
    return gulp.src(paths.demoStyles)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                'ie >= 10',
                'opera >= 12'
            ],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie10'
        }))
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest(buildPaths.demoStyles));
});

gulp.task('watch', function() {
    gulp.watch(paths.assetsScripts, ['assets-scripts']);
    gulp.watch(paths.assetsStyles, ['assets-styles']);
    gulp.watch(paths.demoScripts, ['demo-scripts']);
    gulp.watch(paths.demoStyles, ['demo-styles']);
});

gulp.task('default', ['assets-scripts', 'assets-styles', 'demo-scripts', 'demo-styles']);