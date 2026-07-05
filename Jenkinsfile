import groovy.json.JsonOutput

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
          bat 'npm run wdio > test-output.txt 2>&1'
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
          if (output.contains('passing')) {
            def passingIndex = output.indexOf('passing')
            def passingPart = output.substring(0, passingIndex)
            def passingNumber = (passingPart =~ /\d+/)
            if (passingNumber) {
              passed = passingNumber[0].toInteger()
            }
          }
          if (output.contains('failing')) {
            def failingIndex = output.indexOf('failing')
            def failingPart = output.substring(0, failingIndex)
            def failingNumber = (failingPart =~ /\d+/)
            if (failingNumber) {
              failed = failingNumber[0].toInteger()
            }
          }
          def summary = "Tests: ${passed} passed, ${failed} failed"
          def payload = JsonOutput.toJson([text: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${summary}"])

          withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            bat "curl.exe -X POST -H \"Content-type: application/json\" --data \"${payload}\" %SLACK_WEBHOOK%"
          }
        } catch (Exception e) {
          echo "Slack notification skipped or failed: ${e.getMessage()}"
        }
      }
    }
    failure {
      script {
        try {
          def output = ''
          if (fileExists('test-output.txt')) {
            output = readFile(file: 'test-output.txt')
          }

          def passed = 0
          def failed = 0
          if (output.contains('passing')) {
            def passingIndex = output.indexOf('passing')
            def passingPart = output.substring(0, passingIndex)
            def passingNumber = (passingPart =~ /\d+/)
            if (passingNumber) {
              passed = passingNumber[0].toInteger()
            }
          }
          if (output.contains('failing')) {
            def failingIndex = output.indexOf('failing')
            def failingPart = output.substring(0, failingIndex)
            def failingNumber = (failingPart =~ /\d+/)
            if (failingNumber) {
              failed = failingNumber[0].toInteger()
            }
          }
          def summary = "Tests: ${passed} passed, ${failed} failed"
          def payload = JsonOutput.toJson([text: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${summary}"])

          withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            bat "curl.exe -X POST -H \"Content-type: application/json\" --data \"${payload}\" %SLACK_WEBHOOK%"
          }
        } catch (Exception e) {
          echo "Slack notification skipped or failed: ${e.getMessage()}"
        }
      }
    }
  }
}
