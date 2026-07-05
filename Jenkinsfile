pipeline {
  agent any

  environment {
    CI = 'true'
    ORGANIZER_CLIENT_ID = credentials('ORGANIZER_CLIENT_ID')
    ORGANIZER_CLIENT_SECRET = credentials('ORGANIZER_CLIENT_SECRET')
    ORGANIZER_REFRESH_TOKEN = credentials('ORGANIZER_REFRESH_TOKEN')
    ORGANIZER_ACCESS_TOKEN = credentials('ORGANIZER_ACCESS_TOKEN')
    ORGANIZER_EXPIRY_DATE = credentials('ORGANIZER_EXPIRY_DATE')
    ATTENDEE_CLIENT_ID = credentials('ATTENDEE_CLIENT_ID')
    ATTENDEE_CLIENT_SECRET = credentials('ATTENDEE_CLIENT_SECRET')
    ATTENDEE_REFRESH_TOKEN = credentials('ATTENDEE_REFRESH_TOKEN')
    ATTENDEE_ACCESS_TOKEN = credentials('ATTENDEE_ACCESS_TOKEN')
    ATTENDEE_EXPIRY_DATE = credentials('ATTENDEE_EXPIRY_DATE')
  }

  stages {
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
      echo 'Build succeeded.'
    }
    failure {
      echo 'Build failed.'
    }
  }
}
