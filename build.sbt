name := """echango"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  javaJdbc,
  cache,
  javaWs,
  "org.mongodb" % "mongo-java-driver" % "3.0.2",
  "org.jongo" % "jongo" % "1.2",
  "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.4.1" % "optional"
)
