pipeline {
    agent any

    environment {
        // ── Change these to match your Docker Hub username ──
        DOCKER_HUB_USER  = 'shivankpateriya'
        IMAGE_NAME       = 'tetris-devsecops'
        IMAGE_TAG        = "${BUILD_NUMBER}"          // e.g. :42
        IMAGE_LATEST     = 'latest'
        FULL_IMAGE       = "${DOCKER_HUB_USER}/${IMAGE_NAME}"

        // Jenkins credential IDs (configure these in Jenkins → Credentials)
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    }

    options {
        // Keep last 5 builds to save disk space
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Fail the build if it runs longer than 20 minutes
        timeout(time: 20, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
    }

    stages {

        // ── Stage 1: Checkout ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '===  Checking out source code  ==='
                checkout scm
                sh 'echo "Branch: $GIT_BRANCH | Commit: $GIT_COMMIT"'
            }
        }

        // ── Stage 2: Install Dependencies ────────────────────────────────
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

        // ── Stage 3: Run Tests ────────────────────────────────────────────
        stage('Run Tests') {
            steps {
                echo '===  Running unit tests  ==='
                sh 'npm test'
            }
            post {
                always {
                    // Archive test results if using JUnit reporter
                    // junit 'test-results/**/*.xml'
                    echo 'Tests complete.'
                }
                failure {
                    echo 'Tests FAILED — pipeline will not proceed to build.'
                }
            }
        }

        // ── Stage 4: Docker Build ─────────────────────────────────────────
        stage('Docker Build') {
            steps {
                echo "===  Building Docker image: ${FULL_IMAGE}:${IMAGE_TAG}  ==="
                sh """
                    docker build \
                        --label "build.number=${BUILD_NUMBER}" \
                        --label "git.commit=${GIT_COMMIT}" \
                        --label "build.date=\$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                        -t ${FULL_IMAGE}:${IMAGE_TAG} \
                        -t ${FULL_IMAGE}:${IMAGE_LATEST} \
                        .
                """
                sh "docker images ${FULL_IMAGE}"
            }
        }

        // ── Stage 5: Trivy Security Scan ──────────────────────────────────
        stage('Trivy Scan') {
            steps {
                echo '===  Running Trivy vulnerability scan  ==='
                sh '''
                    # Install Trivy if not present
                    if ! command -v trivy &> /dev/null; then
                        echo "Installing Trivy..."
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    fi

                    echo "Trivy version: $(trivy --version)"

                    # Run scan — save report as HTML for Jenkins archiving
                    trivy image \
                        --exit-code 0 \
                        --severity LOW,MEDIUM \
                        --format table \
                        ${FULL_IMAGE}:${IMAGE_TAG}

                    # Fail pipeline on HIGH or CRITICAL vulnerabilities
                    trivy image \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --format table \
                        ${FULL_IMAGE}:${IMAGE_TAG}
                '''
            }
            post {
                always {
                    // Generate HTML report for archiving
                    sh """
                        trivy image \
                            --exit-code 0 \
                            --format template \
                            --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-report.html \
                            ${FULL_IMAGE}:${IMAGE_TAG} || true
                    """
                    // Archive the report in Jenkins
                    archiveArtifacts artifacts: 'trivy-report.html', allowEmptyArchive: true
                }
                failure {
                    echo 'HIGH/CRITICAL vulnerabilities found — build blocked!'
                }
            }
        }

        // ── Stage 6: Push to Docker Hub ───────────────────────────────────
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
                    echo "Image pushed: ${FULL_IMAGE}:${IMAGE_TAG}"
                    echo "Image pushed: ${FULL_IMAGE}:${IMAGE_LATEST}"
                }
            }
        }

        // ── Stage 7: Cleanup ──────────────────────────────────────────────
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

    // ── Post-pipeline notifications ───────────────────────────────────────
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
              Check console output for details.
            =============================================
            """
        }
        always {
            // Clean workspace after every build
            cleanWs()
        }
    }
}
