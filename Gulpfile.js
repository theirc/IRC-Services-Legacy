var gulp = require('gulp'),
    rename = require('gulp-rename'),
    del = require('del'),
    templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    exec = require('child_process').exec,
    sequence = require('gulp-sequence'),
    babel = require('gulp-babel');


gulp.task('spp-clean', function () {
    return del([
        'provider_portal/static/js/sppApp/app.built.js',
        'provider_portal/static/js/sppApp/templates.js'
    ]);
});

gulp.task('spp-scripts', ['spp-clean', 'spp-templates'], function () {
    return gulp.src('provider_portal/static/js/sppApp/**/*.js')
        .pipe(concat('app.built.js'))
        .pipe(gulp.dest('provider_portal/static/js/sppApp'));
});

gulp.task('spp-templates', ['spp-clean'], function () {
    return gulp.src('provider_portal/templates/angular/**/*.html')
        .pipe(templateCache({
            module: 'sppApp'
        }))
        .pipe(gulp.dest('provider_portal/static/js/sppApp'))
        ;
});

gulp.task('cms-clean', function () {
    return del([
        'cms/static/css/**/*.css',
        'cms/static/js/cmsApp/app.built.js',
        'cms/static/js/cmsApp/templates.js'
    ]);
});

gulp.task('cms-scripts', ['cms-clean', 'cms-templates'], function () {
    return gulp.src('cms/static/js/cmsApp/**/*.js')
        .pipe(concat('app.built.js'))
        .pipe(gulp.dest('cms/static/js/cmsApp'));
});

gulp.task('cms-templates', ['cms-clean'], function () {
    return gulp.src('cms/templates/angular/**/*.html')
        .pipe(templateCache({
            module: 'adminApp'
        }))
        .pipe(gulp.dest('cms/static/js/cmsApp'))
        ;
});

gulp.task('cms-sass', ['cms-clean'], function () {
    return gulp.src(['cms/static/css/**/*.scss', '!cms/static/css/mixins.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('cms/static/css/'));
});

gulp.task('admin-clean', function () {
    return del([
        'admin_panel/static/js/adminApp/app.built.js',
        //'admin_panel/static/adminApp/templates.css',
        //'admin_panel/static/less/build/**/*.*',
        //'admin_panel/static/less/admin.css'
        //'cms/static/css/**/*.css',
        //'cms/static/js/cmsApp/app.built.js',
        //'cms/static/js/cmsApp/templates.js'
    ]);
});


gulp.task('admin-sass', ['admin-clean'], function () {
    return gulp.src(['admin_panel/static/css/**/*.scss', '!cms/static/css/mixins.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('admin_panel/static/css/'));
});

gulp.task('admin-copy-less', ['admin-clean'], function () {
    return gulp.src('bower_components/AdminLTE/dist/**/.css')
        .pipe(gulp.dest('admin_panel/static/less/build'));
});


gulp.task('admin-copy-variables', ['admin-copy-less'], function () {
    return gulp.src(['admin_panel/static/less/variables.less']) //, 'admin_panel/static/less/core.less'])
        .pipe(gulp.dest('admin_panel/static/less/build/less'));
});
gulp.task('admin-less-compile', ['admin-copy-variables'], function () {
    return gulp.src([
        'admin_panel/static/less/build/less/AdminLTE.less',
        'admin_panel/static/less/build/less/skins/_all-skins.less',
        'admin_panel/static/less/content.less',
        'admin_panel/static/less/overrides.less'

    ])
    .pipe(less())
    .pipe(concat('admin.css'))
    .pipe(gulp.dest('admin_panel/static/less/'));
});


gulp.task('admin-templates', ['admin-clean'], function () {
    return gulp.src('admin_panel/templates/angular/**/*.html')
        .pipe(templateCache({
            module: 'adminApp'
        }))
        .pipe(gulp.dest('admin_panel/static/js/adminApp'))
        ;
});

gulp.task('admin-scripts', ['admin-templates', 'admin-clean', 'cms-clean', 'cms-templates'], function () {
    return gulp.src([
        'admin_panel/static/js/adminApp/**/*.js',
        'cms/static/js/cmsApp/**/*.js',
        '!cms/static/js/cmsApp/app.build.js',
        '!cms/static/js/cmsApp/app.js',

        'cms/static/js/cmsApp/templates.js'
    ])
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(concat('app.built.js'))
    .pipe(gulp.dest('admin_panel/static/js/adminApp'));
});

gulp.task('collect-static', ['cms-scripts', 'spp-scripts', 'admin-scripts'], function (cb) {
    var python = process.env.PYTHON_EXECUTABLE || 'python';
    exec(python + ' manage.py collectstatic --noinput', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb();
    });
});

gulp.task('watch', function () {
    return gulp.watch(['admin_panel/**/*.js', 'admin_panel/**/*.html'], ['collect-static']);
});

gulp.task('admin-no-pre', [], function() {
 return gulp.src([
        'admin_panel/static/js/adminApp/**/*.js',
        'cms/static/js/cmsApp/**/*.js',
        '!cms/static/js/cmsApp/app.build.js',
        '!cms/static/js/cmsApp/app.js',

        'cms/static/js/cmsApp/templates.js'
    ])
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(concat('app.built.js'))
    .pipe(gulp.dest('admin_panel/static/js/adminApp'));
});

gulp.task('cms', ['cms-clean', 'cms-scripts', 'cms-templates', 'cms-sass']);
gulp.task('spp', ['spp-clean', 'spp-scripts', 'spp-templates']);
gulp.task('admin', ['admin-clean', 
//'admin-sass',
// 'admin-less-compile',
 'admin-scripts', 'admin-templates']);

//gulp.task('clean', ['cms-clean', 'spp-clean', 'admin-clean']);
gulp.task('default', ['admin']);

