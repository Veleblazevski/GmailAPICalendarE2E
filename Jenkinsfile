pipeline {
  agent any

  environment {
    CI = 'true'
  }

  stages {
    stage('Prepare environment') {
      steps {
        withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
          bat 'copy "%ENV_FILE%" .env'
        }
      }
    }

    stage('Install dependencies') {
      steps {
        bat 'npm install'
      }
    }

    stage('Run WebdriverIO tests') {
      steps {
        script {
          def status = bat(script: 'npm run wdio > test-output.txt 2>&1', returnStatus: true)
          echo "WDIO exit code: ${status}"

          if (status != 0) {
            currentBuild.result = 'FAILURE'
          }
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
    success {
      script {
        try {
          def output = ''
          if (fileExists('test-output.txt')) {
            output = readFile(file: 'test-output.txt')
          }

          def passed = 0
          def failed = 0

          def passingLine = output.split('\n').find { it.contains('passing') }
          if (passingLine) {
            def passingMatches = (passingLine =~ /(\d+)\s+passing/)
            if (passingMatches) {
              passed = passingMatches[0][1].toInteger()
            }
          }

          def failingLine = output.split('\n').find { it.contains('failing') }
          if (failingLine) {
            def failingMatches = (failingLine =~ /(\d+)\s+failing/)
            if (failingMatches) {
              failed = failingMatches[0][1].toInteger()
            }
          }

          def message = "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}\\nPassed: ${passed}\\nFailed: ${failed}\\n${env.BUILD_URL}"

          withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            bat "curl.exe -X POST -H \"Content-type: application/json\" --data \"{\\\"text\\\":\\\"${message}\\\"}\" %SLACK_WEBHOOK%"
          }
        } catch (Exception e) {
          echo "Slack notification skipped or failed: ${e.getMessage()}"
        }
      }
    }
  }
}
