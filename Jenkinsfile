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
        bat 'npm run wdio'
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
    success {
      withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
        slackSend channel: '#builds',
                  color: 'good',
                  message: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                  token: env.SLACK_WEBHOOK
      }
    }
    failure {
      withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
        slackSend channel: '#builds',
                  color: 'danger',
                  message: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                  token: env.SLACK_WEBHOOK
      }
    }
  }
}
