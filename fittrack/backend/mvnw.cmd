@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET DP0=%~dp0
@SET MAVEN_PROJECTBASEDIR=%DP0%
@IF NOT "%MAVEN_BASEDIR%"=="" SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%

@SET WRAPPER_JAR=%DP0%.mvn\wrapper\maven-wrapper.jar
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@SET WRAPPER_PROPERTIES=%DP0%.mvn\wrapper\maven-wrapper.properties

java -jar "%WRAPPER_JAR%" %MAVEN_PROJECTBASEDIR% %WRAPPER_PROPERTIES% %*
