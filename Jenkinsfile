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
          def payload = JsonOutput.toJson([
            text: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            blocks: [
              [
                type: "section",
                text: [
                  type: "mrkdwn",
                  text: "Build SUCCESS: *${env.JOB_NAME}* #${env.BUILD_NUMBER}"
                ]
              ],
              [
                type: "actions",
                elements: [
                  [
                    type: "button",
                    text: [
                      type: "plain_text",
                      text: "Open Jenkins build"
                    ],
                    url: "${env.BUILD_URL}"
                  ]
                ]
              ]
            ]
          ])

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
