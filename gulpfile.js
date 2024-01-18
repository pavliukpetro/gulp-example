const { src, dest, watch, parallel, series } = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint-new');
const browserSync = require('browser-sync').create();
const gulpCopy = require('gulp-copy');

const PATH = {
    html: {
        src: 'src/*.html',
        dist: 'dist'
    },
    scss: {
        src: 'src/scss/**/*.scss',
        dist: 'dist/css'
    },
    js: {
        src: 'src/js/*.js',
        dist: 'dist/js'
    },
    assets: {
        src: 'src/assets/**/*.*',
        dist: 'dist/assets'
    }
}

function defaulTask() {
    // do with files
}

// HTML Task
function htmlTask() {
    return src(PATH.html.src)
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(dest(PATH.html.dist));
}

// Styles Task
function stylesTask() {
    return src('src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/css'));
}

// JS Task
function jsTask() {
    return src('src/js/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/js'));
}

// Eslint Task
function eslintTask() {
    return src('src/js/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
}

// Copy Task
function copyTask() {
    return src(PATH.assets.src)
        .pipe(dest(PATH.assets.dist));
}

function browserSyncServer(cb) {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });
    cb();
}

function browserSyncReload(cb) {
    browserSync.reload();
    cb();
}

// Watch Task
function watchTask() {
    watch(PATH.html.src, series(htmlTask, browserSyncReload));
    watch(PATH.scss.src, series(stylesTask, browserSyncReload));
    watch(PATH.js.src, series(jsTask, browserSyncReload));
    watch(PATH.assets.src, series(copyTask, browserSyncReload));
}

exports.htmlTask = htmlTask;
exports.stylesTask = stylesTask;
exports.jsTask = jsTask;
exports.eslintTask = eslintTask;
exports.browserSyncServer = browserSyncServer;
exports.copyTask = copyTask;
exports.watchTask = watchTask;

exports.default = parallel(
    htmlTask,
    stylesTask,
    jsTask,
    copyTask,
    browserSyncServer,
    watchTask
);
