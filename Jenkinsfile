pipeline {
  agent { label 'playwright-runner' }   // agent

  environment {
    BASE_URL = 'https://staging.example.com' // variable environment
  }

  triggers {
    githubPush()   // aktif kalau job dikonfigurasi lewat GitHub webhook
  }

  /* For Linux Agent
  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', 
        url: 'https://github.com/org/playwright-tests.git',
        credentialsId: 'github-testingpwmcp' // sesuaikan dengan yang di jenkins
      }
    }
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }
    stage('Run AI tests') {
      steps {
        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
          withEnv(["PLAYWRIGHT_JUNIT_OUTPUT_NAME=results/junit-ai.xml"]) {
            sh 'npx playwright test --project=AI'
          }
        }
      }
    }

  }
  */

  /* For Windows Agent */
  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/firmansyahwp/testingpwmcp.git',
            credentialsId: 'github-testingpwmcp'
      }
    }
 
    stage('Install dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx playwright install --with-deps'
      }
    }
 
    stage('Run AI tests') {
      steps {
        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
          withEnv(["PLAYWRIGHT_JUNIT_OUTPUT_NAME=results/junit-ai.xml"]) {
            bat 'npx playwright test --project=AI'
          }
        }
      }
    }

  }  

  post {
    always {
      // Glob pattern ini membaca semua file junit-*.xml dari tiap stage.
      // Dibaca oleh Application Automation Tools plugin (Octane CI integration)
      // sebagai automated test run. Tidak perlu step publish terpisah ke Octane
      // selama pipeline job ini sudah terdaftar di Octane (DevOps > Pipelines).
      junit 'results/junit-*.xml'

      archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
    }
  }
}
