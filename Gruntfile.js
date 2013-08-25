var moment = require('moment');
var wintersmith = require('wintersmith');

module.exports = function (grunt) {

    var version = function() {
        return grunt.file.readJSON('package.json').version || '1.0.0';
    };

    var now = moment().format('HH-mm-ss-DD-MM-YYYY');

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-sftp-deploy');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-bump');

    grunt.initConfig({
        deploy: grunt.file.readJSON('deploy/settings.json'),

        sshAuth: {
            host: '<%= deploy.host %>',
            username: '<%= deploy.username %>',
            privateKey: grunt.file.read('deploy/key.pem')
        },

        clean: {
            build: [
                'public/*',
                'deploy/*.zip'
            ]
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: false,
                push: false,
                createTag: false
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'deploy/<%= deploy.host %>-' + version() + '.zip'
                },
                files: [
                    { expand: true, cwd: './public', src: ['**'] }
                ]
            }
        },

        'sftp-deploy': {
            main: {
                auth: {
                    host: '<%= deploy.host %>',
                    authKey: 'main'
                },
                src: 'deploy',
                dest: '/tmp',
                exclusions: ['deploy/*.json', 'deploy/*.pem'],
                server_sep: '/'
            }
        },

        sshexec: {
            backup: {
                command: 'mkdir -p <%= deploy.root %>/backups/' + now +
                         ' && cp -r <%= deploy.root %>/public <%= deploy.root %>/backups/' + now,
                options: '<%= sshAuth %>'
            },
            clean: {
                command: 'rm -r <%= deploy.root %>/public',
                options: '<%= sshAuth %>'
            },
            unzip: {
                command: 'unzip /tmp/<%= deploy.host %>-' + version() + '.zip -d <%= deploy.root %>/public',
                options: '<%= sshAuth %>'
            }
        }
    });

    grunt.registerTask('wintersmith-build', function() {
        var env = wintersmith('config.json');
        var done = this.async();

        env.build(function(error) {
            if (error) throw error;
            done();
        });
    });

    grunt.registerTask('deploy', ['wintersmith-build', 'compress', 'sftp-deploy', 'sshexec', 'clean', 'bump']);    
};