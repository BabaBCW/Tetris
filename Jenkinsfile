pipeline {
    agent any

    environment {
        DOCKER_HUB_USER       = 'shivankpateriya'
        IMAGE_NAME            = 'tetris-devsecops'
        IMAGE_TAG             = "${BUILD_NUMBER}"
        IMAGE_LATEST          = 'latest'
        FULL_IMAGE            = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '===  Checking out source code  ==='
                checkout scm
                sh 'echo "Branch: $GIT_BRANCH | Commit: $GIT_COMMIT"'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '===  Installing npm dependencies  ==='
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo '===  Running unit tests  ==='
                sh 'npm test'
            }
            post {
                always { echo 'Tests complete.' }
                failure { echo 'Tests FAILED — pipeline will not proceed to build.' }
            }
        }

        stage('Docker Build') {
            steps {
                echo "===  Building Docker image: ${FULL_IMAGE}:${IMAGE_TAG}  ==="
                sh """
                    docker build \\
                        --label "build.number=${BUILD_NUMBER}" \\
                        --label "git.commit=${GIT_COMMIT}" \\
                        --label "build.date=\$(date -u +%Y-%m-%dT%H:%M:%SZ)" \\
                        -t ${FULL_IMAGE}:${IMAGE_TAG} \\
                        -t ${FULL_IMAGE}:${IMAGE_LATEST} \\
                        .
                """
                sh "docker images ${FULL_IMAGE}"
            }
        }

        stage('Trivy Scan') {
            steps {
                echo '===  Running Trivy vulnerability scan  ==='
                sh """
                    if ! command -v trivy > /dev/null 2>&1; then
                        echo "Installing Trivy..."
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    fi

                    trivy --version

                    echo "=== LOW/MEDIUM vulnerabilities (informational) ==="
                    trivy image \\
                        --exit-code 0 \\
                        --severity LOW,MEDIUM \\
                        --scanners vuln \\
                        --format table \\
                        ${FULL_IMAGE}:${IMAGE_TAG}

                    trivy image \\
                        --exit-code 0 \\
                        --scanners vuln \\
                        --format json \\
                        --output trivy-report.json \\
                        ${FULL_IMAGE}:${IMAGE_TAG} || true

                    echo "=== HIGH/CRITICAL vulnerabilities (security gate) ==="
                    trivy image \\
                        --exit-code 1 \\
                        --severity HIGH,CRITICAL \\
                        --scanners vuln \\
                        --format table \\
                        ${FULL_IMAGE}:${IMAGE_TAG}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
                }
                success {
                    echo 'Trivy scan PASSED — no HIGH/CRITICAL vulnerabilities!'
                }
                failure {
                    echo 'HIGH/CRITICAL CVEs found — build blocked. Update the base image in Dockerfile.'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "===  Pushing ${FULL_IMAGE} to Docker Hub  ==="
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${FULL_IMAGE}:${IMAGE_TAG}
                        docker push ${FULL_IMAGE}:${IMAGE_LATEST}
                        docker logout
                    '''
                }
            }
            post {
                success {
                    echo "Pushed: ${FULL_IMAGE}:${IMAGE_TAG} and ${FULL_IMAGE}:${IMAGE_LATEST}"
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo '===  Removing local Docker images  ==='
                sh """
                    docker rmi ${FULL_IMAGE}:${IMAGE_TAG} || true
                    docker rmi ${FULL_IMAGE}:${IMAGE_LATEST} || true
                    docker image prune -f || true
                """
            }
        }
    }

    post {
        success {
            echo """
            =============================================
              BUILD SUCCESS
              Image : ${FULL_IMAGE}:${IMAGE_TAG}
              Branch: ${GIT_BRANCH}
              Commit: ${GIT_COMMIT}
            =============================================
            """
        }
        failure {
            echo """
            =============================================
              BUILD FAILED
              Branch: ${GIT_BRANCH}
              Commit: ${GIT_COMMIT}
            =============================================
            """
        }
        always {
            cleanWs()
        }
    }
}
