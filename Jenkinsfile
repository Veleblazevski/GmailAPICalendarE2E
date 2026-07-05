import groovy.json.JsonOutput

def sendSlackNotification = { String executionStatus ->
  try {
    def output = ''
    if (fileExists('test-output.txt')) {
      output = readFile(file: 'test-output.txt')
    }

    def passed = 0
    def failed = 0

    def passingLine = output.split('\n').find { it.contains('passing') }
    if (passingLine) {
      def passingNumber = (passingLine =~ /\d+/)
      if (passingNumber) {
        passed = passingNumber[0].toInteger()
      }
    }

    def failingLine = output.split('\n').find { it.contains('failing') }
    if (failingLine) {
      def failingNumber = (failingLine =~ /\d+/)
      if (failingNumber) {
        failed = failingNumber[0].toInteger()
      }
    }

    def total = passed + failed
    def passRate = total > 0 ? ((passed * 100) / total).intValue() : 100
    def branchName = (env.GIT_BRANCH ?: 'unknown').replaceFirst(/^origin\//, '')
    def message = "Hello your test results came in...\\nTEST ENV\\nJenkins build: ${env.JOB_NAME} #${env.BUILD_NUMBER}\\nBranch: ${branchName}\\n\\nTEST STATISTICS\\nTest pass rate: ${passRate}%\\nPassed: ${passed}\\nFailed: ${failed}\\nUnknown: 0\\nSkipped: 0\\n\\nSTEP STATISTICS\\nStep pass rate: ${passRate}%\\nPassed: ${passed}\\nFailed: ${failed}\\nSkipped: 0\\n\\nExecution: ${executionStatus}\\n\\nJenkins job link: ${env.BUILD_URL}\\nCucumber report link: ${env.BUILD_URL}artifact/cucumber-summary.html"

    def payload = JsonOutput.toJson([text: message])
    writeFile file: 'slack-payload.json', text: payload

    withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
      bat 'curl.exe -X POST -H "Content-type: application/json" --data @slack-payload.json "%SLACK_WEBHOOK%"'
    }
  } catch (Exception e) {
    echo "Slack notification skipped or failed: ${e.getMessage()}"
  }
}

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

          def output = ''
          if (fileExists('test-output.txt')) {
            output = readFile(file: 'test-output.txt')
          }

          def passed = 0
          def failed = 0

          def passingLine = output.split('\n').find { it.contains('passing') }
          if (passingLine) {
            def passingNumber = (passingLine =~ /\d+/)
            if (passingNumber) {
              passed = passingNumber[0].toInteger()
            }
          }

          def failingLine = output.split('\n').find { it.contains('failing') }
          if (failingLine) {
            def failingNumber = (failingLine =~ /\d+/)
            if (failingNumber) {
              failed = failingNumber[0].toInteger()
            }
          }

          def total = passed + failed
          def passRate = total > 0 ? ((passed * 100) / total).intValue() : 100
          def branchName = (env.GIT_BRANCH ?: 'unknown').replaceFirst(/^origin\//, '')
          def executionStatus = currentBuild.currentResult == 'SUCCESS' ? 'passed' : 'failed'

          def html = """
          <html>
            <body style="font-family:Arial,sans-serif; padding:16px;">
              <h2>Cucumber Test Summary</h2>
              <p><strong>Build:</strong> ${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
              <p><strong>Branch:</strong> ${branchName}</p>
              <p><strong>Execution:</strong> ${executionStatus}</p>
              <p><strong>Passed:</strong> ${passed}</p>
              <p><strong>Failed:</strong> ${failed}</p>
              <p><strong>Pass rate:</strong> ${passRate}%</p>
            </body>
          </html>
          """

          writeFile file: 'cucumber-summary.html', text: html
          archiveArtifacts artifacts: 'cucumber-summary.html,test-output.txt', allowEmptyArchive: true
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
        sendSlackNotification('passed')
      }
    }
    failure {
      script {
        sendSlackNotification('failed')
      }
    }
  }
}
