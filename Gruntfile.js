module.exports=function(grunt){

    require('time-grunt')(grunt);
    
    grunt.initConfig({
        paths:{
            assets:'./assets',
            scss:'./css/sass/',
            css:'./css/', 
            js:'./js',
            jade:'./jade',
            model:'./model',
            img:'./img'
        },
        buildType:'Build',

        pkg: grunt.file.readJSON('package.json'),
        //ur name
        archive_name: grunt.option('name') || 'ugly',
        
        clean: {
            pre: ['dist/', 'build/'],//del before build 
            post: ['<%= archive_name %>*.zip'] //del zip
        },

        uglify:{
            options:{
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' //js文件打上时间戳
            },
            dist: {
                 files: {
                     '<%= paths.assets %>/js/min.v.js': '<%= paths.js %>/base.js'
                 }
            }
        },

        compress:{
            main:{
                options:{
                    archive:'<%= archive_name %>-<%= grunt.template.today("yyyy") %>年<%= grunt.template.today("mm") %>月<%= grunt.template.today("dd") %>日<%= grunt.template.today("h") %>时<%= grunt.template.today("TT") %>.zip'
                },
                expand:true,
                cwd:'build/',
                src:['**/*'],
                dest:''
            }
        },

        copy:{
            main:{
                files:[
                    {expand: true, src: ['assets/css/**'], dest: 'build/'},
                    {expand: true, src: ['assets/images/**'], dest: 'build/'},
                    {expand: true, src: ['html/**'], dest: 'build/'},
                    {expand: true, src: ['assets/js/**'], dest: 'build/'},
                    //copy what to build only /html/ and /assets/ is enough
                    // {expand: true, src: ['*', '!.gitignore', '!.DS_Store','!Gruntfile.js','!package.json','!node_modules/**','!go.sh','!.ftppass','!<%= archive_name %>*.zip'], dest: 'build/'},
                ]
            },

            images:{
                        expand: true,
                        cwd:'img/',
                        src: ['**','!github.png'],
                        dest: 'assets/images/',
                        flatten:true,
                        filter:'isFile',
            },


            archive:{
                files:[
                        {expand: true, src: ['<%= archive_name %>.zip'], dest: 'dist/'}
                ]
            }
        },
        sass: {
            dist: {
                files: {
                    '<%= paths.css %>style.css': '<%= paths.scss %>style.scss'
                    // '<%= paths.assets %>/css/min.style.css': '<%= paths.scss %>style.scss'
                    //att
                },
                options: {
                    sourcemap: 'true',
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                }
            }
        },
        cssmin:{
            options:{
                  keepSpecialComments: 0
              },
              compress:{
                    files:{
                     '<%= paths.assets %>/css/min.style.css': [
                     '<%= paths.css %>/style.css'
                 ]
                 }
              }
        },
        htmlmin: {
            dist: {
                options: {
                removeComments: true,
                //collapseWhitespace: true //mini html:true or false
            },

            files: {
                'build/index.html': 'build/index.html',//del html //
                }
            }
        },
        //uncss
        uncss: {
          dist: {
          files: {
            'html/tidy.css': ['html/indexx.html']
            }
            }
        },
        // connect
        connect:{
            server:{
                options:{
                    port:5177,
                    //base:'html/', //use "html"
                    base:'./',
                    hostname:'*' //default,localhost
                }
            }
        },
        //jade temp
        jade: {
          compile: {
            options: {
              data: true
            },
            // files: {
            //     "<%= paths.jade %>": "<%= paths.jade %>/*.jade"
            // }
            files: [{
              expand: true,
              cwd: 'jade/',
              // src: [ '<%= paths.jade %>/*.jade' ],
              src: [ '**/*.jade' ],
              // dest: '<%= paths.jade %>/',
              dest:'html/', //output 
              ext: '.html'
            }]
          }
        },
        //combine html file
        concat:{
            dist: {
              // src: ['html/header.html', 'html/demo.html', 'html/footer.html'],
              // dest: 'demo.html'
              files: {
                'html/ytxl.html': ['model/header.html', 'model/ytxl.html', 'model/footer.html'],
                // 'html/test.html': ['model/header.html', 'model/test.html', 'model/footer.html'],
                'html/indexx.html': ['model/header.html', 'model/index.html', 'model/footer.html'],
                'html/ddtx.html': ['model/header.html', 'model/ddtx.html', 'model/footer.html'],
                'html/about.html': ['model/header.html', 'model/about.html', 'model/footer.html'],
                'html/news.html': ['model/header.html', 'model/news.html', 'model/footer.html'],
              },
            }
        },

        watch:{
            options:{
                //开启 livereload
                livereload:true,
                //显示日志
                dateFormate:function(time){
                    grunt.log.writeln('编译完成,用时'+time+'ms ' + (new Date()).toString());
                    grunt.log.writeln('Wating for more changes...');
                }
            },
            //css
            sass:{
                files:'<%= paths.scss %>/**/*.scss',
                tasks:['sass','cssmin']
                // tasks:['sass']
            },
            css:{
                files:'<%= paths.css %>/**/*.css',
                tasks:['cssmin']
            },
            js:{
                 files:'<%= paths.js %>/**/*.js',
                 tasks:['uglify']
            },
            concat:{
                 files:'<%= paths.model %>/**/*.html',
                 tasks:['concat']
            },
            // jade: {
            //     files: '<%= paths.jade %>/**/*.jade',
            //     tasks: [ 'jade' ]
            //   },
            //若不使用Sass，可通过grunt watch:base 只监测style.css和js文件
            base:{
                files:['<%= paths.css %>/**/*.css','<%= paths.js %>/**/*.js','img/**'],
                tasks:['cssmin','uglify','copy:images']
            }

        },

        //ftp
        'ftp-deploy': {
          build: {
            auth: {
              host: 'yourftp.domain.com',
              port: 21,
              authKey: 'key1'
            },
            src: 'build',
            dest: '/home/ftp/demo',
            exclusions: ['path/to/source/folder/**/.DS_Store', 'path/to/source/folder/**/Thumbs.db', 'path/to/dist/tmp']
          }
        }

    });

    //output log
    grunt.event.on('watch', function(action, filepath, target) {
      grunt.log.writeln(target + ': ' + '*file*: '+filepath + '*staus*: ' + action);
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-uncss');

    grunt.registerTask('default', ['cssmin','uglify','htmlmin','copy:images','jade']);
    grunt.registerTask('wocao', ['sass','cssmin']);
    // grunt.registerTask('live', ['connect:server']);
    grunt.registerTask('bundle', ['clean:pre','copy:images', 'copy:main','cssmin','copy:archive', 'clean:post','htmlmin','compress',]);
    grunt.registerTask('publish', ['ftp-deploy']);

    grunt.registerTask('j8', ['jade']);
    grunt.registerTask('un', ['uncss']);

    grunt.registerTask('live', 'Start a custom static web server.',['connect','watch']);

};
