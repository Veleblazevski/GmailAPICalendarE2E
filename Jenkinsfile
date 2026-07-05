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
      script {
        try {
          withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            slackSend channel: '#builds',
                      color: 'good',
                      message: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                      token: env.SLACK_WEBHOOK
          }
        } catch (Exception e) {
          echo "Slack notification failed: ${e.getMessage()}"
        }
      }
    }
    failure {
      script {
        try {
          withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
            slackSend channel: '#builds',
                      color: 'danger',
                      message: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                      token: env.SLACK_WEBHOOK
          }
        } catch (Exception e) {
          echo "Slack notification failed: ${e.getMessage()}"
        }
      }
    }
  }
}
