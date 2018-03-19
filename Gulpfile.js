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
    return gulp.src('node_modules/AdminLTE/dist/**/.css')
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
        .pipe(gulp.dest('admin_panel/static/js/adminApp'));
});

gulp.task('admin-scripts', ['admin-templates', 'admin-clean'], function () {
    return gulp.src([
            'admin_panel/static/js/adminApp/**/*.js',
        ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('app.built.js'))
        .pipe(gulp.dest('admin_panel/static/js/adminApp'));
});

gulp.task('collect-static', ['admin'], function (cb) {
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

gulp.task('admin-no-pre', [], function () {
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

gulp.task('admin', ['admin-clean',
    'admin-sass',
    'admin-scripts', 'admin-templates'
]);

gulp.task('default', ['admin']);